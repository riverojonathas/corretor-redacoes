'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Sparkles, Pencil, Search, Maximize, Rocket, Bug, Star, ChevronDown, CheckCircle2, Lightbulb } from 'lucide-react';
import { EXAMPLES_FEATURES, EXAMPLES_RELEASES, ReleaseCategory } from '@/data/releases';
import { cn } from '@/lib/utils';
import { FeedbackModal, FeedbackType } from '@/components/ajuda/FeedbackModal';

// Mapeador de Ícones dinâmico pros cards de feature
const iconMap: Record<string, React.ElementType> = {
    Sparkles,
    Pencil,
    Search,
    Maximize,
};

// Mapeador visual para as categorias de Releases
const getCategoryStyle = (category: ReleaseCategory) => {
    switch (category) {
        case 'nova-feature':
            return { icon: Rocket, bg: 'bg-purple-100', text: 'text-purple-700', label: 'Nova Feature' };
        case 'bugfix':
            return { icon: Bug, bg: 'bg-red-100', text: 'text-red-700', label: 'Correção (Bugfix)' };
        case 'melhoria':
            return { icon: Star, bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Melhoria' };
        default:
            return { icon: CheckCircle2, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Atualização' };
    }
}

export default function AjudaPage() {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('sugestao');
    const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

    const openFeedback = (type: FeedbackType) => {
        setFeedbackType(type);
        setIsFeedbackOpen(true);
    };

    const toggleFeature = (id: string) => {
        setExpandedFeature(prev => prev === id ? null : id);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full bg-background">

                {/* Header Section — alinhado ao tema sépia */}
                <div className="border-b border-[#eee9df] px-8 py-8 lg:px-12 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent-red rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent-red/20 shrink-0">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-dark-gray tracking-tight">Central do Corretor</h1>
                            <p className="text-gray-500 mt-0.5 font-medium text-sm">Novidades, dicas e como dominar a mesa de correção.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <button
                            onClick={() => openFeedback('sugestao')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-sm rounded-xl transition-colors border border-emerald-200/50 shadow-sm"
                        >
                            <Lightbulb size={16} />
                            <span>Sugerir Melhoria</span>
                        </button>
                        <button
                            onClick={() => openFeedback('bug')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-sm rounded-xl transition-colors border border-red-200/50 shadow-sm"
                        >
                            <Bug size={16} />
                            <span>Reportar Erro</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-6xl mx-auto px-8 py-10 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                        {/* LEFT COLUMN: Features com Accordion */}
                        <div className="lg:col-span-7 space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-dark-gray mb-1">Conheça as Ferramentas</h2>
                                <p className="text-sm text-gray-500 mb-6 font-medium">Clique em uma ferramenta para ver o passo a passo de como usá-la.</p>

                                <div className="space-y-3">
                                    {EXAMPLES_FEATURES.map((feature) => {
                                        const IconComponent = iconMap[feature.icon] || Sparkles;
                                        const isExpanded = expandedFeature === feature.id;

                                        return (
                                            <div
                                                key={feature.id}
                                                className={cn(
                                                    "bg-white/40 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer",
                                                    isExpanded
                                                        ? "border-gray-300/60 shadow-md"
                                                        : "border-gray-200/50 shadow-sm hover:shadow-md hover:border-gray-300/40"
                                                )}
                                                onClick={() => toggleFeature(feature.id)}
                                            >
                                                {/* Card Header (always visible) */}
                                                <div className="flex items-center gap-4 p-5">
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", feature.colorClass)}>
                                                        <IconComponent size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className={cn("font-bold text-sm transition-colors", isExpanded ? "text-accent-red" : "text-dark-gray")}>
                                                            {feature.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 mt-0.5 font-medium leading-snug">
                                                            {feature.shortDescription}
                                                        </p>
                                                    </div>
                                                    <ChevronDown
                                                        size={18}
                                                        className={cn(
                                                            "text-gray-400 shrink-0 transition-transform duration-300",
                                                            isExpanded && "rotate-180 text-accent-red"
                                                        )}
                                                    />
                                                </div>

                                                {/* Expanded Content */}
                                                {isExpanded && (
                                                    <div className="px-5 pb-6 border-t border-gray-100/80">
                                                        <p className="text-sm text-gray-600 leading-relaxed mt-4 mb-5">
                                                            {feature.fullDescription}
                                                        </p>

                                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                                            Como usar
                                                        </p>
                                                        <ol className="space-y-2.5">
                                                            {feature.steps.map((step, idx) => (
                                                                <li key={idx} className="flex items-start gap-3">
                                                                    <span className={cn(
                                                                        "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 border",
                                                                        feature.colorClass
                                                                    )}>
                                                                        {idx + 1}
                                                                    </span>
                                                                    <span className="text-sm text-gray-600 leading-relaxed">{step}</span>
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Releases (Timeline) */}
                        <div className="lg:col-span-5">
                            <div className="bg-white/40 rounded-3xl p-6 sm:p-8 border border-gray-200/50 shadow-sm sticky top-8">
                                <h2 className="text-xl font-bold text-dark-gray mb-1">Últimas Atualizações</h2>
                                <p className="text-sm text-gray-500 mb-8 font-medium">O que rolou de novo no sistema.</p>

                                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent">

                                    {EXAMPLES_RELEASES.map((release, index) => {
                                        const style = getCategoryStyle(release.category);
                                        const isLast = index === EXAMPLES_RELEASES.length - 1;

                                        return (
                                            <div key={release.id} className="relative flex items-start gap-6 group">

                                                {/* Timeline Node */}
                                                <div className="flex flex-col items-center">
                                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-white shadow-sm ring-4 ring-gray-50/50 relative z-10 shrink-0", style.text)}>
                                                        <style.icon size={18} />
                                                    </div>
                                                    {!isLast && <div className="w-0.5 h-full bg-gray-100 mt-2"></div>}
                                                </div>

                                                {/* Card Content */}
                                                <div className="flex-1 pb-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                                        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit", style.bg, style.text)}>
                                                            {style.label}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{release.date}</span>
                                                    </div>

                                                    <h3 className="text-base font-bold text-dark-gray mb-1.5 flex items-center gap-2">
                                                        {release.title}
                                                        <span className="text-xs font-semibold text-gray-300 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">{release.version}</span>
                                                    </h3>

                                                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                                        {release.description}
                                                    </p>
                                                </div>

                                            </div>
                                        )
                                    })}

                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
                initialType={feedbackType}
            />
        </DashboardLayout>
    );
}
