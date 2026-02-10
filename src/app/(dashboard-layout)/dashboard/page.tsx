"use client";

import { useAppSelector } from '@/lib/hooks';
import {
    ShieldCheck,
    ArrowRight,
    Settings,
    User,
    Activity,
    Shield
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { user } = useAppSelector((state) => state.auth);

    const stats = [
        { name: 'Profile', href: '/profile', icon: User, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', perm: 'modules~permission~profile' },
        { name: 'Activity', href: '/activity', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', perm: 'modules~permission~activity' },
        { name: 'Settings', href: '/settings', icon: Settings, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', perm: 'modules~permission~settings' },
        { name: 'Security', href: '/security', icon: Shield, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', perm: 'modules~permission~security' },
    ];

    const allowedStats = stats.filter(s => user?.permissions?.includes(s.perm) || user?.role?.includes('super_admin'));

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Welcome, <span className="text-blue-600 font-black">{user?.full_name?.split(' ')[0]}</span>!
                    </h1>
                    <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
                        You are logged in as <span className="font-semibold text-gray-700 dark:text-gray-200">{user?.role?.[0]}</span>. Here's what you can access today.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800 text-sm font-bold uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4" />
                    Active Session
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {allowedStats.map((stat) => (
                    <Link
                        key={stat.name}
                        href={stat.href}
                        className="group relative overflow-hidden flex flex-col p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl w-fit mb-6 transition-transform duration-300 group-hover:scale-110`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{stat.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1">
                            Manage your {stat.name.toLowerCase()} details and preferences.
                        </p>
                        <div className="flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                            Go to {stat.name} <ArrowRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </div>
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-blue-50/20 dark:bg-blue-900/10 rounded-full blur-2xl group-hover:bg-blue-400/10 transition-colors" />
                    </Link>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 overflow-hidden rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Current Permissions</h3>
                    <div className="flex flex-wrap gap-2">
                        {user?.permissions?.map((p, i) => (
                            <span key={i} className="px-3 py-1.5 text-xs font-mono font-bold bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-lg shadow-blue-500/20">
                    <h3 className="text-xl font-bold mb-4">Account Security</h3>
                    <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                        Your account is protected with enterprise-grade security. Make sure to review your activity logs regularly.
                    </p>
                    <Link
                        href="/security"
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-sm font-bold transition-all backdrop-blur-sm"
                    >
                        Review Security Settings
                    </Link>
                </div>
            </div>
        </div>
    );
}
