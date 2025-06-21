// Character mapping for text normalization
const characterMap: Record<string, string> = {
  // Spanish characters
  'ñ': 'n',
  'Ñ': 'N',
  'ü': 'u',
  'Ü': 'U',
  '¿': '?',
  '¡': '!',
  'á': 'a',
  'Á': 'A',
  'é': 'e',
  'É': 'E',
  'í': 'i',
  'Í': 'I',
  'ó': 'o',
  'Ó': 'O',
  'ú': 'u',
  'Ú': 'U',
  
  // French characters
  'ç': 'c',
  'Ç': 'C',
  'è': 'e',
  'È': 'E',
  'ê': 'e',
  'Ê': 'E',
  'à': 'a',
  'À': 'A',
  'â': 'a',
  'Â': 'A',
  'ä': 'a',
  'Ä': 'A',
  'ô': 'o',
  'Ô': 'O',
  'ö': 'o',
  'Ö': 'O',
  'ù': 'u',
  'Ù': 'U',
  'û': 'u',
  'Û': 'U',
  
  // German characters
  'ß': 'ss',
  
  // Portuguese characters
  'ã': 'a',
  'Ã': 'A',
  'õ': 'o',
  'Õ': 'O',
  
  // Currency symbols
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  '₹': 'INR',
  '¢': 'cents',
  '₽': 'RUB',
  
  // Punctuation and symbols
  '–': '-', // en dash
  '—': '-', // em dash
  ''': '`', // left single quotation mark
  ''': "'", // right single quotation mark
  '"': '"', // left double quotation mark
  '"': '"', // right double quotation mark
  '«': '"', // left-pointing double angle quotation mark
  '»': '"', // right-pointing double angle quotation mark
  
  // Legal symbols
  '§': 'Section',
  '¶': '', // paragraph symbol (remove)
  '©': '(c)',
  '®': '(R)',
  '™': '(TM)',
  
  // Problematic characters that cause encoding issues
  'Ø': 'O',
  'ø': 'o',
  'æ': 'ae',
  'Æ': 'AE',
  'œ': 'oe',
  'Œ': 'OE',
  'Ð': 'D',
  'ð': 'd',
  'þ': 'th',
  'Þ': 'TH',
  
  // Mathematical and special symbols
  '×': 'x',
  '÷': '/',
  '±': '+/-',
  '≤': '<=',
  '≥': '>=',
  '≠': '!=',
  '≈': '~=',
  
  // Degree and other symbols
  '°': ' degrees',
  '′': "'",
  '″': '"',
  '‰': ' per mille',
  '‱': ' per ten thousand'
};

/**
 * Normalizes text by replacing special characters with ASCII equivalents
 * This prevents encoding issues in PDF exports and other text processing
 */
export function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Create regex pattern from all character map keys
  const pattern = new RegExp(`[${Object.keys(characterMap).join('')}]`, 'g');
  
  // Replace characters using the mapping
  let normalized = text.replace(pattern, (char) => characterMap[char] || char);
  
  // Additional cleanup
  normalized = normalized
    // Remove or replace any remaining problematic characters
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Log unknown characters for debugging
      if (char.charCodeAt(0) > 127) {
        console.warn(`Unknown character found: ${char} (code: ${char.charCodeAt(0)})`);
      }
      return ''; // Remove unknown characters
    })
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace
    .trim();
  
  return normalized;
}

/**
 * Validates text for PDF compatibility and logs potential issues
 */
export function validateTextForPDF(text: string, context: string = 'unknown'): string {
  const normalized = normalizeText(text);
  
  // Check for potential encoding corruption patterns
  const corruptionPatterns = [
    /Ø=Ü[ÄÜ]/g, // Common corruption pattern
    /[^\x00-\x7F]{3,}/g, // Multiple non-ASCII characters in sequence
    /\uFFFD/g // Unicode replacement character
  ];
  
  corruptionPatterns.forEach((pattern, index) => {
    if (pattern.test(text)) {
      console.warn(`Potential text corruption detected in ${context} (pattern ${index + 1}):`, text.match(pattern));
    }
  });
  
  return normalized;
}

/**
 * Cleans text specifically for legal document processing
 */
export function normalizeLegalText(text: string): string {
  let cleaned = normalizeText(text);
  
  // Legal document specific cleaning
  cleaned = cleaned
    // Normalize legal section markers
    .replace(/§+/g, 'Section')
    .replace(/¶+/g, '')
    // Clean up legal citations
    .replace(/\b(\d+)\s*§\s*(\d+)/g, '$1 Section $2')
    // Normalize contract language
    .replace(/\bwhereas\b/gi, 'WHEREAS')
    .replace(/\bwherefore\b/gi, 'THEREFORE')
    // Clean up signature lines
    .replace(/_+/g, '________________');
  
  return cleaned;
}

/**
 * Prepares text for multilingual PDF export
 */
export function prepareTextForExport(text: string, language: string = 'en'): string {
  // First normalize the text
  let prepared = normalizeText(text);
  
  // Language-specific preparations
  switch (language) {
    case 'es':
      // Spanish specific normalizations
      prepared = prepared
        .replace(/\bSr\./g, 'Señor')
        .replace(/\bSra\./g, 'Señora')
        .replace(/\bDr\./g, 'Doctor');
      break;
      
    case 'fr':
      // French specific normalizations
      prepared = prepared
        .replace(/\bM\./g, 'Monsieur')
        .replace(/\bMme\./g, 'Madame')
        .replace(/\bDr\./g, 'Docteur');
      break;
      
    case 'de':
      // German specific normalizations
      prepared = prepared
        .replace(/\bHr\./g, 'Herr')
        .replace(/\bFr\./g, 'Frau')
        .replace(/\bDr\./g, 'Doktor');
      break;
  }
  
  return prepared;
}