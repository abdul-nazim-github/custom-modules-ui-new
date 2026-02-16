
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3011';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { authenticated: false, message: 'No access token found' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
        // If the token is invalid, we should probably clear the cookies?
        // But for now, just return the error.
      return NextResponse.json(
        { authenticated: false, message: data.message || 'Failed to fetch user' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: data.data || data // valid response usually has data field
    });
  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json(
      { authenticated: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
