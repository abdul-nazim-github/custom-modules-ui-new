
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">Welcome</h1>
        <Link
          href="/register"
          className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Register
        </Link>
      </div>
    </main>
  );
}
