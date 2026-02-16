"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    User,
    Activity,
    Settings,
    Shield,
    Users,
    Lock,
    LogOut,
    ChevronRight,
    Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { logout } from '@/lib/features/auth/authSlice';
import { showToast } from '@/lib/features/toast/toastSlice';
import { useRouter } from 'next/navigation';

interface SidebarProps {
    className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const isSuperAdmin = user?.role?.includes('super_admin');

    const navItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            show: true
        },
        {
            name: 'Profile',
            href: '/profile',
            icon: User,
            show: isSuperAdmin || user?.permissions?.includes('modules~permission~profile')
        },
        {
            name: 'Activity',
            href: '/activity',
            icon: Activity,
            show: isSuperAdmin || user?.permissions?.includes('modules~permission~activity')
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Settings,
            show: isSuperAdmin || user?.permissions?.includes('modules~permission~settings')
        },
        {
            name: 'Security',
            href: '/security',
            icon: Shield,
            show: isSuperAdmin || user?.permissions?.includes('modules~permission~security')
        }
    ];

    const adminItems = [
        {
            name: 'Users',
            href: '/users',
            icon: Users,
            show: isSuperAdmin || user?.permissions?.includes('modules~permission~manage_users')
        },
        {
            name: 'Permissions',
            href: '/permissions',
            icon: Lock,
            show: isSuperAdmin || user?.permissions?.includes('modules~permission~manage_permissions')
        },
        {
            name: 'Contact Submissions',
            href: '/contact-submissions',
            icon: Mail,
            show: isSuperAdmin || user?.permissions?.includes('modules~permission~contact_form')
        }
    ];

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            localStorage.removeItem('user');
            dispatch(logout());
            window.location.href = '/login';
        }
    };

    return (
        <div className={cn("flex h-full w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300", className)}>
            <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                        <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        AdminPro
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                <div>
                    <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        Main Menu
                    </h3>
                    <nav className="space-y-1">
                        {navItems.filter(item => item.show).map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                                        isActive
                                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                            : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={cn("h-5 w-5 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                                        {item.name}
                                    </div>
                                    {isActive && <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {adminItems.some(item => item.show) && (
                    <div>
                        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            Administration
                        </h3>
                        <nav className="space-y-1">
                            {adminItems.filter(item => item.show).map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                                            isActive
                                                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                                : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={cn("h-5 w-5 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                                            {item.name}
                                        </div>
                                        {isActive && <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                        {user?.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {user?.full_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                            {user?.role?.[0]}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 rounded-xl transition-colors cursor-pointer"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}
