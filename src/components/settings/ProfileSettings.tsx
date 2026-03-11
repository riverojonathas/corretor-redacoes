import React, { useState, useRef, useEffect } from 'react';
import { Camera, User as UserIcon, Loader2, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export function ProfileSettings() {
    const { user, nome, avatarUrl, cargo, refreshProfile } = useAuth();

    const [editNome, setEditNome] = useState(nome || '');
    const [loadingInfo, setLoadingInfo] = useState(false);

    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Atualiza o estado local caso demore para carregar do contexto na montagem inicial
    useEffect(() => {
        if (nome) setEditNome(nome);
    }, [nome]);

    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!editNome.trim()) {
            toast.error('O nome não pode ficar em branco.');
            return;
        }

        setLoadingInfo(true);
        try {
            const { error } = await supabase
                .from('perfis')
                .update({ nome: editNome.trim() })
                .eq('id', user.id);

            if (error) throw error;

            await refreshProfile();
            toast.success('Perfil atualizado com sucesso!');
        } catch (error: any) {
            console.error('Erro ao atualizar perfil:', error);
            toast.error('Não foi possível salvar as alterações do perfil.', { description: error.message });
        } finally {
            setLoadingInfo(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadingAvatar(true);
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            if (!user) return;

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`; // Organiza em pastas pelo ID do usuário

            // Faz o upload pro Bucket "avatars"
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                // Se der erro de bucket inexistente ou RLS, avisar
                throw uploadError;
            }

            // Pega a URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Atualiza o perfil com a nova URL
            const { error: updateError } = await supabase
                .from('perfis')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            await refreshProfile();
            toast.success('Foto de perfil atualizada!');

        } catch (error: any) {
            console.error('Erro no upload do avatar:', error);
            toast.error('Erro ao fazer upload da imagem.', {
                description: 'Verifique se o banco de dados (Storage) está configurado corretamente.'
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-dark-gray mb-1">Meu Perfil</h3>
                <p className="text-sm text-gray-500">Gerencie sua identidade pública no Corretor.</p>
            </div>

            <div className="bg-white/40 p-6 sm:p-8 rounded-2xl border border-gray-200/50 shadow-sm flex flex-col md:flex-row gap-10">

                {/* Lado Esquerdo: Avatar */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 bg-gray-100 shadow-inner flex items-center justify-center relative">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={48} className="text-gray-300" />
                            )}

                            {/* Overlay de Loading ou Hover */}
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 cursor-pointer ${uploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} onClick={!uploadingAvatar ? triggerFileInput : undefined}>
                                {uploadingAvatar ? (
                                    <Loader2 className="text-white animate-spin" size={24} />
                                ) : (
                                    <Camera className="text-white drop-shadow-md" size={28} />
                                )}
                            </div>
                        </div>

                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            disabled={uploadingAvatar}
                        />

                        <div className="text-center mt-2">
                            <button
                                type="button"
                                onClick={triggerFileInput}
                                disabled={uploadingAvatar}
                                className="text-xs font-bold text-accent-red hover:text-red-700 transition-colors uppercase tracking-widest disabled:opacity-50"
                            >
                                Alterar Foto
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Formulário */}
                <div className="flex-1">
                    <form onSubmit={handleSaveInfo} className="space-y-5 max-w-md">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Nome de Exibição
                            </label>
                            <input
                                type="text"
                                value={editNome}
                                onChange={(e) => setEditNome(e.target.value)}
                                required
                                className="w-full bg-white/40 border border-gray-200/50 rounded-xl px-4 py-3 text-sm text-dark-gray focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all placeholder:text-gray-500 font-medium"
                                placeholder="Seu nome..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                E-mail da Conta <span className="text-[10px] text-gray-500 font-normal lowercase tracking-normal ml-1">(não modificável)</span>
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full bg-gray-100/50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-500 outline-none cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Cargo / Nível
                            </label>
                            <div className="inline-flex bg-accent-red/5 text-accent-red border border-accent-red/10 px-4 py-2 rounded-lg text-sm font-bold capitalize">
                                {cargo || 'Usuário'}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50">
                            <button
                                type="submit"
                                disabled={loadingInfo || editNome === nome}
                                className="bg-dark-gray text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-dark-gray/20 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
                            >
                                {loadingInfo ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Salvar Perfil
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
