export default function AboutLoading() {
  return (
    <div className="py-24 px-6 relative max-w-5xl mx-auto min-h-screen animate-pulse motion-reduce:animate-none">
      <div className="text-center mb-16">
        <div className="h-10 md:h-12 w-48 bg-white/10 rounded-xl mx-auto mb-4" />
        <div className="h-5 md:h-6 w-3/4 max-w-2xl bg-white/5 rounded-md mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div className="space-y-4">
          <div className="h-8 w-64 bg-white/10 rounded-md mb-6" />
          <div className="h-4 w-full bg-white/5 rounded-md" />
          <div className="h-4 w-full bg-white/5 rounded-md" />
          <div className="h-4 w-5/6 bg-white/5 rounded-md" />
          <div className="h-4 w-full bg-white/5 rounded-md" />
          <div className="h-4 w-4/5 bg-white/5 rounded-md" />
        </div>
        <div className="w-full h-[400px] bg-white/5 rounded-2xl border border-white/10" />
      </div>

      <div className="space-y-4 mb-20">
        <div className="h-8 w-64 bg-white/10 rounded-md mx-auto mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-6 h-48 border border-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}
