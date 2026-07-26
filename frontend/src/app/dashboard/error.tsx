"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Failed to load dashboard data</h2>
      <p className="text-[#C4C4D4] max-w-md mx-auto mb-8">
        There was an error communicating with the server. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
