import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for IEDC SNMIMT",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-24 px-6 relative max-w-[800px] mx-auto min-h-screen">
      <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-white mb-6 leading-tight">
        Privacy Policy
      </h1>
      
      <p className="text-[#C4C4D4] text-sm mb-12 font-medium">
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="space-y-10 text-[#C4C4D4] text-[1.05rem] leading-relaxed">
        
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
          <p>
            Welcome to the Innovation and Entrepreneurship Development Cell (IEDC) at SNMIMT. 
            This Privacy Policy explains how we collect, use, and protect your information when you visit our website, register for events, or interact with our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Scope of This Privacy Policy</h2>
          <p>
            This policy applies to information collected through the official IEDC SNMIMT website, including contact functionality, event registration, startup program submissions, and administrative dashboard access. It does not apply to third-party websites or services linked from our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Information We Collect</h2>
          <p className="mb-4">We collect information that you directly provide to us when you interact with our website:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Contact Enquiries:</strong> Name, email address, and the contents of your message when you submit a query through our contact form.</li>
            <li><strong>Event Registration:</strong> Depending on the event, we may collect event-specific information, such as eligibility information, membership status, equipment requirements, and responses to custom registration questions.</li>
            <li><strong>Startup Submissions:</strong> Information about your startup, including founder details, logo, description, industry, stage, contact information, and supplementary materials.</li>
            <li><strong>Account Information:</strong> Necessary credentials and profile details for users with authorized administrative dashboard access.</li>
          </ul>

          <h3 className="text-xl font-bold text-white mt-6 mb-3">Payment Information</h3>
          <p>
            When an event requires payment, you may be asked to complete the payment using a provided UPI or payment method and upload a payment confirmation or screenshot. Payment confirmation screenshots may contain transaction-related information visible in the screenshot (such as transaction IDs, amounts, dates, and partial sender/recipient information). IEDC does not request or intentionally collect UPI PINs, banking passwords, OTPs, or payment-app login credentials through the website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Payment Information and Verification</h2>
          <p>
            The actual payment is completed through the participant's own UPI/payment application. The website may collect a payment confirmation screenshot when verification is required. This screenshot is used exclusively to verify the payment associated with your event registration. Authorized IEDC personnel may access the submitted proof for verification and event administration purposes. Participants should avoid including unnecessary financial, banking, authentication, or other sensitive information in payment screenshots uploaded to the website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. Automatically Collected Information</h2>
          <p>
            For security, abuse prevention, and system integrity, we may automatically record information such as IP address, browser/user-agent information, timestamps, and records of security-related actions when you interact with our forms or authentication systems.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Startup and Program Information</h2>
          <p>
            Certain startup information may be published on our website when designated for publication. Information submitted for internal evaluation, administration, or support is restricted to authorized personnel and is not intended for public display.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">7. How We Use Information</h2>
          <p className="mb-4">The information we collect is used strictly to operate and improve our organization:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To process your event registrations and communicate event updates.</li>
            <li>To verify event registration payments and associate them with your registration.</li>
            <li>To prevent fraudulent or duplicate registrations and resolve payment-related disputes.</li>
            <li>To respond to your contact enquiries.</li>
            <li>To manage, evaluate, and support student startups within our ecosystem.</li>
            <li>To provide secure access to the administrative dashboard for authorized members.</li>
            <li>To prevent fraud, abuse, and maintain the security of our systems.</li>
            <li>To analyze aggregated website traffic and improve user experience.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. Data Sharing and Disclosure</h2>
          <p>
            Information may be processed or accessed by authorized IEDC personnel and essential infrastructure providers (such as hosting, database, and email services) required to operate our platform. We do not sell, trade, or rent your personal information to outside parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">9. Third-Party Services</h2>
          <p className="mb-4">We utilize secure third-party infrastructure providers, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Vercel:</strong> For website hosting and aggregated analytics.</li>
            <li><strong>Supabase:</strong> For secure database management and file storage.</li>
            <li><strong>Email Providers:</strong> For delivering administrative and transactional communications.</li>
          </ul>
          <p className="mt-4">
            When you make a payment using a third-party UPI or payment application, that provider may independently process your information in accordance with its own privacy policy and terms. IEDC does not control the privacy practices of those third-party services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">10. Third-Party Links</h2>
          <p>
            Our website may contain external links to services such as Google Maps, social media platforms, or external registration forms. IEDC SNMIMT does not control the privacy practices of these third-party websites, and we encourage you to review their respective privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">11. Cookies and Similar Technologies</h2>
          <p>
            We use essential, secure cookies to maintain authenticated sessions for authorized dashboard users. We also use Vercel Analytics to understand aggregated website usage and improve performance and user experience.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">12. Data Storage and Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational safeguards—such as encryption in transit, access controls, and secure authentication—designed to protect your personal information. Payment confirmation screenshots are stored in a private storage environment with access controls and are made available to authorized personnel through time-limited access mechanisms.
          </p>
          <p>
            However, despite our efforts, no electronic transmission over the Internet can be guaranteed to be 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">13. Data Retention</h2>
          <p>
            We retain information (including payment-related records) only as long as reasonably necessary for event administration, payment verification, dispute resolution, fraud prevention, security, institutional record-keeping, or applicable legal requirements. Where deletion is applicable, we may remove information from active systems while retaining certain records (such as audit logs) where necessary for legitimate operational or accounting purposes. The expiration of time-limited access mechanisms (e.g., signed URLs) does not equate to the deletion of the underlying data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">14. Privacy Rights</h2>
          <p>
            Depending on applicable law, you may have rights regarding your personal information, such as the right to access, correct, or request deletion of the information we hold about you. To submit a privacy request, please contact us using the details provided below.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">15. Children and Minor Users</h2>
          <p>
            As an educational organization, our services may be used by students who are minors. We collect only the information necessary for educational and organizational participation. Users under the applicable age of majority must ensure they have appropriate parental or guardian consent where required by their educational institution or local law.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">16. International Data Processing</h2>
          <p>
            Our trusted third-party infrastructure providers (such as Vercel and Supabase) may process or store data on servers located outside of India. By using our platform, you acknowledge this international transfer and processing of information.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">17. Security Incidents</h2>
          <p>
            We maintain processes to detect, investigate, and respond to potential security incidents. In the event of a data breach compromising personal information, we will take appropriate containment measures and provide notifications where required by applicable law and institutional procedures.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">18. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy periodically to reflect changes in our practices or technical systems. The "Last updated" date at the top of this page will reflect the most recent revisions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">19. Contact and Privacy Complaints</h2>
          <p>
            If you have questions, concerns, or complaints regarding this Privacy Policy or our data practices, please contact us using the contact form on our website or refer to the physical contact address provided in the website footer.
          </p>
        </section>

        <div className="pt-8 mt-12 border-t border-white/10">
          <p className="text-sm text-[#8B8B9C] italic">
            Note: This Privacy Policy applies only to the online activities of IEDC SNMIMT and is valid for visitors to our website with regards to the information they share and/or collect.
          </p>
        </div>

      </div>
    </div>
  );
}
