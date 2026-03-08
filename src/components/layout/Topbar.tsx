'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, Search, User, ChevronDown } from 'lucide-react';

export function Topbar() {
    const { user, cargo } = useAuth();
    const pathname = usePathname();

    const renderBreadcrumbs = (path: string) => {
        const parts = path.split('/').filter(Boolean);

        const labels: Record<string, string> = {
            'dashboard': 'Dashboard',
            'correcao': 'Correção',
            'revisao': 'Revisão',
            'redacoes': 'Redações',
            'admin': 'Admin',
            'upload': 'Upload',
            'settings': 'Configurações'
        };

        if (parts.length === 0) {
            return <Link href="/dashboard" className="text-dark-gray font-medium hover:text-gray-900 transition-colors">Dashboard</Link>;
        }

        return parts.map((part, index) => {
            const isLast = index === parts.length - 1;
            const href = '/' + parts.slice(0, index + 1).join('/');
            const label = labels[part] || part.charAt(0).toUpperCase() + part.slice(1);

            console.log('Breadcrumb:', { part, href, label, isLast });

            return (
                <React.Fragment key={href}>
                    {index > 0 && <span className="text-gray-300">/</span>}
                    {isLast ? (
                        <span className="text-dark-gray font-medium cursor-default">{label}</span>
                    ) : (
                        <Link href={href} className="text-gray-500 hover:text-dark-gray transition-colors cursor-pointer relative z-50">
                            {label}
                        </Link>
                    )}
                </React.Fragment>
            );
        });
    };

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
            {/* Left side: Breadcrumbs or Search */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/dashboard" className="hover:text-dark-gray transition-colors">FDE</Link>
                <span className="text-gray-300">/</span>
                <div className="flex items-center gap-2">
                    {renderBreadcrumbs(pathname)}
                </div>
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
