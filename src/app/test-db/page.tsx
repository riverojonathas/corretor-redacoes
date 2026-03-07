import { supabase } from '@/lib/supabaseClient';

export default async function TestDbPage() {
    let result: any = null;
    try {
        const { data, error } = await supabase.from('redacoes').select('id').limit(1);
        result = { data, error };
    } catch (err: any) {
        result = { exception: err.message };
    }

    return (
        <div className="p-10 font-mono text-xs text-black bg-gray-100 min-h-screen">
            <h1 className="font-bold text-lg mb-4">DB Test Page</h1>
            <pre className="bg-white p-4 rounded shadow" id="db-result">
                {JSON.stringify(result, null, 2)}
            </pre>
            <h2 className="mt-8">ENV CHECK:</h2>
            <div>URL length: {process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0}</div>
        </div>
    );
}
