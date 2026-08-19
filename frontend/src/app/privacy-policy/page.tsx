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
        Last updated: {new Date("2026-08-19").toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="space-y-10 text-[#C4C4D4] text-[1.05rem] leading-relaxed">
        
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
          <p>
            Welcome to the Innovation and Entrepreneurship Development Cell (IEDC) at SNMIMT. 
            This Privacy Policy explains how we collect, use, and protect your information when you visit our website or interact with our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
          <p className="mb-4">We collect information that you directly provide to us when you interact with our website:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Contact Enquiries:</strong> Name, email address, and the contents of your message when you submit a query through our contact form.</li>
            <li><strong>Event Registration:</strong> Name, email address, phone number, gender, academic year, department, and any specific answers or files (such as payment screenshots) required for the event you are registering for.</li>
            <li><strong>Startup Submissions:</strong> Information about your startup, including founder details, logo, description, industry, and current stage (applicable for registered members using the dashboard).</li>
            <li><strong>Account Information:</strong> Credentials and profile details for users with dashboard access.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Information Collected Automatically</h2>
          <p>
            When you visit our website, certain information is collected automatically through Vercel Analytics to help us understand how our website is used. 
            This includes anonymous page views and basic device/browser information. This analytics service is completely cookie-free and does not track you across other websites or associate your IP address with personal information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. How We Use Information</h2>
          <p className="mb-4">The information we collect is used strictly for internal purposes to operate and improve our organization:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To process your event registrations and communicate event updates.</li>
            <li>To respond to your contact enquiries.</li>
            <li>To manage and support student startups within our ecosystem.</li>
            <li>To provide secure access to the administrative dashboard for authorized members.</li>
            <li>To analyze website traffic and improve user experience.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. Cookies and Local Storage</h2>
          <p>
            We may use local storage and secure authentication tokens (JWT) to maintain your session if you log in to the administrative dashboard. 
            Currently, our public-facing website and analytics do not use non-essential tracking cookies. A comprehensive Cookie Consent mechanism is planned for future implementation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Third-Party Services</h2>
          <p>
            We utilize secure third-party infrastructure providers to host our application and store data. 
            This includes Vercel for website hosting and analytics, and Supabase for secure database management and file storage (such as event payment screenshots). 
            We do not sell, trade, or rent your personal information to outside parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">7. Data Storage and Security</h2>
          <p>
            We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. 
            However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. Contact Information</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us using the contact form at the bottom of our website, or refer to the physical contact address provided in the footer.
          </p>
        </section>

        <div className="pt-8 mt-12 border-t border-white/10">
          <p className="text-sm text-[#8B8B9C] italic">
            Note: This Privacy Policy applies only to the online activities of IEDC SNMIMT and is valid for visitors to our website with regards to the information that they shared and/or collect.
          </p>
        </div>

      </div>
    </div>
  );
}
