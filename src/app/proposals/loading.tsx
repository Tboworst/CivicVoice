export default function ProposalsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-4">
      <div className="h-16 rounded-2xl bg-white/5 border border-white/7" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 rounded-2xl bg-white/5 border border-white/7" />
      ))}
    </div>
  );
}
