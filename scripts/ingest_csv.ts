import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or ANON_KEY if RLS allows)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Use command line argument if provided, otherwise fallback to the default file
const csvFilename = process.argv[2] || 'feature139407_090320206 - Sheet1.csv';
const CSV_FILE_PATH = path.resolve(process.cwd(), csvFilename);

interface RawCsvRow {
    internal_id?: string;
    external_id?: string;
    task_id?: string;
    question_id?: string;
    answer_id?: string;
    nick?: string;
    title?: string;
    essay?: string;
    genre?: string;
    ConsumerInit?: string;
    ConsumerFinish?: string;
    createdAt?: string;
    updatedAt?: string;
    'extra_fields.redacao_tema'?: string;
    'extra_fields.redacao_ano_serie'?: string;
    'extra_fields.cd_tipo_ensino'?: string;
    'extra_fields.nm_tipo_ensino'?: string;
    [key: string]: any; // Allow dynamic skills
}

function parseNota(notaStr?: string): number {
    if (!notaStr) return 0;
    // Convert "7,5" to 7.5
    const normalized = notaStr.replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
}

async function ingestCsv() {
    console.log(`Reading CSV file from: ${CSV_FILE_PATH}`);

    if (!fs.existsSync(CSV_FILE_PATH)) {
        console.error("CSV file not found!");
        process.exit(1);
    }

    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf8');

    Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            const data = results.data as RawCsvRow[];
            console.log(`Parsed ${data.length} rows. Preparing payload...`);

            const payload = data.map((row) => {
                // Build evaluated_skills array
                const evaluated_skills = [];
                for (let i = 0; i < 5; i++) {
                    evaluated_skills.push({
                        score: parseNota(row[`evaluated_skills[${i}].score`]),
                        comment: row[`evaluated_skills[${i}].comment`] || '',
                        statement: row[`evaluated_skills[${i}].statement`] || ''
                    });
                }

                // Build assessed_skills array
                const assessed_skills = [];
                for (let i = 0; i < 5; i++) {
                    if (row[`assessed_skills[${i}].statement`] || row[`assessed_skills[${i}].description`]) {
                        assessed_skills.push({
                            statement: row[`assessed_skills[${i}].statement`] || '',
                            description: row[`assessed_skills[${i}].description`] || ''
                        });
                    }
                }

                // Build extra_fields JSON
                const extra_fields = {
                    redacao_tema: row['extra_fields.redacao_tema'] || '',
                    redacao_ano_serie: row['extra_fields.redacao_ano_serie'] || '',
                    redacao_zerada: row['extra_fields.redacao_zerada'] || '',
                    cd_tipo_ensino: row['extra_fields.cd_tipo_ensino'] || '',
                    nm_tipo_ensino: row['extra_fields.nm_tipo_ensino'] || ''
                };

                return {
                    internal_id: row.internal_id,
                    external_id: row.external_id,
                    task_id: row.task_id,
                    question_id: row.question_id,
                    answer_id: row.answer_id,
                    nick: row.nick,
                    title: row.title,
                    essay: row.essay,
                    genre: row.genre,
                    statement: row['evaluated_skills[0].statement'] || '', // Optional generalization
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

            console.log(`Ready to insert ${payload.length} rows into 'redacoes' table.`);

            // Batch insert logic (Supabase limits to ~1000 per request)
            const BATCH_SIZE = 100;
            let insertedCount = 0;
            let errorCount = 0;

            for (let i = 0; i < payload.length; i += BATCH_SIZE) {
                const batch = payload.slice(i, i + BATCH_SIZE);
                console.log(`Inserting batch ${i / BATCH_SIZE + 1}...`);

                const { error } = await supabase.from('redacoes').insert(batch);

                if (error) {
                    console.error(`Error inserting batch:`, error);
                    errorCount++;
                } else {
                    insertedCount += batch.length;
                }
            }

            console.log(`Done! Inserted: ${insertedCount}. Errors: ${errorCount}`);
        },
        error: (err: any) => {
            console.error("Error parsing CSV:", err);
        }
    });
}

ingestCsv();
