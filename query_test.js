const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Fetching redacoes...");
  const { data, error } = await supabase.from('redacoes').select('id, titulo').limit(2);
  if (error) console.error("Error:", error);
  else console.log("Data:", data);
}
test();
