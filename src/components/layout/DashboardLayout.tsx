'use client';

import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { WelcomePopup } from '../dashboard/WelcomePopup';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, loading, primeiroAcesso, setPrimeiroAcesso } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            window.location.href = '/login';
        }
    }, [user, loading]);

    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-accent-red"></div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Autenticando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen ml-sidebar min-w-0">
                <Topbar />
                <main className="flex-1 flex flex-col">
                    {children}
                </main>
            </div>
            {primeiroAcesso && (
                <WelcomePopup onClose={() => setPrimeiroAcesso(false)} />
            )}
        </div>
    );
}
