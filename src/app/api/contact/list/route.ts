import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    // Proxy the 'per_page' if the frontend sends it, or handle 'limit'.
    // Given the previous diff, frontend sends 'limit'. Backend curl shows 'limit'.

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3011";

    // Construct query string manually to ensure correct params are forwarded
    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("limit", limit); // Using 'limit' as requested

    const response = await fetch(`${backendUrl}/api/contact/list?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Ensure we don't cache locally
    });

    const data = await response.json();

    if (!response.ok) {
        return NextResponse.json(
            { message: data.message || "Failed to fetch contact list" },
            { status: response.status }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Contact List API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
