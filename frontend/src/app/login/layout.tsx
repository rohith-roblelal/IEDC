import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | IEDC SNMIMT",
  description: "Secure admin login for the IEDC SNMIMT dashboard.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
