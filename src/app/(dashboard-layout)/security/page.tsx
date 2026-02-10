"use client";

import { Shield, Key, Smartphone, Lock, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { notFound } from 'next/navigation';

export default function SecurityPage() {
    const { user } = useAppSelector((state) => state.auth);
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);

    if (!user) return null;

    const hasPermission = user.permissions.includes('modules~permission~security') || user.role.includes('super_admin');

    if (!hasPermission) {
        notFound();
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Security Center</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Manage your password, 2FA, and account security preferences.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Password Update */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center rounded-2xl text-blue-600 mb-6">
                            <Key className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h3>
                        <p className="text-sm text-gray-500 mt-1">Update your account password regularly for better security.</p>
                    </div>
                    <div className="p-8 space-y-6 flex-1">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showCurrentPass ? "text" : "password"}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">New Password</label>
                            <div className="relative">
                                <input
                                    type={showNewPass ? "text" : "password"}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    onClick={() => setShowNewPass(!showNewPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
                            <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3" />
                                Password Requirements
                            </h4>
                            <ul className="text-xs text-blue-600 dark:text-blue-500 space-y-1">
                                <li>• At least 8 characters long</li>
                                <li>• Include at least one special character</li>
                                <li>• Mix of letters and numbers</li>
                            </ul>
                        </div>
                    </div>
                    <div className="p-8 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                        <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer">
                            Update Password
                        </button>
                    </div>
                </div>

                {/* 2FA & Security Stats */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-8">
                            <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center rounded-2xl text-emerald-600 mb-6 font-bold">
                                <Smartphone className="h-6 w-6" />
                            </div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                                </div>
                                <div className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider border border-red-50 dark:border-red-900/30">
                                    Off
                                </div>
                            </div>
                            <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                Enable 2FA <Lock className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-orange-100 dark:border-orange-900/30 shadow-sm overflow-hidden">
                        <div className="p-8">
                            <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center rounded-2xl text-orange-600 mb-6 font-bold">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Security Warning</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                You haven't updated your password in over 3 months. To keep your account safe, we recommend changing it.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-black rounded-3xl p-8 text-white relative overflow-hidden">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Security Score</h4>
                        <div className="flex items-end gap-3 mb-2">
                            <span className="text-6xl font-black">74</span>
                            <span className="text-xl font-bold text-gray-400 mb-2">/100</span>
                        </div>
                        <div className="h-2 w-full bg-gray-700 rounded-full mt-4 overflow-hidden">
                            <div className="h-full w-3/4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-6 leading-relaxed">
                            Your security score is good, but could be better by enabling 2FA and updating your recovery email.
                        </p>
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 bg-blue-600/10 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
