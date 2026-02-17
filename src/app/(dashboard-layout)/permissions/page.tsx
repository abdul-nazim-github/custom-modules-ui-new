"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, Lock, Save, RotateCcw, User, CheckCircle2, Loader2, ArrowLeft, Grid } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import Link from 'next/link';
import { showToast } from '@/lib/features/toast/toastSlice';

interface UserData {
    id: string;
    email: string;
    full_name: string;
    role: string[];
    permissions: string[];
}

interface PermissionMatrix {
    modules: string[];
    actions: string[];
    permissions: string[];
}

function PermissionsContent() {
    const { user: loggedInUser } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('user');

    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [matrix, setMatrix] = useState<PermissionMatrix | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [initialPermissions, setInitialPermissions] = useState<string[]>([]);

    const hasPermission = loggedInUser?.role?.includes('super_admin') || loggedInUser?.permissions?.includes('permissions.view');
    const canEdit = loggedInUser?.role?.includes('super_admin') || loggedInUser?.permissions?.includes('permissions.edit');

    useEffect(() => {
        if (!loading && !hasPermission && loggedInUser) {
            router.push('/dashboard');
            dispatch(showToast({ message: 'You do not have permission to access Direct Matrix', type: 'error' }));
        }
    }, [hasPermission, loading, router, dispatch, loggedInUser]);

    useEffect(() => {
        if (!userId) {
            router.push('/users');
        } else {
            fetchData();
        }
    }, [userId, router]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch Matrix
            const matrixRes = await fetch('/api/permissions/matrix');
            const matrixData = await matrixRes.json();

            if (matrixData.success) {
                setMatrix(matrixData.data);
            }

            // Fetch User Permissions from list
            const listRes = await fetch('/api/permissions/list');
            const listData = await listRes.json();

            if (listData.success && listData.data) {
                const userRecord = listData.data.find((item: any) => item.user.id === userId);
                if (userRecord) {
                    setCurrentUser({
                        id: userRecord.user.id,
                        email: userRecord.user.email,
                        full_name: userRecord.user.full_name,
                        role: [], // Role might not be in the permission list record directly but in user list
                        permissions: userRecord.permissions || []
                    });
                    setPermissions(userRecord.permissions || []);
                    setInitialPermissions(userRecord.permissions || []);
                } else {
                    // Fallback to fetch from users list if not in permissions list yet
                    const userRes = await fetch('/api/auth/users');
                    const userData = await userRes.json();
                    if (userData.success && userData.data) {
                        const user = userData.data.find((u: UserData) => u.id === userId);
                        if (user) {
                            setCurrentUser(user);
                            setPermissions(user.permissions || []);
                            setInitialPermissions(user.permissions || []);
                        } else {
                            dispatch(showToast({ message: 'User not found', type: 'error' }));
                            router.push('/users');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            dispatch(showToast({ message: 'Error loading permissions data', type: 'error' }));
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
        if (!canEdit) {
            dispatch(showToast({ message: 'You do not have permission to edit permissions', type: 'error' }));
            return;
        }
        try {
            setSaving(true);
            const response = await fetch(`/api/permissions/update/${userId}`, {
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
    const canSave = hasChanges && !isEditingSelf && canEdit;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading permissions matrix...</p>
                </div>
            </div>
        );
    }

    if (!currentUser || !matrix) {
        return null;
    }

    // Group permissions by module
    const groupedPermissions = matrix.modules.reduce((acc: any, moduleName: string) => {
        acc[moduleName] = matrix.permissions.filter(p => p.startsWith(`${moduleName}.`));
        return acc;
    }, {});

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
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Access Matrix</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Configure fine-grained module permissions for {currentUser.full_name}.</p>
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
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Editing Permissions For</p>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser.full_name}</h3>
                            <p className="text-sm text-gray-500">{currentUser.email} • {currentUser.role?.join(', ') || 'User'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {matrix.modules.map((moduleName) => (
                            <div key={moduleName} className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-blue-600">
                                        <Grid className="h-5 w-5" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{moduleName} Module</h4>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {groupedPermissions[moduleName].map((perm: string) => {
                                        const isSelected = permissions.includes(perm);
                                        const action = perm.split('.').slice(1).join('.');

                                        return (
                                            <div
                                                key={perm}
                                                onClick={() => togglePermission(perm)}
                                                className={`p-4 rounded-2xl border-2 transition-all group ${isSelected
                                                    ? 'border-blue-600 bg-white dark:bg-gray-800'
                                                    : 'border-transparent bg-white/50 dark:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700'
                                                    } ${isEditingSelf ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-sm font-bold capitalize transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}>
                                                        {action.replace(/\./g, ' ')}
                                                    </span>
                                                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                        ? 'border-blue-600 bg-blue-600 text-white'
                                                        : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                                                        }`}>
                                                        {isSelected && <CheckCircle2 className="h-3 w-3" />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                        <Shield className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Role Based Access Control</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Changes here override default role permissions. User will need to refresh their session to see updates.</p>
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
