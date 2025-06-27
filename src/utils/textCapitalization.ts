/**
 * Utilidades para capitalización inteligente de texto en español e inglés
 * Aplica reglas específicas para documentos legales y títulos
 */

// Palabras que deben mantenerse en minúsculas en títulos (excepto al inicio)
const LOWERCASE_WORDS_ES = [
  'a', 'al', 'ante', 'bajo', 'con', 'contra', 'de', 'del', 'desde', 'durante', 'en', 'entre', 'hacia', 'hasta',
  'para', 'por', 'según', 'sin', 'sobre', 'tras', 'y', 'e', 'o', 'u', 'pero', 'mas', 'sino', 'que', 'si',
  'como', 'cuando', 'donde', 'mientras', 'aunque', 'porque', 'pues', 'ya', 'ni', 'la', 'las', 'el', 'los',
  'un', 'una', 'unos', 'unas', 'lo', 'le', 'les', 'se', 'te', 'me', 'nos', 'os'
];

const LOWERCASE_WORDS_EN = [
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to',
  'up', 'yet', 'with', 'from', 'into', 'onto', 'upon', 'over', 'under', 'above', 'below', 'across', 'through',
  'during', 'before', 'after', 'since', 'until', 'while', 'where', 'when', 'why', 'how', 'what', 'which',
  'that', 'this', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had'
];

// Palabras que siempre deben capitalizarse
const ALWAYS_CAPITALIZE_ES = [
  'justguide', 'colombia', 'bogotá', 'medellín', 'cali', 'barranquilla', 'cartagena', 'bucaramanga',
  'pereira', 'manizales', 'españa', 'madrid', 'barcelona', 'valencia', 'sevilla', 'méxico', 'guadalajara',
  'monterrey', 'puebla', 'tijuana', 'argentina', 'buenos', 'aires', 'córdoba', 'rosario', 'chile',
  'santiago', 'valparaíso', 'concepción', 'ai', 'ia', 'ocr', 'pdf', 'docx', 'api', 'url', 'html', 'css',
  'javascript', 'typescript', 'react', 'node', 'supabase', 'github', 'google', 'microsoft', 'adobe'
];

const ALWAYS_CAPITALIZE_EN = [
  'justguide', 'colombia', 'bogotá', 'medellín', 'cali', 'usa', 'united', 'states', 'america', 'new', 'york',
  'california', 'texas', 'florida', 'washington', 'london', 'manchester', 'birmingham', 'uk', 'united', 'kingdom',
  'england', 'scotland', 'wales', 'ireland', 'canada', 'toronto', 'vancouver', 'montreal', 'australia',
  'sydney', 'melbourne', 'brisbane', 'ai', 'ocr', 'pdf', 'docx', 'api', 'url', 'html', 'css',
  'javascript', 'typescript', 'react', 'node', 'supabase', 'github', 'google', 'microsoft', 'adobe'
];

/**
 * Capitaliza la primera letra de una palabra
 */
function capitalizeFirstLetter(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Capitaliza títulos siguiendo reglas tipográficas correctas
 * Ejemplo: "documentos legales simplificados" -> "Documentos legales simplificados"
 */
export function capitalizeTitle(title: string, language: 'es' | 'en' = 'es'): string {
  if (!title || typeof title !== 'string') return '';
  
  const lowercaseWords = language === 'es' ? LOWERCASE_WORDS_ES : LOWERCASE_WORDS_EN;
  const alwaysCapitalize = language === 'es' ? ALWAYS_CAPITALIZE_ES : ALWAYS_CAPITALIZE_EN;
  
  return title
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      // Limpiar palabra de puntuación para análisis
      const cleanWord = word.replace(/[^\w]/g, '');
      
      // Siempre capitalizar primera palabra
      if (index === 0) {
        return capitalizeFirstLetter(word);
      }
      
      // Palabras que siempre se capitalizan
      if (alwaysCapitalize.includes(cleanWord.toLowerCase())) {
        return word.replace(cleanWord, capitalizeFirstLetter(cleanWord));
      }
      
      // Palabras que se mantienen en minúsculas (excepto al inicio)
      if (lowercaseWords.includes(cleanWord.toLowerCase())) {
        return word;
      }
      
      // Capitalizar otras palabras
      return capitalizeFirstLetter(word);
    })
    .join(' ');
}

/**
 * Capitaliza oraciones correctamente - SOLO primera letra de la oración
 * Capitaliza después de puntos, signos de exclamación e interrogación
 */
export function capitalizeSentences(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    // Capitalizar después de puntos, signos de exclamación e interrogación
    .replace(/([.!?¡¿]\s*)([a-záéíóúñü])/gi, (match, punctuation, letter) => 
      punctuation + letter.toUpperCase()
    )
    // Capitalizar primera letra del texto
    .replace(/^([a-záéíóúñü])/, (match, letter) => letter.toUpperCase())
    // Capitalizar después de dos puntos en contextos apropiados
    .replace(/(:)\s*([a-záéíóúñü])/gi, (match, colon, letter) => 
      colon + ' ' + letter.toUpperCase()
    );
}

/**
 * Capitaliza nombres propios y términos específicos
 */
