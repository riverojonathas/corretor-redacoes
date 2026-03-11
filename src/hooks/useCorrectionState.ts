import { useState, useCallback } from 'react';
import { Highlight } from '@/types/dashboard';

export interface CorrectionFormData extends Record<string, any> {
    comentario_geral: string;
    favorita: boolean;
    suspeita_ia: boolean;
    motivo_suspeita_ia: string;
}

const INITIAL_FORM: CorrectionFormData = {
    comentario_geral: '',
    favorita: false,
    suspeita_ia: false,
    motivo_suspeita_ia: '',
};

export function useCorrectionState() {
    const [formData, setFormData] = useState<CorrectionFormData>(INITIAL_FORM);
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [pristineFormData, setPristineFormData] = useState<CorrectionFormData>(INITIAL_FORM);
    const [pristineHighlights, setPristineHighlights] = useState<Highlight[]>([]);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const isDirty = useCallback(() => {
        if (JSON.stringify(formData) !== JSON.stringify(pristineFormData)) return true;
        return JSON.stringify(highlights) !== JSON.stringify(pristineHighlights);
    }, [formData, pristineFormData, highlights, pristineHighlights]);

    const resetForm = useCallback((initial: Partial<CorrectionFormData> = {}) => {
        const next: CorrectionFormData = { ...INITIAL_FORM, ...initial };
        setFormData(next);
        setPristineFormData(next);
        setHighlights([]);
        setPristineHighlights([]);
    }, []);

    const syncPristine = useCallback((data: CorrectionFormData, hls: Highlight[]) => {
        setPristineFormData({ ...data });
        setPristineHighlights([...hls]);
    }, []);

    return {
        formData,
        setFormData,
        highlights,
        setHighlights,
        pristineFormData,
        setPristineFormData,
        pristineHighlights,
        setPristineHighlights,
        showExitConfirm,
        setShowExitConfirm,
        isDirty,
        resetForm,
        syncPristine,
    };
}
