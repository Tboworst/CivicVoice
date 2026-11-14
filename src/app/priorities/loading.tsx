export default function PrioritiesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6">
      <div className="h-20 rounded-2xl bg-white/5 border border-white/7" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl bg-white/5 border border-white/7" />
        <div className="h-64 rounded-2xl bg-white/5 border border-white/7" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/5 border border-white/7" />
        ))}
      </div>
    </div>
  );
}
