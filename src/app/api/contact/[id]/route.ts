import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // In Next.js 15+ params should be awaited if accessing async, but typically simple params object in older Next.js. Wait, usually params is implicit 2nd arg.
  // Actually, in newer Next.js versions (App Router), usually params is the second argument.
  // The type definition suggests params is a Promise in recent canary versions, but let's stick to standard { params: { id: string } } unless specific Next version dictates otherwise.
  // Looking at package.json, "next": "16.1.6". Next 15 introduced async params. Let's use await params.
) {
  try {
    const { id } = await params;

    if (!id) {
       return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3011";

    const response = await fetch(`${backendUrl}/api/contact/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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
