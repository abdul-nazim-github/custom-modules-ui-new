"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setCredentials } from '@/lib/features/auth/authSlice';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            try {
                const res = await fetch('/api/auth/session');
                if (res.ok) {
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        try {
                            dispatch(setCredentials({ user: JSON.parse(savedUser) }));
                        } catch (e) {
                            localStorage.removeItem('user');
                        }
                    }
                    router.push('/dashboard');
                } else {
                    localStorage.removeItem('user');
                    setIsCheckingAuth(false);
                }
            } catch (err) {
                console.error('Session verify error:', err);
                setIsCheckingAuth(false);
            }
        };

        if (isAuthenticated) {
            router.push('/dashboard');
        } else {
            verifySession();
        }
    }, [isAuthenticated, dispatch, router]);

    if (isCheckingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">Login</h1>
                <LoginForm />
            </div>
        </main>
    );
}
