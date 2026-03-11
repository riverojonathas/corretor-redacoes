'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserCircle, Shield, Layout, Settings as SettingsIcon, LifeBuoy } from 'lucide-react';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { WorkspaceSettings } from '@/components/settings/WorkspaceSettings';
import { MyChamados } from '@/components/settings/MyChamados';
import { cn } from '@/lib/utils';

type Tab = 'profile' | 'security' | 'workspace' | 'chamados';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: 'profile', label: 'Meu Perfil', icon: UserCircle },
        { id: 'security', label: 'Segurança', icon: Shield },
        { id: 'workspace', label: 'Mesa de Correção', icon: Layout },
        { id: 'chamados', label: 'Meus Chamados', icon: LifeBuoy },
    ];

    return (
        <DashboardLayout>
            <div className="p-8 lg:p-12 max-w-6xl mx-auto w-full">

                <div className="mb-8 flex items-center gap-3">
                    <div className="p-2.5 bg-gray-100 rounded-xl text-gray-500">
                        <SettingsIcon size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-dark-gray">Configurações</h1>
                        <p className="text-gray-500 mt-1">Gerencie sua conta e preferências do sistema.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Sidebar / Tabs */}
                    <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 custom-scrollbar">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex flex-1 items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
                                        isActive
                                            ? "bg-dark-gray text-white shadow-lg shadow-dark-gray/10"
                                            : "hover:bg-white/40 text-gray-500 hover:text-dark-gray"
                                    )}
                                >
                                    <Icon size={18} className={isActive ? "text-accent-red" : ""} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 w-full min-w-0">
                        {activeTab === 'profile' && <ProfileSettings />}
                        {activeTab === 'security' && <SecuritySettings />}
                        {activeTab === 'workspace' && <WorkspaceSettings />}
                        {activeTab === 'chamados' && (
                            <div className="bg-white/40 rounded-3xl border border-gray-200/50 shadow-sm p-6 sm:p-8">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-dark-gray">Meus Chamados</h2>
                                    <p className="text-sm text-gray-500 mt-1">Acompanhe o status das suas sugestões e reportes enviados pela Central de Ajuda.</p>
                                </div>
                                <MyChamados />
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
