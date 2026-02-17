"use client";

import { useState, useEffect } from 'react';
import {
    Shield,
    Plus,
    Search,
    Edit2,
    Trash2,
    Save,
    X,
    Loader2,
    CheckCircle2,
    Grid,
    Info,
    ChevronDown,
    ChevronUp,
    Lock
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { showToast } from '@/lib/features/toast/toastSlice';

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

    // Modal/Edit state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleName, setRoleName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [expandedModule, setExpandedModule] = useState<string | null>(null);

    const isSuperAdmin = loggedInUser?.role?.includes('super_admin');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesRes, matrixRes] = await Promise.all([
                fetch('/api/roles/list'),
                fetch('/api/permissions/matrix')
            ]);

            const rolesData = await rolesRes.json();
            const matrixData = await matrixRes.json();

            if (rolesData.success) {
                setRoles(rolesData.data);
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

    const handleOpenModal = (role?: Role) => {
        if (role) {
            setEditingRole(role);
            setRoleName(role.name);
            setSelectedPermissions(role.permissions);
        } else {
            setEditingRole(null);
            setRoleName('');
            setSelectedPermissions([]);
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

    const togglePermission = (perm: string) => {
        setSelectedPermissions(prev =>
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        );
    };

    const toggleModuleAll = (moduleName: string, permsInModule: string[]) => {
        const allSelected = permsInModule.every(p => selectedPermissions.includes(p));
        if (allSelected) {
            setSelectedPermissions(prev => prev.filter(p => !permsInModule.includes(p)));
        } else {
            setSelectedPermissions(prev => [...new Set([...prev, ...permsInModule])]);
        }
    };

    const handleSave = async () => {
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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this role?')) return;

        try {
            const response = await fetch(`/api/roles/delete/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                dispatch(showToast({ message: 'Role deleted successfully', type: 'success' }));
                fetchData();
            } else {
                dispatch(showToast({ message: result.message || 'Delete failed', type: 'error' }));
            }
        } catch (error) {
            console.error('Error deleting role:', error);
            dispatch(showToast({ message: 'Error deleting role', type: 'error' }));
        }
    };

    const filteredRoles = roles.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
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
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
                >
                    <Plus className="h-5 w-5" />
                    Create New Role
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search roles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
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
                                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-bold">
                                            {role.permissions?.length || 0} Permissions
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {role.is_default ? (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                                    <Lock className="h-3.5 w-3.5 text-gray-400" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Default</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenModal(role)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                                                        title="Edit Role"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(role._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                                                        title="Delete Role"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRoles.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-8 py-12 text-center text-gray-500">
                                        No roles found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
                                        {editingRole ? 'Edit Role' : 'Create New Role'}
                                    </h2>
                                    <p className="text-sm text-gray-500">Configure role name and permissions matrix</p>
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
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-lg font-bold"
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
                                        const allSelected = permsInModule.every(p => selectedPermissions.includes(p));
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
                                                        className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all text-gray-400"
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
                                                                className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${selectedPermissions.includes(perm)
                                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'
                                                                    }`}
                                                            >
                                                                <span className="text-xs font-bold capitalize">
                                                                    {perm.split('.').slice(1).join(' ').replace(/\./g, ' ')}
                                                                </span>
                                                                {selectedPermissions.includes(perm) && <CheckCircle2 className="h-3 w-3" />}
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
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {saving ? 'Saving...' : 'Save Role Configuration'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
