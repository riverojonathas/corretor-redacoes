'use client';

import React from 'react';
import {
    User as UserIcon,
    BookOpen,
    Star,
    Inbox,
    Check,
    Clock,
    GraduationCap,
    FileEdit,
    ChevronRight,
    ChevronDown,
    Loader2,
    Lock,
    Search,
    Hash
} from 'lucide-react';
import { RedacaoListItem } from '@/types/dashboard';
import { ListFilters, FilterStatus } from '@/hooks/useRedacoesList';

interface RedacaoListProps {
    lista: RedacaoListItem[];
    loading: boolean;
    hasMore: boolean;
    filters: ListFilters;
    onFilterChange: (filters: ListFilters) => void;
    onLoadMore: () => void;
    initialAnswerId?: string;
    notFoundError: boolean;
    onSelectRedacao: (id: string, revisaoId?: string) => void;
    onGoToRevision: (answerId: string) => void;
}

export function RedacaoList({
    lista,
    loading,
    hasMore,
    filters,
    onFilterChange,
    onLoadMore,
    initialAnswerId,
    notFoundError,
    onSelectRedacao,
    onGoToRevision,
}: RedacaoListProps) {

    const setField = <K extends keyof ListFilters>(key: K, value: ListFilters[K]) => {
        onFilterChange({ ...filters, [key]: value });
    };

    if (initialAnswerId && notFoundError) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 bg-pattern min-h-[calc(100vh-64px)]">
                <div className="bg-white p-12 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100 flex flex-col items-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <UserIcon size={40} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-dark-gray mb-3">Redação não encontrada</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Não foi possível localizar nenhuma redação com o ID fornecido (
                        <code className="bg-gray-100 px-2 py-1 rounded text-red-500 font-mono text-xs">{initialAnswerId}</code>).
                    </p>
                    <button
                        onClick={() => window.location.href = '/dashboard/revisao'}
                        className="bg-black text-white font-bold py-3 px-8 rounded-xl hover:bg-gray-800 transition-colors w-full flex items-center justify-center gap-2"
                    >
                        Voltar para Fila
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto w-full space-y-8 min-h-[calc(100vh-64px)]">
            <div>
                <h1 className="text-3xl font-bold text-dark-gray">Fila de Revisão</h1>
                <p className="text-gray-500 mt-2">Selecione uma redação para avaliar ou revisar sua correção.</p>
            </div>

            {/* Tabs de Status */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-4 overflow-x-auto custom-scrollbar">
                {(['pendente', 'rascunho', 'concluida', 'todas'] as FilterStatus[]).map(status => (
                    <button
                        key={status}
                        onClick={() => setField('status', status)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${
                            filters.status === status
                                ? 'bg-dark-gray text-white shadow-md'
                                : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-dark-gray'
                        }`}
                    >
                        {status === 'todas' ? 'Todas' : status + 's'}
                    </button>
                ))}
            </div>

            {/* Filtros */}
            <div className="bg-white/40 p-6 rounded-2xl shadow-sm border border-gray-200/50 flex flex-col gap-4 mt-2">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full relative">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 pl-1">Busca Rápida</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Pesquisar por tema, título ou aluno (nick)..."
                                value={filters.busca}
                                onChange={(e) => setField('busca', e.target.value)}
                                className="w-full bg-white border border-gray-200 shadow-sm rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all focus:ring-2 focus:ring-red-500/20"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-64">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 pl-1">Série / Nível</label>
                        <input
                            type="text"
                            placeholder="Ex: 3ª série..."
                            value={filters.serie}
                            onChange={(e) => setField('serie', e.target.value)}
                            className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3.5 text-sm outline-none transition-all focus:ring-2 focus:ring-red-500/20"
                        />
                    </div>
                    <div>
                        <button
                            onClick={() => setField('favorita', !filters.favorita)}
                            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all border ${
                                filters.favorita
                                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700 shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <Star size={18} className={filters.favorita ? "fill-yellow-500 text-yellow-500" : ""} />
                            Favoritas
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista */}
            <div className="bg-white/40 rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
                {loading && lista.length === 0 ? (
                    <div className="divide-y divide-gray-100 animate-pulse">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-full flex items-center justify-between p-6">
                                <div className="flex-1 pr-4">
                                    <div className="flex gap-2 mb-3">
                                        <div className="h-5 w-24 bg-gray-100 rounded"></div>
                                        <div className="h-5 w-20 bg-gray-100 rounded"></div>
                                    </div>
                                    <div className="h-6 w-3/4 bg-gray-100 rounded mb-4"></div>
                                </div>
                                <div className="h-6 w-6 bg-gray-100 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                ) : lista.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Inbox className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-dark-gray mb-2">Fila Vazia</h3>
                        <p className="text-gray-500 max-w-sm">
                            {(filters.busca || filters.serie || filters.favorita || filters.status !== 'todas')
                                ? 'Nenhuma redação encontrada para os filtros selecionados.'
                                : 'Nenhuma redação encontrada.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-gray-100">
                            {lista.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.answer_id) {
                                            onGoToRevision(item.answer_id);
                                        } else {
                                            onSelectRedacao(item.id, item.revisao_id);
                                        }
                                    }}
                                    className="w-full flex items-center justify-between p-6 hover:bg-black/5 hover:pl-8 transition-all text-left group"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center flex-wrap gap-2 mb-3">

                                            {/* Badge de lock — Fase D */}
                                            {item.isLocked && (
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-100/40 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-300/60">
                                                    <Lock size={10} /> Em uso
                                                </span>
                                            )}

                                            {/* Badge de status — diferenciado por cor e ícone */}
                                            {item.status === 'concluida' || item.status === 'corrigida' ? (
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-100/40 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-200/50">
                                                    <Check size={12} /> Concluída
                                                </span>
                                            ) : item.status === 'rascunho' ? (
                                                // Rascunho: laranja com ícone de lápis (em progresso)
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-100/40 text-orange-700 text-[10px] font-bold uppercase tracking-wider border border-orange-300/50">
                                                    <FileEdit size={12} /> Rascunho
                                                </span>
                                            ) : (
                                                // Pendente: slate/cinza neutro (ainda não iniciada)
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100/60 text-slate-500 text-[10px] font-bold uppercase tracking-wider border border-slate-200/60">
                                                    <Inbox size={12} /> Pendente
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold text-black truncate group-hover:text-red-600 transition-colors mb-2.5">
                                            {item.titulo_modelo || item.titulo}
                                            {item.favorita && <Star size={18} className="inline-block ml-3 text-yellow-400 fill-yellow-400 drop-shadow-sm" />}
                                        </h3>

                                        <div className="flex items-center flex-wrap gap-3 text-sm text-gray-500">
                                            {/* Answer ID — referência principal do revisor */}
                                            {item.answer_id && (
                                                <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-accent-red/70 bg-accent-red/5 border border-accent-red/10 px-2 py-0.5 rounded">
                                                    <Hash size={10} />{item.answer_id}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1.5 text-gray-600 font-bold bg-black/5 px-2 py-0.5 rounded">
                                                <UserIcon size={14} className="text-gray-500" />
                                                {item.nick}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                                                <GraduationCap size={14} className="text-gray-500" />
                                                {item.nm_tipo_ensino && `${item.nm_tipo_ensino} - `}{item.nr_serie}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-300 group-hover:text-red-500 transition-all transform group-hover:translate-x-1" />
                                </button>
                            ))}
                        </div>

                        {/* Carregar mais */}
                        {hasMore && (
                            <div className="p-6 border-t border-gray-100 flex justify-center">
                                <button
                                    onClick={onLoadMore}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-dark-gray font-semibold rounded-xl transition-all disabled:opacity-50"
                                >
                                    {loading
                                        ? <><Loader2 size={16} className="animate-spin" /> Carregando...</>
                                        : <><ChevronDown size={16} /> Carregar mais</>}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
