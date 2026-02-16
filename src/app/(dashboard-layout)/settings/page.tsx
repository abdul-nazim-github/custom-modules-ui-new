"use client";

import { Settings, Bell, Globe, Moon, Sun, Monitor, Palette, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { notFound } from 'next/navigation';

export default function SettingsPage() {
    const { user } = useAppSelector((state) => state.auth);
    const [theme, setTheme] = useState('system');

    if (!user) return null;

    const hasPermission = user.role.includes('super_admin') || user.permissions.includes('modules~permission~settings');

    if (!hasPermission) {
        notFound();
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">System Settings</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Configure your application preferences and display settings.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Navigation / Sections */}
                <div className="lg:col-span-1 space-y-2">
                    {[
                        { name: 'General', icon: Globe, active: true },
                        { name: 'Appearance', icon: Palette, active: false },
                        { name: 'Notifications', icon: Bell, active: false },
                        { name: 'Email Preferences', icon: Mail, active: false },
                    ].map((item) => (
                        <button
                            key={item.name}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${item.active
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700'
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h3>
                            <p className="text-sm text-gray-500 mt-1">Customize how the dashboard looks on your screen.</p>
                        </div>
                        <div className="p-8 space-y-10">
                            {/* Theme Selection */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Theme Mode</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'light', name: 'Light', icon: Sun },
                                        { id: 'dark', name: 'Dark', icon: Moon },
                                        { id: 'system', name: 'System', icon: Monitor },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setTheme(item.id)}
                                            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${theme === item.id
                                                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20'
                                                : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            <item.icon className={`h-6 w-6 ${theme === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <span className={`text-xs font-bold ${theme === item.id ? 'text-blue-700' : 'text-gray-500'}`}>{item.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Language Selection */}
                            <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Default Language</label>
                                <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white font-medium">
                                    <option>English (United States)</option>
                                    <option>Spanish (Español)</option>
                                    <option>French (Français)</option>
                                    <option>German (Deutsch)</option>
                                </select>
                            </div>

                            {/* Notifications Toggle */}
                            <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Email Notifications</h4>
                                        <p className="text-xs text-gray-500 mt-1">Receive weekly reports and security alerts via email.</p>
                                    </div>
                                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 cursor-pointer">
                                        <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
