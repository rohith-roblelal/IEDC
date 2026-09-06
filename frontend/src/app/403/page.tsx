import Link from "next/link";
import { Metadata } from "next";
import { ShieldX } from "lucide-react";

export const metadata: Metadata = {
  title: "Access Denied | IEDC SNMIMT",
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0E27] p-4">
      <div className="text-center space-y-6">
        
        {/* Icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center border border-purple-500/40 bg-purple-500/10 mx-auto">
          <ShieldX className="w-8 h-8 text-purple-400" />
        </div>

        {/* 403 */}
        <h1
          className="text-9xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent"
          style={{ filter: "drop-shadow(0 0 24px rgba(168, 85, 247, 0.45))" }}
        >
          403
        </h1>

        <h2 className="text-3xl font-semibold text-white">Access Denied</h2>
        
        <p className="text-gray-400 max-w-md mx-auto">
          You do not have the required permissions to access this page. This area is restricted to Super Admins.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow transition-opacity hover:opacity-90 mt-8"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}