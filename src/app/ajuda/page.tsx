'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Pencil, Search, Maximize, Rocket, Bug, Star, ChevronDown, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { EXAMPLES_FEATURES, EXAMPLES_RELEASES, ReleaseCategory } from '@/data/releases';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
    Sparkles,
    Pencil,
    Search,
    Maximize,
};

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
};

export default function AjudaPage() {
    const router = useRouter();
    const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

    const toggleFeature = (id: string) => {
        setExpandedFeature(prev => prev === id ? null : id);
    };

    return (
        <PublicLayout>
            <div className="flex flex-col h-full bg-background">

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-6xl mx-auto px-8 py-10 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                        {/* LEFT: Feature Cards — Accordion */}
                        <div className="lg:col-span-7 space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-dark-gray mb-1">Conheça as Ferramentas</h2>
                                <p className="text-sm text-gray-500 mb-6 font-medium">Clique em uma ferramenta para ver o passo a passo.</p>

                                <div className="space-y-3">
                                    {EXAMPLES_FEATURES.map((feature) => {
                                        const IconComponent = iconMap[feature.icon] || Sparkles;
                                        const isExpanded = expandedFeature === feature.id;

                                        return (
                                            <div
                                                key={feature.id}
                                                className={cn(
                                                    'bg-white/40 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer',
                                                    isExpanded
                                                        ? 'border-gray-300/60 shadow-md'
                                                        : 'border-gray-200/50 shadow-sm hover:shadow-md hover:border-gray-300/40'
                                                )}
                                                onClick={() => toggleFeature(feature.id)}
                                            >
                                                <div className="flex items-center gap-4 p-5">
                                                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border', feature.colorClass)}>
                                                        <IconComponent size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className={cn('font-bold text-sm transition-colors', isExpanded ? 'text-accent-red' : 'text-dark-gray')}>
                                                            {feature.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 mt-0.5 font-medium leading-snug">
                                                            {feature.shortDescription}
                                                        </p>
                                                    </div>
                                                    <ChevronDown
                                                        size={18}
                                                        className={cn(
                                                            'text-gray-400 shrink-0 transition-transform duration-300',
                                                            isExpanded && 'rotate-180 text-accent-red'
                                                        )}
                                                    />
                                                </div>

                                                {isExpanded && (
                                                    <div className="px-5 pb-6 border-t border-gray-100/80">
                                                        <p className="text-sm text-gray-600 leading-relaxed mt-4 mb-5">
                                                            {feature.fullDescription}
                                                        </p>
                                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Como usar</p>
                                                        <ol className="space-y-2.5">
                                                            {feature.steps.map((step, idx) => (
                                                                <li key={idx} className="flex items-start gap-3">
                                                                    <span className={cn(
                                                                        'w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 border',
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

                        {/* RIGHT: Releases — clique navega para página dedicada */}
                        <div className="lg:col-span-5">
                            <div className="bg-white/40 rounded-3xl p-6 sm:p-8 border border-gray-200/50 shadow-sm sticky top-8">
                                <h2 className="text-xl font-bold text-dark-gray mb-1">Últimas Atualizações</h2>
                                <p className="text-sm text-gray-500 mb-8 font-medium">Clique numa release para ver o changelog completo.</p>

                                <div className="space-y-6">
                                    {EXAMPLES_RELEASES.map((release, index) => {
                                        const style = getCategoryStyle(release.category);
                                        const isLast = index === EXAMPLES_RELEASES.length - 1;
                                        const hasDetails = release.changes && release.changes.length > 0;
                                        const totalChanges = release.changes?.reduce((acc, s) => acc + s.items.length, 0) ?? 0;

                                        return (
                                            <div key={release.id} className="relative flex items-start gap-4">
                                                {/* Timeline Node */}
                                                <div className="flex flex-col items-center shrink-0">
                                                    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center bg-white border-2 border-white shadow-sm ring-4 ring-gray-50/50 relative z-10', style.text)}>
                                                        <style.icon size={16} />
                                                    </div>
                                                    {!isLast && <div className="w-0.5 flex-1 bg-gray-100 mt-2 min-h-[24px]"></div>}
                                                </div>

                                                {/* Card — clique navega para /ajuda/release/[version] */}
                                                <div
                                                    className={cn(
                                                        'flex-1 p-4 rounded-2xl border bg-white/30 border-gray-200/50 transition-all',
                                                        hasDetails && 'cursor-pointer hover:border-gray-300/60 hover:shadow-md hover:bg-white/50'
                                                    )}
                                                    onClick={() => hasDetails && router.push(`/ajuda/release/${release.version}`)}
                                                >
                                                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                                                        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', style.bg, style.text)}>
                                                            {style.label}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{release.date}</span>
                                                    </div>

                                                    <h3 className="text-sm font-bold text-dark-gray flex items-center gap-2 flex-wrap">
                                                        {release.title}
                                                        <span className="text-[10px] font-semibold text-gray-300 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{release.version}</span>
                                                    </h3>

                                                    <p className="text-xs text-gray-500 leading-relaxed mt-1.5">{release.description}</p>

                                                    {hasDetails && (
                                                        <p className="text-[11px] text-accent-red font-bold mt-3 flex items-center gap-1">
                                                            <ArrowRight size={11} />
                                                            {totalChanges} mudanças — ver changelog completo
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
