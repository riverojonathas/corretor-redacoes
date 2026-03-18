'use client';

import React from 'react';
import {
    User as UserIcon,
    BookOpen,
    Star,
    CheckCircle2,
    AlertCircle,
    Highlighter,
    Pin,
    PinOff,
    HelpCircle,
    Eye,
    EyeOff,
    ArrowLeft,
    Send,
    Loader2,
    Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Redacao, Criterio } from '@/types/dashboard';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface CorrectionHeaderProps {
    redacao: Redacao;
    criterios: Criterio[];
    activeCriterio: number;
    setActiveCriterio: (id: number) => void;
    getCriterioStatus: (id: number) => 'empty' | 'partial' | 'complete';
    filterHighlightCriterio: number | 'all';
    setFilterHighlightCriterio: (val: number | 'all') => void;
    toolbarMode: 'fixed' | 'floating';
    setToolbarMode: (mode: 'fixed' | 'floating') => void;
    favorita: boolean;
    setFavorita: (fav: boolean) => void;
    hasSelection: boolean;
    onResetPopup: () => void;
    readMode: boolean;
    setReadMode: (mode: boolean) => void;
    onExitMesa: () => void;
    onSaveRevisao: (e: React.MouseEvent | React.FormEvent, isDraft: boolean) => void;
    submitting: boolean;
    isAllComplete: boolean;
    // Status da revisão carregada e função para detectar alterações
    revisaoStatus: 'rascunho' | 'concluida' | null;
    isDirty: () => boolean;
    isViewer?: boolean;
}

