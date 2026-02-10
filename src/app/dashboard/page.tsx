"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setCredentials, logout } from '@/lib/features/auth/authSlice';
import { showToast } from '@/lib/features/toast/toastSlice';
import { LayoutDashboard, LogOut, User, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Session verification logic
    useEffect(() => {
        const verifySession = async () => {
            try {
                // 1. Check if secure cookies still exist
                const res = await fetch('/api/auth/session');

                if (res.ok) {
                    // Cookies exist, now try to restore user data from localStorage if Redux state is empty
                    if (!isAuthenticated) {
                        const savedUser = localStorage.getItem('user');
                        if (savedUser) {
                            dispatch(setCredentials({ user: JSON.parse(savedUser) }));
                        } else {
                            // Cookie exists but user data is gone? Force re-login
                            router.push('/login');
                        }
                    }
                    setIsCheckingAuth(false);
                } else {
                    // Cookies are missing (deleted or expired)
                    console.warn('Session tokens missing. Redirecting to login.');
                    localStorage.removeItem('user');
                    dispatch(logout());
                    router.push('/login');
                }
            } catch (err) {
                console.error('Session verification failed:', err);
                router.push('/login');
            }
        };

        verifySession();
    }, [isAuthenticated, dispatch, router]);

    // Background polling (optional but good for real-time security)
    useEffect(() => {
        if (isCheckingAuth || !isAuthenticated) return;

        const interval = setInterval(async () => {
            const res = await fetch('/api/auth/session');
            if (!res.ok) {
                localStorage.removeItem('user');
                dispatch(logout());
                router.push('/login');
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isCheckingAuth, isAuthenticated, dispatch, router]);

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                localStorage.removeItem('user');
                dispatch(logout());
                dispatch(showToast({ message: 'Logged out successfully', type: 'success' }));
                router.push('/login');
            } else {
                dispatch(showToast({ message: 'Logout failed', type: 'error' }));
            }
        } catch (error) {
            dispatch(showToast({ message: 'An error occurred during logout', type: 'error' }));
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Verifying session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Navigation */}
            <nav className="border-b bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <LayoutDashboard className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600">
                                <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.full_name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        Welcome back, <span className="text-blue-600 font-black">{user?.full_name?.split(' ')[0]}</span>!
                    </h1>
                    <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                        Monitor activity and manage modules from your central command center.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                        <div>
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-2xl text-purple-600 dark:text-purple-400 w-fit mb-6">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Account Status</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Roles</p>
                                    <div className="flex flex-wrap gap-2">
                                        {user?.role?.map((r, i) => (
                                            <span key={i} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold uppercase tracking-wider border border-purple-100 dark:border-purple-800">
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Permissions</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {user?.permissions?.map((p, i) => (
                                            <span key={i} className="px-2.5 py-1 text-[10px] bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-400 font-mono font-bold border border-gray-200 dark:border-gray-600">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
