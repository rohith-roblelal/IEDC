export default function Loading() {
  return (
    <div className="pb-24 animate-pulse motion-reduce:animate-none" aria-busy="true" aria-label="Loading content">
      {/* Hero Section Skeleton */}
      <section className="px-6 pt-12">
        <div className="max-w-[1100px] mx-auto py-14 px-8 text-center">
          <div className="h-12 md:h-16 w-3/4 md:w-1/2 bg-white/10 rounded-xl mx-auto mb-5" />
          <div className="h-4 w-5/6 md:w-1/2 bg-white/5 rounded-md mx-auto mb-3" />
          <div className="h-4 w-4/6 md:w-1/3 bg-white/5 rounded-md mx-auto mb-8" />
          
          <div className="flex justify-center gap-4 mb-11">
            <div className="h-12 w-36 bg-white/10 rounded-full" />
            <div className="h-12 w-36 bg-white/10 rounded-full" />
          </div>
          
          <div className="mx-auto w-[min(800px,100%)] h-[400px] bg-white/5 rounded-3xl" />
        </div>
      </section>

      {/* Announcements Skeleton */}
      <section className="px-6 py-12 max-w-[900px] mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-8 w-8 bg-pink-500/20 rounded-full" />
          <div className="h-8 w-64 bg-white/10 rounded-lg" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="h-6 w-3/4 bg-white/10 rounded-md mb-4" />
              <div className="h-4 w-full bg-white/5 rounded-md mb-2" />
              <div className="h-4 w-5/6 bg-white/5 rounded-md mb-4" />
              <div className="h-3 w-24 bg-white/5 rounded-md" />
            </div>
          ))}
        </div>
      </section>

      {/* Podcasts Skeleton */}
      <section className="px-6 py-24">
        <div className="h-10 w-64 bg-white/10 rounded-xl mx-auto mb-10" />
        <div className="flex flex-wrap justify-center gap-8 max-w-[1200px] mx-auto">
          {[1, 2].map(i => (
            <div key={i} className="w-full md:w-[calc(50%-1rem)] rounded-[28px] bg-white/5 aspect-[16/9]" />
          ))}
        </div>
      </section>
    </div>
  );
}
