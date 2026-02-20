"use client";

import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { Users, Search, Edit2, Shield, Save, X, Loader2, Key, CheckCircle2, ChevronDown, ChevronUp, Lock, MoreVertical, Trash2, Check, UserIcon, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/features/toast/toastSlice';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string[];
    permissions: string[];
    created_at: string;
    updated_at: string;
}

interface Role {
    _id: string;
    name: string;
    permissions: string[];
    is_default?: boolean;
}

interface PermissionMatrix {
    modules: string[];
    actions: string[];
    permissions: string[];
}

export default function UsersPage() {
    const router = useRouter();
    const { user: loggedInUser } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [matrix, setMatrix] = useState<PermissionMatrix | null>(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Edit Name State
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);

    // Access Modal State
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [targetUser, setTargetUser] = useState<User | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [customPermissions, setCustomPermissions] = useState<string[]>([]);
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const [updatingAccess, setUpdatingAccess] = useState(false);
    const [customRoleInput, setCustomRoleInput] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const hasPermission = loggedInUser?.role?.includes('super_admin') || loggedInUser?.permissions?.includes('users.view');
    const canEdit = loggedInUser?.role?.includes('super_admin') || loggedInUser?.permissions?.includes('users.edit');
    const canManageAccess = loggedInUser?.role?.includes('super_admin') || loggedInUser?.permissions?.includes('users.manage');

    useEffect(() => {
        if (!loading && !hasPermission && loggedInUser) {
            router.push('/dashboard');
            dispatch(showToast({ message: 'You do not have permission to access User Directory', type: 'error' }));
        }
    }, [hasPermission, loading, loggedInUser, router, dispatch]);

    const debouncedSearch = useCallback(
        debounce((query: string) => {
            setSearchQuery(query);
            setCurrentPage(1);
        }, 2000),
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, limit, searchQuery, sortBy, sortOrder]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, rolesRes, matrixRes] = await Promise.all([
                fetch(`/api/auth/users?page=${currentPage}&limit=${limit}&sortBy=${sortBy}&order=${sortOrder}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`),
                fetch('/api/roles/list'),
                fetch('/api/permissions/matrix')
            ]);

            const usersData = await usersRes.json();
            const rolesData = await rolesRes.json();
            const matrixData = await matrixRes.json();

            if (usersData.success && usersData.data) {
                setUsers(usersData.data);
                const total = usersData.meta?.totalCount || usersData.total || usersData.data.length;
                setTotalItems(total);
                setTotalPages(usersData.meta?.totalPages || usersData.totalPages || Math.ceil(total / limit));
            }
            if (rolesData.success) setRoles(rolesData.data);
            if (matrixData.success) setMatrix(matrixData.data);

        } catch (error) {
            console.error('Error fetching data:', error);
            dispatch(showToast({ message: 'Error loading page data', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    const handleEditClick = (userId: string, fullName: string) => {
        if (userId === loggedInUser?.id) {
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
        if (!canEdit) {
            dispatch(showToast({ message: 'You do not have permission to edit users', type: 'error' }));
            return;
        }
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
                fetchData();
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

    const handleOpenAccessModal = (user: User) => {
        if (user.id === loggedInUser?.id) {
            dispatch(showToast({ message: 'You cannot manage your own access and roles', type: 'error' }));
            return;
        }
        setTargetUser(user);
        setSelectedRoles(user.role || []);
        setCustomPermissions(user.permissions || []);
        setIsAccessModalOpen(true);
        setExpandedModule(null);
    };

    const handleUpdateAccess = async () => {
        if (!targetUser) return;
        if (!canManageAccess) {
            dispatch(showToast({ message: 'You do not have permission to manage access', type: 'error' }));
            return;
        }

        try {
            setUpdatingAccess(true);
            const response = await fetch(`/api/users/${targetUser.id}/updateAccess`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: selectedRoles,
                    custom_permissions: customPermissions
                }),
            });

            const result = await response.json();

            if (result.success) {
                dispatch(showToast({ message: 'Access updated successfully', type: 'success' }));
                setIsAccessModalOpen(false);
                fetchData();
            } else {
                dispatch(showToast({ message: result.message || 'Failed to update access', type: 'error' }));
            }
        } catch (error) {
            console.error('Error updating access:', error);
            dispatch(showToast({ message: 'Error updating access', type: 'error' }));
        } finally {
            setUpdatingAccess(false);
        }
    };

    const toggleRole = (roleName: string) => {
        const isSelected = selectedRoles.includes(roleName);
        const roleObj = roles.find(r => r.name === roleName);

        if (isSelected) {
            // REMOVING ROLE
            const newRoles = selectedRoles.filter(r => r !== roleName);
            setSelectedRoles(newRoles);

            if (roleObj?.permissions) {
                // Find permissions of OTHER remaining roles
                const otherRoles = roles.filter(r => newRoles.includes(r.name) && r.name !== roleName);
                const otherPerms = new Set(otherRoles.flatMap(r => r.permissions || []));

                setCustomPermissions(prev => {
                    // Filter out permissions that were in the removed role,
                    // UNLESS they are also granted by another active role
                    return prev.filter(p => !roleObj.permissions.includes(p) || otherPerms.has(p));
                });
                dispatch(showToast({ message: `Reverted permissions for ${roleName}`, type: 'info' }));
            }
        } else {
            // ADDING ROLE
            setSelectedRoles(prev => [...prev, roleName]);
            if (roleObj?.permissions) {
                setCustomPermissions(prev => Array.from(new Set([...prev, ...roleObj.permissions])));
                dispatch(showToast({ message: `Auto-selected permissions for ${roleName}`, type: 'success' }));
            }
        }
    };

    const addCustomRole = () => {
        const trimmed = customRoleInput.trim().toLowerCase();
        if (!trimmed) return;

        if (selectedRoles.includes(trimmed)) {
            dispatch(showToast({ message: 'Role already added', type: 'info' }));
        } else {
            setSelectedRoles(prev => [...prev, trimmed]);
            // For custom roles not in list, we don't know their default perms,
            // but we might want to check if it exists in 'roles' array even if added via text
            const existingRole = roles.find(r => r.name === trimmed);
            if (existingRole?.permissions) {
                setCustomPermissions(prev => Array.from(new Set([...prev, ...existingRole.permissions])));
            }
            dispatch(showToast({ message: `Added custom role: ${trimmed}`, type: 'success' }));
        }
        setCustomRoleInput('');
    };

    const removeRole = (roleName: string) => {
        // Reuse toggleRole logic for consistent permission handling
        if (selectedRoles.includes(roleName)) {
            toggleRole(roleName);
        }
    };

    const togglePermission = (perm: string) => {
        setCustomPermissions(prev =>
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        );
    };

    if (!loggedInUser && loading) {
        return (
            <div className="flex items-center justify-center min-vh-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">User Directory</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Manage user access, roles, and identity across the system.</p>
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
                            onChange={handleSearchChange}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8">
                            <TableSkeleton rows={limit} columns={5} />
                        </div>
                    ) : users.length === 0 ? (
                        <EmptyState
                            title={searchQuery ? "No users found" : "No users yet"}
                            description={searchQuery
                                ? `No users matched your search for "${searchTerm}"`
                                : "Start building your community by adding your first user."}
                            icon={<Users className="h-12 w-12 text-gray-400" />}
                        />
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                                    <th
                                        className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors group"
                                        onClick={() => handleSort('first_name')}
                                    >
                                        <div className="flex items-center gap-2">
                                            User
                                            <span className="text-gray-300 group-hover:text-blue-400 transition-colors">
                                                {sortBy === 'first_name' ? (
                                                    sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                                ) : (
                                                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                                                )}
                                            </span>
                                        </div>
                                    </th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Active Roles</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Permissions</th>
                                    <th
                                        className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors group text-right"
                                        onClick={() => handleSort('updated_at')}
                                    >
                                        <div className="flex items-center justify-end gap-2">
                                            Date
                                            <span className="text-gray-300 group-hover:text-blue-400 transition-colors">
                                                {sortBy === 'updated_at' ? (
                                                    sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                                ) : (
                                                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                                                )}
                                            </span>
                                        </div>
                                    </th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {users.map((u) => (
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
                                                        {p}
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
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(u.updated_at || u.created_at).toLocaleDateString('en-GB')}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Tooltip content={u.id === loggedInUser?.id ? "You cannot manage your own access" : !canManageAccess ? "You do not have permission to manage access" : "Manage Access & Roles"}>
                                                    <div className={(!canManageAccess || u.id === loggedInUser?.id) ? "cursor-not-allowed" : ""}>
                                                        <button
                                                            onClick={() => handleOpenAccessModal(u)}
                                                            disabled={!canManageAccess || u.id === loggedInUser?.id}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                                                        >
                                                            <Key className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </Tooltip>
                                                <Tooltip content={!canManageAccess ? "You do not have permission to view matrix" : "View Direct Matrix"}>
                                                    <div className={!canManageAccess ? "cursor-not-allowed" : ""}>
                                                        <Link
                                                            href={canManageAccess ? `/permissions?user=${u.id}` : '#'}
                                                            className={`p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center ${!canManageAccess ? 'opacity-30 pointer-events-none' : 'cursor-pointer'}`}
                                                        >
                                                            <Shield className="h-4 w-4" />
                                                        </Link>
                                                    </div>
                                                </Tooltip>
                                                <Tooltip content={!canEdit ? "You do not have permission to edit users" : "Edit Name"}>
                                                    <div className={(!canEdit || u.id === loggedInUser?.id) ? "cursor-not-allowed" : ""}>
                                                        <button
                                                            onClick={() => handleEditClick(u.id, u.full_name)}
                                                            disabled={u.id === loggedInUser?.id || editingUserId !== null || !canEdit}
                                                            className={`p-2 rounded-lg transition-colors ${u.id === loggedInUser?.id || !canEdit
                                                                ? 'text-gray-300 dark:text-gray-600 pointer-events-none'
                                                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer'
                                                                }`}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    limit={limit}
                    onLimitChange={(newLimit) => {
                        setLimit(newLimit);
                        setCurrentPage(1);
                    }}
                    totalItems={totalItems}
                />
            </div>

            {/* Access Modal */}
            {isAccessModalOpen && targetUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                                    <Key className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Access Control</h2>
                                    <p className="text-sm text-gray-500">Manage roles and custom overrides for {targetUser.full_name}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAccessModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10">
                            {/* Roles Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                        Assigned Roles
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={customRoleInput}
                                            onChange={(e) => setCustomRoleInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addCustomRole()}
                                            placeholder="Add custom role..."
                                            className="px-3 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <button
                                            onClick={addCustomRole}
                                            className="p-1 px-3 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    {selectedRoles.length === 0 && (
                                        <span className="text-xs text-gray-400 italic">No roles selected</span>
                                    )}
                                    {selectedRoles.map(role => (
                                        <div
                                            key={role}
                                            className="group flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800"
                                        >
                                            <span className="capitalize">{role}</span>
                                            <button
                                                onClick={() => removeRole(role)}
                                                className="hover:text-red-500 transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {roles.map(role => {
                                        const isSelected = selectedRoles.includes(role.name);
                                        return (
                                            <div
                                                key={role._id}
                                                onClick={() => toggleRole(role.name)}
                                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-center ${isSelected
                                                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                    : 'border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200'
                                                    }`}
                                            >
                                                <span className="text-xs font-bold capitalize">{role.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Custom Permissions Section */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">
                                    Custom Permission Overrides
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {matrix?.modules.map(moduleName => {
                                        const permsInModule = matrix.permissions.filter(p => p.startsWith(`${moduleName}.`));
                                        const isExpanded = expandedModule === moduleName;

                                        return (
                                            <div key={moduleName} className="border border-gray-100 dark:border-gray-800 rounded-3xl">
                                                <div className="p-4 flex items-center justify-between">
                                                    <span className="font-bold text-gray-900 dark:text-white capitalize">{moduleName}</span>
                                                    <button
                                                        onClick={() => setExpandedModule(isExpanded ? null : moduleName)}
                                                        className="p-2 flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
                                                    >
                                                        {permsInModule.filter(p => customPermissions.includes(p)).length} Set
                                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {isExpanded && (
                                                    <div className="p-4 pt-0 grid grid-cols-1 gap-2 border-t border-gray-50 dark:border-gray-800 mt-2">
                                                        {permsInModule.map(perm => (
                                                            <div
                                                                key={perm}
                                                                onClick={() => togglePermission(perm)}
                                                                className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${customPermissions.includes(perm)
                                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'
                                                                    }`}
                                                            >
                                                                <span className="text-[10px] font-bold">
                                                                    {perm}
                                                                </span>
                                                                {customPermissions.includes(perm) && <CheckCircle2 className="h-3 w-3" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-end gap-4">
                            <button onClick={() => setIsAccessModalOpen(false)} className="px-6 py-3 font-bold text-gray-500 cursor-pointer">
                                Cancel
                            </button>
                            <Tooltip content={!canManageAccess ? "You do not have permission to manage access" : ""}>
                                <div className={!canManageAccess ? "cursor-not-allowed" : ""}>
                                    <button
                                        onClick={handleUpdateAccess}
                                        disabled={updatingAccess || !canManageAccess}
                                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        {updatingAccess ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Save Access Changes
                                    </button>
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
