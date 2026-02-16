import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3011';

    // Try to notify backend, but don't let it block local logout
    try {
      if (accessToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
        });
      }
    } catch (e) {
      console.error('Backend logout notification failed:', e);
    }

    const nextResponse = NextResponse.json({ success: true, message: 'Logged out' });

    // Force clear cookies
    nextResponse.cookies.set('accessToken', '', { path: '/', maxAge: 0 });
    nextResponse.cookies.set('refreshToken', '', { path: '/', maxAge: 0 });

    return nextResponse;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'Internal server error', success: false }, { status: 500 });
  }
}
