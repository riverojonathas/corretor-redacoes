'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileText, PlusCircle, BarChart3, Clock, CheckCircle2, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Stats {
    totalRedacoes: number;
    totalModelos: number;
    totalRevisoes: number;
    notaMediaGeral: number;
    mediasPorSerie: Record<string, number>;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            setLoadingStats(true);
            try {
                // 1. Busca todas as redacoes para calcular totais, modelos, e médias
                const { data: redacoes } = await supabase
                    .from('redacoes')
                    .select('id, titulo, nr_serie, criterio_1_nota, criterio_2_nota, criterio_3_nota, criterio_4_nota, criterio_5_nota');

                // 2. Busca todas as revisões feitas
                const { count: revisoesCount } = await supabase
                    .from('revisoes')
                    .select('id', { count: 'exact', head: true });

                if (!redacoes) {
                    setLoadingStats(false);
                    return;
                }

                // Processamento de dados
                const totalRedacoes = redacoes.length;
                const totalModelos = new Set(redacoes.map((r: any) => r.titulo?.trim())).size;
                const totalRevisoes = revisoesCount || 0;

                let sumGeral = 0;
                let countGeral = 0;

                const seriesData: Record<string, { sum: number, count: number }> = {};

                redacoes.forEach((r: any) => {
                    const notaTotal = (r.criterio_1_nota || 0) + (r.criterio_2_nota || 0) +
                        (r.criterio_3_nota || 0) + (r.criterio_4_nota || 0) +
                        (r.criterio_5_nota || 0);

                    if (notaTotal > 0) { // Assume redação zerada se n tiver nota, mas pra média é melhor considerar só se tiver > 0 (ou considerar tudo, depende. Vamos considerar todas as redacoes)
                        sumGeral += notaTotal;
                        countGeral++;

                        const serie = r.nr_serie?.trim() || 'Outros';
                        if (!seriesData[serie]) {
                            seriesData[serie] = { sum: 0, count: 0 };
                        }
                        seriesData[serie].sum += notaTotal;
                        seriesData[serie].count++;
                    }
                });

                const notaMediaGeral = countGeral > 0 ? Math.round(sumGeral / countGeral) : 0;

                const mediasPorSerie: Record<string, number> = {};
                Object.keys(seriesData).forEach(serie => {
                    mediasPorSerie[serie] = Math.round(seriesData[serie].sum / seriesData[serie].count);
                });

                setStats({
                    totalRedacoes,
                    totalModelos,
                    totalRevisoes,
                    notaMediaGeral,
                    mediasPorSerie
                });
            } catch (err) {
                console.error("Erro ao buscar estatísticas", err);
            } finally {
                setLoadingStats(false);
            }
        }

        fetchMetrics();
    }, []);

    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-dark-gray">Dashboard</h1>
                    <p className="text-gray-500 mt-2">Bem-vindo de volta, {user?.email?.split('@')[0] || 'Usuário'}.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total de Redações</p>
                            <p className="text-2xl font-bold text-dark-gray">
                                {loadingStats ? '...' : stats?.totalRedacoes || 0}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Modelos Disponíveis</p>
                            <p className="text-2xl font-bold text-dark-gray">
                                {loadingStats ? '...' : stats?.totalModelos || 0}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-50 text-green-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Revisões Feitas</p>
                            <p className="text-2xl font-bold text-dark-gray">
                                {loadingStats ? '...' : stats?.totalRevisoes || 0}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-accent-red/10 text-accent-red">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nota Média Geral</p>
                            <p className="text-2xl font-bold text-dark-gray">
                                {loadingStats ? '...' : stats?.notaMediaGeral || 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Secundary Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Ações Rápidas */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-dark-gray mb-6">Ações Rápidas</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button className="flex flex-col items-start p-5 rounded-xl border border-gray-100 hover:border-accent-red hover:bg-accent-red/5 transition-all group">
                                <PlusCircle className="text-gray-400 group-hover:text-accent-red mb-3" size={24} />
                                <span className="font-semibold text-dark-gray">Nova Redação</span>
                                <span className="text-xs text-gray-500 mt-1 text-left">Envie um texto para correção imediata.</span>
                            </button>
                            <button onClick={() => router.push('/dashboard/revisao')} className="flex flex-col items-start p-5 rounded-xl border border-gray-100 hover:border-accent-red hover:bg-accent-red/5 transition-all group">
                                <FileText className="text-gray-400 group-hover:text-accent-red mb-3" size={24} />
                                <span className="font-semibold text-dark-gray">Birô de Revisão</span>
                                <span className="text-xs text-gray-500 mt-1 text-left">Acesse a fila para corrigir ou revisar redações.</span>
                            </button>
                        </div>
                    </div>

                    {/* Médias por Série */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-dark-gray mb-6">Nota Média por Série</h2>
                        {loadingStats ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
                                <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
                                <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
                            </div>
                        ) : !stats || Object.keys(stats.mediasPorSerie).length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>Nenhum dado suficiente para calcular médias por série no momento.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(stats.mediasPorSerie).sort((a, b) => b[1] - a[1]).map(([serie, media], idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <span className="font-bold text-dark-gray">{serie}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-accent-red bg-accent-red/10 px-3 py-1 rounded-full">
                                                {media} pts
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
