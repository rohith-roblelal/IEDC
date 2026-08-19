export default function Loading() {
  return (
    <div className="py-24 px-6 relative max-w-4xl mx-auto animate-pulse motion-reduce:animate-none" aria-busy="true" aria-label="Loading event details">
      {/* Breadcrumbs Skeleton */}
      <div className="mb-8 h-5 w-48 bg-white/5 rounded-md" />

      <div className="bg-[#0A0E27] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="w-full h-64 md:h-96 bg-white/5" />

        <div className="p-8 md:p-12 relative z-10 -mt-20 md:-mt-32">
          {/* Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="h-8 w-24 bg-white/10 rounded-full" />
            <div className="h-8 w-32 bg-white/10 rounded-full" />
          </div>

          {/* Title */}
          <div className="h-12 w-full md:w-3/4 bg-white/10 rounded-xl mb-3" />
          <div className="h-12 w-1/2 bg-white/10 rounded-xl mb-6" />

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 p-6 bg-white/5 rounded-xl border border-white/10">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-20 bg-white/5 rounded-md" />
                  <div className="h-5 w-40 bg-white/10 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          {/* Content Blocks */}
          <div className="space-y-4 mb-12">
            <div className="h-5 w-full bg-white/5 rounded-md" />
            <div className="h-5 w-full bg-white/5 rounded-md" />
            <div className="h-5 w-5/6 bg-white/5 rounded-md" />
            <div className="h-5 w-3/4 bg-white/5 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
