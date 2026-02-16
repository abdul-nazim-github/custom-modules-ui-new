import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    const backendUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3011";

    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("limit", limit);

    const response = await fetch(`${backendUrl}/api/contact/list?${queryParams.toString()}`, {
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
