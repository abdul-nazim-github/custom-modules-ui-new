import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Lightweight local session check.
 * This does NOT call the backend. It only verifies if the httpOnly
 * accessToken cookie exists in the request.
 */
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!accessToken || !refreshToken) {
    return NextResponse.json({
      authenticated: false,
      message: 'Session tokens missing'
    }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true
  }, { status: 200 });
}
