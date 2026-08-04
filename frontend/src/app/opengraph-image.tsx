import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';
export const alt = 'IEDC SNMIMT - Innovation and Entrepreneurship Development Cell';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
export const revalidate = 86400; // Cache for 24 hours

export default async function Image() {
  let siteName = 'IEDC SNMIMT';
  let tagline = 'Innovation and Entrepreneurship Development Cell';
  
  try {
    // Attempt to fetch settings, fallback if unavailable
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const settings = await fetch(`${baseUrl}/api/v1/settings`).then(r => r.json());
    if (settings) {
      siteName = settings.site_name || siteName;
      tagline = settings.site_tagline || tagline;
    }
  } catch (error) {
    console.error("Failed to fetch settings for OG image", error);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0A0F',
          backgroundImage: 'radial-gradient(circle at 75% 20%, #3D1A5C, #0D1030 70%)',
          color: 'white',
          padding: '80px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          {/* SVG Logo abstraction for OG image since fetching external images in Edge can be tricky without arrayBuffers */}
          <svg width="120" height="120" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="65" cy="70" r="42" fill="none" stroke="#3B82F6" strokeWidth="14"/>
            <circle cx="135" cy="70" r="42" fill="none" stroke="#A855F7" strokeWidth="14"/>
            <path d="M105 40 L80 75 L100 75 L90 110 L125 65 L103 65 Z" fill="#F97316"/>
          </svg>
        </div>
        
        <h1
          style={{
            fontSize: '80px',
            fontWeight: 800,
            margin: '0 0 20px 0',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            background: 'linear-gradient(to bottom right, #FFFFFF, #C4C4D4)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {siteName}
        </h1>
        
        <p
          style={{
            fontSize: '32px',
            fontWeight: 500,
            color: '#8B7FE8',
            margin: 0,
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          {tagline}
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
