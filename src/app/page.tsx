'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (user) {
            router.replace('/dashboard');
        } else {
            router.replace('/ajuda');
        }
    }, [user, loading, router]);

    // Tela de transição enquanto verifica auth
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#fdfaf2]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#e63946]" />
        </div>
    );
}