export function CorrectionHeader({
    redacao,
    criterios,
    activeCriterio,
    setActiveCriterio,
    getCriterioStatus,
    filterHighlightCriterio,
    setFilterHighlightCriterio,
    toolbarMode,
    setToolbarMode,
    favorita,
    setFavorita,
    hasSelection,
    onResetPopup,
    readMode,
    setReadMode,
    onExitMesa,
    onSaveRevisao,
    submitting,
    isAllComplete,
    revisaoStatus,
    isDirty,
    isViewer = false
}: CorrectionHeaderProps) {
    // Revisão concluída e sem edições pendentes
    const isConcluded = revisaoStatus === 'concluida' && !isDirty();
    // Revisão concluída mas já editada (precisa re-salvar)
    const isConcludedEdited = revisaoStatus === 'concluida' && isDirty();

    return (
        <div className="border-b border-gray-200/50 bg-[#fdfaf2] shrink-0 flex items-center justify-between px-6 py-2.5 gap-4 transition-all">
            {/* Esquerda: Sair + Estudante + Favoritar */}
            <div className="flex items-center gap-3 shrink-0">
                <button
                    onClick={() => onExitMesa()}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-dark-gray transition-all group hover:bg-black/[0.03] rounded-lg"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    Sair
                </button>

                <div className="w-px h-4 bg-gray-200" />

                <div className="flex items-center gap-2.5 text-gray-500 py-1 px-2.5 bg-black/[0.03] rounded-xl border border-black/5">
                    <UserIcon size={12} className="text-gray-400" />
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-dark-gray leading-none">{redacao.nick}</span>
                        <span className="text-[9px] font-bold text-gray-400 leading-none">{redacao.extra_fields?.redacao_ano_serie}</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setFavorita(!favorita)}
                    className={cn(
                        "p-2 rounded-xl transition-all border shadow-sm",
                        favorita
                            ? "bg-amber-50 text-amber-600 border-amber-200"
                            : "bg-white/50 text-gray-300 border-gray-200/60 hover:border-amber-200 hover:text-amber-500 hover:bg-white"
                    )}
                >
                    <Star size={12} className={cn(favorita && "fill-amber-500 text-amber-500")} />
                </button>
            </div>

            {/* Centro: Abas de Critérios */}
            <div className="flex items-center justify-center flex-1 max-w-2xl px-4">
                <div className="flex bg-black/[0.03] p-0.5 rounded-xl space-x-0.5 border border-black/5 shadow-inner">
                    {criterios.map((c) => (
                        <button
                            key={`tab-${c.id}`}
                            type="button"
                            onClick={() => setActiveCriterio(c.id)}
                            className={cn(
                                "relative px-4 py-2 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap min-w-[90px]",
                                activeCriterio === c.id
                                    ? "bg-white text-dark-gray shadow-md ring-1 ring-black/5"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-white/40",
                                getCriterioStatus(c.id) === 'complete' && activeCriterio !== c.id && "text-emerald-500 bg-emerald-500/[0.03]",
                                getCriterioStatus(c.id) === 'complete' && activeCriterio === c.id && "text-emerald-700 ring-emerald-100",
                                getCriterioStatus(c.id) === 'partial' && activeCriterio !== c.id && "text-amber-500 bg-amber-500/[0.03]",
                                getCriterioStatus(c.id) === 'partial' && activeCriterio === c.id && "text-amber-700 ring-amber-100"
                            )}
                        >
                            <div className="flex items-center justify-center gap-1.5">
                                C{c.id}
                                {getCriterioStatus(c.id) === 'complete' && <CheckCircle2 size={11} className="text-emerald-500" />}
                                {getCriterioStatus(c.id) === 'partial' && <AlertCircle size={11} className="text-amber-500" />}
                            </div>
                            {activeCriterio === c.id && (
                                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent-red rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Direita: Ferramentas + Filtro + Ações Finais */}
            <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 bg-black/[0.03] border border-black/5 rounded-xl p-0.5 shadow-inner">
                    <div className="flex items-center gap-2 px-2.5 border-r border-black/5">
                        <select
                            className="bg-transparent text-[10px] font-black text-dark-gray outline-none cursor-pointer hover:text-accent-red transition-colors"
                            value={filterHighlightCriterio}
                            onChange={(e) => setFilterHighlightCriterio(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        >
                            <option value="all">TODOS</option>
                            {criterios.map(c => <option key={`fh-${c.id}`} value={c.id}>C{c.id}</option>)}
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-0.5 px-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setReadMode(!readMode)}
                                    className={cn(
                                        "p-1.5 rounded-lg transition-all",
                                        readMode
                                            ? "bg-white text-accent-red shadow-sm border border-black/5"
                                            : "text-gray-400 hover:text-dark-gray hover:bg-white/40"
                                    )}
                                >
                                    {readMode ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px] font-bold">Modo Leitura</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => {
                                        const newMode = toolbarMode === 'floating' ? 'fixed' : 'floating';
                                        setToolbarMode(newMode);
                                        if (!hasSelection) onResetPopup();
                                    }}
                                    className={cn(
                                        "p-1.5 rounded-lg transition-all",
                                        toolbarMode === 'fixed'
                                            ? "bg-white text-dark-gray shadow-sm border border-black/5"
                                            : "text-gray-400 hover:text-dark-gray hover:bg-white/40"
                                    )}
                                >
                                    {toolbarMode === 'floating' ? <Pin size={14} /> : <PinOff size={14} />}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px] font-bold">Fixar Barra</TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <div className="flex items-center gap-2 pl-1">
                    {/* Botão Salvar Rascunho — fica oculto quando a revisão está concluída e sem edições ou se for leitor */}
                    {!isConcluded && !isViewer && (
                        <button
                            type="button"
                            onClick={(e) => onSaveRevisao(e, true)}
                            disabled={submitting}
                            className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-dark-gray bg-white/50 border border-gray-200/60 rounded-xl hover:bg-white hover:border-gray-300 transition-all disabled:opacity-50 shadow-sm"
                        >
                            {submitting ? <Loader2 size={12} className="animate-spin" /> : 'Salvar'}
                        </button>
                    )}

                    {/* Botão principal adaptativo */}
                    {isViewer ? (
                        <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
                            <Eye size={14} className="text-blue-500" />
                            Modo Visualização
                        </div>
                    ) : isConcluded ? (
                        // Estado: concluída, sem edições — badge estático verde
                        <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            Revisão Concluída
                        </div>
                    ) : isConcludedEdited ? (
                        // Estado: concluída, mas editada — botão âmbar para salvar alterações
                        <button
                            type="button"
                            onClick={(e) => onSaveRevisao(e, false)}
                            disabled={submitting}
                            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                        >
                            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Salvar Alterações
                        </button>
                    ) : (
                        // Estado: normal (rascunho ou nova) — botão Finalizar
                        <button
                            type="button"
                            onClick={(e) => onSaveRevisao(e, false)}
                            disabled={submitting}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50",
                                isAllComplete ? "bg-accent-red shadow-accent-red/20" : "bg-gray-400"
                            )}
                        >
                            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Finalizar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
