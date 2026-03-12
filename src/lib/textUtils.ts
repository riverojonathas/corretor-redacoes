import { Highlight } from '@/types/dashboard';

export function sanitizeTextWithHighlights(text: string, hls: Highlight[]) {
    if (!text) return { text: '', highlights: hls };

    let sanitizedText = '';
    let newHighlights = hls.map(h => ({ ...h }));
    
    // Pattern to match escaped sequences or real newlines we want to normalize
    const combinedRegex = /\\r\\n|\\n|\\r|\\t/g;
    const replacementMap: Record<string, string> = {
        '\\r\\n': '\n',
        '\\n': '\n',
        '\\r': '\n',
        '\\t': '    '
    };

    let lastIndex = 0;
    let match;
    let currentShift = 0;

    while ((match = combinedRegex.exec(text)) !== null) {
        const matchStr = match[0];
        const replacement = replacementMap[matchStr] || matchStr;
        const index = match.index;
        const length = matchStr.length;
        const diff = length - replacement.length;

        // Append text before match and the replacement
        sanitizedText += text.substring(lastIndex, index) + replacement;
        
        // Update highlights affected by this shift
        newHighlights.forEach(h => {
            // If match is before the highlight, shift the whole highlight
            if (index < h.start_index) {
                h.start_index -= diff;
                h.end_index -= diff;
            } 
            // If match is inside the highlight, shrink the highlight end
            else if (index >= h.start_index && index < h.end_index) {
                h.end_index -= Math.min(diff, h.end_index - index);
            }
        });

        lastIndex = index + length;
        currentShift += diff;
    }

    // Append remaining text
    sanitizedText += text.substring(lastIndex);

    // Also sanitize the texto_marcado values in highlights
    newHighlights.forEach(h => {
        if (h.texto_marcado) {
            h.texto_marcado = h.texto_marcado.replace(combinedRegex, (m) => replacementMap[m] || m);
        }
    });

    return { text: sanitizedText, highlights: newHighlights };
}
