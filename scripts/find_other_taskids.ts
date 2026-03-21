/**
 * find_other_taskids.ts
 *
 * Find task_ids in 'redacoes' that are NOT in the list and get their redacao_tema.
 */

import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const assignedIds = [
  '86145579', '86146814', '86147892', '86149102', '86150805',
  '86151170', '86151813', '86142132', '86142588', '86143006'
];

async function main() {
    console.log('🔍 Buscando task_ids não atribuídos...');

    const { data: rows, error } = await supabase
        .from('redacoes')
        .select("task_id, extra_fields->>redacao_tema")
        .not('task_id', 'in', `(${assignedIds.join(',')})`);

    if (error) {
        console.error('❌ Erro:', error.message);
        return;
    }

    if (!rows || rows.length === 0) {
        console.log('✅ Nenhum task_id extra encontrado.');
        return;
    }

    // Agrupa por task_id para pegar o tema mais comum (ou o primeiro)
    const extraMappings = new Map<string, string>();
    for (const row of rows) {
        if (row.task_id && !extraMappings.has(row.task_id)) {
            extraMappings.set(row.task_id, row.redacao_tema || 'Sem tema');
        }
    }

    const payload = Array.from(extraMappings.entries()).map(([tid, tema]) => ({
        task_id: tid,
        label: tema
    }));

    console.log(`\n📋 Encontrados ${payload.length} novos task_ids para a Proposta 1:`);
    console.log(JSON.stringify(payload, null, 2));
}

main();
