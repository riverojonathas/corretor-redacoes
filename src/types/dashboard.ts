export interface Redacao {
    id: string;
    internal_id: string;
    nick: string;
    title: string;
    essay: string;
    genre: string;
    statement: string;
    support_text: string;
    evaluated_skills?: { score: number; comment: string; statement?: string }[];
    assessed_skills?: { statement: string; description: string }[];
    extra_fields?: { redacao_tema?: string; redacao_ano_serie: string; cd_tipo_ensino?: string; nm_tipo_ensino?: string };
}

export interface RedacaoListItem {
    id: string;
    titulo: string;
    nick: string;
    nr_serie: string;
    status: 'pendente' | 'corrigida' | 'rascunho' | 'concluida';
    revisao_id?: string;
    favorita?: boolean;
    model_id?: string;
    titulo_modelo?: string;
    nm_tipo_ensino?: string;
    answer_id?: string;
    isLocked?: boolean;
    proposta_numero?: number;
    proposta_label?: string;
    created_at?: string;
}


export interface Highlight {
    id?: string;
    revisao_id?: string;
    criterio_id: number;
    cor: string;
    start_index: number;
    end_index: number;
    texto_marcado: string;
    observacao: string;
    target?: 'texto' | 'devolutiva';
}

export interface Criterio {
    id: number;
    name: string;
    desc: string;
    full_desc: string;
}
