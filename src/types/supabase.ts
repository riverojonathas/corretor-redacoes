export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            perfis: {
                Row: {
                    id: string
                    nome: string | null
                    email: string | null
                    cargo: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    nome?: string | null
                    email?: string | null
                    cargo?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    nome?: string | null
                    email?: string | null
                    cargo?: string | null
                    created_at?: string
                }
            }
            redacoes: {
                Row: {
                    id: string
                    data_base: string | null
                    id_redacao: string | null
                    model_id: string | null
                    task_id: string | null
                    answer_id: string | null
                    question_id: string | null
                    external_id: string | null
                    nick: string | null
                    nr_serie: string | null
                    cd_tipo_ensino: string | null
                    nm_tipo_ensino: string | null
                    titulo: string | null
                    texto: string | null
                    criterio_1_nota: number | null
                    criterio_1_devolutiva: string | null
                    criterio_2_nota: number | null
                    criterio_2_devolutiva: string | null
                    criterio_3_nota: number | null
                    criterio_3_devolutiva: string | null
                    criterio_4_nota: number | null
                    criterio_4_devolutiva: string | null
                    criterio_5_nota: number | null
                    criterio_5_devolutiva: string | null
                    nota_geral: number | null
                    comentario_geral: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    data_base?: string | null
                    id_redacao?: string | null
                    model_id?: string | null
                    task_id?: string | null
                    answer_id?: string | null
                    question_id?: string | null
                    external_id?: string | null
                    nick?: string | null
                    nr_serie?: string | null
                    cd_tipo_ensino?: string | null
                    nm_tipo_ensino?: string | null
                    titulo?: string | null
                    texto?: string | null
                    criterio_1_nota?: number | null
                    criterio_1_devolutiva?: string | null
                    criterio_2_nota?: number | null
                    criterio_2_devolutiva?: string | null
                    criterio_3_nota?: number | null
                    criterio_3_devolutiva?: string | null
                    criterio_4_nota?: number | null
                    criterio_4_devolutiva?: string | null
                    criterio_5_nota?: number | null
                    criterio_5_devolutiva?: string | null
                    nota_geral?: number | null
                    comentario_geral?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    data_base?: string | null
                    id_redacao?: string | null
                    model_id?: string | null
                    task_id?: string | null
                    answer_id?: string | null
                    question_id?: string | null
                    external_id?: string | null
                    nick?: string | null
                    nr_serie?: string | null
                    cd_tipo_ensino?: string | null
                    nm_tipo_ensino?: string | null
                    titulo?: string | null
                    texto?: string | null
                    criterio_1_nota?: number | null
                    criterio_1_devolutiva?: string | null
                    criterio_2_nota?: number | null
                    criterio_2_devolutiva?: string | null
                    criterio_3_nota?: number | null
                    criterio_3_devolutiva?: string | null
                    criterio_4_nota?: number | null
                    criterio_4_devolutiva?: string | null
                    criterio_5_nota?: number | null
                    criterio_5_devolutiva?: string | null
                    nota_geral?: number | null
                    comentario_geral?: string | null
                    created_at?: string
                }
            }
            revisoes: {
                Row: {
                    id: string
                    data_correcao: string
                    redacao_id: string
                    corretor_id: string
                    criterio_1_revisao: 'correta' | 'incorreta' | 'parcialmente correta' | null
                    criterio_1_revisao_classificacao: 'insuficiente' | 'ausente' | null
                    criterio_2_revisao: 'correta' | 'incorreta' | 'parcialmente correta' | null
                    criterio_2_revisao_classificacao: 'insuficiente' | 'ausente' | null
                    criterio_3_revisao: 'correta' | 'incorreta' | 'parcialmente correta' | null
                    criterio_3_revisao_classificacao: 'insuficiente' | 'ausente' | null
                    criterio_4_revisao: 'correta' | 'incorreta' | 'parcialmente correta' | null
                    criterio_4_revisao_classificacao: 'insuficiente' | 'ausente' | null
                    criterio_5_revisao: 'correta' | 'incorreta' | 'parcialmente correta' | null
                    criterio_5_revisao_classificacao: 'insuficiente' | 'ausente' | null
                    comentario_geral: string | null
                }
                Insert: {
                    id?: string
                    data_correcao?: string
                    redacao_id: string
                    corretor_id: string
                    criterio_1_revisao?: 'correta' | 'incorreta' | 'parcialmente correta' | null
                    criterio_1_revisao_classificacao?: 'insuficiente' | 'ausente' | null
                    criterio_2_revisao?: 'correta' | 'incorreta' | 'parcialmente correta' | null
                    criterio_2_revisao_classificacao?: 'insuficiente' | 'ausente' | null
                    criterio_3_revisao?: 'correta' | 'incorreta' | 'parcialmente correta' | null
                    criterio_3_revisao_classificacao?: 'insuficiente' | 'ausente' | null
                    criterio_4_revisao?: 'correta' | 'incorreta' | 'parcialmente correta' | null
                    criterio_4_revisao_classificacao?: 'insuficiente' | 'ausente' | null
                    criterio_5_revisao?: 'correta' | 'incorreta' | 'parcialmente correta' | null
                    criterio_5_revisao_classificacao?: 'insuficiente' | 'ausente' | null
                    comentario_geral?: string | null
                }
                Update: {
                    id?: string
                    data_correcao?: string
                    redacao_id?: string
                    corretor_id?: string
                    criterio_1_revisao?: 'correta' | 'incorreta' | 'parcialmente correta' | null
                    criterio_1_revisao_classificacao?: 'insuficiente' | 'ausente' | null
                    criterio_2_revisao?: 'correta' | 'incorreta' | 'parcialmente correta' | null
                    criterio_2_revisao_classificacao?: 'insuficiente' | 'ausente' | null
                    criterio_3_revisao?: 'correta' | 'incorreta' | 'parcialmente correta' | null
                    criterio_3_revisao_classificacao?: 'insuficiente' | 'ausente' | null
                    criterio_4_revisao?: 'correta' | 'incorreta' | 'parcialmente correta' | null
                    criterio_4_revisao_classificacao?: 'insuficiente' | 'ausente' | null
                    criterio_5_revisao?: 'correta' | 'incorreta' | 'parcialmente correta' | null
                    criterio_5_revisao_classificacao?: 'insuficiente' | 'ausente' | null
                    comentario_geral?: string | null
                }
            }
        }
    }
}
