import { getBaseUrl } from '@/lib/utils';
import { NextResponse } from 'next/server';

// Revalidate every 24 hours. The content is largely stable organizational
// information, so there is no need to hit the backend on every request.
export const revalidate = 86400;

export async function GET(): Promise<NextResponse> {
  const base = getBaseUrl();

  const content = `# IEDC SNMIMT

> Innovation and Entrepreneurship Development Centre at SNM Institute of Management and Technology, Maliankara, Kerala, India.

## About

IEDC SNMIMT (Innovation and Entrepreneurship Development Cell) fosters and nurtures innovation combined with entrepreneurship amongst young minds at SNM Institute of Management and Technology. The cell provides a platform for students to explore ideas, build startups, participate in technical events, and develop an entrepreneurial mindset.

## Website

- Home: ${base}/
- About: ${base}/about
- Events: ${base}/events
- Startups: ${base}/startups
- Announcements: ${base}/announcements
- Team: ${base}/team
- Gallery: ${base}/gallery
- Contact: ${base}/contact

## Activities

IEDC SNMIMT organizes hackathons, technical workshops, ideathons, startup showcases, and entrepreneurship programs for students. Published events, registered startups, and official announcements are available through the website's dedicated sections.

## Events

The Events section (${base}/events) is the authoritative source for current and historical event information, including registration details, schedules, and event descriptions.

## Startups

The Startups section (${base}/startups) lists student startups incubated and supported by IEDC SNMIMT, including founder details, industry, and stage information.

## Announcements

The Announcements section (${base}/announcements) contains official notices, updates, and important information from IEDC SNMIMT.

## Team

The Team section (${base}/team) lists the current executive committee, nodal officers, and student leaders of IEDC SNMIMT.

## Location

SNM Institute of Management and Technology
Maliankara P.O, Moothankunnam
Ernakulam Dt., Kerala - 683516, India

## Contact

For enquiries, use the Contact page: ${base}/contact

## Social Profiles

- Facebook: https://www.facebook.com/people/Iedc-Snmimt/61555494891838/
- Instagram: https://www.instagram.com/iedc.snm
- LinkedIn: https://www.linkedin.com/in/iedcsnmimt/

## Legal

- Privacy Policy: ${base}/privacy-policy
- Terms of Service: ${base}/terms

## Important

${base}/ is the authoritative source for current information about IEDC SNMIMT.
Content including events, startups, and announcements is updated regularly.
For the most accurate and up-to-date information, refer directly to the website.
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
