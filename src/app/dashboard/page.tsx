'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileText, PlusCircle, BarChart3, Clock, CheckCircle2, BookOpen, Upload, Inbox, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Stats {
    totalRedacoes: number;
    totalModelos: number;
    totalRevisoes: number;
    notaMediaGeral: number;
    mediasPorSerie: Record<string, number>;
}

export default function DashboardPage() {
    const { user, cargo } = useAuth();
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
                    .select('id, title, extra_fields, evaluated_skills');

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
                const totalModelos = new Set(
                    redacoes.map((r: any) => r.extra_fields?.redacao_tema?.trim())
                           .filter(Boolean)
                ).size;
                const totalRevisoes = revisoesCount || 0;

                let sumGeral = 0;
                let countGeral = 0;

                const seriesData: Record<string, { sum: number, count: number }> = {};

                redacoes.forEach((r: any) => {
                    const skills = r.evaluated_skills || [];
                    // Soma as 5 competências (C1-C5) se existirem
                    const notaTotal = skills.reduce((sum: number, s: any) => sum + (Number(s.score) || 0), 0);

                    // Consideramos para a média apenas se a redação tiver alguma avaliação válida ou não estiver zerada por erro
                    if (notaTotal > 0 || r.extra_fields?.redacao_zerada === false) {
                        sumGeral += notaTotal;
                        countGeral++;

                        const serie = r.extra_fields?.redacao_ano_serie?.trim() || 'Outros';
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
                    <div className="bg-white/40 p-6 rounded-2xl border border-gray-200/50 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-100/30 text-blue-600">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total de Redações</p>
                            <p className="text-2xl font-bold text-dark-gray">
                                {loadingStats ? '...' : stats?.totalRedacoes || 0}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/40 p-6 rounded-2xl border border-gray-200/50 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-100/30 text-purple-600">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Modelos Disponíveis</p>
                            <p className="text-2xl font-bold text-dark-gray">
                                {loadingStats ? '...' : stats?.totalModelos || 0}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/40 p-6 rounded-2xl border border-gray-200/50 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-100/30 text-green-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Revisões Feitas</p>
                            <p className="text-2xl font-bold text-dark-gray">
                                {loadingStats ? '...' : stats?.totalRevisoes || 0}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/40 p-6 rounded-2xl border border-gray-200/50 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-accent-red/10 text-accent-red font-bold">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nota Média Geral</p>
                            <p className="text-2xl font-bold text-dark-gray">
                                {loadingStats ? '...' : stats?.notaMediaGeral || 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Secundary Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Ações Rápidas */}
                    <div className="bg-white/40 p-8 rounded-2xl border border-gray-200/50 shadow-sm flex flex-col h-full">
                        <h2 className="text-xl font-bold text-dark-gray mb-6">Ações Rápidas</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                            {/* Ações para Corretores (Visualizado por todos) */}
                            <button onClick={() => router.push('/dashboard/revisao')} className="flex flex-col items-start p-5 rounded-xl border border-gray-200/40 bg-white/40 hover:border-accent-red/30 hover:bg-accent-red/5 hover:shadow-md transition-all group h-full">
                                <FileText className="text-gray-500 group-hover:text-accent-red mb-3 transition-colors shrink-0" size={24} />
                                <span className="font-semibold text-dark-gray">Birô de Revisão</span>
                                <span className="text-xs text-gray-500 mt-1 text-left">Acesse a fila para analisar textos e atribuir notas finais às redações pendentes.</span>
                            </button>

                            <button onClick={() => router.push('/ajuda')} className="flex flex-col items-start p-5 rounded-xl border border-gray-100 hover:border-emerald-600/30 hover:bg-emerald-50 hover:shadow-md transition-all group h-full">
                                <HelpCircle className="text-gray-500 group-hover:text-emerald-600 mb-3 transition-colors shrink-0" size={24} />
                                <span className="font-semibold text-dark-gray">Central de Ajuda</span>
                                <span className="text-xs text-gray-500 mt-1 text-left">Ficou com dúvida nas ferramentas? Clicando aqui você também tem as últimas novidades.</span>
                            </button>

                            {/* Ações Específicas de Administrador */}
                            {cargo === 'admin' && (
                                <>
                                    <button onClick={() => router.push('/admin/upload')} className="flex flex-col items-start p-5 rounded-xl border border-gray-100 hover:border-purple-600/30 hover:bg-purple-50 hover:shadow-md transition-all group h-full">
                                        <Upload className="text-gray-500 group-hover:text-purple-600 mb-3 transition-colors shrink-0" size={24} />
                                        <span className="font-semibold text-dark-gray">Upload de Textos</span>
                                        <span className="text-xs text-gray-500 mt-1 text-left">Adicione novos lotes de redação (já pré-avaliados pela IA) subindo um arquivo CSV estruturado.</span>
                                    </button>

                                    <button onClick={() => router.push('/admin/feedbacks')} className="flex flex-col items-start p-5 rounded-xl border border-gray-100 hover:border-blue-600/30 hover:bg-blue-50 hover:shadow-md transition-all group h-full">
                                        <Inbox className="text-gray-500 group-hover:text-blue-600 mb-3 transition-colors shrink-0" size={24} />
                                        <span className="font-semibold text-dark-gray">Ver Feedback UI/UX</span>
                                        <span className="text-xs text-gray-500 mt-1 text-left">Caixa de entrada com logs de Bugs reportados pela equipe e propostas de funcionalidades.</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Médias por Série */}
                    <div className="bg-white/40 p-8 rounded-2xl border border-gray-200/50 shadow-sm">
                        <h2 className="text-xl font-bold text-dark-gray mb-6">Nota Média por Série</h2>
                        {loadingStats ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-10 bg-black/5 rounded-lg w-full"></div>
                                <div className="h-10 bg-black/5 rounded-lg w-full"></div>
                                <div className="h-10 bg-black/5 rounded-lg w-full"></div>
                            </div>
                        ) : !stats || Object.keys(stats.mediasPorSerie).length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>Nenhum dado suficiente para calcular médias por série no momento.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(stats.mediasPorSerie).sort((a, b) => b[1] - a[1]).map(([serie, media], idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-white/30 rounded-xl border border-gray-200/50">
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
