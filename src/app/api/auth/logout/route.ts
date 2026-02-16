import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3011';

    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });

    const data = await response.json();

    const nextResponse = NextResponse.json(data, { status: response.status });

    // Clear cookies regardless of backend success
    nextResponse.cookies.delete('accessToken');
    nextResponse.cookies.delete('refreshToken');

    return nextResponse;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'Internal server error', success: false }, { status: 500 });
  }
}
