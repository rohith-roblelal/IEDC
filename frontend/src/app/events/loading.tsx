export default function Loading() {
  return (
    <div className="min-h-screen text-white pt-24 pb-20 px-6 max-w-7xl mx-auto animate-pulse motion-reduce:animate-none" aria-busy="true" aria-label="Loading events">
      <div className="text-center mb-16">
        <div className="h-12 md:h-14 w-48 bg-white/10 rounded-xl mx-auto mb-4" />
        <div className="h-5 w-3/4 md:w-1/2 bg-white/5 rounded-md mx-auto" />
      </div>
      
      {/* Tabs Skeleton */}
      <div className="flex justify-center mb-12">
        <div className="flex space-x-2 bg-white/5 p-1.5 rounded-full">
          <div className="h-10 w-32 bg-white/10 rounded-full" />
          <div className="h-10 w-32 bg-transparent rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-[18px] p-7 flex flex-col gap-3.5 h-[400px]">
            <div className="w-full h-40 bg-white/10 rounded-xl mb-2" />
            <div className="h-6 w-24 bg-white/10 rounded-full" />
            <div className="h-7 w-5/6 bg-white/10 rounded-md" />
            <div className="h-4 w-4/6 bg-white/5 rounded-md mt-1" />
            <div className="flex-1" />
            <div className="h-12 w-full bg-white/10 rounded-full mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
