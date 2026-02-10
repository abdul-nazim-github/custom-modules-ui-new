"use client";

import { Activity, Clock, LogIn, Key, Shield, User } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import { notFound } from 'next/navigation';

export default function ActivityPage() {
    const { user } = useAppSelector((state) => state.auth);

    if (!user) return null;

    const hasPermission = user.permissions.includes('modules~permission~activity') || user.role.includes('super_admin');

    if (!hasPermission) {
        notFound();
    }
    const activities = [
        { id: 1, type: 'login', title: 'Successful Login', description: 'Logged in from Chrome on MacOS', time: '2 hours ago', icon: LogIn, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
        { id: 2, type: 'security', title: 'Password Changed', description: 'Updated account password for better security', time: 'Yesterday', icon: Key, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        { id: 3, type: 'profile', title: 'Profile Updated', description: 'Changed profile picture and display name', time: '3 days ago', icon: User, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
        { id: 4, type: 'access', title: 'New Permissions Granted', description: 'Super admin added "Security" module access', time: '1 week ago', icon: Shield, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Activity Log</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Keep track of your latest actions and security events.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center rounded-2xl text-blue-600">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                            <p className="text-sm text-gray-500">Chronological history of your account interactions.</p>
                        </div>
                    </div>

                    <div className="space-y-8 relative before:absolute before:inset-0 before:left-6 before:border-l-2 before:border-gray-100 dark:before:border-gray-700/50 before:h-full">
                        {activities.map((item) => (
                            <div key={item.id} className="relative pl-12">
                                <div className={`absolute left-0 top-0 h-12 w-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center z-10 shadow-sm border-4 border-white dark:border-gray-800`}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div className="bg-gray-50/50 dark:bg-gray-900/30 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                        <h4 className="text-base font-bold text-gray-900 dark:text-white">{item.title}</h4>
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <Clock className="h-3 w-3" />
                                            {item.time}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-12 w-full py-4 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-2xl transition-all cursor-pointer">
                        Load More Activity
                    </button>
                </div>
            </div>
        </div>
    );
}
