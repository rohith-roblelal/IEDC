export interface FAQItem {
  question: string;
  answer: string;
  link?: {
    text: string;
    href: string;
  };
}

export const FAQ_DATA: FAQItem[] = [
  {
    question: "What is IEDC SNMIMT?",
    answer: "IEDC SNMIMT is the Innovation and Entrepreneurship Development Cell at SNMIMT. It is a student-focused community that promotes innovation, entrepreneurship, mentorship, and the development of student-led ideas and startups."
  },
  {
    question: "Who can become a member of IEDC SNMIMT?",
    answer: "Students interested in innovation, entrepreneurship, technology, and startups can become part of the IEDC SNMIMT community, subject to the applicable membership requirements and opportunities announced by IEDC."
  },
  {
    question: "What kind of events does IEDC SNMIMT organize?",
    answer: "IEDC SNMIMT organizes activities such as hackathons, ideathons, workshops, technical sessions, networking events, entrepreneurship programs, and other initiatives designed to help students explore and develop innovative ideas."
  },
  {
    question: "How can I register for an IEDC event?",
    answer: "Browse the available events on the website, select the event you're interested in, review the event details and eligibility requirements, and complete the registration form. If the event requires payment, follow the payment instructions provided during registration."
  },
  {
    question: "How do I pay for an event?",
    answer: "For paid events, IEDC may provide a UPI payment QR code or payment instructions. You can complete the payment using your preferred UPI application. If payment verification is required, upload the requested payment confirmation screenshot during registration."
  },
  {
    question: "Does uploading a payment screenshot confirm my registration?",
    answer: "No. Uploading a payment screenshot does not automatically confirm your registration. Where payment verification is required, the IEDC team may review the submitted payment proof before confirming the registration."
  },
  {
    question: "How can I get support for my startup idea through IEDC?",
    answer: "IEDC SNMIMT provides opportunities for students to develop and showcase innovative ideas through mentorship, entrepreneurship programs, startup initiatives, events, and other ecosystem activities. Available support may vary depending on the program and stage of the idea or startup."
  },
  {
    question: "How do I stay updated on IEDC news and announcements?",
    answer: "Check the IEDC SNMIMT website regularly for the latest announcements, events, programs, and opportunities. You can also follow IEDC's official social media channels where available."
  },
  {
    question: "How can I contact IEDC SNMIMT?",
    answer: "You can contact the IEDC SNMIMT team through the Contact page on the website. Submit your enquiry through the contact form or use the official contact information provided there.",
    link: {
      text: "Go to Contact Page",
      href: "/contact"
    }
  }
];
