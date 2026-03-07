'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Upload, Settings, LogOut, FileText, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function Sidebar() {
    const pathname = usePathname();
    const { signOut, cargo } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Edit3, label: 'Birô de Revisão', href: '/dashboard/correcao' },
        ...(cargo === 'admin' ? [{ icon: Upload, label: 'Upload', href: '/admin/upload' }] : []),
        { icon: Settings, label: 'Configurações', href: '/settings' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-sidebar bg-white border-r border-gray-100 flex flex-col items-center py-8 z-50">
            {/* Logo area */}
            <div className="mb-10">
                <div className="w-8 h-8 rounded-lg bg-accent-red flex items-center justify-center text-white shadow-sm">
                    <span className="font-bold text-base">R</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.label}
                            className={cn(
                                "p-2 rounded-lg transition-all duration-200 group relative",
                                isActive
                                    ? "bg-accent-red text-white shadow-sm"
                                    : "text-gray-400 hover:text-dark-gray hover:bg-gray-50"
                            )}
                        >
                            <item.icon size={20} />
                            {/* Tooltip on hover */}
                            <span className="absolute left-14 bg-dark-gray text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap uppercase tracking-wider">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto">
                <button
                    onClick={() => signOut()}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-50 transition-all duration-200"
                    title="Sair"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </aside>
    );
}
