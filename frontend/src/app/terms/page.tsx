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
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="space-y-10 text-[#C4C4D4] text-[1.05rem] leading-relaxed">
        
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance and Scope</h2>
          <p>
            By accessing and using the Innovation and Entrepreneurship Development Cell (IEDC) at SNMIMT website, you accept and agree to be bound by the terms and provisions of this agreement. 
            If you do not agree to abide by these terms, please do not use our services or website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility and Website Use</h2>
          <p>
            You agree to use our website only for lawful purposes. You agree not to take any action that might compromise the security of the site, render the site inaccessible to others, or otherwise cause damage to the site or its content.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Description of Services</h2>
          <p>
            IEDC SNMIMT provides a platform for students, faculty, and industry professionals to discover announcements, register for events, showcase student startups, and communicate with our organization. We reserve the right to modify, suspend, or discontinue any aspect of the website at any time without notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. User Responsibilities</h2>
          <p className="mb-4">You are responsible for ensuring that all information you submit to the website is accurate, lawful, and does not infringe on the rights of third parties. You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Submit false or misleading information through our contact, registration, or startup showcase forms.</li>
            <li>Impersonate any person or entity, or falsely state your affiliation with IEDC SNMIMT.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. Event Registration</h2>
          <p>
            When registering for events, you must provide accurate and complete information. Event registrations are subject to review, and IEDC SNMIMT reserves the right to cancel or deny registration at our discretion, particularly if the provided information is inaccurate or if the event reaches capacity.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Payments and Payment Verification</h2>
          <p className="mb-2">
            For events that require a registration fee, the applicable payment instructions will be provided as part of the event registration process. Payments are completed through the participant's selected UPI/payment application. IEDC does not control the operation, availability, or transaction processing of those third-party payment services.
          </p>
          <p className="mb-2">
            When completing a payment, you are responsible for verifying the recipient details and ensuring the correct amount is transferred. Where required, you must upload a valid payment confirmation or screenshot. 
          </p>
          <p className="font-semibold text-white">
            Submitting a payment screenshot does not by itself constitute confirmation of payment or guarantee acceptance into an event.
          </p>
          <p className="mt-2">
            Payment evidence is manually reviewed by authorized IEDC personnel. False, altered, reused, or fraudulent payment evidence will result in the immediate rejection or cancellation of your registration. Please ensure you do not upload unrelated financial or sensitive information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">7. Event Changes, Cancellation and Participation</h2>
          <p>
            Event details, including dates, times, venues, schedules, capacities, and eligibility requirements, are subject to change. In the event of cancellation or postponement, participants will be notified through appropriate IEDC communication channels. Refund or cancellation policies, where applicable, will be communicated specifically for the relevant event.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. User-Submitted Content</h2>
          <p>
            By submitting information to our platform, you represent and warrant that you own or otherwise control all of the necessary rights to the content you submit and that its use will not violate any third-party rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">9. Startup Submissions and Public Content</h2>
          <p>
            When you submit startup information designated for public presentation, you grant IEDC SNMIMT the permission necessary to display the startup profile, operate the IEDC startup showcase, and promote the relevant IEDC program. You retain ownership of your underlying intellectual property. Information submitted strictly for internal evaluation, administration, or support is restricted to authorized personnel and is not intended for public display. Do not submit confidential information for public publication.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">10. Intellectual Property</h2>
          <p>
            All original website content, branding, logos, graphics, and institutional materials remain the exclusive property of IEDC SNMIMT or their respective owners. Users retain ownership of their own submitted content, subject to the operational permissions granted in Section 9.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">11. Account and Security</h2>
          <p>
            Users with authorized administrative dashboard access are responsible for protecting their credentials and must not share access where prohibited. IEDC SNMIMT reserves the right to restrict or terminate access if unauthorized use or a security breach is suspected.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">12. Prohibited Activities</h2>
          <p className="mb-4">In addition to the responsibilities outlined above, you must strictly avoid:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Attempting to bypass security measures, rate limits, or authentication controls.</li>
            <li>Uploading malicious files, malware, or attempting unauthorized access to the platform.</li>
            <li>Scraping, attacking, or disrupting the service infrastructure.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">13. Third-Party Services and Links</h2>
          <p>
            Our website utilizes secure third-party infrastructure (such as Vercel, Supabase, and Google Maps) and may contain links to external third-party websites. IEDC SNMIMT does not control and assumes no responsibility for the content, independent terms, privacy practices, or availability of any third-party services or external links.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">14. Website Availability</h2>
          <p>
            While we strive to provide reliable access to our platform, the website may occasionally be unavailable due to maintenance, infrastructure issues, network failures, third-party outages, or events beyond our reasonable control. We do not guarantee continuous or uninterrupted access.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">15. Website Content and Accuracy</h2>
          <p>
            Event information, announcements, and startup profiles may be updated frequently. While we aim for accuracy, website information may occasionally contain inadvertent technical or typographical errors. IEDC SNMIMT reserves the right to correct or update information at any time without notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">16. Suspension and Termination</h2>
          <p>
            IEDC SNMIMT reserves the right to suspend or terminate your access to the website or cancel event registrations in cases of fraud, abuse, unauthorized access, submission of false information, malicious uploads, or any repeated violation of these Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">17. Privacy Policy</h2>
          <p>
            Your use of the platform is also governed by our Privacy Policy, which outlines what personal information is collected, how it is used, stored, protected, and how you can exercise your applicable privacy rights. Please refer to our Privacy Policy for full details.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">18. Disclaimers</h2>
          <p>
            The website and its services are provided on an "as is" and "as available" basis. IEDC SNMIMT makes no warranties regarding the website's uninterrupted availability, the absolute accuracy of event information, or the independent practices of linked third-party websites.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">19. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, IEDC SNMIMT shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the website, participation in events, or reliance on any information provided on the platform.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">20. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless IEDC SNMIMT from claims, liabilities, or damages arising out of your unlawful use of the platform, your violation of these Terms, or any intellectual property infringement resulting from content you submit.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">21. Governing Law and Jurisdiction</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the applicable laws of India and institutional policies governing SNMIMT. Any disputes arising under these Terms shall be subject to the appropriate jurisdiction as defined by institutional guidelines.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">22. Changes to Terms</h2>
          <p>
            We may update these Terms of Service periodically. The "Last updated" date at the top of this page reflects the most recent revisions. Continued use of the website following any changes constitutes your acceptance of the new Terms where legally permissible.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">23. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us through the general contact form available on our website or refer to the physical contact address provided in the website footer.
          </p>
        </section>

      </div>
    </div>
  );
}
