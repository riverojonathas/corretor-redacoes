import { useState, useEffect, useCallback, useRef } from 'react';

const RENEW_INTERVAL_MS = 10 * 60 * 1000; // Renova o lock a cada 10 minutos

export type LockResult =
    | { status: 'acquired' }
    | { status: 'blocked'; message: string }
    | { status: 'error'; message: string };

export function useLock(userId: string | undefined) {
    const [lockedRedacaoId, setLockedRedacaoId] = useState<string | null>(null);
    const renewTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    // Renovar o lock automaticamente enquanto estiver na mesa
    const renewLock = useCallback(async (redacaoId: string) => {
        if (!userId) return;
        try {
            await fetch('/api/lock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ redacaoId, userId }),
            });
        } catch {
            // Falha silenciosa — o lock expira em 30 min
        }
    }, [userId]);

    useEffect(() => {
        if (lockedRedacaoId) {
            if (renewTimer.current) clearInterval(renewTimer.current);
            renewTimer.current = setInterval(() => renewLock(lockedRedacaoId), RENEW_INTERVAL_MS);
        } else {
            if (renewTimer.current) clearInterval(renewTimer.current);
        }
        return () => { if (renewTimer.current) clearInterval(renewTimer.current); };
    }, [lockedRedacaoId, renewLock]);

    // Liberar lock ao desmontar (ex: navegação via beforeunload)
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (lockedRedacaoId && userId) {
                const body = JSON.stringify({ redacaoId: lockedRedacaoId, userId });
                navigator.sendBeacon('/api/lock-release', body);
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [lockedRedacaoId, userId]);

    const acquireLock = useCallback(async (redacaoId: string): Promise<LockResult> => {
        if (!userId) return { status: 'error', message: 'Usuário não autenticado.' };
        try {
            const res = await fetch('/api/lock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ redacaoId, userId }),
            });
            const data = await res.json();
            if (res.status === 409) {
                return { status: 'blocked', message: data.message || 'Redação em uso.' };
            }
            if (!res.ok) {
                return { status: 'error', message: data.error || 'Erro ao adquirir lock.' };
            }
            setLockedRedacaoId(redacaoId);
            return { status: 'acquired' };
        } catch (err: any) {
            return { status: 'error', message: err.message || 'Erro de rede.' };
        }
    }, [userId]);

    const releaseLock = useCallback(async (redacaoId?: string) => {
        const id = redacaoId ?? lockedRedacaoId;
        if (!id || !userId) return;
        try {
            await fetch('/api/lock', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ redacaoId: id, userId }),
            });
        } catch {
            // Falha silenciosa
        } finally {
            setLockedRedacaoId(null);
        }
    }, [lockedRedacaoId, userId]);

    return { acquireLock, releaseLock, lockedRedacaoId };
}
