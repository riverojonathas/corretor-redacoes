'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users, UserPlus, Search, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { UserModal } from '@/components/admin/UserModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminUsersPage() {
    const { cargo, loading: authLoading } = useAuth();
    const router = useRouter();

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<any | null>(null);

    // Proteção de Rota
    useEffect(() => {
        if (!authLoading && cargo !== 'admin') {
            toast.error('Acesso negado. Apenas administradores podem acessar esta área.');
            router.replace('/dashboard');
        }
    }, [cargo, authLoading, router]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Erro na API.');
            }

            const data = await res.json();
            setUsers(data.users || []);
        } catch (error: any) {
            console.error('Erro ao buscar usuários:', error);
            toast.error('Não foi possível carregar a lista de usuários.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (cargo === 'admin') {
            fetchUsers();
        }
    }, [cargo]);

    const handleDeleteUser = async (user: any) => {
        if (!window.confirm(`Tem certeza que deseja remover o acesso de ${user.nome}? Esta ação apagará a conta do sistema.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/users?id=${user.id}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Erro ao deletar usuário.');
            }

            toast.success('Usuário removido com sucesso!');
            fetchUsers();
        } catch (error: any) {
            toast.error('Ocorreu um erro.', { description: error.message });
        }
    };

    const handleEditClick = (user: any) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleNewUserClick = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };

    const filteredUsers = users.filter(u =>
        u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || cargo !== 'admin') {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center p-20 text-gray-500 gap-2">
                    <ShieldAlert size={20} className="animate-pulse" />
                    <span>Verificando permissões...</span>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">

                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-accent-red/10 rounded-xl text-accent-red">
                            <Users size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-dark-gray">Usuários</h1>
                            <p className="text-gray-500 mt-1">Gerencie acessos e permissões do sistema.</p>
                        </div>
                    </div>

                    <button
                        onClick={handleNewUserClick}
                        className="bg-accent-red text-white py-2.5 px-5 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-accent-red/20 flex items-center gap-2"
                    >
                        <UserPlus size={18} />
                        Adicionar Usuário
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white/40 p-4 rounded-2xl border border-gray-200/50 shadow-sm mb-6 flex items-center gap-3">
                    <Search className="text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou e-mail..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full text-sm outline-none text-dark-gray placeholder:text-gray-500"
                    />
                </div>

                {/* Table */}
                <div className="bg-white/40 rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/30 border-b border-gray-200/40">
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuário</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Cargo</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Data de Cadastro</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-gray-500">
                                            Carregando usuários...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-gray-500">
                                            Nenhum usuário encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-200/30 hover:bg-black/5 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-gray-500 shrink-0">
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="font-bold text-sm uppercase">{user.nome?.charAt(0) || user.email?.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-dark-gray text-sm leading-none">{user.nome}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                             <td className="py-4 px-6">
                                                 <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${user.cargo === 'admin' ? 'bg-accent-red/10 text-accent-red' :
                                                     user.cargo === 'leitor' ? 'bg-blue-100 text-blue-600' :
                                                         'bg-gray-100 text-gray-600'
                                                     }`}>
                                                     {user.cargo || 'corretor'}
                                                 </span>
                                             </td>
                                            <td className="py-4 px-6 text-sm text-gray-500 font-medium">
                                                {user.created_at ? format(new Date(user.created_at), "dd 'de' MMM, yyyy", { locale: ptBR }) : '-'}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditClick(user)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remover Acesso"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchUsers}
                userToEdit={userToEdit}
            />

        </DashboardLayout>
    );
}
