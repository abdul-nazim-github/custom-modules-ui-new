import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Since the backend does not have an /api/auth/me endpoint,
 * this route simply verifies if the accessToken cookie exists.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No session found'
      }, { status: 401 });
    }

    // Since we can't verify with backend, we just return success if cookie exists.
    // The client will then use persisted user data or the token itself.
    return NextResponse.json({
      success: true,
      message: 'Session cookie exists'
    }, { status: 200 });
  } catch (error) {
    console.error('Session Check Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error checking session'
    }, { status: 500 });
  }
}
