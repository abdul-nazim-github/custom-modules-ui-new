'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-2xl w-full">
        <h1 className="text-5xl font-extrabold mb-8 text-gray-900 dark:text-white tracking-tight">
          Custom Modules UI
        </h1>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col gap-6 items-center w-full max-w-md mx-auto">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
              Welcome to the Custom Modules application.
            </p>
            <div className="flex flex-col gap-4 w-full">
              <Link
                href="/forgot-password"
                className="w-full px-6 py-3 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-300"
              >
                Forgot Password
              </Link>
              <Link
                href="/reset-password"
                className="w-full px-6 py-3 text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-bold rounded-xl transition-all duration-300"
              >
                Reset Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
