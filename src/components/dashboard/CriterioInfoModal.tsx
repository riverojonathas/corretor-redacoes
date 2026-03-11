'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Criterio } from '@/types/dashboard';
import { sanitizeTextWithHighlights } from '@/lib/textUtils';

interface CriterioInfoModalProps {
    criterio: Criterio;
    onClose: () => void;
}

export function CriterioInfoModal({ criterio, onClose }: CriterioInfoModalProps) {
    const { text: cleanDesc } = sanitizeTextWithHighlights(criterio.full_desc || '', []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="bg-[#fdfaf2] w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-dark-gray">{criterio.name}</h3>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                            Definição e Critérios de Avaliação
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500 hover:text-dark-gray"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="prose prose-slate max-w-none">
                        <div
                            className="text-gray-700 leading-relaxed font-serif text-lg space-y-6"
                            style={{ whiteSpace: 'pre-wrap' }}
                        >
                            {cleanDesc}
                        </div>
                    </div>
                </div>
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-dark-gray text-white text-sm font-bold rounded-xl hover:bg-black transition-all"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
}
