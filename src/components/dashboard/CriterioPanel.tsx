'use client';

import React from 'react';
import { CheckCircle2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Criterio } from '@/types/dashboard';
import { CorrectionFormData } from '@/hooks/useCorrectionState';

interface CriterioPanelProps {
    criterio: Criterio;
    formData: CorrectionFormData;
    setFormData: (data: CorrectionFormData) => void;
    openTema: Record<number, number | null>;
    setOpenTema: React.Dispatch<React.SetStateAction<Record<number, number | null>>>;
    readMode: boolean;
    onOpenInfo: () => void;
    notaIA: number;
    devolutivaIA: string;
    renderTextWithHighlights: (text: string, isDevolutiva?: boolean, criterioId?: number) => React.ReactNode;
    handleTextSelection: (e: React.MouseEvent) => void;
    hideIaScore?: boolean;
    isViewer?: boolean;
}

const correctOptions = ['Satisfatório', 'Vago', 'Incompleto', 'Com erros'];
const incorrectOptions = ['Identificou incorretamente', 'Não identificou', 'Alucinação', 'Outro'];

const temas = [
    { id: 4, label: 'Avaliação da nota atribuída pela IA' },
    { id: 1, label: 'Identificação de pontos positivos' },
    { id: 2, label: 'Identificação do problema que levou à perda de nota' },
    { id: 3, label: 'Sugestão de melhoria ao estudante' },
];

