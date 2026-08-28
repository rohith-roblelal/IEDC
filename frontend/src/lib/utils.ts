import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the normalized site base URL.
 * Drops trailing slashes to prevent double slashes in canonicals/sitemaps.
 */
export function getBaseUrl() {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iedcsnmimt.com';
  return rawBaseUrl.replace(/\/$/, '');
}
