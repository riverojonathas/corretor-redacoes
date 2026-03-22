import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase keys.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
-- View 3: Resumo de Propostas
CREATE OR REPLACE VIEW public.dashboard_propostas_resumo AS
SELECT 
    (SELECT COUNT(*) FROM public.propostas) AS total_propostas,
    (SELECT SUM(total_redacoes) FROM public.propostas_stats) AS total_redacoes_propostas,
    (SELECT COUNT(*) FROM public.redacoes r LEFT JOIN public.proposta_task_ids pt ON r.task_id = pt.task_id WHERE pt.proposta_id IS NULL) AS redacoes_sem_proposta;

-- View 4: Base da Matriz de Qualidade (Evita 20 Joins Simultâneos)
CREATE OR REPLACE VIEW public.dashboard_ai_eval_matrix_base AS
SELECT 
    rev.id AS revisao_id,
    pt.proposta_id,
    pt.task_id,
    pt.turma_label,
    p.numero AS proposta_numero,
    rev.criterio_1_tema_1, rev.criterio_1_tema_2, rev.criterio_1_tema_3, rev.criterio_1_tema_4,
    rev.criterio_2_tema_1, rev.criterio_2_tema_2, rev.criterio_2_tema_3, rev.criterio_2_tema_4,
    rev.criterio_3_tema_1, rev.criterio_3_tema_2, rev.criterio_3_tema_3, rev.criterio_3_tema_4,
    rev.criterio_4_tema_1, rev.criterio_4_tema_2, rev.criterio_4_tema_3, rev.criterio_4_tema_4,
    rev.criterio_5_tema_1, rev.criterio_5_tema_2, rev.criterio_5_tema_3, rev.criterio_5_tema_4
FROM public.revisoes rev
JOIN public.redacoes r ON r.id = rev.redacao_id
LEFT JOIN public.proposta_task_ids pt ON pt.task_id = r.task_id
LEFT JOIN public.propostas p ON p.id = pt.proposta_id;

-- View 5: Matriz Global de Avaliação da IA (Com filtros de agrupamento)
CREATE OR REPLACE VIEW public.dashboard_ai_eval_matrix_stats AS
SELECT 'C1' as criterio, 'tema_1' as tema, criterio_1_tema_1 as avaliacao, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) as total FROM public.dashboard_ai_eval_matrix_base WHERE criterio_1_tema_1 IS NOT NULL GROUP BY criterio_1_tema_1, proposta_id, task_id, turma_label, proposta_numero
UNION ALL SELECT 'C1', 'tema_2', criterio_1_tema_2, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_1_tema_2 IS NOT NULL GROUP BY criterio_1_tema_2, proposta_id, task_id, turma_label, proposta_numero
UNION ALL SELECT 'C1', 'tema_3', criterio_1_tema_3, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_1_tema_3 IS NOT NULL GROUP BY criterio_1_tema_3, proposta_id, task_id, turma_label, proposta_numero
UNION ALL SELECT 'C1', 'tema_4', criterio_1_tema_4, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_1_tema_4 IS NOT NULL GROUP BY criterio_1_tema_4, proposta_id, task_id, turma_label, proposta_numero
-- C2
UNION ALL SELECT 'C2', 'tema_1', criterio_2_tema_1, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_2_tema_1 IS NOT NULL GROUP BY criterio_2_tema_1, proposta_id, task_id, turma_label, proposta_numero
UNION ALL SELECT 'C2', 'tema_2', criterio_2_tema_2, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_2_tema_2 IS NOT NULL GROUP BY criterio_2_tema_2, proposta_id, task_id, turma_label, proposta_numero
UNION ALL SELECT 'C2', 'tema_3', criterio_2_tema_3, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_2_tema_3 IS NOT NULL GROUP BY criterio_2_tema_3, proposta_id, task_id, turma_label, proposta_numero
UNION ALL SELECT 'C2', 'tema_4', criterio_2_tema_4, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_2_tema_4 IS NOT NULL GROUP BY criterio_2_tema_4, proposta_id, task_id, turma_label, proposta_numero
-- C3
UNION ALL SELECT 'C3', 'tema_1', criterio_3_tema_1, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_3_tema_1 IS NOT NULL GROUP BY criterio_3_tema_1, proposta_id, task_id, turma_label, proposta_numero
UNION ALL SELECT 'C3', 'tema_2', criterio_3_tema_2, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_3_tema_2 IS NOT NULL GROUP BY criterio_3_tema_2, proposta_id, task_id, turma_label, proposta_numero
UNION ALL SELECT 'C3', 'tema_3', criterio_3_tema_3, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_3_tema_3 IS NOT NULL GROUP BY criterio_3_tema_3, proposta_id, task_id, turma_label, proposta_numero
UNION ALL SELECT 'C3', 'tema_4', criterio_3_tema_4, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_3_tema_4 IS NOT NULL GROUP BY criterio_3_tema_4, proposta_id, task_id, turma_label, proposta_numero
-- C4
UNION ALL SELECT 'C4', 'tema_1', criterio_4_tema_1, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_4_tema_1 IS NOT NULL GROUP BY criterio_4_tema_1, proposta_id, task_id, turma_label, proposta_numero
UNION ALL SELECT 'C4', 'tema_2', criterio_4_tema_2, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_4_tema_2 IS NOT NULL GROUP BY criterio_4_tema_2, proposta_id, task_id, turma_label, proposta_numero
UNION ALL SELECT 'C4', 'tema_3', criterio_4_tema_3, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_4_tema_3 IS NOT NULL GROUP BY criterio_4_tema_3, proposta_id, task_id, turma_label, proposta_numero
UNION ALL SELECT 'C4', 'tema_4', criterio_4_tema_4, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_4_tema_4 IS NOT NULL GROUP BY criterio_4_tema_4, proposta_id, task_id, turma_label, proposta_numero
-- C5
UNION ALL SELECT 'C5', 'tema_1', criterio_5_tema_1, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_5_tema_1 IS NOT NULL GROUP BY criterio_5_tema_1, proposta_id, task_id, turma_label, proposta_numero
UNION ALL SELECT 'C5', 'tema_2', criterio_5_tema_2, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_5_tema_2 IS NOT NULL GROUP BY criterio_5_tema_2, proposta_id, task_id, turma_label, proposta_numero
UNION ALL SELECT 'C5', 'tema_3', criterio_5_tema_3, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_5_tema_3 IS NOT NULL GROUP BY criterio_5_tema_3, proposta_id, task_id, turma_label, proposta_numero
UNION ALL SELECT 'C5', 'tema_4', criterio_5_tema_4, proposta_id, task_id, turma_label, proposta_numero, COUNT(*) FROM public.dashboard_ai_eval_matrix_base WHERE criterio_5_tema_4 IS NOT NULL GROUP BY criterio_5_tema_4, proposta_id, task_id, turma_label, proposta_numero;
`;

async function main() {
    console.log("Executando a query...");
    const { data, error } = await supabase.rpc('exec_sql', { query: sql }).catch(async (e) => {
       // Se o RPC falhar, isso é comum se 'exec_sql' não existe, então não podemos rodar migração arbitrária JS,
       // a não ser usando API postgres diretamente com npm pg.
       return { data: null, error: e };
    });
    
    if (error) {
        console.error("Erro via RPC, caindo para postgres nativo...");
        const { Client } = require('pg');
        const dbUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL; // Normalmente não tem direct DB url em public.
        console.log("Tentando conexão nativa se houver DATABASE_URL", !!process.env.DATABASE_URL);
    } else {
        console.log("Sucesso!");
    }
}
main();
