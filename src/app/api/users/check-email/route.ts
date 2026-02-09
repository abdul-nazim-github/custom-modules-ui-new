
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const apiUrl = process.env.API_BASE_URL;

        if (!apiUrl) {
            return NextResponse.json(
                { message: 'API configuration error' },
                { status: 500 }
            );
        }

        const response = await axios.post(`${apiUrl}/api/users/check-email`, body);
        return NextResponse.json(response.data, { status: response.status });
    } catch (error: unknown) {
        let errorMessage = 'An unknown error occurred';
         if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error('Email Check Proxy Error:', errorMessage);

        if (axios.isAxiosError(error)) {
            // Forward the exact status and data from the backend
            // In the case of 409 (Conflict/Exists), we want to make sure we pass that through
            const status = error.response?.status || 500;
            const data = error.response?.data || { message: 'Email check failed' };
            return NextResponse.json(data, { status });
        }

        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
