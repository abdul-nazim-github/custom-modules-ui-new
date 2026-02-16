"use client";

import { useState, useEffect } from 'react';
import { Users, Search, Filter, Edit2, Shield, UserPlus, Save, X, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { showToast } from '@/lib/features/toast/toastSlice';
import { useAppDispatch } from '@/lib/hooks';

interface User {
    id: string;
    email: string;
    full_name: string;
    role: string[];
    permissions: string[];
    created_at: string;
}

export default function UsersPage() {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);

    const hasAccess = user?.role?.includes('super_admin') || user?.permissions?.includes('modules~permission~manage_users');
    const canManagePermissions = user?.role?.includes('super_admin') || user?.permissions?.includes('modules~permission~manage_permissions');

    if (!hasAccess) {
        notFound();
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/auth/users?page=1&limit=100&sortBy=name&order=asc');
            const result = await response.json();

            if (result.success && result.data) {
                setUsers(result.data);
            } else {
                dispatch(showToast({ message: 'Failed to load users', type: 'error' }));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            dispatch(showToast({ message: 'Error loading users', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (userId: string, fullName: string) => {
        if (userId === user?.id) {
            dispatch(showToast({ message: 'You cannot edit your own name', type: 'error' }));
            return;
        }
        setEditingUserId(userId);
        setEditName(fullName);
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setEditName('');
    };

    const handleSaveName = async (userId: string) => {
        if (!editName.trim()) {
            dispatch(showToast({ message: 'Name cannot be empty', type: 'error' }));
            return;
        }

        try {
            setSaving(true);
            const nameParts = editName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            const response = await fetch('/api/auth/profile/edit', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ first_name: firstName, last_name: lastName }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                dispatch(showToast({ message: 'Name updated successfully', type: 'success' }));
                setEditingUserId(null);
                setEditName('');
                fetchUsers(); // Refresh the list
            } else {
                dispatch(showToast({ message: result.message || 'Failed to update name', type: 'error' }));
            }
        } catch (error) {
            console.error('Error updating name:', error);
            dispatch(showToast({ message: 'Error updating name', type: 'error' }));
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">User Management</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">View and manage all registered users in the system.</p>
                </div>
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
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-bold text-gray-900 dark:text-white">{filteredUsers.length}</span> users found
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Permissions</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                {u.full_name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                {editingUserId === u.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            className="px-3 py-1.5 text-sm font-bold bg-white dark:bg-gray-900 border border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleSaveName(u.id)}
                                                            disabled={saving}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            disabled={saving}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{u.full_name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-1">
                                            {u.role.map((r, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-purple-100/50 dark:border-purple-800/50">
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                            {u.permissions.slice(0, 3).map((p, i) => (
                                                <span key={i} className="px-2 py-0.5 text-[9px] bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400 font-mono font-bold border border-gray-200 dark:border-gray-600">
                                                    {p.replace('modules~permission~', '')}
                                                </span>
                                            ))}
                                            {u.permissions.length > 3 && (
                                                <span className="px-2 py-0.5 text-[9px] bg-blue-100 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-400 font-bold">
                                                    +{u.permissions.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {canManagePermissions ? (
                                                <Link
                                                    href={`/permissions?user=${u.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                                                    title="Manage Permissions"
                                                >
                                                    <Shield className="h-4 w-4" />
                                                </Link>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="p-2 text-gray-300 dark:text-gray-600 rounded-lg cursor-not-allowed"
                                                    title="You don't have permission to manage permissions"
                                                >
                                                    <Shield className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEditClick(u.id, u.full_name)}
                                                disabled={u.id === user?.id || editingUserId !== null}
                                                className={`p-2 rounded-lg transition-colors ${u.id === user?.id
                                                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer'
                                                    }`}
                                                title={u.id === user?.id ? 'You cannot edit your own name' : 'Edit name'}
                                            >
                                                <Edit2 className="h-4 w-4" />
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
