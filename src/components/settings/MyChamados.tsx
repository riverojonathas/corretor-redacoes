'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lightbulb, Bug, Clock, CheckCircle2, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Chamado {
    id: string;
    tipo: 'bug' | 'sugestao';
    mensagem: string;
    status: 'novo' | 'em_analise' | 'resolvido';
    created_at: string;
}

const statusConfig = {
    novo: {
        label: 'Aguardando análise',
        icon: Clock,
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        dot: 'bg-yellow-400',
    },
    em_analise: {
        label: 'Em análise',
        icon: AlertCircle,
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-400',
    },
    resolvido: {
        label: 'Resolvido',
        icon: CheckCircle2,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-400',
    },
};

export function MyChamados() {
    const { user } = useAuth();
    const [chamados, setChamados] = useState<Chamado[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        async function fetchChamados() {
            setLoading(true);
            try {
                const res = await fetch(`/api/feedback?userId=${user!.id}`);
                const data = await res.json();
                setChamados(data.feedbacks ?? []);
            } catch (err) {
                console.error('Erro ao buscar chamados:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchChamados();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
        );
    }

    if (chamados.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare size={24} className="text-gray-400" />
                </div>
                <h3 className="font-bold text-dark-gray text-base mb-1">Nenhum chamado aberto</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                    Quando você enviar uma sugestão ou reportar um erro pela Central de Ajuda, o chamado aparecerá aqui.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500 font-medium">
                {chamados.length} chamado{chamados.length !== 1 ? 's' : ''} registrado{chamados.length !== 1 ? 's' : ''}
            </p>

            {chamados.map((chamado) => {
                const statusInfo = statusConfig[chamado.status] ?? statusConfig.novo;
                const StatusIcon = statusInfo.icon;
                const isBug = chamado.tipo === 'bug';

                return (
                    <div
                        key={chamado.id}
                        className="bg-white/40 rounded-2xl border border-gray-200/50 p-5 shadow-sm"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                                    isBug ? "bg-red-50 text-accent-red" : "bg-emerald-50 text-emerald-600"
                                )}>
                                    {isBug ? <Bug size={14} /> : <Lightbulb size={14} />}
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {isBug ? 'Reporte de Erro' : 'Sugestão de Melhoria'}
                                </span>
                            </div>

                            {/* Badge de Status */}
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold shrink-0",
                                statusInfo.className
                            )}>
                                <span className={cn("w-1.5 h-1.5 rounded-full", statusInfo.dot)} />
                                {statusInfo.label}
                            </span>
                        </div>

                        {/* Mensagem */}
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                            {chamado.mensagem}
                        </p>

                        {/* Footer */}
                        <p className="text-xs text-gray-400 mt-3 font-medium">
                            Aberto em {new Date(chamado.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
