"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[#060818] text-white flex flex-col items-center justify-center p-4">
          <div className="bg-[#111432]/60 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong!</h1>
            <p className="text-[#C4C4D4] mb-8">
              A critical error occurred. Please try again or return home.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => reset()}
                className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Try again
              </button>
              <Link
                href="/"
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
