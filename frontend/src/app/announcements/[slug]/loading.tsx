export default function Loading() {
  return (
    <div className="py-24 px-6 relative max-w-4xl mx-auto min-h-screen animate-pulse motion-reduce:animate-none" aria-busy="true" aria-label="Loading announcement">
      {/* Breadcrumb */}
      <div className="mb-8 h-5 w-48 bg-white/5 rounded-md" />

      <div className="bg-[#0A0E27] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
        {/* Badges/Dates */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 bg-white/10 rounded-full" />
            <div className="h-6 w-32 bg-white/5 rounded-md" />
          </div>
        </div>

        {/* Title */}
        <div className="h-12 md:h-16 w-full md:w-5/6 bg-white/10 rounded-xl mb-12" />

        {/* Content paragraphs */}
        <div className="space-y-4">
          <div className="h-5 w-full bg-white/5 rounded-md" />
          <div className="h-5 w-full bg-white/5 rounded-md" />
          <div className="h-5 w-5/6 bg-white/5 rounded-md" />
          <div className="h-5 w-full bg-white/5 rounded-md mt-8" />
          <div className="h-5 w-4/5 bg-white/5 rounded-md" />
          <div className="h-5 w-3/4 bg-white/5 rounded-md" />
        </div>
      </div>
    </div>
  );
}
