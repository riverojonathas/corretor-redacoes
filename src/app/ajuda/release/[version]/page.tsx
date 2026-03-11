'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EXAMPLES_RELEASES, ReleaseCategory } from '@/data/releases';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ArrowLeft, ArrowRight, Rocket, Bug, Star, CheckCircle2, Share2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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

export default function ReleasePage() {
    const params = useParams();
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    const version = typeof params.version === 'string' ? params.version : params.version?.[0];
    const release = EXAMPLES_RELEASES.find(r => r.version === version || r.id === version);

    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // fallback
            window.prompt('Copie o link:', url);
        }
    };

    if (!release) {
        return (
            <PublicLayout>
                <div className="flex flex-col items-center justify-center flex-1 py-24 text-center px-4">
                    <h2 className="text-2xl font-bold text-dark-gray mb-3">Release não encontrada</h2>
                    <p className="text-gray-500 mb-8">Não encontramos uma release com esse identificador.</p>
                    <button onClick={() => router.push('/ajuda')} className="flex items-center gap-2 px-6 py-3 bg-dark-gray text-white rounded-xl hover:bg-black transition-colors font-bold">
                        <ArrowLeft size={16} /> Ver todas as releases
                    </button>
                </div>
            </PublicLayout>
        );
    }

    const style = getCategoryStyle(release.category);
    const totalChanges = release.changes?.reduce((acc, s) => acc + s.items.length, 0) ?? 0;

    return (
        <PublicLayout>
            <div className="max-w-3xl mx-auto w-full px-6 py-10 lg:py-16">

                {/* Breadcrumb */}
                <button
                    onClick={() => router.push('/ajuda')}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-dark-gray font-semibold transition-colors mb-8 group"
                >
                    <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                    Central do Corretor
                </button>

                {/* Header da Release */}
                <div className="mb-10">
                    <div className="flex items-center flex-wrap gap-3 mb-4">
                        <span className={cn('inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider', style.bg, style.text)}>
                            <style.icon size={12} className="mr-1.5" />
                            {style.label}
                        </span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{release.date}</span>
                        <span className="text-xs font-semibold text-gray-400 bg-white px-2.5 py-1 rounded-lg border border-gray-100">{release.version}</span>
                        {totalChanges > 0 && (
                            <span className="text-xs font-semibold text-gray-400">{totalChanges} modificações</span>
                        )}
                    </div>

                    <h1 className="text-3xl lg:text-4xl font-extrabold text-dark-gray tracking-tight leading-tight mb-3">
                        {release.title}
                    </h1>
                    <p className="text-gray-500 text-base leading-relaxed max-w-2xl">{release.description}</p>

                    {/* Botão de compartilhar */}
                    <button
                        onClick={handleShare}
                        className={cn(
                            'mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border',
                            copied
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        )}
                    >
                        {copied ? <><Check size={15} /> Link copiado!</> : <><Share2 size={15} /> Compartilhar esta release</>}
                    </button>
                </div>

                {/* Divisor */}
                <div className="border-t border-[#eee9df] mb-10" />

                {/* Changelog por seção */}
                {release.changes && release.changes.length > 0 && (
                    <div className="space-y-10">
                        {release.changes.map((section, sIdx) => (
                            <div key={sIdx}>
                                <h2 className="text-base font-bold text-dark-gray mb-5 pb-2 border-b border-[#eee9df]">
                                    {section.section}
                                </h2>
                                <ul className="space-y-3">
                                    {section.items.map((item, iIdx) => (
                                        <li key={iIdx} className="flex items-start gap-3">
                                            <span className="w-5 h-5 rounded-full bg-accent-red/10 text-accent-red flex items-center justify-center shrink-0 mt-0.5">
                                                <ArrowRight size={11} />
                                            </span>
                                            <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer navegação */}
                <div className="mt-16 pt-8 border-t border-[#eee9df] flex items-center justify-between">
                    <button
                        onClick={() => router.push('/ajuda')}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-dark-gray font-semibold transition-colors group"
                    >
                        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                        Ver todas as versões
                    </button>
                    <a
                        href="/login"
                        className="flex items-center gap-2 px-5 py-2.5 bg-dark-gray text-white rounded-xl hover:bg-black transition-colors font-bold text-sm"
                    >
                        Entrar na Plataforma →
                    </a>
                </div>
            </div>
        </PublicLayout>
    );
}
