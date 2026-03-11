import { Highlight } from '@/types/dashboard';

export function sanitizeTextWithHighlights(text: string, hls: Highlight[]) {
    if (!text) return { text: '', highlights: hls };

    let sanitizedText = text;
    let newHighlights = hls.map(h => ({ ...h }));

    const patterns = [
        { regex: /\\n/g, replacement: '\n' },
        { regex: /\\t/g, replacement: '\t' },
        { regex: /\\r/g, replacement: '\r' }
    ];

    let allMatches: { index: number, length: number, replacement: string }[] = [];

    patterns.forEach(p => {
        let match;
        const re = new RegExp(p.regex);
        while ((match = re.exec(text)) !== null) {
            allMatches.push({
                index: match.index,
                length: match[0].length,
                replacement: p.replacement
            });
        }
    });

    allMatches.sort((a, b) => b.index - a.index);

    allMatches.forEach(m => {
        const diff = m.length - m.replacement.length;
        sanitizedText = sanitizedText.substring(0, m.index) + m.replacement + sanitizedText.substring(m.index + m.length);

        newHighlights.forEach(h => {
            if (m.index < h.start_index) {
                h.start_index -= diff;
                h.end_index -= diff;
            } else if (m.index >= h.start_index && m.index < h.end_index) {
                h.end_index -= diff;
            }
        });
    });

    newHighlights.forEach(h => {
        let cleanMarked = h.texto_marcado;
        patterns.forEach(p => {
            cleanMarked = cleanMarked.replace(p.regex, p.replacement);
        });
        h.texto_marcado = cleanMarked;
    });

    return { text: sanitizedText, highlights: newHighlights };
}
