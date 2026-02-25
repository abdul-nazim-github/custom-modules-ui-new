"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setCredentials, logout } from '@/lib/features/auth/authSlice';
import Sidebar from '@/components/dashboard/Sidebar';

import { usePathname } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const getPageTitle = () => {
        const segment = pathname.split('/').pop();
        if (!segment || segment === 'dashboard') return 'Dashboard';
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    };
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    // Guard to prevent re-running session check after a redirect is triggered
    const isRedirecting = useRef(false);

    useEffect(() => {
        // Only run once on mount — do NOT include isAuthenticated in deps
        // to avoid infinite loop when logout() changes isAuthenticated
        const verifySession = async () => {
            if (isRedirecting.current) return;

            try {
                const res = await fetch('/api/auth/session');

                if (res.ok) {
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        dispatch(setCredentials({ user: JSON.parse(savedUser) }));
                    } else if (!isAuthenticated) {
                        isRedirecting.current = true;
                        window.location.href = '/login';
                        return;
                    }
                    setIsCheckingAuth(false);
                } else {
                    isRedirecting.current = true;
                    localStorage.removeItem('user');
                    dispatch(logout());
                    window.location.href = '/login';
                }
            } catch (err) {
                console.error('Session verification failed:', err);
                isRedirecting.current = true;
                window.location.href = '/login';
            }
        };

        verifySession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    // Background polling for session validity
    useEffect(() => {
        if (isCheckingAuth || !isAuthenticated) return;

        const interval = setInterval(async () => {
            if (isRedirecting.current) return;

            const res = await fetch('/api/auth/session');
            if (!res.ok) {
                isRedirecting.current = true;
                localStorage.removeItem('user');
                dispatch(logout());
                window.location.href = '/login';
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [isCheckingAuth, isAuthenticated, dispatch]);

    if (isCheckingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative h-16 w-16">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Initializing your workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        {getPageTitle()}
                    </h2>
                    <div className="flex items-center gap-4">
                        {/* Additional header items like notifications could go here */}
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-950/50">
                    <div className="max-w-7xl mx-auto p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
