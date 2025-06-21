/*
  Document Parser API
  Extracts text from legal documents (PDF, DOCX, images) and detects language
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface ParseDocumentRequest {
  file_url?: string;
  file_content?: string; // base64 encoded content
  file_type: 'pdf' | 'docx' | 'image';
}

interface ParseDocumentResponse {
  extracted_text: string;
  detected_language: string;
}

// Enhanced language detection based on common words and legal patterns
function detectLanguage(text: string): string {
  const cleanText = text.toLowerCase().trim();
  
  // Colombian/Spanish indicators (enhanced)
  const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'una', 'del', 'los', 'las', 'este', 'esta', 'como', 'pero', 'sus', 'fue', 'ser', 'tiene', 'todo', 'más', 'muy', 'puede', 'hacer', 'tiempo', 'año', 'años', 'estado', 'gobierno', 'nacional', 'trabajo', 'día', 'grupo', 'caso', 'parte', 'lugar', 'forma', 'manera', 'vida', 'mundo', 'casa', 'país', 'ejemplo', 'nombre', 'número', 'agua', 'historia', 'derecho', 'ley', 'legal', 'tribunal', 'juez', 'demanda', 'contrato', 'documento', 'firma', 'fecha', 'artículo', 'código', 'civil', 'penal', 'administrativo', 'arrendador', 'arrendatario', 'canon', 'arriendo', 'colombia', 'colombiano', 'bogotá', 'medellín', 'cali', 'pesos', 'identificado', 'cédula', 'ciudadanía', 'mayor', 'edad', 'domiciliado', 'inmueble', 'ubicado', 'destinado', 'vivienda', 'urbana', 'plazo', 'duración', 'meses', 'contados', 'partir', 'mensual', 'pagaderos', 'primeros', 'días', 'reajuste', 'anualmente', 'porcentaje', 'igual', 'ipc', 'certificado', 'dane', 'depósito', 'dinero', 'suma', 'equivalente', 'garantía', 'obligaciones', 'entregar', 'condiciones', 'habitabilidad', 'realizar', 'reparaciones', 'locativas', 'mayores', 'respetar', 'pacífico', 'cumplir', 'disposiciones', 'pagar', 'puntualmente', 'usar', 'conforme', 'destinación', 'conservar', 'buen', 'subarrendar', 'autorización', 'escrita', 'terminación', 'podrá', 'terminarse', 'vencimiento', 'mutuo', 'acuerdo', 'causales', 'establecidas', 'constancia', 'anterior', 'partes', 'firman'];
  
  // English indicators
  const englishWords = ['the', 'of', 'and', 'to', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'i', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him', 'has', 'two', 'more', 'very', 'what', 'know', 'just', 'first', 'get', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'life', 'only', 'new', 'way', 'may', 'say', 'great', 'where', 'much', 'through', 'well', 'me', 'right', 'legal', 'court', 'law', 'contract', 'document', 'agreement', 'plaintiff', 'defendant', 'judge', 'attorney', 'lawsuit', 'claim', 'evidence', 'witness', 'trial', 'verdict', 'settlement', 'damages', 'liability', 'breach', 'terms', 'conditions', 'signature', 'date', 'article', 'section', 'clause', 'provision', 'statute', 'regulation', 'civil', 'criminal', 'administrative'];
  
  // French indicators
  const frenchWords = ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par', 'grand', 'en', 'une', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'droit', 'loi', 'tribunal', 'juge', 'contrat', 'document', 'signature', 'date', 'article', 'code', 'civil', 'pénal', 'administratif'];
  
  // Check for specific Colombian legal patterns
  if (cleanText.includes('ley 820') || 
      cleanText.includes('código civil colombiano') ||
      cleanText.includes('bogotá d.c') ||
      cleanText.includes('arrendador') ||
      cleanText.includes('arrendatario') ||
      cleanText.includes('canon de arrendamiento') ||
      cleanText.includes('ipc') ||
      cleanText.includes('dane') ||
      cleanText.includes('cédula de ciudadanía') ||
      cleanText.includes('pesos colombianos')) {
    return 'es';
  }
  
  const words = cleanText.split(/\s+/).slice(0, 100); // Check first 100 words
  
  let spanishScore = 0;
  let englishScore = 0;
  let frenchScore = 0;
  
  words.forEach(word => {
    if (spanishWords.includes(word)) spanishScore++;
    if (englishWords.includes(word)) englishScore++;
    if (frenchWords.includes(word)) frenchScore++;
  });
  
  // Determine language based on highest score
  if (spanishScore > englishScore && spanishScore > frenchScore) {
    return 'es';
  } else if (frenchScore > englishScore && frenchScore > spanishScore) {
    return 'fr';
  } else {
    return 'en'; // Default to English
  }
}

// Clean and format extracted text
function cleanExtractedText(rawText: string): string {
  if (!rawText || rawText.trim().length === 0) {
    return '';
  }
  
  // Remove excessive whitespace and normalize line breaks
  let cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
  
  // Handle table-like structures - convert to line-separated format
  cleaned = cleaned.replace(/\|/g, ' | ');
  
  // Remove HTML tags if any
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Fix common OCR errors
  cleaned = cleaned
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase
    .replace(/(\d)([A-Za-z])/g, '$1 $2') // Add space between numbers and letters
    .replace(/([A-Za-z])(\d)/g, '$1 $2'); // Add space between letters and numbers
  
  return cleaned;
}

// Enhanced document parsing with Colombian legal document support
async function parseDocument(request: ParseDocumentRequest): Promise<ParseDocumentResponse> {
  try {
    let extractedText = '';
    
    // In a real implementation, you would:
    // 1. For PDFs: Use pdf-parse or similar library
    // 2. For DOCX: Use mammoth.js or docx library
    // 3. For images: Use Tesseract.js for OCR
    
    // For this demo, we'll simulate text extraction with realistic Colombian content
    if (request.file_content) {
      // Simulate extracting text from base64 content
      try {
        const decodedContent = atob(request.file_content);
        
        // Check if it's a Colombian legal document
        if (decodedContent.includes('colombia') || 
            decodedContent.includes('bogotá') || 
            decodedContent.includes('arrendamiento') ||
            decodedContent.includes('ley 820')) {
          extractedText = `CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA

PRIMERA: IDENTIFICACIÓN DE LAS PARTES
Arrendador: Carlos Eduardo Ramírez Gómez, mayor de edad, identificado con cédula de ciudadanía No. 80.123.456 de Bogotá D.C., domiciliado en la Carrera 15 No. 93-47, Bogotá D.C.

Arrendatario: Ana María Rodríguez López, mayor de edad, identificada con cédula de ciudadanía No. 52.987.654 de Medellín, domiciliada en la Calle 72 No. 10-34, Bogotá D.C.

SEGUNDA: OBJETO DEL CONTRATO
El arrendador da en arriendo al arrendatario el inmueble ubicado en la Carrera 11 No. 85-23, Apartamento 501, Bogotá D.C., destinado exclusivamente para vivienda urbana.

TERCERA: PLAZO
El presente contrato tendrá una duración de doce (12) meses, contados a partir del 1 de febrero de 2024 hasta el 31 de enero de 2025.

CUARTA: CANON DE ARRENDAMIENTO
El canon mensual de arrendamiento será de DOS MILLONES QUINIENTOS MIL PESOS ($2.500.000) moneda corriente, pagaderos dentro de los primeros cinco (5) días de cada mes.

QUINTA: REAJUSTE DEL CANON
El canon de arrendamiento se reajustará anualmente en un porcentaje igual al IPC certificado por el DANE para el año inmediatamente anterior.

SEXTA: DEPÓSITO EN DINERO
El arrendatario entregará al arrendador la suma de CINCO MILLONES DE PESOS ($5.000.000) como depósito en dinero, equivalente a dos (2) meses de canon.

SÉPTIMA: OBLIGACIONES DEL ARRENDADOR
- Entregar el inmueble en condiciones de habitabilidad
- Realizar las reparaciones locativas mayores
- Respetar el uso pacífico del inmueble por parte del arrendatario
- Cumplir con las disposiciones de la Ley 820 de 2003

OCTAVA: OBLIGACIONES DEL ARRENDATARIO
- Pagar puntualmente el canon de arrendamiento
- Usar el inmueble conforme a su destinación
- Conservar el inmueble en buen estado
- No subarrendar sin autorización escrita del arrendador
- Cumplir con las disposiciones del Código Civil Colombiano

NOVENA: TERMINACIÓN
El contrato podrá terminarse por vencimiento del plazo, mutuo acuerdo, o por las causales establecidas en el artículo 22 de la Ley 820 de 2003.

En constancia de lo anterior, las partes firman en Bogotá D.C., a los quince (15) días del mes de enero de 2024.

_____________________________          _____________________________
Carlos Eduardo Ramírez Gómez           Ana María Rodríguez López
Arrendador                             Arrendatario
C.C. 80.123.456                       C.C. 52.987.654`;
        } else {
          // Default to generic legal document
          extractedText = `RENTAL AGREEMENT

FIRST: IDENTIFICATION OF PARTIES
Landlord: John Smith, of legal age, residing at 123 Main Street, New York, NY.
Tenant: Jane Doe, of legal age, residing at 456 Second Avenue, New York, NY.

SECOND: SUBJECT OF CONTRACT
The landlord rents to the tenant the property located at 789 Example Street, Downtown, New York, NY, for residential use.

THIRD: TERM
This contract shall have a duration of 12 months, starting January 1, 2024 and ending December 31, 2024.

FOURTH: RENT
The monthly rent shall be $2,500.00 (two thousand five hundred dollars), payable within the first five days of each month.

FIFTH: DEPOSIT
The tenant shall provide a deposit equivalent to two months' rent as guarantee for compliance with obligations.

SIXTH: LANDLORD OBLIGATIONS
- Deliver the property in habitable conditions
- Perform major repairs
- Respect peaceful use of the property

SEVENTH: TENANT OBLIGATIONS
- Pay rent punctually
- Use property according to its intended purpose
- Maintain property in good condition
- Not sublease without authorization

EIGHTH: TERMINATION
The contract may be terminated by expiration of term or breach by either party.

Signatures:
_________________                    _________________
John Smith                          Jane Doe
Landlord                           Tenant

Date: December 15, 2023`;
        }
      } catch (error) {
        extractedText = 'Document unreadable.';
      }
    } else if (request.file_url) {
      // Simulate fetching and parsing from URL - default to Colombian content for testing
      extractedText = `CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA

PRIMERA: IDENTIFICACIÓN DE LAS PARTES
Arrendador: Carlos Eduardo Ramírez Gómez, mayor de edad, identificado con cédula de ciudadanía No. 80.123.456 de Bogotá D.C.
Arrendatario: Ana María Rodríguez López, mayor de edad, identificada con cédula de ciudadanía No. 52.987.654 de Medellín.

SEGUNDA: OBJETO DEL CONTRATO
El arrendador da en arriendo al arrendatario el inmueble ubicado en la Carrera 11 No. 85-23, Apartamento 501, Bogotá D.C., destinado exclusivamente para vivienda urbana.

TERCERA: PLAZO
El presente contrato tendrá una duración de doce (12) meses, contados a partir del 1 de febrero de 2024 hasta el 31 de enero de 2025.

CUARTA: CANON DE ARRENDAMIENTO
El canon mensual de arrendamiento será de DOS MILLONES QUINIENTOS MIL PESOS ($2.500.000) moneda corriente, pagaderos dentro de los primeros cinco (5) días de cada mes.

QUINTA: REAJUSTE DEL CANON
El canon de arrendamiento se reajustará anualmente en un porcentaje igual al IPC certificado por el DANE para el año inmediatamente anterior.

SEXTA: DEPÓSITO EN DINERO
El arrendatario entregará al arrendador la suma de CINCO MILLONES DE PESOS ($5.000.000) como depósito en dinero, equivalente a dos (2) meses de canon.

SÉPTIMA: OBLIGACIONES DEL ARRENDADOR
- Entregar el inmueble en condiciones de habitabilidad
- Realizar las reparaciones locativas mayores
- Respetar el uso pacífico del inmueble por parte del arrendatario
- Cumplir con las disposiciones de la Ley 820 de 2003

OCTAVA: OBLIGACIONES DEL ARRENDATARIO
- Pagar puntualmente el canon de arrendamiento
- Usar el inmueble conforme a su destinación
- Conservar el inmueble en buen estado
- No subarrendar sin autorización escrita del arrendador
- Cumplir con las disposiciones del Código Civil Colombiano

NOVENA: TERMINACIÓN
El contrato podrá terminarse por vencimiento del plazo, mutuo acuerdo, o por las causales establecidas en el artículo 22 de la Ley 820 de 2003.

En constancia de lo anterior, las partes firman en Bogotá D.C., a los quince (15) días del mes de enero de 2024.

_____________________________          _____________________________
Carlos Eduardo Ramírez Gómez           Ana María Rodríguez López
Arrendador                             Arrendatario
C.C. 80.123.456                       C.C. 52.987.654`;
    } else {
      extractedText = 'Document unreadable.';
    }
    
    if (extractedText === 'Document unreadable.' || !extractedText.trim()) {
      return {
        extracted_text: 'Document unreadable.',
        detected_language: 'en'
      };
    }
    
    const cleanedText = cleanExtractedText(extractedText);
    const detectedLanguage = detectLanguage(cleanedText);
    
    return {
      extracted_text: cleanedText,
      detected_language: detectedLanguage
    };
    
  } catch (error) {
    return {
      extracted_text: 'Document unreadable.',
      detected_language: 'en'
    };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const requestData: ParseDocumentRequest = await req.json();
    
    if (!requestData.file_type) {
      return new Response(
        JSON.stringify({ error: 'file_type is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!requestData.file_url && !requestData.file_content) {
      return new Response(
        JSON.stringify({ error: 'Either file_url or file_content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const result = await parseDocument(requestData);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        extracted_text: 'Document unreadable.',
        detected_language: 'en'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});