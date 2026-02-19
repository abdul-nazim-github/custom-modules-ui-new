import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3011';
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      const nextResponse = NextResponse.json(data, { status: 200 });

      // Set access token in cookie
      if (data.data?.accessToken) {
        nextResponse.cookies.set('accessToken', data.data.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 3600, // 1 hour
        });
      }

      // Set refresh token in cookie
      if (data.data?.refreshToken) {
        nextResponse.cookies.set('refreshToken', data.data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 3600, // 7 days
        });
      }

      return nextResponse;
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error', success: false }, { status: 500 });
  }
}
