'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="p-4 bg-gray-100 rounded-full text-gray-400 mb-4">
                        <Settings size={48} />
                    </div>
                    <h1 className="text-2xl font-bold text-dark-gray">Configurações</h1>
                    <p className="text-gray-500 mt-2 max-w-sm">
                        Ajuste suas preferências e informações de perfil nesta área (Em breve).
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
