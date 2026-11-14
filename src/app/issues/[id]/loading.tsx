export default function IssueLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-4 w-32 bg-white/5 rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 rounded-2xl bg-white/5 border border-white/7" />
          <div className="h-32 rounded-2xl bg-white/5 border border-white/7" />
          <div className="h-56 rounded-2xl bg-white/5 border border-white/7" />
          <div className="h-48 rounded-2xl bg-white/5 border border-white/7" />
        </div>
        <div className="space-y-5">
          <div className="h-44 rounded-2xl bg-white/5 border border-white/7" />
          <div className="h-52 rounded-2xl bg-white/5 border border-white/7" />
          <div className="h-36 rounded-2xl bg-white/5 border border-white/7" />
        </div>
      </div>
    </div>
  );
}
