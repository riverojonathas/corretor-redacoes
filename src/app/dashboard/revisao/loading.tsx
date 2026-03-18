import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MesaCorretorSkeleton } from '@/components/dashboard/MesaCorretorSkeleton';

export default function LoadingRevisao() {
    return (
        <DashboardLayout>
            <MesaCorretorSkeleton />
        </DashboardLayout>
    );
}
