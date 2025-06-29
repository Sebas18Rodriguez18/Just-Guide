import mammoth from 'mammoth';

export interface DocumentParseResult {
  extracted_text: string;
  detected_language: 'es' | 'en';
  confidence: number;
  word_count: number;
  criminal_procedure_location?: string; // Nueva propiedad para ubicación del procedimiento penal
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

// Detectar la ubicación del procedimiento penal
function detectCriminalProcedureLocation(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  // Patrones para detectar ubicaciones de procedimientos penales en Colombia
  if (lowerText.includes('fiscalía general de la nación') || 
      lowerText.includes('código de procedimiento penal colombiano') ||
      lowerText.includes('ley 906 de 2004')) {
    
    // Detectar ciudades específicas de Colombia
    if (lowerText.includes('bogotá') || lowerText.includes('bogota')) {
      return 'Bogotá, Colombia';
    } else if (lowerText.includes('medellín') || lowerText.includes('medellin')) {
      return 'Medellín, Colombia';
    } else if (lowerText.includes('cali')) {
      return 'Cali, Colombia';
    } else if (lowerText.includes('barranquilla')) {
      return 'Barranquilla, Colombia';
    } else if (lowerText.includes('cartagena')) {
      return 'Cartagena, Colombia';
    } else if (lowerText.includes('bucaramanga')) {
      return 'Bucaramanga, Colombia';
    } else {
      return 'Colombia';
    }
  }
  
  // Patrones para detectar ubicaciones de procedimientos penales en México
  if (lowerText.includes('fiscalía general de la república') || 
      lowerText.includes('código nacional de procedimientos penales') ||
      lowerText.includes('procuraduría general de justicia')) {
    
    // Detectar ciudades específicas de México
    if (lowerText.includes('ciudad de méxico') || lowerText.includes('cdmx') || lowerText.includes('df')) {
      return 'Ciudad de México, México';
    } else if (lowerText.includes('guadalajara')) {
      return 'Guadalajara, México';
    } else if (lowerText.includes('monterrey')) {
      return 'Monterrey, México';
    } else if (lowerText.includes('puebla')) {
      return 'Puebla, México';
    } else {
      return 'México';
    }
  }
  
  // Patrones para detectar ubicaciones de procedimientos penales en España
  if (lowerText.includes('audiencia nacional') || 
      lowerText.includes('ley de enjuiciamiento criminal') ||
      lowerText.includes('código penal español')) {
    
    // Detectar ciudades específicas de España
    if (lowerText.includes('madrid')) {
      return 'Madrid, España';
    } else if (lowerText.includes('barcelona')) {
      return 'Barcelona, España';
    } else if (lowerText.includes('valencia')) {
      return 'Valencia, España';
    } else if (lowerText.includes('sevilla')) {
      return 'Sevilla, España';
    } else {
      return 'España';
    }
  }
  
  // Patrones para detectar ubicaciones de procedimientos penales en Estados Unidos
  if (lowerText.includes('district attorney') || 
      lowerText.includes('criminal procedure') ||
      lowerText.includes('federal rules of criminal procedure')) {
    
    // Detectar estados específicos de EE.UU.
    if (lowerText.includes('new york') || lowerText.includes('ny')) {
      return 'New York, USA';
    } else if (lowerText.includes('california') || lowerText.includes('ca')) {
      return 'California, USA';
    } else if (lowerText.includes('texas') || lowerText.includes('tx')) {
      return 'Texas, USA';
    } else if (lowerText.includes('florida') || lowerText.includes('fl')) {
      return 'Florida, USA';
    } else {
      return 'United States';
    }
  }
  
  // Si no se detecta una ubicación específica pero hay términos penales
  if (lowerText.includes('procedimiento penal') || 
      lowerText.includes('criminal procedure') ||
      lowerText.includes('proceso penal') ||
      lowerText.includes('delito') ||
      lowerText.includes('crime') ||
      lowerText.includes('acusado') ||
      lowerText.includes('accused') ||
      lowerText.includes('imputado') ||
      lowerText.includes('defendant')) {
    return 'Ubicación no especificada';
  }
  
  // No se detectó procedimiento penal
  return undefined;
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
    console.log('📝 Iniciando extracción de texto DOCX...');
    console.log(`📄 Archivo: ${file.name}`);
    console.log(`📊 Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    
    if (onProgress) onProgress(0.1);
    
    const arrayBuffer = await file.arrayBuffer();
    console.log(`✅ ArrayBuffer creado: ${arrayBuffer.byteLength} bytes`);
    
    if (onProgress) onProgress(0.3);
    
    console.log('🔄 Extrayendo texto con mammoth...');
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (onProgress) onProgress(0.7);
    
    if (result.messages && result.messages.length > 0) {
      console.warn('⚠️ Advertencias durante extracción DOCX:', result.messages);
    }
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('El archivo DOCX no contiene texto extraíble o está vacío');
    }
    
    console.log(`✅ Texto extraído exitosamente: ${result.value.length} caracteres`);
    
    if (onProgress) onProgress(1.0);
    
    return result.value;
  } catch (error) {
    console.error('❌ Error extrayendo texto de DOCX:', error);
    throw new Error('No se pudo extraer texto del archivo DOCX. Verifica que el archivo no esté dañado o protegido.');
  }
}

// Función principal para parsear documentos DOCX únicamente
export async function parseDocument(
  file: File,
  onProgress?: (progress: number) => void
): Promise<DocumentParseResult> {
  try {
    console.log(`🚀 INICIANDO ANÁLISIS DE DOCUMENTO DOCX`);
    console.log(`📄 Archivo: ${file.name}`);
    console.log(`📊 Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`🏷️ Tipo MIME: ${file.type}`);
    
    if (onProgress) onProgress(0.02);
    
    // Validación robusta de tipo de archivo - SOLO DOCX
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    const isDOCX = fileType.includes('wordprocessingml') || 
                   fileType.includes('officedocument') || 
                   fileType.includes('document') ||
                   fileName.endsWith('.docx');
    
    console.log(`🔍 Tipo detectado: ${isDOCX ? 'DOCX' : 'NO SOPORTADO'}`);
    
    if (!isDOCX) {
      throw new Error('❌ Solo se admiten archivos DOCX. Por favor, convierte tu documento a formato DOCX.');
    }
    
    // Validación de tamaño
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`📏 El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo permitido: 10MB.`);
    }
    
    if (file.size < 100) {
      throw new Error('📏 El archivo es demasiado pequeño. Verifica que sea un documento DOCX válido.');
    }
    
    if (onProgress) onProgress(0.05);
    
    let extractedText = '';
    
    try {
      console.log('📝 Extrayendo texto de archivo DOCX...');
      extractedText = await extractTextFromDOCX(file, (progress) => {
        if (onProgress) onProgress(0.05 + progress * 0.65);
      });
      console.log('✅ Extracción DOCX completada');
    } catch (extractionError) {
      console.error(`💥 Error durante extracción DOCX:`, extractionError);
      throw extractionError;
    }
    
    if (onProgress) onProgress(0.75);
    
    console.log(`📝 Texto bruto extraído: ${extractedText.length} caracteres`);
    
    // Validación de contenido mínimo
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error(`❌ No se pudo extraer texto del archivo DOCX. El documento puede estar vacío, dañado, o protegido.`);
    }
    
    if (extractedText.trim().length < 10) {
      throw new Error(`❌ El documento contiene muy poco texto (${extractedText.length} caracteres). Verifica que sea un documento válido con contenido.`);
    }
    
    // Limpiar y formatear el texto
    console.log('🧹 Limpiando y formateando texto...');
    const cleanedText = cleanAndFormatText(extractedText);
    
    console.log(`✨ Texto limpio: ${cleanedText.length} caracteres`);
    
    if (cleanedText.length < 10) {
      throw new Error('❌ Después de limpiar el texto, no queda contenido suficiente para procesar. El documento puede contener solo caracteres especiales o estar dañado.');
    }
    
    if (onProgress) onProgress(0.85);
    
    // Detectar idioma (solo español o inglés)
    console.log('🌐 Detectando idioma...');
    const detectedLanguage = detectLanguage(cleanedText);
    console.log(`🎯 Idioma detectado: ${detectedLanguage === 'es' ? 'Español' : 'English'}`);
    
    // Detectar ubicación del procedimiento penal
    console.log('🔍 Detectando ubicación del procedimiento penal...');
    const criminalProcedureLocation = detectCriminalProcedureLocation(cleanedText);
    console.log(`🌎 Ubicación del procedimiento penal: ${criminalProcedureLocation || 'No detectada'}`);
    
    // Contar palabras
    const words = cleanedText.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    console.log(`📊 Palabras contadas: ${wordCount}`);
    
    if (onProgress) onProgress(0.92);
    
    // Calcular confianza basada en múltiples factores
    let confidence = 0.8; // Confianza base más alta para DOCX
    
    // Factor 1: Cantidad de palabras
    if (wordCount > 500) confidence = 0.98;
    else if (wordCount > 300) confidence = 0.95;
    else if (wordCount > 100) confidence = 0.9;
    else if (wordCount > 50) confidence = 0.85;
    else if (wordCount < 20) confidence = 0.6;
    
    // Factor 2: Presencia de términos legales
    const legalTermsSpanish = /\b(contrato|ley|artículo|código|arrendamiento|demanda|tribunal|obligación|derecho|civil|penal)\b/gi;
    const legalTermsEnglish = /\b(contract|law|article|code|lease|lawsuit|court|obligation|right|civil|criminal)\b/gi;
    
    const spanishMatches = (cleanedText.match(legalTermsSpanish) || []).length;
    const englishMatches = (cleanedText.match(legalTermsEnglish) || []).length;
    const totalLegalTerms = spanishMatches + englishMatches;
    
    if (totalLegalTerms > 10) confidence = Math.min(confidence + 0.15, 1.0);
    else if (totalLegalTerms > 5) confidence = Math.min(confidence + 0.1, 1.0);
    else if (totalLegalTerms > 2) confidence = Math.min(confidence + 0.05, 1.0);
    
    console.log(`⚖️ Términos legales encontrados: ${totalLegalTerms} (ES: ${spanishMatches}, EN: ${englishMatches})`);
    
    // Factor 3: Estructura del documento
    const structurePatterns = /\b(primera|segunda|tercera|cuarta|quinta|first|second|third|fourth|fifth|artículo|article|sección|section|capítulo|chapter)\b/gi;
    const structureMatches = (cleanedText.match(structurePatterns) || []).length;
    
    if (structureMatches > 5) confidence = Math.min(confidence + 0.1, 1.0);
    else if (structureMatches > 2) confidence = Math.min(confidence + 0.05, 1.0);
    
    console.log(`📋 Elementos de estructura encontrados: ${structureMatches}`);
    
    // Factor 4: Calidad del texto (caracteres especiales vs texto normal)
    const specialCharsRatio = (cleanedText.match(/[^\w\s]/g) || []).length / cleanedText.length;
    if (specialCharsRatio < 0.1) confidence = Math.min(confidence + 0.05, 1.0);
    else if (specialCharsRatio > 0.3) confidence = Math.max(confidence - 0.1, 0.4);
    
    console.log(`🔤 Ratio de caracteres especiales: ${(specialCharsRatio * 100).toFixed(1)}%`);
    
    if (onProgress) onProgress(0.98);
    
    const result = {
      extracted_text: cleanedText,
      detected_language: detectedLanguage,
      confidence: Math.round(confidence * 100) / 100, // Redondear a 2 decimales
      word_count: wordCount,
      criminal_procedure_location: criminalProcedureLocation // Agregar la ubicación del procedimiento penal
    };
    
    console.log(`🎉 ANÁLISIS DOCX COMPLETADO EXITOSAMENTE`);
    console.log(`📊 Resultados finales:`);
    console.log(`   📝 Caracteres: ${cleanedText.length}`);
    console.log(`   📖 Palabras: ${wordCount}`);
    console.log(`   🌐 Idioma: ${detectedLanguage === 'es' ? 'Español' : 'English'}`);
    console.log(`   🎯 Confianza: ${Math.round(confidence * 100)}%`);
    console.log(`   ⚖️ Términos legales: ${totalLegalTerms}`);
    console.log(`   📋 Estructura: ${structureMatches} elementos`);
    if (criminalProcedureLocation) {
      console.log(`   🌎 Ubicación del procedimiento penal: ${criminalProcedureLocation}`);
    }
    
    if (onProgress) onProgress(1.0);
    
    return result;
    
  } catch (error) {
    console.error('💥 ERROR CRÍTICO EN ANÁLISIS DE DOCUMENTO DOCX:', error);
    
    // Re-lanzar errores ya formateados
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('💥 Error desconocido al procesar el documento DOCX. Intenta con otro archivo.');
    }
  }
}