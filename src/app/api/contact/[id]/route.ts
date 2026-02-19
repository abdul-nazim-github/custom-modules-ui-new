import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
       return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3011";

    const response = await fetch(`${backendUrl}/api/contact/${id}`, {
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
            { message: data.message || "Failed to fetch contact details" },
            { status: response.status }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Contact Detail API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
