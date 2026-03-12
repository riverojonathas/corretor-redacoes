'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { X, BookOpen } from 'lucide-react';
import { Criterio } from '@/types/dashboard';
import { sanitizeTextWithHighlights } from '@/lib/textUtils';

interface CriterioInfoModalProps {
    criterio: Criterio;
    onClose: () => void;
}

/**
 * Normaliza texto que pode conter markdown "informal" para markdown padrão.
 */
function normalizeMarkdown(text: string): string {
    return text
        // Headings colados: #TITULO ou #TITULO: ou #Titulo → ## Titulo
        .replace(/^#\s*([A-Za-zÀ-ÿ][^\n]+)$/gm, (_, content) => {
            return `## ${content.trim()}`;
        })
        // Bullets implícitos: linhas que começam com "Sim" / "Não" seguidos de →
        .replace(/^(Sim|Não)\s+([\wà-ú][^\n]+→[^\n]+)$/gm, '- **$1** $2')
        // Substituir setas simples por setas mais elegantes
        .replace(/→/g, '→')
        // Garante linha em branco antes de headers para o parser do markdown
        .replace(/\n(?=#{1,6}\s)/g, '\n\n');
}

/** Detecta se o conteúdo tem marcações de markdown */
function hasMarkdown(text: string): boolean {
    return /^#[A-Z]|^\*\*|^-\s|^#{1,3}\s|\*\*[^*]+\*\*/.test(text);
}

export function CriterioInfoModal({ criterio, onClose }: CriterioInfoModalProps) {
    const { text: cleanDesc } = sanitizeTextWithHighlights(criterio.full_desc || '', []);
    const isMarkdown = hasMarkdown(cleanDesc);
    const content = isMarkdown ? normalizeMarkdown(cleanDesc) : cleanDesc;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            {/* Modal mais largo: max-w-4xl para melhor legibilidade de textos técnicos */}
            <div className="bg-[#fdfaf2] w-full max-w-4xl rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                {/* Header: Design mais premium com gradiente sutil */}
                <div className="px-8 py-6 border-b border-gray-200/20 flex items-center justify-between shrink-0 bg-gradient-to-r from-white/90 to-[#fdfaf2]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent-red/10 flex items-center justify-center shrink-0 shadow-sm border border-accent-red/5">
                            <BookOpen size={20} className="text-accent-red" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-dark-gray leading-tight tracking-tight">{criterio.name}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-red/40" />
                                Definição e Critérios de Avaliação
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-black/5 rounded-full transition-all text-gray-400 hover:text-dark-gray hover:rotate-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Conteúdo: Fundo sutilmente mais claro que o modal para destacar o texto */}
                <div className="px-10 lg:px-14 py-10 overflow-y-auto custom-scrollbar flex-1 bg-white/20">
                    {isMarkdown ? (
                        // Renderização com Markdown
                        <div className="prose prose-slate max-w-none
                            prose-headings:text-dark-gray prose-headings:tracking-tight
                            prose-h2:text-[13px] prose-h2:font-black prose-h2:uppercase prose-h2:tracking-[0.15em] prose-h2:text-accent-red
                            prose-h2:flex prose-h2:items-center prose-h2:gap-3
                            prose-h2:before:content-[''] prose-h2:before:w-1 prose-h2:before:h-4 prose-h2:before:bg-accent-red prose-h2:before:rounded-full
                            prose-h2:mt-12 prose-h2:mb-6
                            prose-h3:text-sm prose-h3:font-bold prose-h3:text-gray-700 prose-h3:mt-8 prose-h3:mb-3
                            prose-p:text-gray-600 prose-p:leading-[1.8] prose-p:text-[17px] prose-p:my-5
                            prose-li:text-gray-600 prose-li:text-[17px] prose-li:my-2.5
                            prose-strong:text-dark-gray prose-strong:font-bold
                            prose-ul:pl-5 prose-ul:my-5
                            [&>*:first-child]:mt-0
                        ">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                    ) : (
                        // Texto simples, sem markdown — pre-wrap elegante
                        <div
                            className="text-gray-600 leading-[1.8] text-[17px] space-y-7 font-serif"
                            style={{ whiteSpace: 'pre-wrap' }}
                        >
                            {content}
                        </div>
                    )}
                </div>

                {/* Footer: Integrado ao fundo creme (#fdfaf2) para não parecer "solto" */}
                <div className="px-8 py-6 bg-gradient-to-b from-[#fdfaf2]/0 to-[#fdfaf2] border-t border-gray-200/10 flex justify-end shrink-0 backdrop-blur-sm">
                    <button
                        onClick={onClose}
                        className="px-10 py-3.5 bg-dark-gray text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
}
