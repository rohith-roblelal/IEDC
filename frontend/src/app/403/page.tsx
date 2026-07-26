import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-bold tracking-tighter text-gray-200 dark:text-gray-800">403</h1>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Access Denied</h2>
        <p className="text-gray-500 max-w-md mx-auto dark:text-gray-400">
          You do not have the required permissions to access this page. This area is restricted to Super Admins.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300 mt-8"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
