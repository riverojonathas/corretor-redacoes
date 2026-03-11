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
    EyeOff
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
    setReadMode
}: CorrectionHeaderProps) {
    return (
        <div className="border-b border-gray-200/50 bg-[#fdfaf2] shrink-0 flex flex-col transition-colors">
            {/* Linha 1: Metadados da Redação e Ferramentas */}
            <div className="flex items-center justify-between px-8 py-3 border-b border-gray-100/30 flex-wrap gap-4">
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-3 text-gray-500">
                        <UserIcon size={14} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-dark-gray">{redacao.nick}</span>
                        <span className="text-gray-200">|</span>
                        <span className="text-[11px] font-medium text-gray-500">{redacao.extra_fields?.redacao_ano_serie}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-black/5 border border-[#eee9df] rounded-lg p-0.5">
                        <div className="flex items-center gap-1 px-2 border-r border-[#eee9df]">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Filtro:</span>
                            <select
                                className="bg-transparent text-[10px] font-bold text-gray-600 outline-none cursor-pointer"
                                value={filterHighlightCriterio}
                                onChange={(e) => setFilterHighlightCriterio(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            >
                                <option value="all">TODOS</option>
                                {criterios.map(c => <option key={`fh-${c.id}`} value={c.id}>C{c.id}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={() => setReadMode(!readMode)}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold transition-all uppercase rounded-md",
                                readMode
                                    ? "bg-[#fdfaf2] text-accent-red shadow-sm border border-[#eee9df]"
                                    : "text-gray-500 hover:text-dark-gray hover:bg-[#fdfaf2]/50"
                            )}
                        >
                            {readMode ? <EyeOff size={11} /> : <Eye size={11} />}
                            {readMode ? "Sair" : "Leitura"}
                        </button>
                        <button
                            onClick={() => {
                                const newMode = toolbarMode === 'floating' ? 'fixed' : 'floating';
                                setToolbarMode(newMode);
                                if (!hasSelection) {
                                    onResetPopup();
                                }
                            }}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold transition-all uppercase rounded-md",
                                toolbarMode === 'fixed'
                                    ? "bg-[#fdfaf2] text-dark-gray shadow-sm border border-[#eee9df]"
                                    : "text-gray-500 hover:text-dark-gray hover:bg-[#fdfaf2]/50"
                            )}
                        >
                            {toolbarMode === 'floating' ? <Pin size={11} /> : <PinOff size={11} />}
                            {toolbarMode === 'floating' ? "Fixar" : "Livre"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Linha 2: Avaliação e Abas */}
            <div className="flex items-center justify-between px-8 py-2.5 bg-[#fdfaf2]/50">
                <div className="flex items-center gap-4">
                    <h2 className="text-xs font-bold text-dark-gray flex items-center gap-2 uppercase tracking-wider">
                        <BookOpen className="text-red-500" size={14} />
                        Avaliação Técnica
                    </h2>
                    <button
                        type="button"
                        onClick={() => setFavorita(!favorita)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors border ${favorita
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'bg-black/5 text-gray-500 border-[#eee9df] hover:bg-amber-50/50 hover:text-amber-600'
                            }`}
                    >
                        <Star size={10} className={favorita ? 'fill-amber-500 text-amber-500' : ''} />
                        {favorita ? 'Favorita' : 'Favoritar'}
                    </button>
                </div>

                <div className="flex bg-black/5 p-0.5 rounded-lg space-x-1 border border-black/5">
                    {criterios.map((c) => (
                        <button
                            key={`tab-${c.id}`}
                            type="button"
                            onClick={() => setActiveCriterio(c.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap",
                                activeCriterio === c.id
                                    ? "bg-[#fdfaf2] text-dark-gray shadow-sm border border-gray-200/50 ring-1 ring-inset ring-gray-100"
                                    : "text-gray-500 hover:text-dark-gray hover:bg-white/50",
                                getCriterioStatus(c.id) === 'complete' && activeCriterio !== c.id && "text-emerald-600 bg-emerald-500/5",
                                getCriterioStatus(c.id) === 'complete' && activeCriterio === c.id && "ring-emerald-200/50 text-emerald-700 bg-emerald-500/10",
                                getCriterioStatus(c.id) === 'partial' && activeCriterio !== c.id && "text-amber-600 bg-amber-500/5",
                                getCriterioStatus(c.id) === 'partial' && activeCriterio === c.id && "ring-amber-200/50 text-amber-700 bg-amber-500/10"
                            )}
                        >
                            <div className="flex items-center justify-center gap-1.5">
                                Critério {c.id}
                                {getCriterioStatus(c.id) === 'complete' && <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />}
                                {getCriterioStatus(c.id) === 'partial' && <AlertCircle size={12} className="text-amber-500 shrink-0" />}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
