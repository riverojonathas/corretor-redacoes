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
                    internal_id: string | null
                    external_id: string | null
                    task_id: string | null
                    question_id: string | null
                    answer_id: string | null
                    nick: string | null
                    title: string | null
                    essay: string | null
                    genre: string | null
                    statement: string | null
                    support_text: string | null
                    consumer_init: string | null
                    consumer_finish: string | null
                    evaluated_skills: Json | null
                    assessed_skills: Json | null
                    extra_fields: Json | null
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    internal_id?: string | null
                    external_id?: string | null
                    task_id?: string | null
                    question_id?: string | null
                    answer_id?: string | null
                    nick?: string | null
                    title?: string | null
                    essay?: string | null
                    genre?: string | null
                    statement?: string | null
                    support_text?: string | null
                    consumer_init?: string | null
                    consumer_finish?: string | null
                    evaluated_skills?: Json | null
                    assessed_skills?: Json | null
                    extra_fields?: Json | null
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    internal_id?: string | null
                    external_id?: string | null
                    task_id?: string | null
                    question_id?: string | null
                    answer_id?: string | null
                    nick?: string | null
                    title?: string | null
                    essay?: string | null
                    genre?: string | null
                    statement?: string | null
                    support_text?: string | null
                    consumer_init?: string | null
                    consumer_finish?: string | null
                    evaluated_skills?: Json | null
                    assessed_skills?: Json | null
                    extra_fields?: Json | null
                    created_at?: string
                    updated_at?: string | null
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
