"use client";

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { notFound, useRouter } from 'next/navigation';
import { showToast } from '@/lib/features/toast/toastSlice';
import { User, Mail, Shield, Calendar, Edit2, Camera } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const hasPermission = user?.role?.includes('super_admin') || user?.permissions?.includes('modules~permission~profile');

    useEffect(() => {
        if (user && !hasPermission) {
            router.push('/dashboard');
            dispatch(showToast({ message: 'You do not have permission to access this page', type: 'error' }));
        }
    }, [user, hasPermission, router, dispatch]);

    if (!user) return null;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Profile Settings</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Manage your public profile and account information.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column - Avatar & Basic Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
                        <div className="flex flex-col items-center">
                            <div className="relative group cursor-pointer">
                                <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl ring-4 ring-white dark:ring-gray-900">
                                    {user.full_name.charAt(0)}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">{user.full_name}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mt-1">{user.role[0]}</p>
                        </div>

                        <div className="mt-10 space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <Mail className="h-5 w-5 text-blue-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Email Address</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <Calendar className="h-5 w-5 text-emerald-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Member Since</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">February 2026</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - User Details */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Account Details</h3>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25">
                                <Edit2 className="h-4 w-4" />
                                Edit Profile
                            </button>
                        </div>
                        <div className="p-8 grid gap-8 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Full Name</label>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium">
                                    {user.full_name}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Email</label>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium">
                                    {user.email}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Role</label>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium">
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                                        {user.role[0]}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Account ID</label>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 font-mono text-sm">
                                    {user.id}
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-8 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                                    <Shield className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Privacy Control</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your data is secured with end-to-end encryption and will never be shared.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
