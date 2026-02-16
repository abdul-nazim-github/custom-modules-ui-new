
'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { checkSession } from '@/lib/features/auth/authSlice';

export default function SessionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(checkSession());
    }, [dispatch]);

    return <>{children}</>;
}
