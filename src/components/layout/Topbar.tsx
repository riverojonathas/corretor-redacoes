'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Bell, Search, User, ChevronDown } from 'lucide-react';

export function Topbar() {
    const { user, cargo } = useAuth();
    const pathname = usePathname();

    const formatBreadcrumb = (path: string) => {
        const parts = path.split('/').filter(Boolean);
        if (parts.length === 0) return 'Dashboard';

        const labels: Record<string, string> = {
            'dashboard': 'Dashboard',
            'correcao': 'Birô de Revisão',
            'redacoes': 'Redações',
            'admin': 'Admin',
            'upload': 'Upload',
            'settings': 'Configurações'
        };

        return parts.map(p => labels[p] || p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
    };

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
            {/* Left side: Breadcrumbs or Search */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>FDE</span>
                <span className="text-gray-300">/</span>
                <span className="text-dark-gray font-medium">{formatBreadcrumb(pathname)}</span>
            </div>

            {/* Right side: Actions & Profile */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 border-r border-gray-100 pr-6">
                    <button className="text-gray-400 hover:text-dark-gray transition-colors">
                        <Search size={18} />
                    </button>
                    <button className="text-gray-400 hover:text-dark-gray transition-colors">
                        <Bell size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-semibold text-dark-gray leading-none">
                            {user?.email?.split('@')[0] || 'Usuário'}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                            {cargo || 'Membro'}
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-dark-gray">
                        <User size={16} />
                    </div>
                    <ChevronDown size={14} className="text-gray-400" />
                </div>
            </div>
        </header>
    );
}
