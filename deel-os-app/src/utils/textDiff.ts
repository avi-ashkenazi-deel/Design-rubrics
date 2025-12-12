// Split text into sentences
const splitSentences = (text: string): string[] => {
  if (!text) return [];
  return text.split(/(?<=[.!?])\s+/).filter(s => s.trim());
};

// Normalize sentence for comparison
const normalize = (sentence: string): string => {
  return sentence.toLowerCase().trim().replace(/\s+/g, ' ');
};

// Get text diff for rubrics comparison
export function getTextDiff(texts: string[]): string[] {
  if (texts.length <= 1) return texts.map(t => t || '—');

  const sentencesPerText = texts.map(splitSentences);
  const allNormalizedSentences = sentencesPerText.map(sentences => 
    sentences.map(normalize)
  );

  const isCommonSentence = (normalizedSentence: string): boolean => {
    return allNormalizedSentences.every(textSentences => 
      textSentences.some(s => s === normalizedSentence)
    );
  };

  const highlightedTexts = sentencesPerText.map((sentences, textIndex) => {
    if (sentences.length === 0) return texts[textIndex] || '—';

    return sentences.map(sentence => {
      const isUnique = !isCommonSentence(normalize(sentence));
      if (isUnique) {
        return `<span class="diff-highlight">${sentence}</span>`;
      }
      return sentence;
    }).join(' ');
  });

  return highlightedTexts.map(t => t || '—');
}

// Get text diff for ladders comparison
export function getLaddersTextDiff(texts: string[]): string[] {
  if (texts.length <= 1) {
    return texts.map(t => t === '-' ? '<span class="empty-value">—</span>' : t);
  }

  const nonEmptyTexts = texts.filter(t => t && t !== '-');
  if (nonEmptyTexts.length === 0) {
    return texts.map(() => '<span class="empty-value">—</span>');
  }

  const sentencesPerText = texts.map(t => splitSentences(t === '-' ? '' : t));
  const allNormalizedSentences = sentencesPerText.map(sentences => 
    sentences.map(normalize)
  );

  const nonEmptyIndices = texts
    .map((t, i) => (t && t !== '-' ? i : -1))
    .filter(i => i >= 0);

  const isCommonSentence = (normalizedSentence: string): boolean => {
    return nonEmptyIndices.every(idx => 
      allNormalizedSentences[idx].some(s => s === normalizedSentence)
    );
  };

  return texts.map((text, idx) => {
    if (!text || text === '-') {
      return '<span class="empty-value">—</span>';
    }

    const sentences = sentencesPerText[idx];
    if (sentences.length === 0) return text;

    return sentences.map(sentence => {
      const isUnique = !isCommonSentence(normalize(sentence));
      if (isUnique) {
        return `<span class="diff-highlight">${sentence}</span>`;
      }
      return sentence;
    }).join(' ');
  });
}

// Format cell text with bullet points
export function formatCellText(text: string): string {
  if (!text || text === '—') return text;
  // Replace bullet points with line break + bullet, then remove the first <br> even if inside a span
  return text
    .replace(/\s*•\s*/g, '<br>• ')
    .replace(/^(<[^>]*>)?<br>/, '$1')  // Remove first <br>, preserving any leading tag
    .replace(/<br>\s*<br>/g, '<br>'); // Clean up double breaks
}

