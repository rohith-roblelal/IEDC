export default function GalleryLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-6 animate-pulse motion-reduce:animate-none">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-6" />
          <div className="h-10 md:h-12 w-64 bg-white/10 rounded-xl mx-auto mb-4" />
          <div className="h-5 md:h-6 w-3/4 max-w-2xl bg-white/5 rounded-md mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 aspect-[4/5]" />
          ))}
        </div>
      </div>
    </div>
  );
}
