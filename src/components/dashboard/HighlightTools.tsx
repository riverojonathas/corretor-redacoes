'use client';

import React from 'react';
import { Highlighter, Check, Move, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Criterio } from '@/types/dashboard';

interface HighlightToolsProps {
    visible: boolean;
    x: number;
    y: number;
    target: 'texto' | 'devolutiva';
    targetId?: number;
    criterios: Criterio[];
    formData: { criterio_id: number; cor: string; observacao: string };
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    isDragging: boolean;
    onDragStart: (e: React.MouseEvent) => void;
}

export function FloatingToolbar({
    visible,
    x,
    y,
    target,
    targetId,
    criterios,
    formData,
    setFormData,
    onSubmit,
    onClose,
    isDragging,
    onDragStart
}: HighlightToolsProps) {
    if (!visible) return null;

    return (
        <div
            className={cn(
                "fixed z-50 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 p-5 w-80 animate-in fade-in zoom-in-95 outline-none transition-shadow",
                isDragging ? "shadow-2xl opacity-90 duration-0" : "duration-200"
            )}
            style={{
                top: Math.max(20, y),
                left: Math.max(20, Math.min(window.innerWidth - 340, x))
            }}
            onMouseUp={(e) => e.stopPropagation()}
        >
            <div
                className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 cursor-move group"
                onMouseDown={onDragStart}
            >
                <Move size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                <Highlighter className="text-red-500" size={16} />
                <h4 className="text-sm font-bold text-dark-gray">Criar Destaque Visual</h4>
                <button type="button" onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
                    <X size={16} />
                </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    {target === 'texto' && (
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Critério Ref.</label>
                            <select
                                required
                                value={formData.criterio_id}
                                onChange={(e) => setFormData({ ...formData, criterio_id: Number(e.target.value) })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-red-500/20 outline-none font-medium"
                            >
                                {criterios.map(c => <option key={`hp-${c.id}`} value={c.id}>Critério {c.id}</option>)}
                            </select>
                        </div>
                    )}
                    <div className={cn(target !== 'texto' && "col-span-2")}>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cor</label>
                        <select
                            required
                            value={formData.cor}
                            onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-red-500/20 outline-none font-medium"
                        >
                            <option value="amarelo">Amarelo 🟨</option>
                            <option value="verde">Verde 🟩</option>
                            <option value="vermelho">Vermelho 🟥</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Observação</label>
                    <textarea
                        rows={2}
                        value={formData.observacao}
                        onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                        placeholder="Ex: Trecho confuso..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:ring-2 focus:ring-red-500/20 outline-none resize-none"
                    />
                </div>

                <button type="submit" className="w-full bg-black text-white text-xs font-bold py-2.5 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                    <Check size={14} /> Salvar Destaque
                </button>
            </form>
        </div>
    );
}

export function FixedToolbar({
    visible,
    criterios,
    formData,
    setFormData,
    onSubmit
}: {
    visible: boolean;
    criterios: Criterio[];
    formData: { criterio_id: number; cor: string; observacao: string };
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
}) {
    return (
        <div className={cn(
            "mb-6 p-4 rounded-xl border transition-all duration-300",
            visible
                ? "bg-white border-red-500/30 shadow-[0_4px_20px_-5px_rgba(239,68,68,0.15)]"
                : "bg-gray-50 border-gray-200 opacity-60 grayscale-[50%] pointer-events-none"
        )}>
            <div className="flex items-center gap-2 mb-3">
                <Highlighter size={16} className={visible ? "text-red-500" : "text-gray-400"} />
                <span className="text-sm font-bold text-dark-gray">
                    {visible ? "Texto Selecionado: Adicionar Destaque" : "Selecione um texto para grifar..."}
                </span>
            </div>
            <form onSubmit={onSubmit} className="flex gap-3">
                <select
                    required
                    value={formData.criterio_id}
                    onChange={(e) => setFormData({ ...formData, criterio_id: Number(e.target.value) })}
                    className="w-32 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-red-500/20"
                >
                    {criterios.map(c => <option key={`hp-f-${c.id}`} value={c.id}>Critério {c.id}</option>)}
                </select>
                <select
                    required
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="w-28 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-red-500/20"
                >
                    <option value="amarelo">Amarelo 🟨</option>
                    <option value="verde">Verde 🟩</option>
                    <option value="vermelho">Vermelho 🟥</option>
                </select>
                <input
                    type="text"
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    placeholder="Observação rápida..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-red-500/20"
                />
                <button type="submit" className="bg-black text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                    <Check size={14} /> Salvar
                </button>
            </form>
        </div>
    );
}
