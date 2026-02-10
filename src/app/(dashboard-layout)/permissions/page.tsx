"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, Lock, Save, RotateCcw, User, CheckCircle2 } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import Link from 'next/link';

import { notFound } from 'next/navigation';

function PermissionsContent() {
    const { user: loggedInUser } = useAppSelector((state) => state.auth);
    const searchParams = useSearchParams();
    const userId = searchParams.get('user') || '1';

    if (!loggedInUser?.role?.includes('super_admin')) {
        notFound();
    }

    // Mock users mapping
    const users = {
        '1': { full_name: 'Ai Use Mail', email: 'aiusemail01@gmail.com', role: 'user' },
        '2': { full_name: 'Super Admin', email: 'admin@example.com', role: 'super_admin' },
        '3': { full_name: 'Sarah Connor', email: 'sarah@resistance.com', role: 'user' },
        '4': { full_name: 'John Doe', email: 'john@example.com', role: 'manager' },
    };

    const currentUser = users[userId as keyof typeof users] || users['1'];

    const modules = [
        { id: 'profile', name: 'Profile Module', permission: 'modules~permission~profile', description: 'Access to view and edit personal profile information.' },
        { id: 'activity', name: 'Activity Module', permission: 'modules~permission~activity', description: 'Access to view account activity logs and history.' },
        { id: 'settings', name: 'Settings Module', permission: 'modules~permission~settings', description: 'Access to configure system and display preferences.' },
        { id: 'security', name: 'Security Module', permission: 'modules~permission~security', description: 'Access to security controls, password changes and 2FA.' },
    ];

    const [permissions, setPermissions] = useState<string[]>(
        userId === '2' ? modules.map(m => m.permission).concat(['*']) :
            userId === '1' ? ['modules~permission~profile', 'modules~permission~settings'] : []
    );

    const togglePermission = (perm: string) => {
        setPermissions(prev =>
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Module Permissions</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Manage fine-grained module access for each user.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 font-bold hover:bg-white dark:hover:bg-gray-800 rounded-2xl transition-all cursor-pointer">
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer">
                        <Save className="h-4 w-4" />
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-blue-600 font-black shadow-sm">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Managing Permissions For</p>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser.full_name}</h3>
                            <p className="text-sm text-gray-500">{currentUser.email} • {currentUser.role}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="space-y-4">
                        {modules.map((mod) => {
                            const isSelected = permissions.includes(mod.permission) || permissions.includes('*');
                            return (
                                <div
                                    key={mod.id}
                                    onClick={() => togglePermission(mod.permission)}
                                    className={`group relative p-6 rounded-3xl border-2 cursor-pointer transition-all ${isSelected
                                        ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10'
                                        : 'border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-2xl transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                                                }`}>
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold transition-colors ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {mod.name}
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                                                    {mod.description}
                                                </p>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <code className={`text-[10px] font-bold px-2 py-1 rounded-md border ${isSelected
                                                        ? 'bg-blue-100/50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                                                        : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-900 dark:border-gray-700'
                                                        }`}>
                                                        {mod.permission}
                                                    </code>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                            ? 'border-blue-600 bg-blue-600 text-white scale-110'
                                            : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                                            }`}>
                                            {isSelected && <CheckCircle2 className="h-4 w-4" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-8 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                        <Shield className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Security Tip</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Changes to permissions take effect the next time the user logs in or refreshes their session.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PermissionsPage() {
    return (
        <Suspense fallback={<div>Loading permissions...</div>}>
            <PermissionsContent />
        </Suspense>
    );
}
