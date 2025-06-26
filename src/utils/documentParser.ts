import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

export interface DocumentParseResult {
  extracted_text: string;
  detected_language: 'es' | 'en';
  confidence: number;
  word_count: number;
}

// Función para capitalizar texto correctamente
function capitalizeText(text: string): string {
  return text
    // Capitalizar después de puntos, signos de exclamación e interrogación
    .replace(/([.!?]\s*)([a-záéíóúñü])/gi, (match, punctuation, letter) => 
      punctuation + letter.toUpperCase()
    )
    // Capitalizar primera letra del texto
    .replace(/^([a-záéíóúñü])/, (match, letter) => letter.toUpperCase())
    // Capitalizar después de dos puntos en contextos legales
    .replace(/(:)\s*([a-záéíóúñü])/gi, (match, colon, letter) => 
      colon + ' ' + letter.toUpperCase()
    )
    // Capitalizar nombres propios comunes en documentos legales
    .replace(/\b(colombia|bogotá|medellín|cali|barranquilla|cartagena|bucaramanga|pereira|manizales)\b/gi, 
      (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
    )
    // Capitalizar términos legales importantes
    .replace(/\b(código civil|ley \d+|artículo \d+|contrato|arrendamiento|arrendador|arrendatario)\b/gi, 
      (match) => match.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    );
}

// Detección de idioma mejorada solo para español e inglés
function detectLanguage(text: string): 'es' | 'en' {
  const cleanText = text.toLowerCase().trim();
  
  // Palabras clave en español (especialmente términos legales colombianos)
  const spanishKeywords = [
    // Palabras comunes en español
    'el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'una', 'del', 'los', 'las',
    // Términos legales en español
    'contrato', 'arrendamiento', 'arrendador', 'arrendatario', 'canon', 'inmueble', 'vivienda', 'urbana', 'plazo', 'duración', 'meses', 'obligaciones',
    'código', 'civil', 'ley', 'artículo', 'demanda', 'tribunal', 'juez', 'sentencia', 'derecho', 'legal', 'jurídico',
    // Términos específicos colombianos
    'colombia', 'colombiano', 'bogotá', 'medellín', 'cali', 'pesos', 'cédula', 'ciudadanía', 'dane', 'ipc',
    // Conectores y preposiciones en español
    'pero', 'sin', 'embargo', 'además', 'también', 'asimismo', 'por', 'tanto', 'mediante', 'según', 'conforme'
  ];
  
  // Palabras clave en inglés
  const englishKeywords = [
    // Palabras comunes en inglés
    'the', 'of', 'and', 'to', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they',
    // Términos legales en inglés
    'contract', 'agreement', 'lease', 'rental', 'landlord', 'tenant', 'property', 'term', 'duration', 'months', 'obligations',
    'code', 'civil', 'law', 'article', 'lawsuit', 'court', 'judge', 'verdict', 'legal', 'juridical',
    // Términos específicos de EE.UU.
    'plaintiff', 'defendant', 'discovery', 'deposition', 'motion', 'damages', 'liability', 'breach',
    // Conectores en inglés
    'but', 'however', 'moreover', 'furthermore', 'therefore', 'according', 'pursuant', 'whereas'
  ];
  
  const words = cleanText.split(/\s+/).slice(0, 150); // Analizar primeras 150 palabras
  
  let spanishScore = 0;
  let englishScore = 0;
  
  words.forEach(word => {
    if (spanishKeywords.includes(word)) spanishScore++;
    if (englishKeywords.includes(word)) englishScore++;
  });
  
  // Patrones específicos que indican español
  const spanishPatterns = [
    /\bley\s+\d+\s+de\s+\d{4}\b/i, // Ley 820 de 2003
    /\bcédula\s+de\s+ciudadanía\b/i,
    /\bmayor\s+de\s+edad\b/i,
    /\bcanon\s+de\s+arrendamiento\b/i,
    /\bpesos\s+colombianos\b/i,
    /\bbogotá\s+d\.?c\.?\b/i
  ];
  
  // Patrones específicos que indican inglés
  const englishPatterns = [
    /\bplaintiff\s+v\.?\s+defendant\b/i,
    /\bstatute\s+of\s+limitations\b/i,
    /\bbreach\s+of\s+contract\b/i,
    /\bpower\s+of\s+attorney\b/i,
    /\blast\s+will\s+and\s+testament\b/i
  ];
  
  // Verificar patrones específicos
  spanishPatterns.forEach(pattern => {
    if (pattern.test(cleanText)) spanishScore += 5;
  });
  
  englishPatterns.forEach(pattern => {
    if (pattern.test(cleanText)) englishScore += 5;
  });
  
  // Determinar idioma basado en puntuación
  return spanishScore > englishScore ? 'es' : 'en';
}

// Limpiar y formatear texto extraído
function cleanAndFormatText(rawText: string): string {
  if (!rawText || rawText.trim().length === 0) {
    return '';
  }
  
  let cleaned = rawText
    // Normalizar saltos de línea
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remover exceso de espacios en blanco
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    // Remover caracteres de control
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Limpiar caracteres especiales problemáticos
    .replace(/[^\w\s\n.,;:!?¡¿()[\]{}"'`´-áéíóúñüÁÉÍÓÚÑÜ]/g, ' ')
    .trim();
  
  // Capitalizar correctamente
  cleaned = capitalizeText(cleaned);
  
  // Formatear secciones numeradas comunes en documentos legales
  cleaned = cleaned
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
  
  return cleaned;
}

// Extraer texto de archivo DOCX usando mammoth
async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX extraction warnings:', result.messages);
    }
    
    return result.value || '';
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('No se pudo extraer texto del archivo DOCX');
  }
}

