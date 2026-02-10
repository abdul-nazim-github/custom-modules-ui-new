"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

import { ContactItem, ContactListResponse } from "@/types/contact";

export default function ContactSupportListPage() {
  const [items, setItems] = useState<ContactItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchList = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<ContactListResponse>("/api/contact/list", {
          params: { page, limit: perPage },
        });
        if (!isMounted) return;
        setItems(response.data?.data || []);
        if (response.data?.meta) {
          setTotalCount(response.data.meta.totalCount);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const errorMessage = err instanceof Error ? err.message : "Failed to load contact list";
        setError(errorMessage);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchList();
    return () => {
      isMounted = false;
    };
  }, [page, perPage]);

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Support List</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review submitted support requests.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="cursor-pointer">
              Back Home
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Loading contacts...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            No contact requests found.
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <>
            <div className="space-y-4">
              {items.map((item) => (
                <Link key={item._id} href={`/contact-support/${item._id}`} className="block">
                  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm text-gray-500 dark:text-gray-400">From</p>
                        <p className="truncate text-base font-semibold text-gray-900 dark:text-white">
                          {item.name || "N/A"}
                        </p>
                        <p className="truncate text-sm text-gray-600 dark:text-gray-300">{item.email}</p>
                      </div>
                      <div className="min-w-0 md:text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
                        <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.subject || "No subject"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                      {item.message || "No message"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1); // Reset to first page on per page change
                  }}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages || 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="h-8 w-8 p-0"
                  >
                    &lt;
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page >= totalPages}
                    className="h-8 w-8 p-0"
                  >
                    &gt;
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
