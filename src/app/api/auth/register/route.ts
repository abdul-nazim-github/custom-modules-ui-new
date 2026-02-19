
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        if (!apiUrl) {
            return NextResponse.json(
                { message: 'API configuration error' },
                { status: 500 }
            );
        }

        const response = await axios.post(`${apiUrl}/api/auth/register`, body);
        return NextResponse.json(response.data, { status: response.status });
    } catch (error: unknown) {
        let errorMessage = 'An unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error('Registration Proxy Error:', errorMessage);

        if (axios.isAxiosError(error)) {
            const status = error.response?.status || 500;
            const data = error.response?.data || { message: 'Registration failed' };
            return NextResponse.json(data, { status });
        }

        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
