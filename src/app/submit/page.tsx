"use client";

import { useState, useRef } from "react";
import {
  MapPin,
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  Tag,
  Loader2,
  Bot,
  Sparkles,
  X,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { AICategorizationCard } from "@/components/shared/AICategorizationCard";
import { MapWrapper } from "@/components/map/MapWrapper";
import { CATEGORY_LABELS } from "@/types";
import type { IssueCategory } from "@/types";
import { cn } from "@/lib/utils";
import { submitIssue } from "@/app/actions/issues";
import { categorizeIssue } from "@/app/actions/ai";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import type { IssueCategorization } from "@/app/actions/ai";

const categories = Object.entries(CATEGORY_LABELS) as [IssueCategory, string][];

type FormStep = "details" | "location" | "review";

interface FormData {
  title: string;
  description: string;
  category: IssueCategory | "";
  locationName: string;
  tags: string;
}

export default function SubmitPage() {
  const [step, setStep] = useState<FormStep>("details");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    locationName: "",
    tags: "",
  });

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be under 10 MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // AI categorization state
  const [categorizing, setCategorizing] = useState(false);
  const [categorization, setCategorization] = useState<IssueCategorization | null>(null);
  const [catError, setCatError] = useState<string | null>(null);
  const [catErrorCode, setCatErrorCode] = useState<string | undefined>();
  const [catVisible, setCatVisible] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceedToLocation =
    form.title.trim().length >= 10 &&
    form.description.trim().length >= 20 &&
    form.category !== "";

  const canProceedToReview =
    canProceedToLocation && form.locationName.trim().length > 0;

  const runAICategorizaton = async () => {
    if (form.title.trim().length < 10 || form.description.trim().length < 20) return;
    setCategorizing(true);
    setCatError(null);
    setCatVisible(true);
    const res = await categorizeIssue(form.title, form.description);
    setCategorizing(false);
    if (res.success && res.data) {
      setCategorization(res.data);
    } else {
      setCatError(res.error ?? "Analysis failed.");
      setCatErrorCode(res.errorCode);
    }
  };

  const applyAISuggestion = (category: string, tags: string[]) => {
    if (category) updateField("category", category);
    if (tags.length > 0 && !form.tags.trim()) {
      updateField("tags", tags.join(", "));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    if (hasSupabaseConfig()) {
      // Upload image to Supabase Storage if one was selected
      let imageUrl: string | undefined;
      if (imageFile) {
        try {
          const supabase = createClient();
          const ext = imageFile.name.split(".").pop() ?? "jpg";
          const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { data, error: uploadErr } = await supabase.storage
            .from("issue-images")
            .upload(path, imageFile, { cacheControl: "3600", upsert: false });
          if (!uploadErr && data) {
            const { data: urlData } = supabase.storage
              .from("issue-images")
              .getPublicUrl(data.path);
            imageUrl = urlData.publicUrl;
          }
          // If upload fails (bucket not created yet), continue without image
        } catch {
          // Storage not available — submit without image
        }
      }

      const result = await submitIssue({
        title: form.title,
        description: form.description,
        category: form.category,
        locationName: form.locationName,
        locationLat: 39.3959,
        locationLng: -76.6025,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        imageUrl,
      });
      if (!result.success) {
        setSubmitError(result.error ?? "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  const steps: { id: FormStep; label: string; number: number }[] = [
    { id: "details", label: "Details", number: 1 },
    { id: "location", label: "Location", number: 2 },
    { id: "review", label: "Review", number: 3 },
  ];

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-civic-lime/15 border border-civic-lime/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-civic-lime" />
          </div>
          <h1 className="text-2xl font-bold text-civic-text mb-3">Issue Submitted</h1>
          <p className="text-civic-text-muted mb-2">
            Thank you for raising{" "}
            <span className="text-civic-cyan font-medium">&ldquo;{form.title}&rdquo;</span>.
          </p>
          <p className="text-sm text-civic-text-muted mb-8">
            Your issue will be reviewed and made visible on the community map shortly.
            The community can then vote to surface it as a priority.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                setSubmitted(false);
                setStep("details");
                setForm({ title: "", description: "", category: "", locationName: "", tags: "" });
                setCategorization(null);
                setCatVisible(false);
              }}
            >
              Submit Another Issue
            </Button>
            <Button variant="secondary" asChild>
              <a href="/explore">Explore the Map</a>
            </Button>
          </div>
          {!hasSupabaseConfig() && (
            <p className="text-xs text-amber-400/70 bg-amber-400/5 border border-amber-400/15 rounded-lg px-3 py-2 mt-6">
              Note: Running in demo mode — connect Supabase to save data permanently.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-civic-text mb-2">
          Submit a Community Issue
        </h1>
        <p className="text-civic-text-muted">
          Help your community by documenting an issue affecting Towson. Be specific —
          detailed submissions get more community support.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => {
          const isDone =
            (s.id === "details" && (step === "location" || step === "review")) ||
            (s.id === "location" && step === "review");
          const isActive = step === s.id;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all",
                    isDone
                      ? "bg-civic-lime/20 border-civic-lime/50 text-civic-lime"
                      : isActive
                      ? "bg-civic-cyan/20 border-civic-cyan/50 text-civic-cyan"
                      : "bg-white/5 border-white/15 text-civic-text-muted"
                  )}
                >
                  {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : s.number}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive
                      ? "text-civic-cyan"
                      : isDone
                      ? "text-civic-lime"
                      : "text-civic-text-muted"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px mx-3 bg-white/10" />
              )}
            </div>
          );
        })}
      </div>

      <div className="glass rounded-2xl p-6 border border-white/7">
        {/* ── Step 1: Details ── */}
        {step === "details" && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-civic-text mb-1.5">
                Issue Title <span className="text-civic-red">*</span>
              </label>
              <Input
                placeholder="Brief, specific title (e.g. 'Broken streetlights on York Rd near Bosley Ave')"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                maxLength={120}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-civic-text-muted">Minimum 10 characters</p>
                <p
                  className={cn(
                    "text-xs",
                    form.title.length < 10 ? "text-civic-text-muted" : "text-civic-lime"
                  )}
                >
                  {form.title.length}/120
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-civic-text mb-1.5">
                Category <span className="text-civic-red">*</span>
              </label>
              <Select
                value={form.category}
                onValueChange={(v) => updateField("category", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.category && (
                <div className="mt-2">
                  <CategoryBadge category={form.category as IssueCategory} size="sm" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-civic-text mb-1.5">
                Description <span className="text-civic-red">*</span>
              </label>
              <Textarea
                placeholder="Describe the issue in detail. Include: what it is, how long it's been a problem, who is affected, and any safety concerns. The more specific you are, the more credibility your submission carries."
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="min-h-[140px]"
                maxLength={2000}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-civic-text-muted">
                  Minimum 20 characters. No personal attacks or unverified claims.
                </p>
                <p
                  className={cn(
                    "text-xs",
                    form.description.length < 20 ? "text-civic-text-muted" : "text-civic-lime"
                  )}
                >
                  {form.description.length}/2000
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-civic-text mb-1.5">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" />
                  Tags (optional)
                </div>
              </label>
              <Input
                placeholder="e.g. pedestrian safety, york road, lighting"
                value={form.tags}
                onChange={(e) => updateField("tags", e.target.value)}
              />
              <p className="text-xs text-civic-text-muted mt-1">
                Comma-separated. Tags help group related issues.
              </p>
            </div>

            {/* AI categorization */}
            {(form.title.trim().length >= 10 && form.description.trim().length >= 20) && (
              <div className="space-y-3">
                {!catVisible && (
                  <button
                    type="button"
                    onClick={runAICategorizaton}
                    className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors py-1"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <Sparkles className="w-3 h-3" />
                    Get AI Suggestions
                  </button>
                )}
                {catVisible && (
                  <AICategorizationCard
                    loading={categorizing}
                    analysis={categorization}
                    error={catError}
                    errorCode={catErrorCode}
                    onApply={applyAISuggestion}
                    onDismiss={() => setCatVisible(false)}
                    onRetry={runAICategorizaton}
                  />
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-civic-text mb-1.5">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Photo (optional)
                </div>
              </label>

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-56 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-white/15 hover:border-white/25 rounded-xl p-6 flex flex-col items-center gap-2 text-civic-text-muted hover:text-civic-text transition-colors"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">Click to upload a photo</span>
                  <span className="text-xs">JPG, PNG, WEBP · max 10 MB</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-civic-text-muted mt-1.5">
                A photo helps the community and institutions understand the issue.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setStep("location")}
                disabled={!canProceedToLocation}
                className="gap-2"
              >
                Continue to Location →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Location ── */}
        {step === "location" && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-civic-text mb-1.5">
                Location Name <span className="text-civic-red">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-civic-text-muted" />
                <Input
                  placeholder="e.g. York Rd & Bosley Ave, Towson"
                  value={form.locationName}
                  onChange={(e) => updateField("locationName", e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-civic-text-muted mt-1">
                Be as specific as possible — street intersection, building name, or landmark.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-civic-text">Map Location</label>
                <span className="flex items-center gap-1 text-xs text-civic-text-muted">
                  <Info className="w-3 h-3" />
                  Click-to-pin coming soon
                </span>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/10 h-64">
                <MapWrapper
                  center={[-76.6025, 39.3959]}
                  zoom={13}
                  height="100%"
                  interactive={true}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 glass rounded-lg p-3 border border-amber-400/15">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400/80">
                Your general location will be shown on the public map. Avoid including your home
                address. Approximate intersections or landmarks are ideal.
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="secondary" onClick={() => setStep("details")}>
                ← Back
              </Button>
              <Button
                onClick={() => setStep("review")}
                disabled={!canProceedToReview}
                className="gap-2"
              >
                Review Submission →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === "review" && (
          <div className="space-y-5 animate-fade-in">
            <div className="rounded-xl bg-civic-elevated border border-white/8 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-civic-text-muted uppercase tracking-wide">
                Review Your Submission
              </h3>

              <div>
                <p className="text-xs text-civic-text-muted">Title</p>
                <p className="text-sm font-semibold text-civic-text mt-0.5">{form.title}</p>
              </div>

              {form.category && (
                <div>
                  <p className="text-xs text-civic-text-muted mb-1">Category</p>
                  <CategoryBadge category={form.category as IssueCategory} size="sm" />
                </div>
              )}

              <div>
                <p className="text-xs text-civic-text-muted">Description</p>
                <p className="text-sm text-civic-text mt-0.5 leading-relaxed">{form.description}</p>
              </div>

              <div>
                <p className="text-xs text-civic-text-muted">Location</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-civic-cyan" />
                  <p className="text-sm text-civic-text">{form.locationName}</p>
                </div>
              </div>

              {form.tags && (
                <div>
                  <p className="text-xs text-civic-text-muted mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.tags.split(",").map((tag) =>
                      tag.trim() ? (
                        <span
                          key={tag}
                          className="text-xs text-civic-text-muted bg-white/5 border border-white/8 rounded-full px-2 py-0.5"
                        >
                          #{tag.trim()}
                        </span>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* AI analysis summary */}
              {categorization && (
                <div className="pt-2 border-t border-white/8">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Bot className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-purple-400 font-medium">AI Summary</span>
                    <span className="text-xs text-civic-text-muted">
                      {Math.round(categorization.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-xs text-civic-text-muted">{categorization.summary}</p>
                </div>
              )}
            </div>

            <div className="glass rounded-lg p-3 border border-white/8">
              <p className="text-xs text-civic-text-muted leading-relaxed">
                By submitting, you confirm this issue is real, affects the Towson community, and you
                have not included false information, personal attacks, or private data about
                individuals. CivicVoice reserves the right to remove submissions that violate
                community guidelines.
              </p>
            </div>

            {submitError && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {submitError}
              </p>
            )}

            <div className="flex justify-between pt-2">
              <Button
                variant="secondary"
                onClick={() => setStep("location")}
                disabled={submitting}
              >
                ← Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="gap-2 shadow-glow-cyan-sm"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Submit Issue</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
