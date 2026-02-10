"use client";

import { useState } from 'react';
import { Users, Search, Filter, MoreVertical, Edit2, Shield, Trash2, UserPlus } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import Link from 'next/link';

import { notFound } from 'next/navigation';

export default function UsersPage() {
    const { user } = useAppSelector((state) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');

    if (!user?.role?.includes('super_admin')) {
        notFound();
    }

    const mockUsers = [
        { id: '1', full_name: 'Ai Use Mail', email: 'aiusemail01@gmail.com', role: ['user'], permissions: ['modules~permission~profile', 'modules~permission~settings'], status: 'active' },
        { id: '2', full_name: 'Super Admin', email: 'admin@example.com', role: ['super_admin'], permissions: ['*'], status: 'active' },
        { id: '3', full_name: 'Sarah Connor', email: 'sarah@resistance.com', role: ['user'], permissions: ['modules~permission~profile'], status: 'inactive' },
        { id: '4', full_name: 'John Doe', email: 'john@example.com', role: ['manager'], permissions: ['modules~permission~profile', 'modules~permission~activity'], status: 'active' },
    ];

    const filteredUsers = mockUsers.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">User Management</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">View and manage all registered users in the system.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer">
                    <UserPlus className="h-4 w-4" />
                    Add New User
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
                            <Filter className="h-4 w-4" />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                {user.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{user.full_name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-1">
                                            {user.role.map((r, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-purple-100/50 dark:border-purple-800/50">
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.status === 'active'
                                            ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/permissions?user=${user.id}`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                                                title="Manage Permissions"
                                            >
                                                <Shield className="h-4 w-4" />
                                            </Link>
                                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors cursor-pointer">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
