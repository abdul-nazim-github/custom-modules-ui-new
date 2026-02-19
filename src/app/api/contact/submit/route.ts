
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // --- Validation ---

    // --- Validation ---

    if (
      !name || !name.trim() || name.length > 100 ||
      !email || !email.trim() || email.trim().length > 100 ||
      !subject || !subject.trim() || subject.length > 200 ||
      !message || !message.trim() || message.length > 2000 || message.trim().length < 10
    ) {
        return NextResponse.json({ message: "Validation failed. Please check your input." }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ message: "Validation failed. Please check your input." }, { status: 400 });
    }

    // --- Sanitization (Simple) ---
    // In a real app, use a library like DOMPurify or specialized xss libraries if html content is allowed.
    // Here we will just strip potential script tags or reject them.

    const hasDangerousInput = (str: string) => {
      const dangerousPatterns = [
        /<script\b[^>]*>([\s\S]*?)<\/script>/gim,
        /javascript:/gim,
        /onload=/gim,
        /onerror=/gim,
      ];
      return dangerousPatterns.some((pattern) => pattern.test(str));
    };

    if (
      hasDangerousInput(name) ||
      hasDangerousInput(email) ||
      hasDangerousInput(subject) ||
      hasDangerousInput(message)
    ) {
      return NextResponse.json({ message: "Validation failed. Please check your input." }, { status: 400 });
    }
    // --- Backend Submission ---
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3011";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const backendResponse = await fetch(`${backendUrl}/api/contact/submit`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name, email, subject, message }),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to submit contact form" },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
