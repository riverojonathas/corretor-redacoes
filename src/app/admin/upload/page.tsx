'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Upload as UploadIcon, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminUploadPage() {
    const { user, cargo, loading } = useAuth();
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!loading && (!user || cargo !== 'admin')) {
            router.replace('/dashboard');
        }
    }, [user, cargo, loading, router]);

    const handleFileUpload = async (file: File) => {
        if (!file.name.endsWith('.csv')) {
            setMessage({ type: 'error', text: 'Por favor, envie apenas arquivos CSV.' });
            return;
        }

        setIsUploading(true);
        setMessage(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const formattedData = results.data.map((rawRow: any) => {
                        const row: any = {};
                        Object.keys(rawRow).forEach(k => { row[k.trim()] = rawRow[k]; });

                        function parseNota(notaStr?: string): number {
                            if (!notaStr) return 0;
                            const normalized = String(notaStr).replace(',', '.');
                            const num = parseFloat(normalized);
                            return isNaN(num) ? 0 : num;
                        }

                        const evaluated_skills = [];
                        for (let i = 0; i < 5; i++) {
                            evaluated_skills.push({
                                score: parseNota(row[`evaluated_skills[${i}].score`]),
                                comment: row[`evaluated_skills[${i}].comment`] || '',
                                statement: row[`evaluated_skills[${i}].statement`] || ''
                            });
                        }

                        const assessed_skills = [];
                        for (let i = 0; i < 5; i++) {
                            if (row[`assessed_skills[${i}].statement`] || row[`assessed_skills[${i}].description`]) {
                                assessed_skills.push({
                                    statement: row[`assessed_skills[${i}].statement`] || '',
                                    description: row[`assessed_skills[${i}].description`] || ''
                                });
                            }
                        }

                        const extra_fields = {
                            redacao_tema: row['extra_fields.redacao_tema'] || '',
                            redacao_ano_serie: row['extra_fields.redacao_ano_serie'] || '',
                            redacao_zerada: row['extra_fields.redacao_zerada'] || '',
                            cd_tipo_ensino: row['extra_fields.cd_tipo_ensino'] || '',
                            nm_tipo_ensino: row['extra_fields.nm_tipo_ensino'] || ''
                        };

                        return {
                            internal_id: row.internal_id || row.id_redacao,
                            external_id: row.external_id,
                            task_id: row.task_id,
                            question_id: row.question_id,
                            answer_id: row.answer_id,
                            nick: row.nick,
                            title: row.title || row.titulo,
                            essay: row.essay || row.texto,
                            genre: row.genre,
                            statement: row['evaluated_skills[0].statement'] || row.statement || '',
                            support_text: row.support_text || '',
                            consumer_init: row.ConsumerInit ? new Date(row.ConsumerInit).toISOString() : null,
                            consumer_finish: row.ConsumerFinish ? new Date(row.ConsumerFinish).toISOString() : null,
                            created_at: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
                            updated_at: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
                            evaluated_skills,
                            assessed_skills,
                            extra_fields
                        };
                    });

                    if (formattedData.length === 0) {
                        setMessage({ type: 'error', text: 'O arquivo CSV está vazio.' });
                        setIsUploading(false);
                        return;
                    }

                    // Envia para a API Route que usa service_role key (bypassa RLS)
                    const response = await fetch('/api/admin/import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ rows: formattedData }),
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.error || 'Erro desconhecido na importação.');
                    }

                    setMessage({
                        type: 'success',
                        text: `${result.insertedCount} redações importadas com sucesso!`
                    });
                } catch (error: any) {
                    setMessage({ type: 'error', text: `Erro na importação: ${error.message}` });
                } finally {
                    setIsUploading(false);
                }
            },
            error: (error) => {
                setMessage({ type: 'error', text: `Erro ao ler o arquivo: ${error.message}` });
                setIsUploading(false);
            }
        });
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    }, []);

    if (loading || (!user || cargo !== 'admin')) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-red border-t-transparent"></div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-dark-gray">Importar Redações</h1>
                    <p className="text-gray-500 mt-2">Carregue arquivos CSV para alimentar o banco de dados da plataforma.</p>
                </div>

                <div className="bg-white/40 rounded-2xl border border-gray-200/50 shadow-sm p-8">
                    {message && (
                        <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <span className="text-sm font-medium">{message.text}</span>
                        </div>
                    )}

                    <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`relative border-2 border-dashed rounded-2xl p-16 transition-all duration-300 flex flex-col items-center justify-center ${isDragging ? 'border-accent-red bg-accent-red/5 scale-[1.01]' : 'border-gray-200/50 bg-white/20'
                            } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-accent-red/30 hover:bg-black/5'}`}
                        onClick={() => !isUploading && document.getElementById('fileInput')?.click()}
                    >
                        <input
                            id="fileInput"
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                            disabled={isUploading}
                        />

                        {isUploading ? (
                            <div className="flex flex-col items-center">
                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-red border-t-transparent mb-4"></div>
                                <p className="text-accent-red font-semibold">Processando arquivo...</p>
                            </div>
                        ) : (
                            <>
                                <div className={`p-4 rounded-full mb-6 transition-colors ${isDragging ? 'bg-accent-red text-white' : 'bg-white text-gray-500 shadow-sm'}`}>
                                    <UploadIcon size={32} />
                                </div>
                                <p className="text-xl font-bold text-dark-gray">
                                    {isDragging ? 'Solte para importar' : 'Arraste seu CSV aqui'}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">ou clique para procurar no seu computador</p>
                            </>
                        )}
                    </div>

                    <div className="mt-10 bg-white/20 rounded-2xl p-6 border border-gray-200/50 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-dark-gray">
                            <Info size={18} className="text-accent-red" />
                            <h4 className="font-bold">Mapa de Colunas Esperadas (Tabela: redacoes)</h4>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                O arquivo CSV deve conter um cabeçalho na primeira linha. O sistema converterá todos os nomes das colunas para <strong>minúsculas</strong>. Abaixo está o esquema esperado para o banco de dados. Colunas ausentes no CSV serão ignoradas, mas podem causar erro caso sejam obrigatórias na arquitetura.
                            </p>

                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead className="bg-white/30 text-gray-500">
                                        <tr>
                                            <th className="p-3 border-b border-gray-200/50 font-bold w-1/4">Coluna (Cabeçalho do CSV)</th>
                                            <th className="p-3 border-b border-gray-200/50 font-bold w-1/4">Tipo de Dado</th>
                                            <th className="p-3 border-b border-gray-200/50 font-bold w-1/2">Descrição</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200/30 bg-transparent">
                                        <tr><td className="p-3 font-mono text-dark-gray">internal_id</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">ID originial da redação</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">task_id / answer_id / question_id</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">IDs de controle e origem</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">external_id</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">ID externo (ex: plataforma parceira)</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">nick</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">Apelido do aluno</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">title</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">Título da redação</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">essay</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">Texto integral da redação (Importante)</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">genre</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">Gênero textual</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">statement</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">Enunciado / Tema</td></tr>
                                        <tr><td className="p-3 font-mono text-accent-red">evaluated_skills</td><td className="p-3 text-gray-500">JSON</td><td className="p-3 text-gray-600">Array JSON com as notas e comentários de cada competência</td></tr>
                                        <tr><td className="p-3 font-mono text-accent-red">assessed_skills</td><td className="p-3 text-gray-500">JSON</td><td className="p-3 text-gray-600">Aray JSON com descrição e instruções das métricas avaliadas</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">extra_fields</td><td className="p-3 text-gray-500">JSON</td><td className="p-3 text-gray-600">JSON com ano, série, e outros metadados extras</td></tr>

                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 italic">
                                * Nota: 'id' e 'created_at' são gerados automaticamente pelo sistema. Você não precisa incluí-los no arquivo CSV.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
