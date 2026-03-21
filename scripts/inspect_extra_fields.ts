/**
 * inspect_extra_fields.ts
 *
 * Inspect all fields in extra_fields to find something similar to "2026_6EFP2".
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
  '86151170', '86151813', '86142132', '86142588', '86143006', '86143422'
];

async function main() {
    console.log('🔍 Inspecionando extra_fields de redações não atribuídas...');

    const { data: rows, error } = await supabase
        .from('redacoes')
        .select("task_id, extra_fields")
        .not('task_id', 'in', `(${assignedIds.join(',')})`)
        .limit(10); // Amostra

    if (error) {
        console.error('❌ Erro:', error.message);
        return;
    }

    if (!rows || rows.length === 0) {
        console.log('✅ Nenhum dado extra encontrado.');
        return;
    }

    rows.forEach(row => {
        console.log(`\n--- [task_id: ${row.task_id}] ---`);
        console.log(JSON.stringify(row.extra_fields, null, 2));
    });
}

main();
