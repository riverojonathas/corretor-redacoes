'use client';

import React, { useMemo } from 'react';
import { BarChart3, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Tooltip from '@radix-ui/react-tooltip';

export interface AIEvalMatrixStat {
    criterio: string; // C1, C2, etc.
    tema: string; // tema_1, tema_2, etc.
    avaliacao: string;
    total: number;
}

interface AIEvalChartProps {
    data: AIEvalMatrixStat[];
}

const TEMAS_LABELS: Record<string, string> = {
    tema_1: 'Pontos Positivos',
    tema_2: 'Problema',
    tema_3: 'Sugestão',
    tema_4: 'Nota IA',
};

const CRITERIOS_LABELS: Record<string, string> = {
    C1: 'Domínio da norma culta',
    C2: 'Compreensão da proposta',
    C3: 'Seleção e organização',
    C4: 'Conhecimento dos mecanismos',
    C5: 'Proposta de intervenção',
};

const CRITERIOS = ['C1', 'C2', 'C3', 'C4', 'C5'];
const TEMAS = ['tema_1', 'tema_2', 'tema_3', 'tema_4'];

export function AIEvalChart({ data }: AIEvalChartProps) {
    // Processa a matriz
    const matrix = useMemo(() => {
        const m: Record<string, Record<string, any>> = {};
        CRITERIOS.forEach((c) => {
            m[c] = {};
            TEMAS.forEach((t) => {
                m[c][t] = { 
                    total: 0, 
                    success: 0, 
                    warning: 0, 
                    error: 0,
                    breakdown: [] as { label: string, count: number }[]
                };
            });
        });

        if (!data) return m;

        data.forEach((row) => {
            if (!m[row.criterio] || !m[row.criterio][row.tema]) return;

            const val = row.avaliacao;
            const count = Number(row.total);
            const cell = m[row.criterio][row.tema];

            cell.total += count;
            
            const existing = cell.breakdown.find((b: { label: string, count: number }) => b.label === val);
            if (existing) {
                existing.count += count;
            } else {
                cell.breakdown.push({ label: val, count });
            }

            // Classificar o status
            const isScoreTema = row.tema === 'tema_4';
            let status = 'error';

            if (val === 'Outro') {
                status = 'warning';
            } else if (isScoreTema) {
                if (val === 'Adequada') status = 'success';
                else if (val.includes('1 nível')) status = 'warning';
                else status = 'error';
            } else {
                const incorrectOptions = ['Identificou incorretamente', 'Não identificou', 'Alucinação', 'Outro'];
                if (incorrectOptions.includes(val)) {
                    status = 'error';
                } else if (val === 'Satisfatório') {
                    status = 'success';
                } else {
                    // Vago, Incompleto, Com erros
                    status = 'warning'; // Classificamos como warning pois não é alucinação mas não é perfeito
                }
            }

            if (status === 'success') cell.success += count;
            else if (status === 'warning') cell.warning += count;
            else cell.error += count;
        });

        // Ordenar breakdowns
        CRITERIOS.forEach((c) => {
            TEMAS.forEach((t) => {
                m[c][t].breakdown.sort((a: any, b: any) => b.count - a.count);
            });
        });

        return m;
    }, [data]);

    const hasData = data && data.length > 0;

    if (!hasData) {
        return (
            <div className="bg-white/40 p-8 rounded-2xl border border-gray-200/50 shadow-sm flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500">
                <BarChart3 className="mb-4 text-gray-400" size={32} />
                <p>Nenhuma avaliação de IA disponível ainda.</p>
            </div>
        );
    }

    return (
        <Tooltip.Provider delayDuration={200}>
            <div className="bg-white/40 p-8 rounded-2xl border border-gray-200/50 shadow-sm flex flex-col h-full w-full overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-dark-gray flex items-center gap-2">
                            Matriz de Qualidade da IA
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <Info size={16} className="text-gray-400 cursor-help" />
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content 
                                        className="max-w-xs bg-dark-gray text-white text-xs p-3 rounded-lg shadow-xl font-medium animate-in fade-in zoom-in-95"
                                        sideOffset={5}
                                    >
                                        Percentual de exatidão ("Satisfatório" ou "Adequada") da inteligência artificial separada por Critérios (C1-C5) e Quesitos respondidos pelos avaliadores.
                                        <Tooltip.Arrow className="fill-dark-gray" />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Taxa de sucesso por predição de modelo (Verde indica melhor acerto).</p>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="min-w-[600px]">
                        {/* Header Row */}
                        <div className="grid grid-cols-5 gap-2 mb-3">
                            <div className="col-span-1"></div> {/* Empty corner */}
                            {TEMAS.map((t) => (
                                <div key={t} className="col-span-1 text-center">
                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                                        {TEMAS_LABELS[t]}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Matrix Rows */}
                        <div className="flex flex-col gap-2">
                            {CRITERIOS.map((c, rowIdx) => (
                                <div key={c} className="grid grid-cols-5 gap-2 items-center">
                                    <div className="col-span-1 text-right pr-4 flex flex-col items-end">
                                        <span className="bg-dark-gray text-white text-[10px] font-black px-1.5 py-0.5 rounded leading-none mb-1">
                                            {c}
                                        </span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase leading-tight text-right w-24">
                                            {CRITERIOS_LABELS[c]}
                                        </span>
                                    </div>
                                    
                                    {TEMAS.map((t) => {
                                        const cell = matrix[c][t];
                                        const total = cell.total;
                                        const prcSuccess = total > 0 ? (cell.success / total) * 100 : 0;
                                        const prcWarning = total > 0 ? (cell.warning / total) * 100 : 0;
                                        const prcError = total > 0 ? (cell.error / total) * 100 : 0;

                                        let bgColor = 'bg-gray-100';
                                        let textColor = 'text-gray-400';
                                        let borderColor = 'border-gray-200/50';

                                        if (total > 0) {
                                            if (prcSuccess === 100) {
                                                bgColor = 'bg-emerald-100';
                                                textColor = 'text-emerald-700';
                                                borderColor = 'border-emerald-200';
                                            } else if (prcSuccess >= 70) {
                                                bgColor = 'bg-emerald-50';
                                                textColor = 'text-emerald-600';
                                                borderColor = 'border-emerald-100';
                                            } else if (prcSuccess >= 40) {
                                                bgColor = 'bg-amber-50';
                                                textColor = 'text-amber-600';
                                                borderColor = 'border-amber-200';
                                            } else {
                                                bgColor = 'bg-rose-50';
                                                textColor = 'text-rose-600';
                                                borderColor = 'border-rose-200';
                                            }
                                        }

                                        return (
                                            <div key={t} className="col-span-1 h-14 relative group">
                                                <Tooltip.Root>
                                                    <Tooltip.Trigger asChild>
                                                        <div className={cn(
                                                            "w-full h-full rounded-xl border flex flex-col items-center justify-center cursor-default transition-all duration-300 hover:shadow-sm hover:scale-[1.02]",
                                                            bgColor, borderColor
                                                        )}>
                                                            {total === 0 ? (
                                                                <span className="text-xs font-bold text-gray-300">-</span>
                                                            ) : (
                                                                <>
                                                                    <span className={cn("text-sm font-black", textColor)}>
                                                                        {prcSuccess.toFixed(0)}%
                                                                    </span>
                                                                    <div className="w-full flex h-1 mt-1.5 opacity-60 rounded-full overflow-hidden px-2 gap-0.5">
                                                                        <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${prcSuccess}%` }} />
                                                                        <div className="h-full bg-amber-400" style={{ width: `${prcWarning}%` }} />
                                                                        <div className="h-full bg-rose-500 rounded-r-full" style={{ width: `${prcError}%` }} />
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </Tooltip.Trigger>
                                                    
                                                    {total > 0 && (
                                                        <Tooltip.Portal>
                                                            <Tooltip.Content 
                                                                className="z-50 min-w-48 bg-white border border-gray-100 p-4 rounded-xl shadow-xl animate-in fade-in zoom-in-95"
                                                                sideOffset={5}
                                                            >
                                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
                                                                    {c} - {TEMAS_LABELS[t]}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {cell.breakdown.map((b: any, i: number) => (
                                                                        <div key={i} className="flex justify-between items-center gap-4">
                                                                            <span className="text-xs font-medium text-gray-600">{b.label}</span>
                                                                            <span className="text-xs font-bold text-dark-gray">{b.count}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold">
                                                                    <span>TOTAL</span>
                                                                    <span>{total} avaliações</span>
                                                                </div>
                                                                <Tooltip.Arrow className="fill-white" />
                                                            </Tooltip.Content>
                                                        </Tooltip.Portal>
                                                    )}
                                                </Tooltip.Root>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Tooltip.Provider>
    );
}

