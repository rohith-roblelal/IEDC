"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string; code?: string; status?: number };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Root Error Boundary Caught:", error);
  }, [error]);

  const isNetworkError = error.code === "NETWORK_ERROR" || error.code === "API_TIMEOUT" || error.status === 503 || error.status === 504;
  const isAuthError = error.code === "UNAUTHORIZED" || error.status === 401;

  if (isAuthError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Session Expired</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Please log in again to continue.
        </p>
        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-2xl font-bold mb-2">
        {isNetworkError ? "Service Temporarily Unavailable" : "Something went wrong"}
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {isNetworkError 
          ? "We're having trouble connecting to the server. The service might be degraded or temporarily down." 
          : error.message || "An unexpected error occurred while loading this page."}
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    </div>
  );
}
