'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ExitConfirmModalProps {
    onSaveAndExit: (e: React.MouseEvent) => void;
    onExitWithoutSave: () => void;
    onCancel: () => void;
}

export function ExitConfirmModal({ onSaveAndExit, onExitWithoutSave, onCancel }: ExitConfirmModalProps) {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onCancel}
            />
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-8 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 text-accent-red mb-6">
                    <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center">
                        <AlertCircle size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-dark-gray text-center">Alterações não salvas!</h3>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-8 text-center">
                    Você possui alterações que ainda não foram salvas como rascunho. Se sair agora, o progresso desta sessão
                    será perdido.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onSaveAndExit}
                        className="w-full py-3.5 bg-dark-gray text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg"
                    >
                        Salvar Rascunho e Sair
                    </button>
                    <button
                        onClick={onExitWithoutSave}
                        className="w-full py-3.5 bg-gray-50 text-gray-500 font-bold rounded-xl hover:bg-gray-100 hover:text-dark-gray transition-all text-sm"
                    >
                        Sair sem salvar
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full py-3.5 text-gray-500 font-bold hover:text-dark-gray transition-all text-xs"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
