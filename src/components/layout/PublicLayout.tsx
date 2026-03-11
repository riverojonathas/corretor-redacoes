'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface PublicLayoutProps {
    children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="min-h-screen bg-[#fdfaf2] flex flex-col">
            {/* Topbar pública — branding apenas */}
            <header className="sticky top-0 z-50 border-b border-[#eee9df] bg-[#fdfaf2]/90 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
                <Link href="/ajuda" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-accent-red rounded-xl flex items-center justify-center text-white shadow-sm shadow-accent-red/20">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <span className="font-extrabold text-dark-gray text-sm group-hover:text-accent-red transition-colors">Central do Corretor</span>
                        <span className="text-[11px] text-gray-400 font-medium block leading-none">Corretor de Redações</span>
                    </div>
                </Link>
                <Link
                    href="/login"
                    className="text-sm font-bold px-4 py-2 bg-dark-gray text-white rounded-xl hover:bg-black transition-colors"
                >
                    Entrar na Plataforma →
                </Link>
            </header>

            <main className="flex-1 flex flex-col">
                {children}
            </main>
        </div>
    );
}
