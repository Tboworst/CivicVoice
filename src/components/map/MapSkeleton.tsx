import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapSkeletonProps {
  className?: string;
  message?: string;
}

export function MapSkeleton({ className, message }: MapSkeletonProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl",
        "bg-civic-surface border border-white/7",
        className
      )}
      style={{
        background:
          "radial-gradient(ellipse at 50% 50%, rgba(0,30,60,0.6) 0%, #05080f 70%)",
      }}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Fake markers */}
      {[
        { top: "35%", left: "45%" },
        { top: "52%", left: "38%" },
        { top: "28%", left: "60%" },
        { top: "65%", left: "55%" },
        { top: "42%", left: "72%" },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="relative">
            <div
              className="w-2.5 h-2.5 rounded-full bg-civic-cyan"
              style={{ boxShadow: "0 0 8px rgba(0,212,255,0.8)" }}
            />
            <div
              className="absolute inset-0 rounded-full bg-civic-cyan/30 animate-ping"
              style={{ animationDuration: `${1.5 + i * 0.4}s` }}
            />
          </div>
        </div>
      ))}

      {/* Center message */}
      <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
        <div className="w-12 h-12 rounded-xl bg-civic-cyan/10 border border-civic-cyan/20 flex items-center justify-center">
          <MapPin className="w-6 h-6 text-civic-cyan" />
        </div>
        <div>
          <p className="text-sm font-medium text-civic-text">
            {message || "Interactive Map"}
          </p>
          <p className="text-xs text-civic-text-muted mt-1">
            Add <code className="text-civic-cyan bg-white/5 px-1 rounded">NEXT_PUBLIC_MAPTILER_KEY</code> to{" "}
            <code className="text-white/60 bg-white/5 px-1 rounded">.env.local</code> to enable
          </p>
        </div>
      </div>
    </div>
  );
}
