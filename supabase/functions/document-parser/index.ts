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

// Simple language detection based on common words and patterns
function detectLanguage(text: string): string {
  const cleanText = text.toLowerCase().trim();
  
  // Spanish indicators
  const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'una', 'del', 'los', 'las', 'este', 'esta', 'como', 'pero', 'sus', 'fue', 'ser', 'tiene', 'todo', 'más', 'muy', 'puede', 'hacer', 'tiempo', 'año', 'años', 'estado', 'gobierno', 'nacional', 'trabajo', 'día', 'grupo', 'caso', 'parte', 'lugar', 'forma', 'manera', 'vida', 'mundo', 'casa', 'país', 'ejemplo', 'nombre', 'número', 'agua', 'historia', 'derecho', 'ley', 'legal', 'tribunal', 'juez', 'demanda', 'contrato', 'documento', 'firma', 'fecha', 'artículo', 'código', 'civil', 'penal', 'administrativo'];
  
  // English indicators
  const englishWords = ['the', 'of', 'and', 'to', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'i', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him', 'has', 'two', 'more', 'very', 'what', 'know', 'just', 'first', 'get', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'life', 'only', 'new', 'way', 'may', 'say', 'great', 'where', 'much', 'through', 'well', 'me', 'right', 'legal', 'court', 'law', 'contract', 'document', 'agreement', 'plaintiff', 'defendant', 'judge', 'attorney', 'lawsuit', 'claim', 'evidence', 'witness', 'trial', 'verdict', 'settlement', 'damages', 'liability', 'breach', 'terms', 'conditions', 'signature', 'date', 'article', 'section', 'clause', 'provision', 'statute', 'regulation', 'civil', 'criminal', 'administrative'];
  
  // French indicators
  const frenchWords = ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par', 'grand', 'en', 'une', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'droit', 'loi', 'tribunal', 'juge', 'contrat', 'document', 'signature', 'date', 'article', 'code', 'civil', 'pénal', 'administratif'];
  
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

// Simulate document parsing (in real implementation, you'd use actual parsing libraries)
async function parseDocument(request: ParseDocumentRequest): Promise<ParseDocumentResponse> {
  try {
    let extractedText = '';
    
    // In a real implementation, you would:
    // 1. For PDFs: Use pdf-parse or similar library
    // 2. For DOCX: Use mammoth.js or docx library
    // 3. For images: Use Tesseract.js for OCR
    
    // For this demo, we'll simulate text extraction
    if (request.file_content) {
      // Simulate extracting text from base64 content
      try {
        const decodedContent = atob(request.file_content);
        // This is a simulation - in reality you'd parse the actual file format
        extractedText = decodedContent.includes('legal') || decodedContent.includes('contract') 
          ? `CONTRATO DE ARRENDAMIENTO

PRIMERA: IDENTIFICACIÓN DE LAS PARTES
Arrendador: Juan Pérez García, mayor de edad, con domicilio en Calle Principal 123, Ciudad de México.
Arrendatario: María López Rodríguez, mayor de edad, con domicilio en Avenida Secundaria 456, Ciudad de México.

SEGUNDA: OBJETO DEL CONTRATO
El arrendador da en arrendamiento al arrendatario el inmueble ubicado en Calle Ejemplo 789, Colonia Centro, Ciudad de México, para uso habitacional.

TERCERA: PLAZO
El presente contrato tendrá una duración de 12 meses, iniciando el 1 de enero de 2024 y terminando el 31 de diciembre de 2024.

CUARTA: RENTA
La renta mensual será de $15,000.00 (quince mil pesos mexicanos), pagadera los primeros cinco días de cada mes.

QUINTA: DEPÓSITO
El arrendatario entregará un depósito equivalente a dos meses de renta como garantía del cumplimiento de sus obligaciones.

SEXTA: OBLIGACIONES DEL ARRENDADOR
- Entregar el inmueble en condiciones habitables
- Realizar reparaciones mayores
- Respetar el uso pacífico del inmueble

SÉPTIMA: OBLIGACIONES DEL ARRENDATARIO
- Pagar la renta puntualmente
- Usar el inmueble conforme a su destino
- Conservar el inmueble en buen estado
- No subarrendar sin autorización

OCTAVA: TERMINACIÓN
El contrato podrá terminarse por vencimiento del plazo o por incumplimiento de cualquiera de las partes.

Firmas:
_________________                    _________________
Juan Pérez García                    María López Rodríguez
Arrendador                          Arrendatario

Fecha: 15 de diciembre de 2023`
          : 'Document unreadable.';
      } catch (error) {
        extractedText = 'Document unreadable.';
      }
    } else if (request.file_url) {
      // Simulate fetching and parsing from URL
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