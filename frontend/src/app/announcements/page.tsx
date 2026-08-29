import { getBaseUrl } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Pin, Clock, ChevronRight } from "lucide-react";
import { AnnouncementsAPI, AnnouncementResponse } from "@/lib/api/announcements";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Announcements",
    description: "Stay updated with the latest news, announcements, and important notices from IEDC SNMIMT. Get notified about upcoming deadlines, funding, and campus events.",
    alternates: {
      canonical: '/announcements',
    },
    openGraph: {
      title: "Announcements | IEDC SNMIMT",
      description: "Stay updated with the latest news, announcements, and important notices from IEDC SNMIMT. Get notified about upcoming deadlines, funding, and campus events.",
      url: `${getBaseUrl()}/announcements`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Announcements | IEDC SNMIMT",
      description: "Stay updated with the latest news, announcements, and important notices from IEDC SNMIMT. Get notified about upcoming deadlines, funding, and campus events.",
    }
  };
}

export default async function AnnouncementsPage() {
  let announcements: AnnouncementResponse[] = [];

  try {
    const data = await AnnouncementsAPI.getAnnouncements(
      { is_published: true, include_expired: false, page_size: 50 },
      true,
      { next: { revalidate: 60 } }
    );
    announcements = Array.isArray(data) ? data : (data.items ?? []);
  } catch {
    // Silently fall back to empty list — UI handles empty state gracefully
  }

  const pinnedAnnouncements = announcements.filter((a) => a.is_pinned);
  const regularAnnouncements = announcements.filter((a) => !a.is_pinned);

  return (
    <div className="py-24 px-6 relative max-w-4xl mx-auto min-h-screen">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
          <Megaphone className="text-blue-400 w-10 h-10 md:w-12 md:h-12" /> Announcements
        </h1>
        <p className="text-[#C4C4D4] text-lg max-w-2xl mx-auto">
          Stay updated with the latest news, deadlines, and official notices from the IEDC SNMIMT community.
        </p>
      </div>

      {/* AI GEO Summary Block */}
      <section className="sr-only" aria-label="Quick Summary">
        <p>What is this page? A listing of all official announcements, news, and notices for IEDC SNMIMT.</p>
        <p>What will you find here? Important updates, upcoming deadlines, and general information for student innovators.</p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "IEDC SNMIMT Announcements",
            "description": "Stay updated with the latest news, announcements, and notices from IEDC SNMIMT.",
            "url": `${getBaseUrl()}/announcements`
          })
        }}
      />

      {announcements.length === 0 ? (
        <div className="text-center bg-[#111432] p-12 rounded-2xl border border-white/10">
          <Megaphone className="w-16 h-16 mx-auto mb-4 text-[#C4C4D4]/30" />
          <h2 className="text-2xl font-bold mb-2">No active announcements</h2>
          <p className="text-[#C4C4D4]">Check back later for updates and news.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pinnedAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}

          {pinnedAnnouncements.length > 0 && regularAnnouncements.length > 0 && (
            <div className="py-4 flex items-center">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="px-4 text-sm font-medium text-[#C4C4D4] uppercase tracking-widest">Recent Updates</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>
          )}

          {regularAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementCard({ announcement }: { announcement: AnnouncementResponse }) {
  return (
    <Link href={`/announcements/${announcement.slug}`} className="block group">
      <div className="bg-[#0A0E27] border border-white/10 hover:border-blue-500/50 rounded-2xl p-6 md:p-8 transition-all hover:shadow-2xl hover:shadow-blue-500/10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            {announcement.is_pinned && (
              <span className="flex items-center gap-1.5 bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-orange-500/20">
                <Pin size={12} /> Important
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[#C4C4D4] text-sm">
              <Clock size={14} /> {new Date(announcement.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors mb-3">
          {announcement.title}
        </h3>

        <p className="text-[#C4C4D4] line-clamp-3 leading-relaxed">
          {announcement.content.replace(/[#*`_]/g, '')}
        </p>

        <div className="mt-6 flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
          Read full announcement <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
