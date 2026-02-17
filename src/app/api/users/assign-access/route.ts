import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3011';

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

    const response = await fetch(`${API_BASE_URL}/api/users/assign-access`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Assign Access Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
