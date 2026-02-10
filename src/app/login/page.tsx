"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setCredentials, logout } from '@/lib/features/auth/authSlice';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await fetch('/api/auth/me', { credentials: 'include' });
                const data = await response.json();

                if (response.ok && data.success) {
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        dispatch(setCredentials({ user: JSON.parse(savedUser) }));
                    }
                    router.push('/dashboard');
                } else {
                    localStorage.removeItem('user');
                    dispatch(logout());
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
                dispatch(logout());
            } finally {
                setIsCheckingAuth(false);
            }
        };

        if (!isAuthenticated) {
            verifyAuth();
        } else {
            router.push('/dashboard');
            setIsCheckingAuth(false);
        }
    }, [isAuthenticated, dispatch, router]);

    if (isCheckingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return null; // Will be redirected
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
