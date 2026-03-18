import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MesaCorretorSkeleton } from '@/components/dashboard/MesaCorretorSkeleton';

export default function LoadingRevisaoId() {
    return (
        <DashboardLayout>
            <MesaCorretorSkeleton />
        </DashboardLayout>
    );
}
