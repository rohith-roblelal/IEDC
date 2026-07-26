import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060818] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 text-center">
        <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <Search size={40} className="text-[#C4C4D4]" />
        </div>
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 text-transparent bg-clip-text mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-[#C4C4D4] max-w-md mx-auto mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-medium transition-all transform hover:scale-[1.02]"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
