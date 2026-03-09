import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Rota protegida da API: Necessita Service Role Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Cria um cliente "admin" superpoderoso. *Nunca* exporte isso pro frontend.
const getAdminSupabase = () => {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('Supabase Service Role Key não configurada.');
    }
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};

// GET: Listar Usuários
export async function GET(req: NextRequest) {
    try {
        const supabaseAdmin = getAdminSupabase();

        // Retorna todos os perfis (bypassa RLS porque usa service_role_key)
        const { data, error } = await supabaseAdmin
            .from('perfis')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ users: data || [] });

    } catch (error: any) {
        console.error('Erro ao listar usuários (API):', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Criar Usuário
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, nome, cargo = 'corretor' } = body;

        if (!email || !password || !nome) {
            return NextResponse.json({ error: 'Dados incompletos (email, password, nome).' }, { status: 400 });
        }

        const supabaseAdmin = getAdminSupabase();

        // 1. Cria usuário no auth.users sem precisar confirmar email (autoConfirm: true)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { nome, cargo }
        });

        if (authError) throw authError;

        if (!authData.user) {
            return NextResponse.json({ error: 'Falha desconhecida ao criar usuário no Auth.' }, { status: 500 });
        }

        // 2. Insere dados na tabela pública perfis
        const { error: dbError } = await supabaseAdmin
            .from('perfis')
            .upsert({
                id: authData.user.id,
                email: authData.user.email,
                nome: nome,
                cargo: cargo,
                primeiro_acesso: true
            });

        if (dbError) {
            // Rollback: se falhou em criar o perfil, apaga do Auth.
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            throw dbError;
        }

        return NextResponse.json({ message: 'Usuário criado com sucesso.', user: authData.user }, { status: 201 });

    } catch (error: any) {
        console.error('Erro na criação de usuário (API):', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Atualizar cargo ou senha de um usuário
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, cargo, password } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID é obrigatório.' }, { status: 400 });
        }

        const supabaseAdmin = getAdminSupabase();

        // 1. Atualizar senha (se fornecida)
        if (password) {
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
            if (authError) throw authError;
        }

        // 2. Atualizar cargo (se fornecido)
        if (cargo) {
            const { error: dbError } = await supabaseAdmin
                .from('perfis')
                .update({ cargo })
                .eq('id', userId);

            if (dbError) throw dbError;
        }

        return NextResponse.json({ message: 'Usuário atualizado com sucesso.' });

    } catch (error: any) {
        console.error('Erro na atualização de usuário (API):', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Deletar Usuário
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json({ error: 'User ID não fornecido na query.' }, { status: 400 });
        }

        const supabaseAdmin = getAdminSupabase();

        // 1. Deleta manualmente da tabela perfis caso não exista ON DELETE CASCADE
        const { error: dbError } = await supabaseAdmin.from('perfis').delete().eq('id', userId);
        if (dbError) throw dbError;

        // 2. Deleta do Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) throw authError;

        return NextResponse.json({ message: 'Usuário removido com sucesso.' });

    } catch (error: any) {
        console.error('Erro na exclusão de usuário (API):', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
