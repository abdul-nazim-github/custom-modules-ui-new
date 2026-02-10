"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">Login</h1>
                <LoginForm />
            </div>
        </main>
    );
}
