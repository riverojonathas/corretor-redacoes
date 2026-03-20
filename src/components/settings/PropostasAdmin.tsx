'use client';

import React, { useState, useCallback } from 'react';
import { Plus, Trash2, X, ChevronDown, ChevronUp, BookOpen, Hash, Tag, FileText, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaskIdEntry {
    id: string;
    task_id: string;
    turma_label: string | null;
    created_at: string;
}

interface Proposta {
    id: string;
    numero: number;
    descricao: string | null;
    created_at: string;
    proposta_task_ids: TaskIdEntry[];
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function usePropostas() {
    const [propostas, setPropostas] = useState<Proposta[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [propRes, countRes] = await Promise.all([
                fetch('/api/admin/propostas'),
                fetch('/api/admin/propostas/task-ids'),
            ]);
            if (!propRes.ok) throw new Error('Erro ao carregar propostas');
            const propData = await propRes.json();
            const countData = countRes.ok ? await countRes.json() : {};
            setPropostas(propData);
            setCounts(countData);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { propostas, counts, loading, error, reload };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AddTaskIdRow({
    propostaId,
    onAdded,
}: {
    propostaId: string;
    onAdded: () => void;
}) {
    const [taskId, setTaskId] = useState('');
    const [label, setLabel] = useState('');
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const handleAdd = async () => {
        if (!taskId.trim()) { setErr('Informe o Task ID'); return; }
        setSaving(true); setErr('');
        const res = await fetch('/api/admin/propostas/task-ids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proposta_id: propostaId, task_id: taskId.trim(), turma_label: label.trim() || null }),
        });
        setSaving(false);
        if (!res.ok) {
            const d = await res.json();
            setErr(d.error || 'Erro ao adicionar');
        } else {
            setTaskId(''); setLabel('');
            onAdded();
        }
    };

    return (
        <div className="mt-3 space-y-2">
            <div className="flex gap-2 flex-wrap">
                <input
                    type="text"
                    placeholder="Task ID (ex: 86145579)"
                    value={taskId}
                    onChange={e => setTaskId(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    className="flex-1 min-w-[140px] px-3 py-2 text-sm bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-gray/20"
                />
                <input
                    type="text"
                    placeholder="Label (ex: 2026_6EFP2)"
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    className="flex-1 min-w-[140px] px-3 py-2 text-sm bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-gray/20"
                />
                <button
                    onClick={handleAdd}
                    disabled={saving}
                    className={cn(
                        'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all',
                        saving
                            ? 'bg-gray-100 text-gray-400 cursor-wait'
                            : 'bg-dark-gray text-white hover:bg-dark-gray/90 active:scale-95'
                    )}
                >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Adicionar
                </button>
            </div>
            {err && (
                <p className="flex items-center gap-1.5 text-xs text-red-500">
                    <AlertCircle size={12} /> {err}
                </p>
            )}
        </div>
    );
}

function PropostaCard({
    proposta,
    counts,
    onRefresh,
}: {
    proposta: Proposta;
    counts: Record<string, number>;
    onRefresh: () => void;
}) {
    const [expanded, setExpanded] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [deletingProposta, setDeletingProposta] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const totalRedacoes = proposta.proposta_task_ids.reduce(
        (sum, t) => sum + (counts[t.task_id] || 0),
        0
    );

    const handleRemoveTaskId = async (taskId: string) => {
        setDeleting(taskId);
        await fetch('/api/admin/propostas/task-ids', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id: taskId }),
        });
        setDeleting(null);
        onRefresh();
    };

    const handleDeleteProposta = async () => {
        setDeletingProposta(true);
        await fetch('/api/admin/propostas', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proposta_id: proposta.id }),
        });
        setDeletingProposta(false);
        setConfirmDelete(false);
        onRefresh();
    };

    return (
        <div className="bg-white/50 border border-gray-200/70 rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md">

            {/* Header da proposta */}
            <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-dark-gray text-white font-bold text-sm shrink-0">
                    P{proposta.numero}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-dark-gray truncate">
                        Proposta {proposta.numero}
                        {proposta.descricao && (
                            <span className="text-gray-500 font-normal ml-2 text-sm">— {proposta.descricao}</span>
                        )}
                    </h3>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                            <Hash size={10} />
                            {proposta.proposta_task_ids.length} task_id{proposta.proposta_task_ids.length !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                            <FileText size={10} />
                            {totalRedacoes} redaç{totalRedacoes !== 1 ? 'ões' : 'ão'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {confirmDelete ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-red-500 font-medium">Confirmar exclusão?</span>
                            <button
                                onClick={handleDeleteProposta}
                                disabled={deletingProposta}
                                className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                            >
                                {deletingProposta ? <Loader2 size={12} className="animate-spin" /> : 'Sim, excluir'}
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Excluir proposta"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                    <button
                        onClick={() => setExpanded(v => !v)}
                        className="p-2 text-gray-400 hover:text-dark-gray hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>
            </div>

            {/* Lista de task_ids */}
            {expanded && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-2">
                    {proposta.proposta_task_ids.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Nenhum Task ID vinculado ainda.</p>
                    ) : (
                        <div className="space-y-1.5">
                            {proposta.proposta_task_ids.map(t => (
                                <div
                                    key={t.id}
                                    className="flex items-center gap-3 px-3 py-2 bg-gray-50/80 rounded-xl text-sm"
                                >
                                    <code className="font-mono text-xs bg-dark-gray/5 px-2 py-0.5 rounded-lg text-dark-gray shrink-0">
                                        {t.task_id}
                                    </code>
                                    {t.turma_label && (
                                        <span className="flex items-center gap-1 text-gray-500 text-xs">
                                            <Tag size={10} />
                                            {t.turma_label}
                                        </span>
                                    )}
                                    <span className="ml-auto text-xs text-gray-400 shrink-0">
                                        {counts[t.task_id] ?? 0} redaç{(counts[t.task_id] ?? 0) !== 1 ? 'ões' : 'ão'}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveTaskId(t.task_id)}
                                        disabled={deleting === t.task_id}
                                        className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                        title={`Remover task_id ${t.task_id}`}
                                    >
                                        {deleting === t.task_id
                                            ? <Loader2 size={12} className="animate-spin" />
                                            : <X size={12} />
                                        }
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Linha de adição de novo task_id */}
                    <AddTaskIdRow propostaId={proposta.id} onAdded={onRefresh} />
                </div>
            )}
        </div>
    );
}

// ─── Componente Principal ────────────────────────────────────────────────────

export function PropostasAdmin() {
    const { propostas, counts, loading, error, reload } = usePropostas();
    const [loaded, setLoaded] = useState(false);

    // Lazy load: só busca quando o componente é montado
    React.useEffect(() => {
        if (!loaded) { reload(); setLoaded(true); }
    }, [loaded, reload]);

    const [showForm, setShowForm] = useState(false);
    const [newNumero, setNewNumero] = useState('');
    const [newDescricao, setNewDescricao] = useState('');
    const [creating, setCreating] = useState(false);
    const [createErr, setCreateErr] = useState('');

    const handleCreate = async () => {
        const numero = parseInt(newNumero, 10);
        if (isNaN(numero) || numero < 1) { setCreateErr('Informe um número válido (ex: 1, 2, 3)'); return; }
        setCreating(true); setCreateErr('');
        const res = await fetch('/api/admin/propostas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numero, descricao: newDescricao.trim() || null }),
        });
        setCreating(false);
        if (!res.ok) {
            const d = await res.json();
            setCreateErr(d.error || 'Erro ao criar proposta');
        } else {
            setNewNumero(''); setNewDescricao(''); setShowForm(false);
            reload();
        }
    };

    return (
        <div className="bg-white/40 rounded-3xl border border-gray-200/50 shadow-sm p-6 sm:p-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BookOpen size={18} className="text-dark-gray" />
                        <h2 className="text-xl font-bold text-dark-gray">Propostas</h2>
                    </div>
                    <p className="text-sm text-gray-500">
                        Associe Task IDs às propostas para classificar as redações por número de proposta.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all',
                        showForm
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-dark-gray text-white hover:bg-dark-gray/90 active:scale-95'
                    )}
                >
                    <Plus size={14} />
                    Nova Proposta
                </button>
            </div>

            {/* Formulário de nova proposta */}
            {showForm && (
                <div className="mb-6 p-4 bg-amber-50/60 border border-amber-100 rounded-2xl space-y-3">
                    <p className="text-sm font-bold text-dark-gray">Nova Proposta</p>
                    <div className="flex gap-3 flex-wrap">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500 font-medium">Número *</label>
                            <input
                                type="number"
                                min={1}
                                placeholder="Ex: 1"
                                value={newNumero}
                                onChange={e => setNewNumero(e.target.value)}
                                className="w-28 px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-gray/20"
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                            <label className="text-xs text-gray-500 font-medium">Descrição (opcional)</label>
                            <input
                                type="text"
                                placeholder="Ex: Turmas regulares 2026"
                                value={newDescricao}
                                onChange={e => setNewDescricao(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-gray/20"
                            />
                        </div>
                    </div>
                    {createErr && (
                        <p className="flex items-center gap-1.5 text-xs text-red-500">
                            <AlertCircle size={12} /> {createErr}
                        </p>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            className={cn(
                                'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all',
                                creating
                                    ? 'bg-gray-100 text-gray-400 cursor-wait'
                                    : 'bg-dark-gray text-white hover:bg-dark-gray/90 active:scale-95'
                            )}
                        >
                            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            Criar Proposta
                        </button>
                        <button
                            onClick={() => { setShowForm(false); setCreateErr(''); setNewNumero(''); setNewDescricao(''); }}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Estados de loading/erro */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
            )}
            {error && !loading && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                    <AlertCircle size={16} /> {error}
                    <button onClick={reload} className="ml-auto text-xs underline">Tentar novamente</button>
                </div>
            )}

            {/* Lista de propostas */}
            {!loading && !error && (
                <div className="space-y-4">
                    {propostas.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Nenhuma proposta cadastrada.</p>
                            <p className="text-xs mt-1">Clique em "Nova Proposta" para começar.</p>
                        </div>
                    ) : (
                        propostas.map(p => (
                            <PropostaCard
                                key={p.id}
                                proposta={p}
                                counts={counts}
                                onRefresh={reload}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
