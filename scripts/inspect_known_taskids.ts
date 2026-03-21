/**
 * inspect_known_taskids.ts
 *
 * Inspect records for task_ids that we KNOW the user associated with labels like 2026_6EFP2.
 */

import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// 2026_6EFP2: 86145579, 2026_7EFP2: 86146814
const knownIds = ['86145579', '86146814', '86151170', '86142132'];

async function main() {
    console.log('🔍 Inspecionando redações conhecidas...');

    const { data: rows, error } = await supabase
        .from('redacoes')
        .select("*")
        .in('task_id', knownIds)
        .limit(10);

    if (error) {
        console.error('❌ Erro:', error.message);
        return;
    }

    if (!rows || rows.length === 0) {
        console.log('✅ Nenhuma redação encontrada para esses IDs no banco.');
        return;
    }

    rows.forEach(row => {
        console.log(`\n--- [task_id: ${row.task_id}] ---`);
        console.log(JSON.stringify(row, null, 2));
    });
}

main();
