'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Sparkles, Pencil, Search, Eye, Rocket, Bug, Star, ChevronDown, CheckCircle2, Lightbulb } from 'lucide-react';
import { EXAMPLES_FEATURES, EXAMPLES_RELEASES, ReleaseCategory } from '@/data/releases';
import { cn } from '@/lib/utils';
import { FeedbackModal, FeedbackType } from '@/components/ajuda/FeedbackModal';

// Mapeador de Ícones dinâmico pros cards de feature
const iconMap: Record<string, React.ElementType> = {
    Sparkles,
    Pencil,
    Search,
    Eye,
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

    const openFeedback = (type: FeedbackType) => {
        setFeedbackType(type);
        setIsFeedbackOpen(true);
    };
    // Estado para tabs mobile-friendly, ou manter tudo na tela dividindo em seções.
    // Vamos usar a abordagem de única tela rolável com Header sticky.

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full bg-[#FAFAFA]">
                {/* Header Section */}
                <div className="bg-white border-b border-gray-100 px-8 py-10 lg:px-12 sticky top-0 z-10 w-full shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="max-w-6xl mx-auto md:mx-0 flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent-red rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent-red/20 shrink-0">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-dark-gray tracking-tight">Central do Corretor</h1>
                            <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">Novidades, dicas e como dominar a mesa de correção.</p>
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
                    <div className="max-w-6xl mx-auto px-8 py-12 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                        {/* LEFT COLUMN: Features (Bento Grid) */}
                        <div className="lg:col-span-7 space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-dark-gray mb-2">Conheça as Ferramentas</h2>
                                <p className="text-sm text-gray-500 mb-6 font-medium">Extraia o máximo de produtividade que a plataforma oferece.</p>

                                {/* Bento Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {EXAMPLES_FEATURES.map((feature, idx) => {
                                        const IconComponent = iconMap[feature.icon] || Sparkles;
                                        // The first item spans 2 columns on small screens if we want a true bento feel, 
                                        // but for 4 items, a simple 2x2 grid is very clean.
                                        return (
                                            <div
                                                key={feature.id}
                                                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col h-full"
                                            >
                                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border", feature.colorClass)}>
                                                    <IconComponent size={24} />
                                                </div>
                                                <h3 className="text-lg font-bold text-dark-gray mb-2 group-hover:text-accent-red transition-colors">{feature.title}</h3>
                                                <p className="text-sm text-gray-500 font-medium leading-relaxed flex-grow">
                                                    {feature.shortDescription}
                                                </p>

                                                {/* Hidden detailed text that expands or can be used for a modal later */}
                                                <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400 font-medium">
                                                    Clique para saber mais (Em breve)
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Releases (Timeline) */}
                        <div className="lg:col-span-5">
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm sticky top-32">
                                <h2 className="text-xl font-bold text-dark-gray mb-2">Últimas Atualizações</h2>
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
                                                    {/* Continuing line except for the last item - handled by background absolute line but this adds a solid connection */}
                                                    {!isLast && <div className="w-0.5 h-full bg-gray-100 mt-2"></div>}
                                                </div>

                                                {/* Card Content */}
                                                <div className="flex-1 pb-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                                        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit", style.bg, style.text)}>
                                                            {style.label}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{release.date}</span>
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
