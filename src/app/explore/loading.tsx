export default function ExploreLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map skeleton */}
        <div className="lg:col-span-2">
          <div className="h-[520px] rounded-2xl bg-white/5 border border-white/7" />
        </div>
        {/* Issue list skeleton */}
        <div className="space-y-3">
          <div className="h-10 rounded-xl bg-white/5" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 border border-white/7" />
          ))}
        </div>
      </div>
    </div>
  );
}
