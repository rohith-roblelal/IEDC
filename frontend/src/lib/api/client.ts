import { redirect } from "next/navigation";

export class ApiError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public status: number, public message: string, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

export function getApiUrl(path: string) {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  
  // In the browser, use relative path to leverage Next.js API rewrites and avoid CORS issues
  if (typeof window !== "undefined") {
    return `/${cleanPath}`;
  }

  // Use absolute URL for server components
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  return `${baseUrl}/${cleanPath}`;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      } else {
        redirect("/login");
      }
    } else if (response.status === 403) {
      if (typeof window !== "undefined") {
        window.location.href = "/403";
      } else {
        redirect("/403");
      }
    }

    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { detail: response.statusText };
    }
    
    throw new ApiError(
      response.status,
      errorData.detail || "An error occurred",
      errorData
    );
  }

  // Support 204 No Content
  if (response.status === 204) return null;
  
  return response.json();
}

type FetchOptions = RequestInit & { timeout?: number };

async function fetchWithTimeout(url: string, options: FetchOptions = {}) {
  const { timeout = 30000, ...fetchOptions } = options;
  
  // Do not use AbortController on the server as it disables Next.js fetch memoization
  const isServer = typeof window === "undefined";
  if (isServer) {
    return await fetch(url, fetchOptions);
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new ApiError(408, "Request Timeout");
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Client-side fetch wrapper that intercepts 401 and 403 responses
 */
export async function clientFetch(path: string, options: FetchOptions = {}) {
  const url = getApiUrl(path);
  
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  
  const method = options.method ? options.method.toUpperCase() : "GET";
  if (method !== "GET" && (!options.body || typeof options.body === "string")) {
      headers.set("Content-Type", "application/json");
  }

  // In the browser, credentials: 'include' ensures the HttpOnly cookie is sent
  const response = await fetchWithTimeout(url, {
    ...options,
    credentials: "include",
    headers
  });

  return handleResponse(response);
}
