export default function Loading() {
  return (
    <div className="py-24 px-6 relative max-w-4xl mx-auto min-h-screen animate-pulse motion-reduce:animate-none" aria-busy="true" aria-label="Loading announcements">
      <div className="text-center mb-16">
        <div className="h-12 md:h-14 w-64 bg-white/10 rounded-xl mx-auto mb-4" />
        <div className="h-5 w-3/4 md:w-1/2 bg-white/5 rounded-md mx-auto" />
      </div>

      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-[#0A0E27] border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-24 bg-white/10 rounded-full" />
                <div className="h-5 w-32 bg-white/5 rounded-md" />
              </div>
            </div>
            
            <div className="h-8 w-3/4 bg-white/10 rounded-lg mb-4" />
            <div className="h-5 w-full bg-white/5 rounded-md mb-2" />
            <div className="h-5 w-5/6 bg-white/5 rounded-md mb-6" />
            
            <div className="h-5 w-48 bg-blue-500/20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
