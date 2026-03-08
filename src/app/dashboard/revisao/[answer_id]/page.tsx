'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MesaCorretor } from '@/components/dashboard/MesaCorretor';
import { useParams } from 'next/navigation';

export default function CorrecaoDiretaPage() {
    const params = useParams();
    const answerId = params.answer_id as string;

    return (
        <DashboardLayout>
            <MesaCorretor initialAnswerId={answerId} />
        </DashboardLayout>
    );
}
