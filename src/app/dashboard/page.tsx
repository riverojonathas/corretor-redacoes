'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileText, PlusCircle, BarChart3, Clock, CheckCircle2, BookOpen, Upload, Inbox, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { AIEvalChart } from '@/components/dashboard/AIEvalChart';

interface Stats {
    totalRedacoes: number;
    totalModelos: number;
    totalRevisoes: number;
    notaMediaGeral: number;
    mediasPorSerie: Record<string, number>;
    aiStats: any[]; // Todos os dados granulares da Matriz
    totalPropostas?: number;
    totalRedacoesPropostas?: number;
    propostasDisponiveis?: any[]; // {proposta_id, numero_proposta, descricao, task_id, turma_label}
}

export default function DashboardPage() {
    const { user, cargo } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // Filtros da Matriz
    const [filterProposta, setFilterProposta] = useState<string>('todas');
    const [filterLabel, setFilterLabel] = useState<string>('todos');
    const [filterTaskId, setFilterTaskId] = useState<string>('todos');

    // Dados Filtrados da Matriz
    const filteredAiStats = stats?.aiStats?.filter(row => {
        if (filterProposta !== 'todas' && String(row.proposta_numero) !== filterProposta) return false;
        if (filterLabel !== 'todos' && row.turma_label !== filterLabel) return false;
        if (filterTaskId !== 'todos' && row.task_id !== filterTaskId) return false;
        return true;
    }) || [];

    // Opções Dinâmicas para os Selects de Filtro
    const propostasOptions = Array.from(new Set(stats?.propostasDisponiveis?.map(p => p.numero_proposta).filter(Boolean)));
    const labelsOptions = Array.from(new Set(stats?.propostasDisponiveis?.filter(p => filterProposta === 'todas' || String(p.numero_proposta) === filterProposta).map(p => p.turma_label).filter(Boolean)));
    const taskIdsOptions = Array.from(new Set(stats?.propostasDisponiveis?.filter(p => {
        if (filterProposta !== 'todas' && String(p.numero_proposta) !== filterProposta) return false;
        if (filterLabel !== 'todos' && p.turma_label !== filterLabel) return false;
        return true;
    }).map(p => p.task_id).filter(Boolean)));

    useEffect(() => {
        async function fetchMetrics() {
            setLoadingStats(true);
            try {
                // Fase B: usa as Views SQL para evitar full-scan
                const [statsResult, serieResult, aiEvalResult, resumoPropostasResult, propostasStatsResult] = await Promise.all([
                    supabase
                        .from('dashboard_stats')
                        .select('total_redacoes, total_modelos, total_revisoes, nota_media_geral')
                        .single(),
                    supabase
                        .from('dashboard_stats_por_serie')
                        .select('serie, nota_media'),
                    supabase
                        .from('dashboard_ai_eval_matrix_stats')
                        .select('criterio, tema, avaliacao, total, proposta_id, task_id, turma_label, proposta_numero'),
                    supabase
                        .from('dashboard_propostas_resumo')
                        .select('*')
                        .single(),
                    supabase
                        .from('propostas_stats')
                        .select('proposta_id, numero_proposta, descricao, task_id, turma_label')
                ]);

                const statsData = statsResult.data;
                const serieData = serieResult.data ?? [];
                const aiStatsData = aiEvalResult.data ?? []; 
                const resumoPropostas = resumoPropostasResult.data;
                const propostasList = propostasStatsResult.data ?? [];

                if (!statsData) {
                    setLoadingStats(false);
                    return;
                }

                const mediasPorSerie: Record<string, number> = {};
                serieData.forEach((row: any) => {
                    if (row.serie) mediasPorSerie[row.serie] = Number(row.nota_media) || 0;
                });

                setStats({
                    totalRedacoes: Number(statsData.total_redacoes) || 0,
                    totalModelos: Number(statsData.total_modelos) || 0,
                    totalRevisoes: Number(statsData.total_revisoes) || 0,
                    notaMediaGeral: Number(statsData.nota_media_geral) || 0,
                    mediasPorSerie,
                    aiStats: aiStatsData,
                    totalPropostas: Number(resumoPropostas?.total_propostas || 0),
                    totalRedacoesPropostas: Number(resumoPropostas?.total_redacoes_propostas || 0),
                    propostasDisponiveis: propostasList
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
                {/* Ações Rápidas - Agora no Topo, Horizontal */}
                <div className="flex flex-wrap gap-4">
                    <button onClick={() => router.push('/dashboard/revisao')} className="flex items-center gap-3 px-6 py-3 rounded-xl border border-gray-200/50 bg-white/40 hover:border-accent-red/30 hover:bg-accent-red/5 hover:shadow-sm transition-all group">
                        <FileText className="text-gray-400 group-hover:text-accent-red transition-colors" size={20} />
                        <span className="text-sm font-bold text-dark-gray">Mesa de Revisão</span>
                    </button>

                    {cargo === 'admin' && (
                        <>
                            <button onClick={() => router.push('/admin/upload')} className="flex items-center gap-3 px-6 py-3 rounded-xl border border-gray-200/50 bg-white/40 hover:border-purple-600/30 hover:bg-purple-50 hover:shadow-sm transition-all group">
                                <Upload className="text-gray-400 group-hover:text-purple-600 transition-colors" size={20} />
                                <span className="text-sm font-bold text-dark-gray">Upload de Textos</span>
                            </button>

                            <button onClick={() => router.push('/admin/feedbacks')} className="flex items-center gap-3 px-6 py-3 rounded-xl border border-gray-200/50 bg-white/40 hover:border-blue-600/30 hover:bg-blue-50 hover:shadow-sm transition-all group">
                                <Inbox className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
                                <span className="text-sm font-bold text-dark-gray">Feedbacks UI/UX</span>
                            </button>
                        </>
                    )}

                    <button onClick={() => router.push('/ajuda')} className="flex items-center gap-3 px-6 py-3 rounded-xl border border-gray-200/50 bg-white/40 hover:border-emerald-600/30 hover:bg-emerald-50 hover:shadow-sm transition-all group ml-auto">
                        <HelpCircle className="text-gray-400 group-hover:text-emerald-600 transition-colors" size={20} />
                        <span className="text-sm font-bold text-dark-gray">Central de Ajuda</span>
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <button 
                        onClick={() => router.push('/dashboard/revisao')}
                        className="bg-white/40 p-6 rounded-2xl border border-gray-200/50 shadow-sm flex items-center gap-4 text-left hover:border-blue-200 hover:shadow-md transition-all group"
                    >
                        <div className="p-3 rounded-xl bg-blue-100/30 text-blue-600 group-hover:scale-110 transition-transform">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total de Redações</p>
                            <p className="text-2xl font-bold text-dark-gray">
                                {loadingStats ? '...' : stats?.totalRedacoes || 0}
                            </p>
                        </div>
                    </button>

                    <div className="bg-white/40 p-6 rounded-2xl border border-gray-200/50 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-100/30 text-purple-600">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Propostas / Agrupamentos</p>
                            <p className="text-2xl font-bold text-dark-gray flex items-end gap-2">
                                {loadingStats ? '...' : stats?.totalPropostas || 0}
                                <span className="text-xs font-normal text-gray-400 mb-1">({stats?.totalRedacoesPropostas} redações agrupadas)</span>
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={() => router.push('/dashboard/revisao?status=completed')}
                        className="bg-white/40 p-6 rounded-2xl border border-gray-200/50 shadow-sm flex items-center gap-4 text-left hover:border-green-200 hover:shadow-md transition-all group"
                    >
                        <div className="p-3 rounded-xl bg-green-100/30 text-green-600 group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Revisões Feitas</p>
                            <p className="text-2xl font-bold text-dark-gray">
                                {loadingStats ? '...' : stats?.totalRevisoes || 0}
                            </p>
                        </div>
                    </button>

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
                <div className="grid grid-cols-1 gap-8">
                    {/* Gráfico de Avaliação da IA */}
                    <div className="w-full">
                        {/* Filtros da Matriz */}
                        <div className="flex flex-wrap gap-4 mb-4 bg-white/40 p-4 rounded-xl border border-gray-200/50 shadow-sm items-end">
                            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Filtrar por Proposta</label>
                                <select 
                                    className="w-full text-sm border-gray-200 rounded-lg bg-white/60 focus:ring-accent-red focus:border-accent-red select-sm transition-all text-dark-gray"
                                    value={filterProposta}
                                    onChange={(e) => {
                                        setFilterProposta(e.target.value);
                                        setFilterLabel('todos');
                                        setFilterTaskId('todos');
                                    }}
                                >
                                    <option value="todas">Todas as Propostas</option>
                                    <option value="undefined">Redações Sem Proposta (Avulsas)</option>
                                    {propostasOptions.map(num => (
                                        <option key={String(num)} value={String(num)}>Proposta Num. {num}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Filtrar por Label (Turma)</label>
                                <select 
                                    className="w-full text-sm border-gray-200 rounded-lg bg-white/60 focus:ring-accent-red focus:border-accent-red select-sm transition-all disabled:opacity-50 text-dark-gray"
                                    value={filterLabel}
                                    onChange={(e) => {
                                        setFilterLabel(e.target.value);
                                        setFilterTaskId('todos');
                                    }}
                                    disabled={filterProposta === 'undefined'}
                                >
                                    <option value="todos">Todos os Labels</option>
                                    {labelsOptions.map(lbl => (
                                        <option key={String(lbl)} value={String(lbl)}>{String(lbl)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Filtrar por Task ID</label>
                                <select 
                                    className="w-full text-sm border-gray-200 rounded-lg bg-white/60 focus:ring-accent-red focus:border-accent-red select-sm transition-all disabled:opacity-50 text-dark-gray"
                                    value={filterTaskId}
                                    onChange={(e) => setFilterTaskId(e.target.value)}
                                    disabled={filterProposta === 'undefined'}
                                >
                                    <option value="todos">Todos os Task IDs</option>
                                    {taskIdsOptions.map(tid => (
                                        <option key={String(tid)} value={String(tid)}>ID: {String(tid)}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Botão Limpar */}
                            {(filterProposta !== 'todas' || filterLabel !== 'todos' || filterTaskId !== 'todos') && (
                                <button 
                                    onClick={() => {
                                        setFilterProposta('todas');
                                        setFilterLabel('todos');
                                        setFilterTaskId('todos');
                                    }}
                                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-accent-red bg-gray-100 hover:bg-accent-red/10 rounded-lg transition-colors h-[38px]"
                                >
                                    Limpar Filtros
                                </button>
                            )}
                        </div>

                        {loadingStats ? (
                            <div className="bg-white/40 p-8 rounded-2xl border border-gray-200/50 shadow-sm animate-pulse min-h-[300px]">
                                <div className="h-6 bg-black/5 rounded w-1/3 mb-6"></div>
                                <div className="space-y-4">
                                    <div className="h-10 bg-black/5 rounded w-full"></div>
                                    <div className="h-10 bg-black/5 rounded w-full"></div>
                                    <div className="h-10 bg-black/5 rounded w-full"></div>
                                </div>
                            </div>
                        ) : (
                            <AIEvalChart data={filteredAiStats} />
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
