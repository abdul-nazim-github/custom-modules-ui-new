"use client";

import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import {
    Shield,
    Plus,
    Search,
    Edit2,
    Trash2,
    Save,
    X,
    Loader2,
    Check,
    CheckCircle2,
    Info,
    ChevronDown,
    ChevronUp,
    Lock,
    Eye
} from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip'; // Added Tooltip import
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { showToast } from '@/lib/features/toast/toastSlice';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Role {
    _id: string;
    name: string;
    permissions: string[];
    is_default?: boolean;
    created_at: string;
    updated_at: string;
}

interface PermissionMatrix {
    modules: string[];
    actions: string[];
    permissions: string[];
}

export default function RolesPage() {
    const { user: loggedInUser } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();

    const [roles, setRoles] = useState<Role[]>([]);
    const [matrix, setMatrix] = useState<PermissionMatrix | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Modal/Edit state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleName, setRoleName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const [viewOnly, setViewOnly] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const hasPermission = loggedInUser?.role?.includes('super_admin') || loggedInUser?.permissions?.includes('roles.view');
    const canCreate = loggedInUser?.role?.includes('super_admin') || loggedInUser?.permissions?.includes('roles.create');
    const canEdit = loggedInUser?.role?.includes('super_admin') || loggedInUser?.permissions?.includes('roles.edit');
    const canDelete = loggedInUser?.role?.includes('super_admin') || loggedInUser?.permissions?.includes('roles.delete');

    useEffect(() => {
        if (!loading && !hasPermission && loggedInUser) {
            dispatch(showToast({ message: 'You do not have permission to access Role Management', type: 'error' }));
            // Redirect or hide content
        }
    }, [hasPermission, loading, loggedInUser, dispatch]);

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
    }, [currentPage, limit, searchQuery]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesRes, matrixRes] = await Promise.all([
                fetch(`/api/roles/list?page=${currentPage}&limit=${limit}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`),
                fetch('/api/permissions/matrix')
            ]);

            const rolesData = await rolesRes.json();
            const matrixData = await matrixRes.json();

            if (rolesData.success) {
                setRoles(rolesData.data);
                const total = rolesData.meta?.totalCount || rolesData.total || rolesData.data.length;
                setTotalItems(total);
                setTotalPages(rolesData.meta?.totalPages || rolesData.totalPages || Math.ceil(total / limit));
            }
            if (matrixData.success) {
                setMatrix(matrixData.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            dispatch(showToast({ message: 'Error loading roles data', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (role?: Role, forceViewOnly: boolean = false) => {
        if (role) {
            setEditingRole(role);
            setRoleName(role.name);
            setSelectedPermissions(role.permissions || []);
            setViewOnly(forceViewOnly || role.is_default || !canEdit);
        } else {
            setEditingRole(null);
            setRoleName('');
            setSelectedPermissions([]);
            setViewOnly(false);
        }
        setIsModalOpen(true);
        setExpandedModule(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRole(null);
        setRoleName('');
        setSelectedPermissions([]);
    };

    const isPermissionActive = (perm: string) => {
        if (selectedPermissions.includes('*')) return true;
        const moduleName = perm.split('.')[0];
        if (selectedPermissions.includes(`${moduleName}.*`)) return true;
        return selectedPermissions.includes(perm);
    };

    const togglePermission = (perm: string) => {
        if (viewOnly) return;

        // If super admin wildcard exists, toggle it off and expand all others EXCEPT this one
        if (selectedPermissions.includes('*')) {
            const allPerms = matrix?.permissions.filter(p => p !== perm) || [];
            setSelectedPermissions(allPerms);
            return;
        }

        const moduleName = perm.split('.')[0];
        const moduleWildcard = `${moduleName}.*`;

        // If module wildcard exists, toggle it off and expand other perms in module
        if (selectedPermissions.includes(moduleWildcard)) {
            const permsInModule = matrix?.permissions.filter(p => p.startsWith(`${moduleName}.`) && p !== perm) || [];
            const otherPerms = selectedPermissions.filter(p => p !== moduleWildcard);
            setSelectedPermissions([...otherPerms, ...permsInModule]);
            return;
        }

        setSelectedPermissions(prev =>
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        );
    };

    const toggleModuleAll = (moduleName: string, permsInModule: string[]) => {
        if (viewOnly) return;

        const moduleWildcard = `${moduleName}.*`;
        const hasFullWildcard = selectedPermissions.includes('*');
        const hasModuleWildcard = selectedPermissions.includes(moduleWildcard);
        const allExplicitSelected = permsInModule.every(p => selectedPermissions.includes(p));

        if (hasFullWildcard) {
            // Remove full wildcard, add all other modules' perms
            const otherPerms = matrix?.permissions.filter(p => !p.startsWith(`${moduleName}.`)) || [];
            setSelectedPermissions(otherPerms);
            return;
        }

        if (hasModuleWildcard || allExplicitSelected) {
            // Remove wildcard or all explicit perms
            setSelectedPermissions(prev => prev.filter(p => !permsInModule.includes(p) && p !== moduleWildcard));
        } else {
            // Add module wildcard instead of listing all
            setSelectedPermissions(prev => [...new Set([...prev.filter(p => !permsInModule.includes(p)), moduleWildcard])]);
        }
    };

    const handleSave = async () => {
        if (editingRole ? !canEdit : !canCreate) {
            dispatch(showToast({ message: `You do not have permission to ${editingRole ? 'edit' : 'create'} roles`, type: 'error' }));
            return;
        }
        if (!roleName.trim()) {
            dispatch(showToast({ message: 'Role name is required', type: 'error' }));
            return;
        }

        try {
            setSaving(true);
            const url = editingRole
                ? `/api/roles/update/${editingRole._id}`
                : '/api/roles/create';

            const method = editingRole ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: roleName,
                    permissions: selectedPermissions
                }),
            });

            const result = await response.json();

            if (result.success) {
                dispatch(showToast({
                    message: `Role ${editingRole ? 'updated' : 'created'} successfully`,
                    type: 'success'
                }));
                handleCloseModal();
                fetchData();
            } else {
                dispatch(showToast({ message: result.message || 'Operation failed', type: 'error' }));
            }
        } catch (error) {
            console.error('Error saving role:', error);
            dispatch(showToast({ message: 'Error saving role', type: 'error' }));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            setIsDeleting(true);
            const response = await fetch(`/api/roles/delete/${itemToDelete.id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                dispatch(showToast({ message: 'Role deleted successfully', type: 'success' }));
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
                fetchData();
            } else {
                dispatch(showToast({ message: result.message || 'Delete failed', type: 'error' }));
            }
        } catch (error) {
            console.error('Error deleting role:', error);
            dispatch(showToast({ message: 'Error deleting role', type: 'error' }));
        } finally {
            setIsDeleting(false);
        }
    };

    const openDeleteModal = (id: string, name: string) => {
        setItemToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const filteredRoles = roles;

    if (!loggedInUser && loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Role Management</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Define and manage system roles and their default permissions.</p>
                </div>
                <Tooltip
                    content={!canCreate ? "You do not have permission to create roles" : ""}
                >
                    <div className={!canCreate ? "cursor-not-allowed w-fit" : "w-fit"}>
                        <button
                            onClick={() => handleOpenModal()}
                            disabled={!canCreate}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        >
                            <Plus className="h-5 w-5" />
                            Create New Role
                        </button>
                    </div>
                </Tooltip>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search roles..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8">
                            <TableSkeleton rows={limit} columns={4} />
                        </div>
                    ) : filteredRoles.length === 0 ? (
                        <EmptyState
                            title={searchQuery ? "No roles found" : "No roles yet"}
                            description={searchQuery
                                ? `No roles matched your search for "${searchTerm}"`
                                : "Define access levels by creating your first role."}
                            icon={<Shield className="h-12 w-12 text-gray-400" />}
                            action={{
                                label: "Create Role",
                                onClick: () => {
                                    setEditingRole(null);
                                    setRoleName('');
                                    setSelectedPermissions([]);
                                    setIsModalOpen(true);
                                },
                                disabled: !canCreate,
                                tooltip: !canCreate ? "You do not have permission to create roles" : ""
                            }}
                        />
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Role Name</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Permissions Count</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredRoles.map((role) => (
                                    <tr key={role._id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                                    <Shield className="h-5 w-5" />
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white capitalize">{role.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-1">
                                                {(() => {
                                                    const isFull = role.permissions?.includes('*') ||
                                                        (matrix && role.permissions?.length === matrix.permissions.length);

                                                    if (isFull) {
                                                        return (
                                                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-800 flex items-center gap-1.5">
                                                                <Shield className="h-3 w-3" />
                                                                Full System Access
                                                            </span>
                                                        );
                                                    }

                                                    const wildcards = role.permissions?.filter(p => p.endsWith('.*')) || [];
                                                    const regularCount = (role.permissions?.length || 0) - wildcards.length;

                                                    if (wildcards.length === 0) {
                                                        return (
                                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-bold">
                                                                {role.permissions?.length || 0} Permissions
                                                            </span>
                                                        );
                                                    }

                                                    return (
                                                        <div className="flex flex-wrap gap-1">
                                                            {wildcards.map(w => (
                                                                <span key={w} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded text-[10px] font-bold border border-purple-100 dark:border-purple-800">
                                                                    All {w.split('.')[0]}
                                                                </span>
                                                            ))}
                                                            {regularCount > 0 && (
                                                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-[10px] font-bold">
                                                                    +{regularCount} More
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                {role.is_default && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                                        <Lock className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Default</span>
                                                    </div>
                                                )}
                                                <Tooltip
                                                    content="View Role Permissions"
                                                >
                                                    <div className={(!hasPermission) ? "cursor-not-allowed" : ""}>
                                                        <button
                                                            onClick={() => handleOpenModal(role, true)}
                                                            disabled={!hasPermission}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </Tooltip>
                                                {!role.is_default && (
                                                    <Tooltip
                                                        content={!canEdit ? "You do not have permission to edit roles" : "Edit Role"}
                                                    >
                                                        <div className={(!canEdit) ? "cursor-not-allowed" : ""}>
                                                            <button
                                                                onClick={() => handleOpenModal(role, false)}
                                                                disabled={!canEdit}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </Tooltip>
                                                )}
                                                <Tooltip
                                                    content={!canDelete ? "You do not have permission to delete roles" : "Delete Role"}
                                                >
                                                    <div className={(!canDelete || role.is_default) ? "cursor-not-allowed" : ""}>
                                                        <button
                                                            onClick={() => openDeleteModal(role._id, role.name)}
                                                            disabled={!canDelete || role.is_default}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                        {editingRole ? (viewOnly ? 'View Role' : 'Edit Role') : 'Create New Role'}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {viewOnly ? 'View name and permissions matrix' : 'Configure role name and permissions matrix'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-3 hover:bg-white dark:hover:bg-gray-800 rounded-2xl transition-all cursor-pointer text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">
                                    Role Identification
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Supervisor, Support Agent, Manager"
                                    value={roleName}
                                    onChange={(e) => setRoleName(e.target.value)}
                                    disabled={viewOnly}
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-lg font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                        Permission Matrix
                                    </label>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                                        {selectedPermissions.length} Active
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {matrix?.modules.map((moduleName) => {
                                        const permsInModule = matrix.permissions.filter(p => p.startsWith(`${moduleName}.`));
                                        const isExpanded = expandedModule === moduleName;
                                        const moduleWildcard = `${moduleName}.*`;
                                        const allSelected = selectedPermissions.includes('*') ||
                                            selectedPermissions.includes(moduleWildcard) ||
                                            permsInModule.every(p => selectedPermissions.includes(p));
                                        const someSelected = permsInModule.some(p => selectedPermissions.includes(p));

                                        return (
                                            <div
                                                key={moduleName}
                                                className={`border rounded-3xl transition-all ${isExpanded
                                                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50/10'
                                                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                                    }`}
                                            >
                                                <div className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => toggleModuleAll(moduleName, permsInModule)}
                                                            className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${allSelected
                                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                                : someSelected
                                                                    ? 'bg-blue-100 border-blue-600 text-blue-600'
                                                                    : 'border-gray-300 dark:border-gray-600'
                                                                }`}
                                                        >
                                                            {allSelected && <CheckCircle2 className="h-3 w-3" />}
                                                            {!allSelected && someSelected && <div className="h-1.5 w-1.5 bg-blue-600 rounded-sm" />}
                                                        </button>
                                                        <span className="font-bold text-gray-900 dark:text-white capitalize truncate">{moduleName}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setExpandedModule(isExpanded ? null : moduleName)}
                                                        className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all text-gray-400 cursor-pointer"
                                                    >
                                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                    </button>
                                                </div>

                                                {isExpanded && (
                                                    <div className="p-4 pt-0 grid grid-cols-1 gap-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                                                        {permsInModule.map(perm => (
                                                            <div
                                                                key={perm}
                                                                onClick={() => togglePermission(perm)}
                                                                className={`p-3 rounded-xl flex items-center justify-between transition-all ${isPermissionActive(perm)
                                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'
                                                                    } ${viewOnly ? 'cursor-default' : 'cursor-pointer'}`}
                                                            >
                                                                <span className="text-xs font-bold capitalize">
                                                                    {perm.split('.').slice(1).join(' ').replace(/\./g, ' ')}
                                                                </span>
                                                                {isPermissionActive(perm) && <CheckCircle2 className="h-3 w-3" />}
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

                        <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-xl border border-orange-100 dark:border-orange-800">
                                <Info className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Overrides possible via user settings</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-6 py-3 text-gray-500 font-bold hover:bg-white dark:hover:bg-gray-800 rounded-2xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <Tooltip
                                    content={editingRole ? (!canEdit ? "You do not have permission to edit roles" : "") : (!canCreate ? "You do not have permission to create roles" : "")}
                                >
                                    <div className={(editingRole ? !canEdit : !canCreate) ? "cursor-not-allowed" : ""}>
                                        {!viewOnly && (
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                                            >
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                {saving ? 'Saving...' : 'Save Role Configuration'}
                                            </button>
                                        )}
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                itemName={itemToDelete?.name}
                isLoading={isDeleting}
                message="Are you sure you want to delete this role? This will affecting all users currently assigned to it."
            />
        </div>
    );
}
