"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

import { ContactItem, ContactDetailResponse } from "@/types/contact";

export default function ContactSupportDetailPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isMounted, setIsMounted] = useState(false);
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [item, setItem] = useState<ContactItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isMounted, isAuthenticated, router]);

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<ContactDetailResponse>(`/api/contact/${id}`);
        if (!isMounted) return;
        setItem(response.data?.data || null);
      } catch (err: unknown) {
        if (!isMounted) return;
        const errorMessage = err instanceof Error ? err.message : "Failed to load contact detail";
        setError(errorMessage);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!isMounted || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Detail</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View full contact message.
            </p>
          </div>
          <Link href="/contact-support">
            <Button variant="outline" className="cursor-pointer">
              Back to List
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Loading contact...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {!isLoading && !error && item && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Name
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {item.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="text-base text-gray-800 dark:text-gray-200">{item.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Subject
                </p>
                <p className="text-base text-gray-800 dark:text-gray-200">
                  {item.subject || "No subject"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Received
                </p>
                <p className="text-base text-gray-800 dark:text-gray-200">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Message
              </p>
              <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200">
                {item.message || "No message"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
