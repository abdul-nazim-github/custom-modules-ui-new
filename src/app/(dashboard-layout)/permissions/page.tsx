"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, Lock, Save, RotateCcw, User, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { showToast } from '@/lib/features/toast/toastSlice';

interface UserData {
    id: string;
    email: string;
    full_name: string;
    role: string[];
    permissions: string[];
}

function PermissionsContent() {
    const { user: loggedInUser } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('user');

    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [initialPermissions, setInitialPermissions] = useState<string[]>([]);

    const hasAccess = loggedInUser?.role?.includes('super_admin') || loggedInUser?.permissions?.includes('modules~permission~manage_permissions');

    useEffect(() => {
        if (!loading && !hasAccess) {
            router.push('/dashboard');
            dispatch(showToast({ message: 'You do not have permission to access this page', type: 'error' }));
        }
    }, [hasAccess, loading, router, dispatch]);

    useEffect(() => {
        if (!userId) {
            router.push('/users');
        } else {
            fetchUserData();
        }
    }, [userId, router]);
    const modules = [
        { id: 'profile', name: 'Profile Module', permission: 'modules~permission~profile', description: 'Access to view and edit personal profile information.' },
        { id: 'activity', name: 'Activity Module', permission: 'modules~permission~activity', description: 'Access to view account activity logs and history.' },
        { id: 'settings', name: 'Settings Module', permission: 'modules~permission~settings', description: 'Access to configure system and display preferences.' },
        { id: 'security', name: 'Security Module', permission: 'modules~permission~security', description: 'Access to security controls, password changes and 2FA.' },
        { id: 'manage_users', name: 'Manage Users', permission: 'modules~permission~manage_users', description: 'Access to view and edit user information.' },
        { id: 'manage_permissions', name: 'Manage Permissions', permission: 'modules~permission~manage_permissions', description: 'Access to modify user permissions.' },
        { id: 'contact_form', name: 'Contact Form', permission: 'modules~permission~contact_form', description: 'Access to view contact form submissions.' },
    ];

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/auth/users?page=1&limit=100');
            const result = await response.json();

            if (result.success && result.data) {
                const user = result.data.find((u: UserData) => u.id === userId);
                if (user) {
                    setCurrentUser(user);
                    setPermissions(user.permissions || []);
                    setInitialPermissions(user.permissions || []);
                } else {
                    dispatch(showToast({ message: 'User not found', type: 'error' }));
                    router.push('/users');
                }
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            dispatch(showToast({ message: 'Error loading user data', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const isEditingSelf = userId === loggedInUser?.id;

    const togglePermission = (perm: string) => {
        if (isEditingSelf) {
            dispatch(showToast({ message: 'You cannot modify your own permissions', type: 'error' }));
            return;
        }
        setPermissions(prev =>
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await fetch(`/api/auth/users/${userId}/permissions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissions }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                dispatch(showToast({ message: 'Permissions updated successfully', type: 'success' }));
                setInitialPermissions(permissions);
            } else {
                dispatch(showToast({ message: result.message || 'Failed to update permissions', type: 'error' }));
            }
        } catch (error) {
            console.error('Error updating permissions:', error);
            dispatch(showToast({ message: 'Error updating permissions', type: 'error' }));
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setPermissions(initialPermissions);
        dispatch(showToast({ message: 'Changes reset', type: 'info' }));
    };

    const hasChanges = JSON.stringify(permissions.sort()) !== JSON.stringify(initialPermissions.sort());
    const canSave = hasChanges && !isEditingSelf;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading permissions...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return null;
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link
                        href="/users"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-3 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Users
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Module Permissions</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Manage fine-grained module access for this user.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        disabled={!hasChanges || saving}
                        className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 font-bold hover:bg-white dark:hover:bg-gray-800 rounded-2xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!canSave || saving}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isEditingSelf ? 'You cannot modify your own permissions' : ''}
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
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
                            <p className="text-sm text-gray-500">{currentUser.email} • {currentUser.role.join(', ')}</p>
                        </div>
                    </div>
                </div>

                {isEditingSelf && (
                    <div className="px-8 py-4 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-800">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-orange-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-orange-900 dark:text-orange-200">
                                    Viewing Your Own Permissions
                                </p>
                                <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
                                    You cannot modify your own permissions. Ask another administrator for assistance.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-8">
                    <div className="space-y-4">
                        {modules.map((mod) => {
                            const isSelected = permissions.includes(mod.permission);
                            return (
                                <div
                                    key={mod.id}
                                    onClick={() => togglePermission(mod.permission)}
                                    className={`group relative p-6 rounded-3xl border-2 transition-all ${isEditingSelf
                                        ? 'cursor-not-allowed opacity-60 border-gray-200 dark:border-gray-700'
                                        : isSelected
                                            ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10 cursor-pointer'
                                            : 'border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'
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
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        }>
            <PermissionsContent />
        </Suspense>
    );
}
