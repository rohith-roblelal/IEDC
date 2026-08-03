import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ConditionalWrapper } from "@/components/ConditionalWrapper";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";
import { SettingsProvider } from "@/lib/settings-context";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

import { clientFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "IEDC SNMIMT",
  description: "Innovation and Entrepreneurship Development Cell at SNMIMT",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialSettings = null;
  try {
    initialSettings = await clientFetch("api/v1/settings", { cache: "no-store" });
  } catch (error) {
    console.error("Failed to fetch initial settings:", error);
  }

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning className={`${poppins.variable} font-sans bg-[radial-gradient(circle_at_75%_20%,#3D1A5C,#0D1030_70%)] bg-fixed bg-[#0D1030] text-white antialiased min-h-screen flex flex-col`}>
        <ToastProvider>
          <ConfirmProvider>
            <SettingsProvider initialSettings={initialSettings}>
              <ConditionalWrapper excludePaths={["/dashboard"]}>
                <Navbar />
              </ConditionalWrapper>
              <main className="flex-1">
                {children}
              </main>
              <ConditionalWrapper excludePaths={["/dashboard"]}>
                <Footer />
              </ConditionalWrapper>
            </SettingsProvider>
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
