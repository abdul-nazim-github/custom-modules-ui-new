import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3011";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const search = searchParams.get("search") || "";

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("limit", limit);
    if (search) queryParams.append("search", search);

    const response = await fetch(`${API_BASE_URL}/api/content/list?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
        return NextResponse.json(
            { message: data.message || "Failed to fetch content list" },
            { status: response.status }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Content List API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Checking if the backend endpoint should be /create instead of /list
    const response = await fetch(`${API_BASE_URL}/api/content/create`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        const text = await response.text();
        console.error("Backend non-JSON response:", text);
        return NextResponse.json(
            { success: false, message: `Backend error: ${response.status}`, details: text },
            { status: response.status || 500 }
        );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Content Create Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
