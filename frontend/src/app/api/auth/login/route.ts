import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    
    // Proxy login to FastAPI backend
    const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: "Login failed" }));
      return NextResponse.json(errorData, { status: res.status });
    }

    const data = await res.json();
    const token = data.access_token;

    if (!token) {
      return NextResponse.json({ detail: "No token returned" }, { status: 500 });
    }

    // Create a new response
    const response = NextResponse.json({ success: true });

    // Set the cookie securely
    response.cookies.set({
      name: "access_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 24 * 60 * 60, // 8 days (matches FastAPI ACCESS_TOKEN_EXPIRE_MINUTES)
    });

    return response;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