export function CriterioPanel({
    criterio: c,
    formData,
    setFormData,
    openTema,
    setOpenTema,
    readMode,
    onOpenInfo,
    notaIA,
    devolutivaIA,
    renderTextWithHighlights,
    handleTextSelection,
    hideIaScore = false,
    isViewer = false,
}: CriterioPanelProps) {

    const notaAtribuidaField = `criterio_${c.id}_nota_atribuida`;
    const notaAtribuida = (formData as any)[notaAtribuidaField];
    const isScoreHiddenRef = hideIaScore && (notaAtribuida === undefined || notaAtribuida === null || notaAtribuida === '');

    const getStatus = (val: string, isScoreTheme: boolean) => {
        if (val === 'Outro') return 'info';
        if (isScoreTheme) {
            if (val === 'Adequada') return 'success';
            if (val.includes('1 nível')) return 'warning';
            return 'error';
        }
        return incorrectOptions.includes(val) ? 'error' : 'success';
    };

    // Determine qual tema está aberto para este critério
    const currentOpenTema =
        openTema[c.id] !== undefined
            ? openTema[c.id]
            : temas.find((t) => !(formData as any)[`criterio_${c.id}_tema_${t.id}`])?.id ?? null;

    return (
        <div key={`content-${c.id}`} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Cabeçalho sticky do critério */}
            <div
                className={cn(
                    'sticky top-0 z-10 border-b border-gray-200 flex items-center justify-between px-8 lg:px-12 py-3 transition-all',
                    readMode
                        ? 'bg-transparent opacity-40 hover:opacity-100'
                        : 'bg-[#fdfaf2]/95 backdrop-blur-sm shadow-sm'
                )}
            >
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-dark-gray text-lg flex items-center gap-2">
                        <span className="bg-dark-gray text-white text-[10px] px-1.5 py-0.5 rounded leading-none">C{c.id}</span>
                        <span className="uppercase tracking-wide">{c.desc}</span>
                    </h3>
                    {c.full_desc && (
                        <button
                            type="button"
                            onClick={onOpenInfo}
                            className="text-gray-400 hover:text-dark-gray focus:outline-none transition-colors"
                        >
                            <HelpCircle size={16} />
                        </button>
                    )}
                </div>
                <div className="bg-accent-red/5 px-4 py-1.5 rounded-full border border-accent-red/10 shrink-0">
                    <span className="text-[11px] font-black text-accent-red uppercase tracking-wider">
                        Nota IA: {isScoreHiddenRef ? 'Oculta' : notaIA}
                    </span>
                </div>
            </div>

            <div className="px-8 lg:px-12 mt-8">
                {/* Devolutiva da IA */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-red" />
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Devolutiva Inteligente</h4>
                    </div>
                    <div
                        data-devolutiva="true"
                        data-criterio-id={c.id}
                        onMouseUp={handleTextSelection}
                        className="p-4 lg:p-6 text-[15px] text-gray-700 leading-relaxed font-medium relative group"
                    >
                        {renderTextWithHighlights(devolutivaIA, true, c.id)}
                    </div>
                </div>

                {/* Avaliação Final (somente fora do readMode) */}
                {!readMode && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-dark-gray" />
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Avaliação Final</h4>
                        </div>

                        {/* Sanfona de temas */}
                        <div className="flex flex-col gap-2">
                            {temas.map((tema, idx) => {
                                const fieldName = `criterio_${c.id}_tema_${tema.id}`;
                                const currentValue = (formData as any)[fieldName];
                                const isOpen = currentOpenTema === tema.id;
                                const isDone = !!currentValue;
                                const isScoreTheme = tema.id === 4;

                                const currentCorrectOptions = isScoreTheme ? ['Adequada'] : correctOptions;
                                const currentIncorrectOptions = isScoreTheme
                                    ? [
                                        '1 nível abaixo', '2 níveis abaixo', 'mais de dois níveis abaixo',
                                        '1 nível acima', '2 níveis acima', 'mais de dois níveis acima',
                                        'Outro'
                                    ]
                                    : incorrectOptions;

                                const handleSelect = (opt: string) => {
                                    const newFormData = { ...formData, [fieldName]: opt };
                                    setFormData(newFormData);
                                    
                                    // Encontrar o próximo tema na ordem do array que ainda não foi preenchido
                                    const currentIndex = temas.findIndex(t => t.id === tema.id);
                                    const nextTema = temas.slice(currentIndex + 1).find(
                                        (t) => !(newFormData as any)[`criterio_${c.id}_tema_${t.id}`]
                                    );
                                    
                                    setOpenTema((prev) => ({ ...prev, [c.id]: nextTema?.id ?? null }));
                                };

                                return (
                                    <div
                                        key={tema.id}
                                        className={cn(
                                            'rounded-2xl border transition-all duration-300 overflow-hidden',
                                            isOpen
                                                ? 'border-[#eee9df] bg-white/30'
                                                : isDone
                                                    ? 'border-transparent bg-transparent'
                                                    : 'border-dashed border-[#eee9df]'
                                        )}
                                    >
                                        {/* Header do item */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenTema((prev) => ({ ...prev, [c.id]: isOpen ? null : tema.id }))
                                            }
                                            className={cn(
                                                'w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors',
                                                isOpen ? '' : 'hover:bg-black/5'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={cn(
                                                        'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-all',
                                                        isDone
                                                            ? getStatus(currentValue, isScoreTheme) === 'success'
                                                                ? 'bg-emerald-100 text-emerald-600'
                                                                : getStatus(currentValue, isScoreTheme) === 'warning'
                                                                    ? 'bg-amber-100 text-amber-600'
                                                                    : getStatus(currentValue, isScoreTheme) === 'info'
                                                                        ? 'bg-blue-100 text-blue-600'
                                                                        : 'bg-rose-100 text-rose-600'
                                                            : 'bg-black/10 text-gray-400'
                                                    )}
                                                >
                                                    {isDone
                                                        ? getStatus(currentValue, isScoreTheme) === 'success'
                                                            ? '✓'
                                                            : getStatus(currentValue, isScoreTheme) === 'warning'
                                                                ? '!'
                                                                : getStatus(currentValue, isScoreTheme) === 'info'
                                                                    ? '•'
                                                                    : '✕'
                                                        : idx + 1}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'text-[12px] font-bold uppercase tracking-wide transition-colors',
                                                        isOpen ? 'text-dark-gray' : isDone ? 'text-gray-500' : 'text-gray-400'
                                                    )}
                                                >
                                                    {tema.label}
                                                </span>
                                            </div>
                                            {isDone && !isOpen && (
                                                <div className="flex items-center gap-2">
                                                    {isScoreTheme && notaAtribuida !== undefined && notaAtribuida !== null && notaAtribuida !== '' && (
                                                        <span className="text-[12px] font-bold px-3 py-1 rounded-full border text-gray-700 bg-gray-50 border-gray-200">
                                                            Nota Corretor: {notaAtribuida}
                                                        </span>
                                                    )}
                                                    <span
                                                        className={cn(
                                                            'text-[12px] font-bold px-3 py-1 rounded-full border transition-all',
                                                            getStatus(currentValue, isScoreTheme) === 'success'
                                                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                                                : getStatus(currentValue, isScoreTheme) === 'warning'
                                                                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                                                                    : getStatus(currentValue, isScoreTheme) === 'info'
                                                                        ? 'text-blue-700 bg-blue-50 border-blue-200'
                                                                        : 'text-rose-700 bg-rose-50 border-rose-200'
                                                        )}
                                                    >
                                                        {currentValue}
                                                    </span>
                                                </div>
                                            )}
                                        </button>

                                        {/* Corpo expansível */}
                                        {isOpen && (
                                            <div className="px-5 pb-5 flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                {isScoreTheme && isScoreHiddenRef ? (
                                                    <div className="flex flex-col gap-3 w-full">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                                            Atribuir Nota Manualmente (0 a 10)
                                                        </label>
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max="10"
                                                                id={`input-nota-${c.id}`}
                                                                disabled={isViewer}
                                                                className="w-32 bg-white/40 border border-[#eee9df] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red/30 outline-none transition-all disabled:opacity-50"
                                                                placeholder="Ex: 8.5"
                                                             />
                                                             {!isViewer && (
                                                                 <button
                                                                     type="button"
                                                                     onClick={() => {
                                                                         const input = document.getElementById(`input-nota-${c.id}`) as HTMLInputElement;
                                                                         if (!input || !input.value) return;
                                                                         const val = parseFloat(input.value);
                                                                         if (isNaN(val) || val < 0 || val > 10) return;
                                                                         
                                                                         const diff = notaIA - val;
                                                                         let status = '';
                                                                         if (diff >= -0.75 && diff <= 0.75) status = 'Adequada';
                                                                         else if (diff >= -1.75 && diff <= -0.76) status = '1 nível abaixo';
                                                                         else if (diff >= 0.76 && diff <= 1.75) status = '1 nível acima';
                                                                         else if (diff >= -2.50 && diff <= -1.76) status = '2 níveis abaixo';
                                                                         else if (diff >= 1.76 && diff <= 2.50) status = '2 níveis acima';
                                                                         else if (diff <= -2.51) status = 'mais de dois níveis abaixo';
                                                                         else if (diff >= 2.51) status = 'mais de dois níveis acima';

                                                                         const newFormData = { 
                                                                             ...formData, 
                                                                             [fieldName]: status,
                                                                             [notaAtribuidaField]: val
                                                                         };
                                                                         setFormData(newFormData);
                                                                         
                                                                         const currentIndex = temas.findIndex(t => t.id === tema.id);
                                                                         const nextTema = temas.slice(currentIndex + 1).find(
                                                                             (t) => !(newFormData as any)[`criterio_${c.id}_tema_${t.id}`]
                                                                         );
                                                                         
                                                                         setOpenTema((prev) => ({ ...prev, [c.id]: nextTema?.id ?? null }));
                                                                     }}
                                                                     className="px-4 py-2 bg-dark-gray text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
                                                                 >
                                                                     Salvar Nota
                                                                 </button>
                                                             )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {isScoreTheme && notaAtribuida !== undefined && notaAtribuida !== null && notaAtribuida !== '' && (
                                                            <div className="w-full flex items-center justify-between mb-2">
                                                                <span className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 inline-block">
                                                                    Nota Corretor: {notaAtribuida} <span className="text-gray-400 mx-1">|</span> Nota IA: {notaIA}
                                                                </span>
                                                                {!isViewer && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            // Limpa a nota atribuída para poder re-avaliar cegamente se quiser
                                                                            const newFormData = { ...formData, [notaAtribuidaField]: '' };
                                                                            setFormData(newFormData);
                                                                        }}
                                                                        className="text-xs text-blue-500 hover:text-blue-700 underline font-semibold"
                                                                    >
                                                                        Limpar Nota e Refazer
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                        {currentCorrectOptions.map((opt) => (
                                                            <button
                                                                key={opt}
                                                                type="button"
                                                                disabled={isViewer}
                                                                onClick={() => handleSelect(opt)}
                                                                className={cn(
                                                                    'px-3 py-1.5 rounded-full text-[12px] font-bold transition-all border',
                                                                    currentValue === opt
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                                                                        : 'bg-transparent text-gray-500 border-[#eee9df] hover:border-emerald-200 hover:text-emerald-600'
                                                                )}
                                                            >
                                                                {opt}
                                                            </button>
                                                        ))}
                                                        <div className="w-px h-4 bg-[#eee9df] mx-1" />
                                                        {currentIncorrectOptions.map((opt) => {
                                                            const status = getStatus(opt, isScoreTheme);
                                                            return (
                                                                <button
                                                                    key={opt}
                                                                    type="button"
                                                                    disabled={isViewer}
                                                                    onClick={() => handleSelect(opt)}
                                                                    className={cn(
                                                                        'px-3 py-1.5 rounded-full text-[12px] font-bold transition-all border',
                                                                        currentValue === opt
                                                                            ? status === 'warning'
                                                                                ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'
                                                                                : status === 'info'
                                                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                                                                                    : 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm'
                                                                            : 'bg-transparent text-gray-500 border-[#eee9df]',
                                                                        currentValue !== opt && (
                                                                            status === 'warning'
                                                                                ? 'hover:border-amber-200 hover:text-amber-600'
                                                                                : status === 'info'
                                                                                    ? 'hover:border-blue-200 hover:text-blue-600'
                                                                                    : 'hover:border-rose-200 hover:text-rose-600'
                                                                        )
                                                                    )}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Observação do Critério */}
                        <div className="space-y-4 pt-4 border-t border-[#eee9df]">
                            <div className="flex items-center justify-between px-1">
                                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.15em]">
                                    Observação do Critério
                                </label>
                                {(formData as any)[`criterio_${c.id}_observacao`] && (
                                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                                        <CheckCircle2 size={12} />
                                        Preenchido
                                    </span>
                                )}
                            </div>
                            <textarea
                                rows={4}
                                value={(formData as any)[`criterio_${c.id}_observacao`] || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        [`criterio_${c.id}_observacao`]: e.target.value,
                                    })
                                }
                                placeholder="Descreva pontos positivos e negativos observados neste critério..."
                                className="w-full bg-white/40 border border-[#eee9df] rounded-2xl px-5 py-4 text-[15px] focus:ring-4 focus:ring-accent-red/5 focus:border-accent-red/30 outline-none transition-all resize-none min-h-[140px] text-dark-gray placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
