export default function StartupsLoading() {
  return (
    <div className="min-h-screen text-white pt-32 pb-24 px-6 max-w-7xl mx-auto animate-pulse motion-reduce:animate-none">
      <div className="text-center mb-16">
        <div className="h-10 md:h-12 w-64 bg-white/10 rounded-xl mx-auto mb-4" />
        <div className="h-5 md:h-6 w-3/4 max-w-2xl bg-white/5 rounded-md mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl flex flex-col h-[350px]">
            <div className="p-6 flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-white/10 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-6 w-32 bg-white/10 rounded-md mb-2" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-white/5 rounded-full" />
                    <div className="h-5 w-20 bg-white/5 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="h-4 w-full bg-white/5 rounded-md mb-2" />
              <div className="h-4 w-5/6 bg-white/5 rounded-md mb-2" />
              <div className="h-4 w-4/5 bg-white/5 rounded-md mb-6" />
              
              <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
                <div className="h-4 w-3/4 bg-white/5 rounded-md" />
                <div className="h-4 w-1/2 bg-white/5 rounded-md" />
              </div>
            </div>
            <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-between items-center">
              <div className="h-4 w-24 bg-white/10 rounded-md" />
              <div className="h-4 w-4 bg-white/10 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
