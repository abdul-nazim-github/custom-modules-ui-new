"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setCredentials, logout } from '@/lib/features/auth/authSlice';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
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
                    dispatch(setCredentials({ user: data.data.user }));
                    router.push('/dashboard');
                } else {
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
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <RegisterForm />
        </div>
    );
}
