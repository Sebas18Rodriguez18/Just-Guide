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
    // Limpiar caracteres especiales problemáticos pero mantener acentos
    .replace(/[^\w\s\n.,;:!?¡¿()[\]{}"'`´-áéíóúñüÁÉÍÓÚÑÜ$%]/g, ' ')
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
async function extractTextFromDOCX(file: File, onProgress?: (progress: number) => void): Promise<string> {
  try {
    if (onProgress) onProgress(0.2);
    
    const arrayBuffer = await file.arrayBuffer();
    
    if (onProgress) onProgress(0.5);
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (onProgress) onProgress(0.8);
    
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX extraction warnings:', result.messages);
    }
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('El archivo DOCX no contiene texto extraíble o está vacío');
    }
    
    if (onProgress) onProgress(1.0);
    
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('No se pudo extraer texto del archivo DOCX. Verifica que el archivo no esté dañado.');
  }
}

// Extraer texto de archivo PDF usando pdfjs-dist con configuración robusta
async function extractTextFromPDF(file: File, onProgress?: (progress: number) => void): Promise<string> {
  try {
    if (onProgress) onProgress(0.1);
    
    console.log('Starting PDF text extraction...');
    
    // Convertir archivo a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log(`PDF file size: ${arrayBuffer.byteLength} bytes`);
    
    if (onProgress) onProgress(0.2);
    
    // Configurar PDF.js con opciones robustas
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: false,
      verbosity: 0, // Reducir logs
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/standard_fonts/',
      // Configuraciones adicionales para mejorar compatibilidad
      isEvalSupported: false,
      disableAutoFetch: false,
      disableStream: false,
      disableRange: false
    });
    
    console.log('Loading PDF document...');
    const pdf = await loadingTask.promise;
    console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);
    
    if (onProgress) onProgress(0.3);
    
    let fullText = '';
    const totalPages = pdf.numPages;
    
    // Extraer texto de cada página con manejo robusto de errores
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}/${totalPages}...`);
        
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent({
          normalizeWhitespace: true,
          disableCombineTextItems: false
        });
        
        // Procesar elementos de texto de manera más inteligente
        let pageText = '';
        let lastY = null;
        
        for (const item of textContent.items) {
          if ('str' in item && item.str && item.str.trim().length > 0) {
            const currentY = 'transform' in item ? item.transform[5] : null;
            
            // Agregar salto de línea si cambia la posición Y significativamente
            if (lastY !== null && currentY !== null && Math.abs(lastY - currentY) > 5) {
              pageText += '\n';
            }
            
            // Agregar el texto con espacios apropiados
            const text = item.str.trim();
            if (text) {
              if (pageText && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
                pageText += ' ';
              }
              pageText += text;
            }
            
            lastY = currentY;
          }
        }
        
        if (pageText.trim()) {
          fullText += pageText.trim() + '\n\n';
          console.log(`Page ${pageNum} extracted ${pageText.length} characters`);
        } else {
          console.warn(`Page ${pageNum} contains no extractable text`);
        }
        
        // Actualizar progreso
        if (onProgress) {
          const progress = 0.3 + (pageNum / totalPages) * 0.6;
          onProgress(progress);
        }
        
        // Limpiar recursos de la página
        page.cleanup();
        
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        // Continuar con las siguientes páginas en lugar de fallar completamente
        continue;
      }
    }
    
    if (onProgress) onProgress(0.95);
    
    console.log(`Total extracted text length: ${fullText.length} characters`);
    
    // Verificar que se extrajo texto
    if (!fullText || fullText.trim().length === 0) {
      throw new Error('El PDF no contiene texto extraíble. Puede ser un PDF escaneado, protegido, o contener solo imágenes.');
    }
    
    // Limpiar y normalizar el texto extraído
    fullText = fullText
      .replace(/\s+/g, ' ') // Normalizar espacios múltiples
      .replace(/\n{3,}/g, '\n\n') // Normalizar saltos de línea múltiples
      .replace(/\t/g, ' ') // Convertir tabs a espacios
      .trim();
    
    if (fullText.length < 10) {
      throw new Error('El texto extraído del PDF es demasiado corto. Verifica que el PDF contenga texto legible.');
    }
    
    if (onProgress) onProgress(1.0);
    
    console.log('PDF text extraction completed successfully');
    return fullText;
    
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    
    // Proporcionar mensajes de error específicos y útiles
    if (error instanceof Error) {
      if (error.message.includes('extraíble') || error.message.includes('escaneado')) {
        throw error;
      }
      if (error.message.includes('Invalid PDF') || error.message.includes('corrupted')) {
        throw new Error('El archivo PDF está dañado o no es válido. Intenta con otro archivo.');
      }
      if (error.message.includes('password') || error.message.includes('encrypted')) {
        throw new Error('El PDF está protegido con contraseña. Desbloquéalo antes de subirlo.');
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Error de conexión al procesar el PDF. Verifica tu conexión a internet.');
      }
    }
    
    throw new Error('No se pudo extraer texto del archivo PDF. Asegúrate de que el PDF contenga texto seleccionable y no esté protegido o dañado.');
  }
}

// Función principal para parsear documentos con manejo robusto
export async function parseDocument(
  file: File,
  onProgress?: (progress: number) => void
): Promise<DocumentParseResult> {
  try {
    console.log(`Starting document parsing for file: ${file.name} (${file.size} bytes)`);
    
    if (onProgress) onProgress(0.05);
    
    // Validar tipo de archivo de manera más robusta
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    console.log(`File type: ${fileType}, File name: ${fileName}`);
    
    const isPDF = fileType.includes('pdf') || fileName.endsWith('.pdf');
    const isDOCX = fileType.includes('wordprocessingml') || 
                   fileType.includes('officedocument') || 
                   fileType.includes('document') ||
                   fileName.endsWith('.docx');
    
    if (!isPDF && !isDOCX) {
      throw new Error('Solo se admiten archivos PDF y DOCX. Verifica que el archivo tenga la extensión correcta.');
    }
    
    console.log(`File identified as: ${isPDF ? 'PDF' : 'DOCX'}`);
    
    if (onProgress) onProgress(0.1);
    
    let extractedText = '';
    
    try {
      if (isDOCX) {
        console.log('Extracting text from DOCX file...');
        extractedText = await extractTextFromDOCX(file, (progress) => {
          if (onProgress) onProgress(0.1 + progress * 0.6);
        });
        console.log('DOCX text extraction completed');
      } else if (isPDF) {
        console.log('Extracting text from PDF file...');
        extractedText = await extractTextFromPDF(file, (progress) => {
          if (onProgress) onProgress(0.1 + progress * 0.6);
        });
        console.log('PDF text extraction completed');
      }
    } catch (extractionError) {
      console.error('Error during text extraction:', extractionError);
      throw extractionError;
    }
    
    if (onProgress) onProgress(0.75);
    
    console.log(`Raw extracted text length: ${extractedText.length} characters`);
    
    // Limpiar y formatear el texto
    const cleanedText = cleanAndFormatText(extractedText);
    
    console.log(`Cleaned text length: ${cleanedText.length} characters`);
    
    if (cleanedText.length < 10) {
      throw new Error('El documento no contiene suficiente texto para procesar. Verifica que el archivo no esté vacío, dañado, o sea un documento escaneado.');
    }
    
    if (onProgress) onProgress(0.85);
    
    // Detectar idioma (solo español o inglés)
    const detectedLanguage = detectLanguage(cleanedText);
    console.log(`Detected language: ${detectedLanguage}`);
    
    // Contar palabras
    const wordCount = cleanedText.split(/\s+/).filter(word => word.length > 0).length;
    console.log(`Word count: ${wordCount}`);
    
    if (onProgress) onProgress(0.95);
    
    // Calcular confianza basada en la longitud del texto y calidad
    let confidence = 0.7; // Confianza base
    
    // Ajustar confianza basada en cantidad de palabras
    if (wordCount > 100) confidence = 0.85;
    if (wordCount > 300) confidence = 0.9;
    if (wordCount > 500) confidence = 0.95;
    if (wordCount < 50) confidence = 0.6;
    if (wordCount < 20) confidence = 0.4;
    
    // Ajustar confianza basada en la presencia de términos legales
    const legalTermsSpanish = /\b(contrato|ley|artículo|código|arrendamiento|demanda|tribunal)\b/i;
    const legalTermsEnglish = /\b(contract|law|article|code|lease|lawsuit|court)\b/i;
    const hasLegalTerms = legalTermsSpanish.test(cleanedText) || legalTermsEnglish.test(cleanedText);
    
    if (hasLegalTerms) {
      confidence = Math.min(confidence + 0.1, 1.0);
      console.log('Legal terms detected, confidence increased');
    }
    
    // Ajustar confianza basada en la estructura del documento
    const hasStructure = /\b(primera|segunda|tercera|first|second|third|artículo|article|sección|section)\b/i.test(cleanedText);
    if (hasStructure) {
      confidence = Math.min(confidence + 0.05, 1.0);
      console.log('Document structure detected, confidence increased');
    }
    
    if (onProgress) onProgress(1.0);
    
    const result = {
      extracted_text: cleanedText,
      detected_language: detectedLanguage,
      confidence: confidence,
      word_count: wordCount
    };
    
    console.log(`Document parsing completed successfully:`, {
      language: detectedLanguage,
      wordCount: wordCount,
      confidence: Math.round(confidence * 100) + '%',
      textLength: cleanedText.length
    });
    
    return result;
    
  } catch (error) {
    console.error('Error parsing document:', error);
    
    // Re-lanzar el error para que sea manejado por el componente
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Error desconocido al procesar el documento. Intenta con otro archivo.');
    }
  }
}