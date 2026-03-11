'use client';

import React, { useState } from 'react';
import {
    User as UserIcon,
    BookOpen,
    Star,
    Inbox,
    Check,
    Clock,
    GraduationCap,
    ClipboardList,
    ChevronRight
} from 'lucide-react';
import { RedacaoListItem } from '@/types/dashboard';

interface RedacaoListProps {
    listaRedacoes: RedacaoListItem[];
    loadingLista: boolean;
    initialAnswerId?: string;
    notFoundError: boolean;
    onSelectRedacao: (id: string, revisaoId?: string) => void;
    onGoToRevision: (answerId: string) => void;
}

export function RedacaoList({
    listaRedacoes,
    loadingLista,
    initialAnswerId,
    notFoundError,
    onSelectRedacao,
    onGoToRevision
}: RedacaoListProps) {
    const [filterNick, setFilterNick] = useState('');
    const [filterSerie, setFilterSerie] = useState('');
    const [filterTitulo, setFilterTitulo] = useState('');
    const [filterFavorita, setFilterFavorita] = useState(false);

    const redacoesFiltradas = listaRedacoes.filter((r) => {
        const matchNick = r.nick.toLowerCase().includes(filterNick.toLowerCase());
        const matchSerie = r.nr_serie.toLowerCase().includes(filterSerie.toLowerCase());
        const matchTitulo = r.titulo.toLowerCase().includes(filterTitulo.toLowerCase());
        const matchFavorita = filterFavorita ? r.favorita === true : true;
        return matchNick && matchSerie && matchTitulo && matchFavorita;
    });

    if (initialAnswerId && notFoundError) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 bg-pattern min-h-[calc(100vh-64px)]">
                <div className="bg-white p-12 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100 flex flex-col items-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <UserIcon size={40} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-dark-gray mb-3">Redação não encontrada</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">Não foi possível localizar nenhuma redação com o ID fornecido (<code className="bg-gray-100 px-2 py-1 rounded text-red-500 font-mono text-xs">{initialAnswerId}</code>).</p>

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

            <div className="bg-white/40 p-6 rounded-2xl shadow-sm border border-gray-200/50 flex flex-col gap-4">
                <div className="flex items-center gap-4 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-dark-gray">
                        <input
                            type="checkbox"
                            checked={filterFavorita}
                            onChange={(e) => setFilterFavorita(e.target.checked)}
                            className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                        />
                        Apenas Favoritas
                    </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tema / Título</label>
                        <input
                            type="text"
                            placeholder="Buscar por tema..."
                            value={filterTitulo}
                            onChange={(e) => setFilterTitulo(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-red-500/20"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Autor (Nick)</label>
                        <input
                            type="text"
                            placeholder="Buscar por nick..."
                            value={filterNick}
                            onChange={(e) => setFilterNick(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-red-500/20"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Série</label>
                        <input
                            type="text"
                            placeholder="Buscar por série..."
                            value={filterSerie}
                            onChange={(e) => setFilterSerie(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-red-500/20"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white/40 rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
                {loadingLista ? (
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
                ) : redacoesFiltradas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Inbox className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-dark-gray mb-2">Fila Vazia</h3>
                        <p className="text-gray-500 max-w-sm">Nenhuma redação encontrada.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {redacoesFiltradas.map((item) => (
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
                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-100/30 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-200/30">
                                            <ClipboardList size={12} />
                                            {item.model_id || 'Geral'}
                                        </span>

                                        {item.status === 'concluida' || item.status === 'corrigida' ? (
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-100/30 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-200/30">
                                                <Check size={12} /> Concluída
                                            </span>
                                        ) : item.status === 'rascunho' ? (
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-100/30 text-yellow-700 text-[10px] font-bold uppercase tracking-wider border border-yellow-200/30">
                                                <Clock size={12} /> Rascunho
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-100/30 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200/30">
                                                <Clock size={12} /> Pendente
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-dark-gray truncate group-hover:text-red-500 transition-colors mb-2">
                                        {item.titulo_modelo || item.titulo}
                                        {item.favorita && <Star size={16} className="inline-block ml-2 text-yellow-400 fill-yellow-400" />}
                                    </h3>

                                    <div className="flex items-center flex-wrap gap-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5 text-gray-600 font-bold bg-black/5 px-2 py-0.5 rounded">
                                            <UserIcon size={14} className="text-gray-400" />
                                            {item.nick}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                                            <GraduationCap size={14} className="text-gray-400" />
                                            {item.nm_tipo_ensino && `${item.nm_tipo_ensino} - `}{item.nr_serie}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="text-gray-300 group-hover:text-red-500 transition-all transform group-hover:translate-x-1" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
