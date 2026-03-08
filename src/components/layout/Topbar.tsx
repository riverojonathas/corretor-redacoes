'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, ChevronDown, LogOut, Key } from 'lucide-react';

export function Topbar() {
    const { user, cargo, signOut } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        if (isProfileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileOpen]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

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
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-2 rounded-full transition-colors focus:outline-none"
                    >
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
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="px-4 py-2 border-b border-gray-100 mb-2 sm:hidden">
                                <p className="text-xs font-semibold text-dark-gray truncate">
                                    {user?.email}
                                </p>
                                <p className="text-[10px] text-gray-400 uppercase mt-0.5">
                                    {cargo || 'Membro'}
                                </p>
                            </div>

                            <Link
                                href="/settings"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-dark-gray transition-colors w-full text-left"
                            >
                                <Key size={14} />
                                Alterar Senha
                            </Link>

                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                            >
                                <LogOut size={14} />
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
