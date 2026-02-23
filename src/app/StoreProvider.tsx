'use client'
/* eslint-disable react-hooks/refs */

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '../lib/store'
import SessionProvider from '@/components/auth/SessionProvider'
import ApiInterceptor from '@/components/auth/ApiInterceptor'

export default function StoreProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const storeRef = useRef<AppStore>(null)
    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore()
    }

    return (
        <Provider store={storeRef.current}>
            <ApiInterceptor>
                <SessionProvider>{children}</SessionProvider>
            </ApiInterceptor>
        </Provider>
    )
}
