import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

const sql = `
CREATE OR REPLACE VIEW public.fila_revisao_view AS
SELECT 
    r.id,
    r.title,
    r.nick,
    r.extra_fields,
    r.answer_id,
    r.created_at,
    r.locked_by,
    r.locked_at,
    r.task_id,
    pt.turma_label AS proposta_label,
    p.numero AS proposta_numero,
    pt.proposta_id,
    COALESCE(rev.status, 'pendente') AS status,
    rev.favorita,
    rev.id AS revisao_id,
    rev.corretor_id
FROM public.redacoes r
LEFT JOIN public.proposta_task_ids pt ON pt.task_id = r.task_id
LEFT JOIN public.propostas p ON p.id = pt.proposta_id
LEFT JOIN LATERAL (
    SELECT id, status, favorita, corretor_id 
    FROM public.revisoes 
    WHERE redacao_id = r.id 
    LIMIT 1
) rev ON true;
`;

async function main() {
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    if(error){
        console.log("RPC Error fallback");
        const { Client } = require('pg');
        const dbUrl = process.env.DATABASE_URL;
        if(dbUrl) {
            const client = new Client({ connectionString: dbUrl });
            await client.connect();
            await client.query(sql);
            await client.end();
            console.log("Success with pg!");
        } else {
            console.error("No DATABASE_URL");
        }
    } else {
        console.log("Success with rpc!");
    }
}
main();