// Extraer texto de archivo PDF usando pdfjs-dist
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items from the page
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    if (!fullText || fullText.trim().length === 0) {
      throw new Error('El PDF no contiene texto extraíble o está protegido');
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    
    // Si falla la extracción real, mostrar error específico
    if (error instanceof Error && error.message.includes('extraíble')) {
      throw error;
    }
    
    throw new Error('No se pudo extraer texto del archivo PDF. Asegúrate de que el PDF contenga texto seleccionable.');
  }
}

// Función principal para parsear documentos
export async function parseDocument(
  file: File,
  onProgress?: (progress: number) => void
): Promise<DocumentParseResult> {
  try {
    if (onProgress) onProgress(0.1);
    
    // Validar tipo de archivo
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    const isPDF = fileType.includes('pdf') || fileName.endsWith('.pdf');
    const isDOCX = fileType.includes('wordprocessingml') || fileName.endsWith('.docx');
    
    if (!isPDF && !isDOCX) {
      throw new Error('Solo se admiten archivos PDF y DOCX');
    }
    
    if (onProgress) onProgress(0.3);
    
    let extractedText = '';
    
    try {
      if (isDOCX) {
        extractedText = await extractTextFromDOCX(file);
      } else if (isPDF) {
        extractedText = await extractTextFromPDF(file);
      }
    } catch (extractionError) {
      console.error('Error during text extraction:', extractionError);
      throw extractionError;
    }
    
    if (onProgress) onProgress(0.7);
    
    // Limpiar y formatear el texto
    const cleanedText = cleanAndFormatText(extractedText);
    
    if (cleanedText.length < 10) {
      throw new Error('El documento no contiene suficiente texto para procesar');
    }
    
    if (onProgress) onProgress(0.9);
    
    // Detectar idioma (solo español o inglés)
    const detectedLanguage = detectLanguage(cleanedText);
    
    // Contar palabras
    const wordCount = cleanedText.split(/\s+/).filter(word => word.length > 0).length;
    
    // Calcular confianza basada en la longitud del texto y calidad
    let confidence = 0.8;
    if (wordCount > 100) confidence = 0.9;
    if (wordCount > 500) confidence = 0.95;
    if (wordCount < 50) confidence = 0.6;
    
    if (onProgress) onProgress(1.0);
    
    return {
      extracted_text: cleanedText,
      detected_language: detectedLanguage,
      confidence: confidence,
      word_count: wordCount
    };
    
  } catch (error) {
    console.error('Error parsing document:', error);
    throw error;
  }
}