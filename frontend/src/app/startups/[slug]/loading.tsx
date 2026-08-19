export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-pulse motion-reduce:animate-none" aria-busy="true" aria-label="Loading startup details">
      <div className="bg-[#0D1030] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 sm:p-8 flex items-start justify-between border-b border-white/10 bg-[#0A0E27]">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 flex-shrink-0" />
            <div className="space-y-3">
              <div className="h-8 sm:h-10 w-48 sm:w-64 bg-white/10 rounded-lg" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-white/5 rounded-full" />
                <div className="h-6 w-24 bg-white/5 rounded-full" />
              </div>
            </div>
          </div>
          <div className="w-10 h-10 bg-white/5 rounded-full" />
        </div>
        
        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div>
                <div className="h-6 w-24 bg-white/10 rounded-md mb-4" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-white/5 rounded-md" />
                  <div className="h-4 w-full bg-white/5 rounded-md" />
                  <div className="h-4 w-4/5 bg-white/5 rounded-md" />
                  <div className="h-4 w-5/6 bg-white/5 rounded-md" />
                </div>
              </div>
              <div>
                <div className="h-6 w-32 bg-white/10 rounded-md mb-4" />
                <div className="h-20 w-full bg-white/5 rounded-xl" />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="h-5 w-20 bg-white/10 rounded-md mb-6" />
                <div className="space-y-5">
                  {[1, 2, 3].map(i => (
                    <div key={i}>
                      <div className="h-3 w-16 bg-white/5 rounded-md mb-2" />
                      <div className="h-4 w-32 bg-white/10 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="h-5 w-20 bg-white/10 rounded-md mb-6" />
                <div className="space-y-5">
                  <div className="h-3 w-24 bg-white/5 rounded-md mb-2" />
                  <div className="h-4 w-40 bg-white/10 rounded-md mb-2" />
                  <div className="h-4 w-32 bg-white/10 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
