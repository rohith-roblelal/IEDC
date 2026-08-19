import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service and Acceptable Use Policy for IEDC SNMIMT",
};

export default function TermsPage() {
  return (
    <div className="py-24 px-6 relative max-w-[800px] mx-auto min-h-screen">
      <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-white mb-6 leading-tight">
        Terms of Service
      </h1>
      
      <p className="text-[#C4C4D4] text-sm mb-12 font-medium">
        Last updated: {new Date("2026-08-19").toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="space-y-10 text-[#C4C4D4] text-[1.05rem] leading-relaxed">
        
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Innovation and Entrepreneurship Development Cell (IEDC) at SNMIMT website, you accept and agree to be bound by the terms and provisions of this agreement. 
            If you do not agree to abide by these terms, please do not use our services or website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
          <p>
            IEDC SNMIMT provides a platform for students, faculty, and industry professionals to discover announcements, register for events, showcase student startups, and communicate with our organization. 
            We reserve the right to modify, suspend, or discontinue any aspect of the website at any time without notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. User Conduct and Acceptable Use</h2>
          <p className="mb-4">You agree to use our website only for lawful purposes. You agree not to take any action that might compromise the security of the site, render the site inaccessible to others, or otherwise cause damage to the site or its content. Specifically, you agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Submit false or misleading information through our contact, registration, or startup showcase forms.</li>
            <li>Attempt to bypass or bypass any security measures, rate limiting, or authentication systems.</li>
            <li>Use the website to distribute spam, malware, or any other unauthorized content.</li>
            <li>Impersonate any person or entity, or falsely state your affiliation with IEDC SNMIMT.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Event Registration</h2>
          <p>
            When registering for events, you must provide accurate and complete information. Event registrations are subject to review, and IEDC SNMIMT reserves the right to cancel or deny registration at our discretion, particularly if the provided information is inaccurate or if the event reaches capacity.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. User-Submitted Information</h2>
          <p>
            By submitting information to our platform (e.g., startup details, contact messages, payment proofs), you grant IEDC SNMIMT the right to use, store, and process this information for its intended purpose. 
            You represent and warrant that you own or otherwise control all of the rights to the content you submit and that its publication will not violate any third-party rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites or services (e.g., startup websites, external partners, payment gateways) that are not owned or controlled by IEDC SNMIMT. 
            We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, IEDC SNMIMT shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the website.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. Revisions and Errata</h2>
          <p>
            The materials appearing on the IEDC SNMIMT website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its website are accurate, complete, or current. 
            We may make changes to the materials contained on the website at any time without notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">9. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us through the general contact form available in the footer of this website.
          </p>
        </section>

        <div className="pt-8 mt-12 border-t border-white/10">
          <p className="text-sm text-[#8B8B9C] italic">
            [Action Required by Website Owner: Please review this document to confirm the limitation of liability, governing jurisdiction, and precise commercial terms (if applicable) match SNMIMT institutional policies.]
          </p>
        </div>

      </div>
    </div>
  );
}