export function capitalizeProperNouns(text: string, language: 'es' | 'en' = 'es'): string {
  if (!text || typeof text !== 'string') return '';
  
  const alwaysCapitalize = language === 'es' ? ALWAYS_CAPITALIZE_ES : ALWAYS_CAPITALIZE_EN;
  
  let result = text;
  
  // Capitalizar palabras específicas
  alwaysCapitalize.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, (match) => capitalizeFirstLetter(match));
  });
  
  // Capitalizar nombres de países y ciudades específicos
  const properNouns = language === 'es' ? [
    'colombia', 'bogotá', 'medellín', 'cali', 'barranquilla', 'cartagena', 'bucaramanga',
    'pereira', 'manizales', 'españa', 'madrid', 'barcelona', 'valencia', 'sevilla',
    'méxico', 'guadalajara', 'monterrey', 'puebla', 'tijuana', 'argentina', 'chile',
    'justguide', 'código civil', 'ley', 'artículo'
  ] : [
    'colombia', 'bogotá', 'medellín', 'cali', 'usa', 'united states', 'new york',
    'california', 'texas', 'florida', 'washington', 'london', 'manchester',
    'birmingham', 'uk', 'united kingdom', 'england', 'scotland', 'wales',
    'justguide', 'civil code', 'law', 'article'
  ];
  
  properNouns.forEach(noun => {
    const regex = new RegExp(`\\b${noun}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      return match.split(' ').map(word => capitalizeFirstLetter(word)).join(' ');
    });
  });
  
  return result;
}

/**
 * Función principal para capitalizar texto de manera inteligente
 * SIEMPRE usa capitalización de oraciones (sentence-style) por defecto
 */
export function smartCapitalize(text: string, type: 'title' | 'sentence' | 'proper' = 'sentence', language: 'es' | 'en' = 'es'): string {
  if (!text || typeof text !== 'string') return '';
  
  switch (type) {
    case 'title':
      // Para títulos, usar capitalización de oraciones pero con nombres propios
      return capitalizeSentences(capitalizeProperNouns(text, language));
    case 'proper':
      return capitalizeProperNouns(text, language);
    case 'sentence':
    default:
      // Capitalización de oraciones: solo primera letra y después de puntuación
      return capitalizeSentences(capitalizeProperNouns(text, language));
  }
}

/**
 * Capitaliza texto específicamente para la interfaz de usuario
 * Aplica reglas específicas para títulos, botones, etc.
 */
export function capitalizeUI(text: string, language: 'es' | 'en' = 'es'): string {
  if (!text || typeof text !== 'string') return '';
  
  // Para títulos principales como "JustGuide - documentos legales simplificados"
  if (text.includes('JustGuide')) {
    return text
      .split(' - ')
      .map((part, index) => {
        if (index === 0) {
          return part; // Mantener "JustGuide" como está
        } else {
          // Usar capitalización de oraciones para el resto
          return smartCapitalize(part, 'sentence', language);
        }
      })
      .join(' - ');
  }
  
  // Para otros textos de UI, usar capitalización de oraciones
  return smartCapitalize(text, 'sentence', language);
}

/**
 * Capitaliza contenido de documentos legales
 * Aplica reglas específicas para documentos jurídicos
 */
export function capitalizeLegalDocument(text: string, language: 'es' | 'en' = 'es'): string {
  if (!text || typeof text !== 'string') return '';
  
  let result = text;
  
  // Capitalizar secciones numeradas
  if (language === 'es') {
    result = result
      .replace(/^(primera?|primero|1\.?\s*[-:]?\s*)/gmi, 'PRIMERA: ')
      .replace(/^(segunda?|segundo|2\.?\s*[-:]?\s*)/gmi, 'SEGUNDA: ')
      .replace(/^(tercera?|tercero|3\.?\s*[-:]?\s*)/gmi, 'TERCERA: ')
      .replace(/^(cuarta?|cuarto|4\.?\s*[-:]?\s*)/gmi, 'CUARTA: ')
      .replace(/^(quinta?|quinto|5\.?\s*[-:]?\s*)/gmi, 'QUINTA: ')
      .replace(/^(sexta?|sexto|6\.?\s*[-:]?\s*)/gmi, 'SEXTA: ')
      .replace(/^(séptima?|septimo|7\.?\s*[-:]?\s*)/gmi, 'SÉPTIMA: ')
      .replace(/^(octava?|octavo|8\.?\s*[-:]?\s*)/gmi, 'OCTAVA: ')
      .replace(/^(novena?|noveno|9\.?\s*[-:]?\s*)/gmi, 'NOVENA: ')
      .replace(/^(décima?|decimo|10\.?\s*[-:]?\s*)/gmi, 'DÉCIMA: ');
  } else {
    result = result
      .replace(/^(first|1\.?\s*[-:]?\s*)/gmi, 'FIRST: ')
      .replace(/^(second|2\.?\s*[-:]?\s*)/gmi, 'SECOND: ')
      .replace(/^(third|3\.?\s*[-:]?\s*)/gmi, 'THIRD: ')
      .replace(/^(fourth|4\.?\s*[-:]?\s*)/gmi, 'FOURTH: ')
      .replace(/^(fifth|5\.?\s*[-:]?\s*)/gmi, 'FIFTH: ')
      .replace(/^(sixth|6\.?\s*[-:]?\s*)/gmi, 'SIXTH: ')
      .replace(/^(seventh|7\.?\s*[-:]?\s*)/gmi, 'SEVENTH: ')
      .replace(/^(eighth|8\.?\s*[-:]?\s*)/gmi, 'EIGHTH: ')
      .replace(/^(ninth|9\.?\s*[-:]?\s*)/gmi, 'NINTH: ')
      .replace(/^(tenth|10\.?\s*[-:]?\s*)/gmi, 'TENTH: ');
  }
  
  // Aplicar capitalización de oraciones y nombres propios
  result = capitalizeSentences(capitalizeProperNouns(result, language));
  
  return result;
}