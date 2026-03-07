'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
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
                    const formattedData = results.data.map((row: any) => {
                        const newRow: any = {};
                        Object.keys(row).forEach(key => {
                            newRow[key.toLowerCase().trim()] = row[key];
                        });
                        return newRow;
                    });

                    if (formattedData.length === 0) {
                        setMessage({ type: 'error', text: 'O arquivo CSV está vazio.' });
                        setIsUploading(false);
                        return;
                    }

                    const { error } = await supabase
                        .from('redacoes')
                        .insert(formattedData);

                    if (error) throw error;

                    setMessage({
                        type: 'success',
                        text: `${formattedData.length} redações importadas com sucesso!`
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

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
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
                        className={`relative border-2 border-dashed rounded-2xl p-16 transition-all duration-300 flex flex-col items-center justify-center ${isDragging ? 'border-accent-red bg-accent-red/5 scale-[1.01]' : 'border-gray-200 bg-white'
                            } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-300 hover:bg-gray-50/50'}`}
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
                                <div className={`p-4 rounded-full mb-6 transition-colors ${isDragging ? 'bg-accent-red text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                                    <UploadIcon size={32} />
                                </div>
                                <p className="text-xl font-bold text-dark-gray">
                                    {isDragging ? 'Solte para importar' : 'Arraste seu CSV aqui'}
                                </p>
                                <p className="text-sm text-gray-400 mt-2">ou clique para procurar no seu computador</p>
                            </>
                        )}
                    </div>

                    <div className="mt-10 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
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
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500">
                                            <th className="p-3 border-b border-gray-200 font-bold w-1/4">Coluna (Cabeçalho do CSV)</th>
                                            <th className="p-3 border-b border-gray-200 font-bold w-1/4">Tipo de Dado</th>
                                            <th className="p-3 border-b border-gray-200 font-bold w-1/2">Descrição</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        <tr><td className="p-3 font-mono text-dark-gray">data_base</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">Data base da redação</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">id_redacao</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">ID originial da redação</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">model_id</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">ID do modelo da proposta/tarefa</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">task_id / answer_id / question_id</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">IDs de controle e origem</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">external_id</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">ID externo (ex: plataforma parceira)</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">nick</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">Apelido do aluno</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">nr_serie</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">Série/Ano do aluno</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">cd_tipo_ensino / nm_tipo_ensino</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">Código e Nome do tipo de ensino</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">titulo</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">Título da redação</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">texto</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">Texto integral da redação (Importante)</td></tr>
                                        <tr><td className="p-3 font-mono text-accent-red">criterio_[1-5]_nota</td><td className="p-3 text-gray-500">Numérico</td><td className="p-3 text-gray-600">Nota da IA para cada um dos 5 critérios</td></tr>
                                        <tr><td className="p-3 font-mono text-accent-red">criterio_[1-5]_devolutiva</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">Texto da devolutiva/avaliação da IA por critério</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">nota_geral</td><td className="p-3 text-gray-500">Numérico</td><td className="p-3 text-gray-600">Soma ou Média Geral das notas</td></tr>
                                        <tr><td className="p-3 font-mono text-dark-gray">comentario_geral</td><td className="p-3 text-gray-500">Texto</td><td className="p-3 text-gray-600">Comentário final que a IA deu para toda a redação</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 italic">
                                * Nota: 'id' e 'created_at' são gerados automaticamente pelo sistema. Você não precisa incluí-los no arquivo CSV.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
