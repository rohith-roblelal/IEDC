export default function TeamLoading() {
  return (
    <div className="py-24 px-6 relative max-w-[1100px] mx-auto animate-pulse motion-reduce:animate-none">
      <div className="h-10 md:h-12 w-48 bg-white/10 rounded-xl mx-auto mb-5" />
      <div className="h-5 md:h-6 w-3/4 max-w-2xl bg-white/5 rounded-md mx-auto mb-12" />

      <div className="space-y-14">
        {[1, 2].map((section) => (
          <div key={section}>
            <div className="h-4 w-64 bg-white/10 rounded-md mx-auto mb-6" />
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${section === 1 ? 'max-w-[640px]' : 'md:grid-cols-3 lg:grid-cols-4'} mx-auto gap-5`}>
              {[1, 2, 3, 4].slice(0, section === 1 ? 2 : 4).map((i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-white/10 mb-4" />
                  <div className="h-5 w-32 bg-white/10 rounded-md mb-2" />
                  <div className="h-4 w-24 bg-white/5 rounded-md mb-4" />
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5" />
                    <div className="w-8 h-8 rounded-full bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
