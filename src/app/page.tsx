'use client';

import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { logout } from '@/lib/features/auth/authSlice';
import { showToast } from '@/lib/features/toast/toastSlice';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        dispatch(logout());
        dispatch(showToast({ message: 'Logged out successfully', type: 'success' }));
        router.refresh();
      } else {
        dispatch(showToast({ message: 'Logout failed', type: 'error' }));
      }
    } catch (error) {
      dispatch(showToast({ message: 'An error occurred during logout', type: 'error' }));
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-2xl w-full">
        <h1 className="text-5xl font-extrabold mb-8 text-gray-900 dark:text-white tracking-tight">
          Welcome{user ? `, ${user.full_name}` : ''}
        </h1>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          {!isAuthenticated ? (
            <div className="flex flex-col gap-6 items-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                Please sign in to access your modules and settings.
              </p>
              <Link
                href="/login"
                className="inline-block px-10 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6 items-center">
              <div className="space-y-4 text-left w-full bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-600">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-2">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Email</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-2">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Roles</span>
                  <div className="flex gap-2">
                    {user?.role.map((r) => (
                      <span key={r} className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 font-medium block mb-2">Permissions</span>
                  <div className="flex flex-wrap gap-2">
                    {user?.permissions.map((p) => (
                      <span key={p} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-10 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold rounded-xl border-2 border-red-100 dark:border-red-900/30 transition-all duration-300 cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
