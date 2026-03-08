'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MesaCorretor } from '@/components/dashboard/MesaCorretor';

export default function CorrecaoPage() {
    return (
        <DashboardLayout>
            <MesaCorretor />
        </DashboardLayout>
    );
}
