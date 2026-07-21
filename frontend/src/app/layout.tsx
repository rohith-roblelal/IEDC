import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ConditionalWrapper } from "@/components/ConditionalWrapper";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "IEDC SNMIMT",
  description: "Innovation and Entrepreneurship Development Cell at SNMIMT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${poppins.variable} font-sans bg-[radial-gradient(circle_at_75%_20%,#3D1A5C,#0D1030_70%)] bg-fixed bg-[#0D1030] text-white antialiased min-h-screen flex flex-col`}>
        <ConditionalWrapper excludePaths={["/dashboard"]}>
          <Navbar />
        </ConditionalWrapper>
        <main className="flex-1">
          {children}
        </main>
        <ConditionalWrapper excludePaths={["/dashboard"]}>
          <Footer />
        </ConditionalWrapper>
      </body>
    </html>
  );
}
