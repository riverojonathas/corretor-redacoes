'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Inbox, CheckCircle2, Clock, ShieldAlert, Lightbulb, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminFeedbacksPage() {
    const { cargo, loading: authLoading } = useAuth();
    const router = useRouter();

    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && cargo !== 'admin') {
            toast.error('Acesso negado.');
            router.replace('/dashboard');
        }
    }, [cargo, authLoading, router]);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/feedbacks');
            if (!res.ok) throw new Error('Falha ao buscar feedbacks');
            const data = await res.json();
            setFeedbacks(data.feedbacks || []);
        } catch (error: any) {
            console.error(error);
            toast.error('Não foi possível carregar os feedbacks.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (cargo === 'admin') {
            fetchFeedbacks();
        }
    }, [cargo]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const res = await fetch('/api/admin/feedbacks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });

            if (!res.ok) throw new Error('Erro ao atualizar status');

            toast.success('Status atualizado.');

            // Otimistic UI update
            setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));

        } catch (error: any) {
            toast.error('Erro ao atualizar.', { description: error.message });
        }
    };

    if (authLoading || cargo !== 'admin') {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center p-20 text-gray-500 gap-2">
                    <ShieldAlert size={20} className="animate-pulse" />
                    <span>Verificando permissões...</span>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">

                {/* Header Actions */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                        <Inbox size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-dark-gray">Caixa de Entrada (Feedbacks)</h1>
                        <p className="text-gray-500 mt-1">Acompanhe sugestões e reportes de bugs da equipe.</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/40 rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/30 border-b border-gray-200/40">
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Enviado por</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/6">Tipo</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Mensagem</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/6">Data</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/6 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-500">Carregando mensagens...</td>
                                    </tr>
                                ) : feedbacks.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-500">Sua caixa de entrada está vazia.</td>
                                    </tr>
                                ) : (
                                    feedbacks.map((f) => (
                                        <tr key={f.id} className="border-b border-gray-200/30 hover:bg-black/5 transition-colors">
                                            {/* Usuário */}
                                            <td className="py-4 px-6 align-top">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                                                        {f.perfis?.avatar_url ? (
                                                            <img src={f.perfis.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-gray-500 uppercase">
                                                                {f.perfis?.nome?.charAt(0) || '?'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-dark-gray text-sm">{f.perfis?.nome || 'Usuário Desconhecido'}</p>
                                                        <p className="text-xs text-gray-500">{f.perfis?.cargo || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tipo */}
                                            <td className="py-4 px-6 align-top">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold tracking-wider ${f.tipo === 'bug' ? 'bg-red-50 text-accent-red' : 'bg-emerald-50 text-emerald-600'
                                                    }`}>
                                                    {f.tipo === 'bug' ? <Bug size={12} /> : <Lightbulb size={12} />}
                                                    {f.tipo === 'bug' ? 'ERRO' : 'IDÉIA'}
                                                </span>
                                            </td>

                                            {/* Mensagem */}
                                            <td className="py-4 px-6 align-top">
                                                <p className="text-sm text-gray-600 font-medium whitespace-pre-wrap">{f.mensagem}</p>
                                            </td>

                                            {/* Data */}
                                            <td className="py-4 px-6 align-top text-xs text-gray-500 font-medium">
                                                {format(new Date(f.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                                            </td>

                                            {/* Status */}
                                            <td className="py-4 px-6 align-top text-right">
                                                <select
                                                    value={f.status}
                                                    onChange={(e) => handleStatusChange(f.id, e.target.value)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none border cursor-pointer appearance-none transition-colors ${f.status === 'resolvido' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                            f.status === 'em_analise' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                                'bg-gray-100 border-gray-200 text-gray-600'
                                                        }`}
                                                >
                                                    <option value="novo">● Novo</option>
                                                    <option value="em_analise">⏱ Em Análise</option>
                                                    <option value="resolvido">✔ Resolvido</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
