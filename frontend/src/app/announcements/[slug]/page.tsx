import { getBaseUrl } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Clock, Pin } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AnnouncementsAPI } from "@/lib/api/announcements";
import JsonLd from "@/components/seo/JsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const announcement = await AnnouncementsAPI.getAnnouncement(slug, true);
    if (!announcement || !announcement.is_published) {
      return { title: "Announcement Not Found | IEDC SNMIMT" };
    }
    
    // Clean markdown characters for the description meta tag
    const plainTextContent = announcement.content.replace(/[#*`_]/g, '').substring(0, 160);
    
    const baseUrl = getBaseUrl();
    
    return {
      title: announcement.title,
      description: plainTextContent,
      alternates: {
        canonical: `/announcements/${slug}`,
      },
      openGraph: {
        title: announcement.title,
        description: plainTextContent,
        url: `/announcements/${slug}`,
        type: "article",
        images: [{ url: '/api/og', alt: 'IEDC SNMIMT — Innovation and Entrepreneurship Development Cell' }],
      },
      twitter: {
        card: "summary_large_image",
        title: announcement.title,
        description: plainTextContent,
        images: ['/api/og'],
      }
    };
  } catch {
    return { title: "Announcement Not Found | IEDC SNMIMT" };
  }
}

export default async function AnnouncementDetailPage({ params }: Props) {
  const { slug } = await params;
  
  // Fetch data outside try/catch to avoid JSX-in-try/catch anti-pattern.
  // Errors are handled via early returns before rendering.
  let announcement: Awaited<ReturnType<typeof AnnouncementsAPI.getAnnouncement>> | null = null;
  let fetchError: Error | null = null;

  try {
    announcement = await AnnouncementsAPI.getAnnouncement(slug, true);
  } catch (error) {
    fetchError = error instanceof Error ? error : new Error("Unknown error");
  }

  // Handle API errors
  if (fetchError) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <h1 className="text-3xl font-bold text-white">Error</h1>
        <p className="text-red-400 mt-4">Failed to load announcement details. Please try again later.</p>
      </div>
    );
  }

  // Handle not found
  if (!announcement || !announcement.is_published) {
    notFound();
  }

  // Handle expired
  if (announcement.expires_at && new Date(announcement.expires_at) < new Date()) {
    notFound();
  }

  const baseUrl = getBaseUrl();
  const jsonLdData = {
    headline: announcement.title,
    description: announcement.content.replace(/[#*`_]/g, '').substring(0, 160),
    datePublished: announcement.created_at,
    dateModified: announcement.updated_at || announcement.created_at,
    author: {
      "@type": "Organization",
      name: "IEDC SNMIMT",
      url: baseUrl,
    }
  };

  return (
    <main className="py-24 px-6 relative max-w-3xl mx-auto min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: baseUrl },
          { name: "Announcements", item: `${baseUrl}/announcements` },
          { name: announcement.title, item: `${baseUrl}/announcements/${slug}` },
        ]}
      />
      <JsonLd type="Article" data={jsonLdData} />
      <nav aria-label="Breadcrumb" className="mb-8 text-sm font-medium">
        <ol className="flex items-center space-x-2 text-[#C4C4D4]">
          <li>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-white/30">/</span>
            <Link href="/announcements" className="hover:text-white transition-colors">Announcements</Link>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-white/30">/</span>
            <span className="text-white line-clamp-1" aria-current="page">{announcement.title}</span>
          </li>
        </ol>
      </nav>

      {/* AI GEO Summary Block */}
      <section className="sr-only" aria-label="Quick Summary">
        <p>What is this page? An official announcement from IEDC SNMIMT titled &quot;{announcement.title}&quot;.</p>
        <p>Published on: {new Date(announcement.created_at).toLocaleDateString()}</p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": announcement.title,
            "datePublished": announcement.created_at,
            "author": {
              "@type": "Organization",
              "name": "IEDC SNMIMT"
            },
            "url": `${baseUrl}/announcements/${slug}`
          })
        }}
      />

      <article className="bg-[#0A0E27] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
        <header className="mb-10 border-b border-white/10 pb-8">
          <div className="flex items-center gap-3 flex-wrap mb-6">
            {announcement.is_pinned && (
              <span className="flex items-center gap-1.5 bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-orange-500/20">
                <Pin size={12} /> Important
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[#C4C4D4] text-sm font-medium">
              <Clock size={16} /> 
              {new Date(announcement.created_at).toLocaleDateString(undefined, { 
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            {announcement.title}
          </h1>
        </header>

        <div className="prose prose-invert prose-blue max-w-none text-[#E0E0E0] md:text-lg leading-relaxed
          prose-headings:text-white prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
          prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white
          prose-ul:list-disc prose-ul:ml-6 prose-ul:my-4
          prose-ol:list-decimal prose-ol:ml-6 prose-ol:my-4
          prose-li:my-1
          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-500/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:my-6
          prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-[#111432] prose-pre:border prose-pre:border-white/10
        ">
          <ReactMarkdown>
            {announcement.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
