import { Metadata } from "next";
import ContactClient from "./ContactClient";
import { clientFetch } from "@/lib/api/client";

export async function generateMetadata(): Promise<Metadata> {
  let title = "Contact | IEDC SNMIMT";
  let description = "Get in touch with IEDC SNMIMT for queries, collaborations, ideas, and opportunities.";

  try {
    const settings = await clientFetch("api/v1/settings", { next: { revalidate: 3600 } }).catch(() => null);
    if (settings) {
      if (settings.site_name) {
        title = `Contact | ${settings.site_name}`;
      }
    }
  } catch (error) {
    console.error("Failed to fetch settings for contact metadata", error);
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    }
  };
}

export default function ContactPage() {
  return (
    <div className="pt-24 pb-20 px-6 max-w-[1100px] mx-auto min-h-[80vh]">
      <ContactClient />
    </div>
  );
}
