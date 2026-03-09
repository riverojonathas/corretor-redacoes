import React, { useState } from 'react';
import { X, Save, EyeOff, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userToEdit?: any | null; // null = Create Mode
}

export function UserModal({ isOpen, onClose, onSuccess, userToEdit }: UserModalProps) {
    const isEditMode = !!userToEdit;

    const [nome, setNome] = useState(userToEdit?.nome || '');
    const [email, setEmail] = useState(userToEdit?.email || '');
    const [cargo, setCargo] = useState(userToEdit?.cargo || 'corretor');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Reseta form quando fecha/abre
    React.useEffect(() => {
        if (isOpen) {
            setNome(userToEdit?.nome || '');
            setEmail(userToEdit?.email || '');
            setCargo(userToEdit?.cargo || 'corretor');
            setPassword('');
        }
    }, [isOpen, userToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditMode) {
                // UPDATE
                const res = await fetch('/api/admin/users', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userToEdit.id,
                        cargo,
                        password: password ? password : undefined
                    })
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Erro ao atualizar.');
                }

                toast.success('Usuário atualizado com sucesso!');
            } else {
                // CREATE
                const res = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nome,
                        email,
                        cargo,
                        password
                    })
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Erro ao criar usuário.');
                }

                toast.success('Usuário criado com sucesso!');
            }

            onSuccess();
            onClose();

        } catch (error: any) {
            toast.error('Ocorreu um erro.', { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-lg font-bold text-dark-gray">
                        {isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-dark-gray hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nome</label>
                        <input
                            type="text"
                            required
                            disabled={isEditMode} // No momento só o dono muda o próprio nome
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-dark-gray focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all disabled:opacity-60"
                            placeholder="Nome Completo"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">E-mail</label>
                        <input
                            type="email"
                            required
                            disabled={isEditMode} // Email não muda
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-dark-gray focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all disabled:opacity-60"
                            placeholder="email@escola.com.br"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cargo</label>
                        <select
                            value={cargo}
                            onChange={e => setCargo(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-dark-gray focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all cursor-pointer appearance-none"
                        >
                            <option value="corretor">Corretor</option>
                            <option value="admin">Administrador (Admin)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {isEditMode ? 'Nova Senha (opcional)' : 'Senha Inicial'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required={!isEditMode}
                                minLength={6}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-dark-gray focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all"
                                placeholder={isEditMode ? "Deixe em branco para não alterar" : "Mínimo 6 caracteres"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark-gray p-1"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-dark-gray text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-dark-gray/20 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {isEditMode ? 'Salvar Edição' : 'Criar Usuário'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
