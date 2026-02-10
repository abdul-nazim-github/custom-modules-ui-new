
"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContactModal } from '@/components/ContactModal';

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Our Service</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          We are here to help you with any questions or concerns. Feel free to reach out to us.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={() => setIsContactOpen(true)}
            className="cursor-pointer rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:translate-y-0 active:shadow-md"
          >
            Contact Support
          </Button>
          <Link href="/contact-support">
            <Button
              size="lg"
              variant="outline"
              className="cursor-pointer rounded-md px-6 py-3 text-base font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:translate-y-0 active:shadow-md"
            >
              View Contact List
            </Button>
          </Link>
        </div>

        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
        />
      </main>
    </div>
  );
}
