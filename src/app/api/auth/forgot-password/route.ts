import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3011';
        const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Forgot password proxy error:', error);
        return NextResponse.json(
            { message: 'An internal error occurred.' },
            { status: 500 }
        );
    }
}
