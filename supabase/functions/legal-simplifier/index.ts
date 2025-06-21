/*
  Legal Text Simplifier API
  Converts complex legal text into plain language based on jurisdiction and user preferences
*/

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface SimplifyRequest {
  extracted_text: string;
  language?: string;
  country?: string;
  region?: string;
  legal_system_type?: string;
  legal_literacy_level?: string;
}

interface SimplifyResponse {
  simplified_summary: string;
  reading_level: string;
  jurisdiction_note?: string;
}

// Enhanced jurisdiction-specific legal term translations and simplifications
const jurisdictionTerms: Record<string, Record<string, string>> = {
  'Colombia': {
    'arrendador': 'la persona que da en arriendo (propietario)',
    'arrendatario': 'la persona que recibe en arriendo (inquilino)',
    'canon de arrendamiento': 'valor mensual que se paga por el arriendo',
    'ley 820 de 2003': 'ley que regula los contratos de arrendamiento en Colombia',
    'código civil colombiano': 'conjunto de normas que regulan las relaciones civiles en Colombia',
    'ipc': 'índice de precios al consumidor para ajustar arriendos',
    'dane': 'entidad que certifica la inflación en Colombia',
    'artículo 22': 'sección de la ley que establece las causales de terminación',
    'incumplimiento': 'no cumplir con las obligaciones del contrato',
    'terminación': 'finalización del contrato de arriendo',
    'restitución': 'devolución del inmueble al propietario',
    'depósito en dinero': 'dinero que se entrega como garantía',
    'cláusula': 'condición específica del contrato',
    'reparaciones locativas': 'arreglos menores que debe hacer el inquilino',
    'reparaciones mayores': 'arreglos grandes que debe hacer el propietario',
    'cédula de ciudadanía': 'documento de identidad colombiano',
    'mayor de edad': 'persona de 18 años o más',
    'domiciliado': 'que vive en un lugar específico',
    'inmueble': 'propiedad como casa o apartamento',
    'vivienda urbana': 'casa o apartamento en la ciudad',
    'canon': 'precio del arriendo',
    'moneda corriente': 'pesos colombianos',
    'pagaderos': 'que se deben pagar',
    'reajuste': 'aumento del precio según la inflación',
    'anualmente': 'cada año',
    'porcentaje': 'parte de cien',
    'certificado': 'confirmado oficialmente',
    'habitabilidad': 'condiciones para vivir bien',
    'pacífico': 'sin problemas o molestias',
    'disposiciones': 'reglas establecidas',
    'puntualmente': 'a tiempo',
    'destinación': 'uso para el que está hecho',
    'conservar': 'mantener en buen estado',
    'subarrendar': 'dar en arriendo a otra persona',
    'autorización escrita': 'permiso por escrito',
    'vencimiento':   'cuando se acaba el tiempo',
    'mutuo acuerdo': 'cuando ambas partes están de acuerdo',
    'causales': 'razones legales',
    'establecidas': 'definidas en la ley',
    'constancia': 'prueba o evidencia'
  },
  'Mexico': {
    'demandante': 'la persona que presenta la demanda',
    'demandado': 'la persona contra quien se presenta la demanda',
    'juicio': 'proceso legal ante un juez',
    'sentencia': 'decisión final del juez',
    'apelación': 'pedir que otro juez revise la decisión',
    'notificación': 'aviso oficial',
    'embargo': 'retener bienes por deudas',
    'fianza': 'dinero que se deja como garantía'
  },
  'USA': {
    'plaintiff': 'the person who is suing',
    'defendant': 'the person being sued',
    'discovery': 'the process of gathering evidence',
    'deposition': 'sworn testimony given outside of court',
    'motion': 'a formal request to the court',
    'injunction': 'a court order to stop doing something',
    'damages': 'money awarded to compensate for harm',
    'liability': 'legal responsibility for something',
    'breach of contract': 'breaking the terms of an agreement',
    'statute of limitations': 'time limit for filing a lawsuit',
    'due process': 'fair treatment under the law',
    'jurisdiction': 'the court\'s authority to hear a case',
  },
  'Spain': {
    'demandante': 'la persona que presenta la demanda',
    'demandado': 'la persona contra quien se presenta la demanda',
    'auto': 'decisión del juez sobre un tema específico',
    'sentencia': 'decisión final del juez',
    'recurso': 'pedir que otro juez revise la decisión',
    'emplazamiento': 'citación oficial para comparecer',
    'ejecución': 'hacer cumplir una decisión judicial',
    'hipoteca': 'garantía sobre una propiedad',
    'usufructo': 'derecho a usar algo que no es tuyo',
    'servidumbre': 'derecho de paso sobre propiedad ajena',
    'registro de la propiedad': 'oficina que registra propiedades',
    'notario': 'funcionario que da fe de documentos',
  },
  'UK': {
    'claimant': 'the person making a legal claim',
    'defendant': 'the person defending against a claim',
    'solicitor': 'a type of lawyer who gives legal advice',
    'barrister': 'a type of lawyer who represents clients in court',
    'chambers': 'a barrister\'s office',
    'injunction': 'a court order to stop doing something',
    'statutory': 'required by law',
    'common law': 'law based on court decisions',
    'precedent': 'a previous court decision that guides future cases',
    'tort': 'a civil wrong that causes harm',
    'negligence': 'failing to take proper care',
    'breach of duty': 'not fulfilling a legal obligation',
  }
};

// Enhanced legal system explanations
const legalSystemExplanations: Record<string, Record<string, string>> = {
  'en': {
    'common_law': 'This jurisdiction follows common law, where court decisions create legal precedents that guide future cases.',
    'civil_law': 'This jurisdiction follows civil law, where written codes and statutes are the primary source of law.',
    'islamic_law': 'This jurisdiction incorporates Islamic law (Sharia) principles alongside civil law.',
    'hybrid': 'This jurisdiction combines elements from different legal systems.',
    'international': 'This follows general international legal principles. Local laws may vary significantly.',
  },
  'es': {
    'common_law': 'Esta jurisdicción sigue el derecho anglosajón, donde las decisiones judiciales crean precedentes que guían casos futuros.',
    'civil_law': 'Esta jurisdicción sigue el derecho civil, donde los códigos escritos y estatutos son la fuente principal del derecho.',
    'islamic_law': 'Esta jurisdicción incorpora principios de la ley islámica (Sharia) junto con el derecho civil.',
    'hybrid': 'Esta jurisdicción combina elementos de diferentes sistemas legales.',
    'international': 'Esto sigue principios legales internacionales generales. Las leyes locales pueden variar significativamente.',
  },
  'fr': {
    'common_law': 'Cette juridiction suit la common law, où les décisions judiciaires créent des précédents qui guident les affaires futures.',
    'civil_law': 'Cette juridiction suit le droit civil, où les codes écrits et les statuts sont la source principale du droit.',
    'islamic_law': 'Cette juridiction incorpore les principes de la loi islamique (Charia) aux côtés du droit civil.',
    'hybrid': 'Cette juridiction combine des éléments de différents systèmes juridiques.',
    'international': 'Ceci suit les principes juridiques internationaux généraux. Les lois locales peuvent varier considérablement.',
  }
};

function getJurisdictionKey(country: string, region?: string): string {
  if (country === 'Colombia') return 'Colombia';
  if (country === 'USA') return 'USA';
  if (country === 'Mexico') return 'Mexico';
  if (country === 'Spain') return 'Spain';
  if (country === 'United Kingdom' || country === 'UK') return 'UK';
  return 'Global';
}

function simplifyLegalTerms(text: string, country: string, region?: string): string {
  const jurisdictionKey = getJurisdictionKey(country, region);
  const terms = jurisdictionTerms[jurisdictionKey] || {};
  
  let simplified = text;
  
  // Replace jurisdiction-specific legal terms
  Object.entries(terms).forEach(([term, explanation]) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    simplified = simplified.replace(regex, explanation);
  });
  
  return simplified;
}

function addJurisdictionContext(text: string, country: string, region: string, legalSystemType: string, language: string): string {
  const explanations = legalSystemExplanations[language] || legalSystemExplanations['en'];
  const systemExplanation = explanations[legalSystemType] || '';
  
  let contextualText = text;
  
  // Add jurisdiction-specific context
  if (country && region) {
    const jurisdictionNote = language === 'es' 
      ? `\n\n**Nota Jurisdiccional:** Este documento se interpreta bajo las leyes de ${country} (${region}). ${systemExplanation}`
      : language === 'fr'
      ? `\n\n**Note Juridictionnelle:** Ce document est interprété selon les lois de ${country} (${region}). ${systemExplanation}`
      : `\n\n**Jurisdiction Note:** This document is interpreted under the laws of ${country} (${region}). ${systemExplanation}`;
    
    contextualText += jurisdictionNote;
  }
  
  return contextualText;
}

function adjustForLiteracyLevel(text: string, level: string, language: string): string {
  let adjusted = text;
  
  if (level === 'basic') {
    // Use simpler vocabulary and shorter sentences
    if (language === 'es') {
      adjusted = adjusted
        .replace(/no obstante/gi, 'pero')
        .replace(/sin embargo/gi, 'pero')
        .replace(/por consiguiente/gi, 'por eso')
        .replace(/asimismo/gi, 'también')
        .replace(/en virtud de/gi, 'por')
        .replace(/con el fin de/gi, 'para')
        .replace(/a efectos de/gi, 'para')
        .replace(/en caso de que/gi, 'si')
        .replace(/con anterioridad/gi, 'antes')
        .replace(/posteriormente/gi, 'después')
        .replace(/adicionalmente/gi, 'además')
        .replace(/consecuentemente/gi, 'por eso')
        .replace(/específicamente/gi, 'en especial')
        .replace(/particularmente/gi, 'en especial');
    } else {
      adjusted = adjusted
        .replace(/nevertheless/gi, 'but')
        .replace(/however/gi, 'but')
        .replace(/therefore/gi, 'so')
        .replace(/furthermore/gi, 'also')
        .replace(/pursuant to/gi, 'according to')
        .replace(/in order to/gi, 'to')
        .replace(/subsequently/gi, 'later')
        .replace(/additionally/gi, 'also')
        .replace(/consequently/gi, 'so')
        .replace(/specifically/gi, 'especially')
        .replace(/particularly/gi, 'especially');
    }
  }
  
  return adjusted;
}

// Enhanced Colombian legal text simplification
function simplifyColombianLegalText(text: string, language: string): string {
  let simplified = text;
  
  if (language === 'es') {
    // Add section organization based on Colombian legal structure
    simplified = simplified
      .replace(/(PRIMERA?|PRIMERO|1\.?\s*[-:]?\s*)/gi, '\n## 1. Información de las personas\n')
      .replace(/(SEGUNDA?|SEGUNDO|2\.?\s*[-:]?\s*)/gi, '\n## 2. Qué se está arrendando\n')
      .replace(/(TERCERA?|TERCERO|3\.?\s*[-:]?\s*)/gi, '\n## 3. Tiempo del contrato\n')
      .replace(/(CUARTA?|CUARTO|4\.?\s*[-:]?\s*)/gi, '\n## 4. Dinero y pagos\n')
      .replace(/(QUINTA?|QUINTO|5\.?\s*[-:]?\s*)/gi, '\n## 5. Reajuste del canon\n')
      .replace(/(SEXTA?|SEXTO|6\.?\s*[-:]?\s*)/gi, '\n## 6. Depósito de garantía\n')
      .replace(/(SÉPTIMA?|SEPTIMO|7\.?\s*[-:]?\s*)/gi, '\n## 7. Obligaciones del arrendador\n')
      .replace(/(OCTAVA?|OCTAVO|8\.?\s*[-:]?\s*)/gi, '\n## 8. Obligaciones del arrendatario\n')
      .replace(/(NOVENA?|NOVENO|9\.?\s*[-:]?\s*)/gi, '\n## 9. Cómo termina el contrato\n');
    
    // Add explanatory context for Colombian legal concepts
    simplified = simplified
      .replace(/Ley 820 de 2003/gi, 'Ley 820 de 2003 (ley que regula los arriendos en Colombia)')
      .replace(/Código Civil Colombiano/gi, 'Código Civil Colombiano (leyes civiles de Colombia)')
      .replace(/IPC/gi, 'IPC (índice que mide la inflación)')
      .replace(/DANE/gi, 'DANE (entidad que calcula la inflación en Colombia)')
      .replace(/artículo 22/gi, 'artículo 22 (sección que explica cuándo se puede terminar el contrato)')
      .replace(/cédula de ciudadanía/gi, 'cédula de ciudadanía (documento de identidad)')
      .replace(/mayor de edad/gi, 'mayor de edad (18 años o más)')
      .replace(/canon de arrendamiento/gi, 'canon de arrendamiento (precio mensual del arriendo)')
      .replace(/depósito en dinero/gi, 'depósito en dinero (garantía que se devuelve)')
      .replace(/reparaciones locativas/gi, 'reparaciones locativas (arreglos menores)')
      .replace(/vivienda urbana/gi, 'vivienda urbana (casa o apartamento en la ciudad)');
  }
  
  return simplified;
}

function simplifyLegalText(request: SimplifyRequest): string {
  const {
    extracted_text,
    language = 'en',
    country = 'Global',
    region = '',
    legal_system_type = 'international',
    legal_literacy_level = 'basic'
  } = request;
  
  if (!extracted_text || extracted_text.trim() === '' || extracted_text === 'Document unreadable.') {
    return language === 'es' 
      ? 'No se pudo leer el documento o está vacío.'
      : language === 'fr'
      ? 'Le document n\'a pas pu être lu ou est vide.'
      : 'Document could not be read or is empty.';
  }
  
  // Step 1: Clean and normalize the text
  let simplified = extracted_text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  // Step 2: Apply Colombian-specific simplification if applicable
  if (country === 'Colombia' && language === 'es') {
    simplified = simplifyColombianLegalText(simplified, language);
  }
  
  // Step 3: Replace jurisdiction-specific legal terms
  simplified = simplifyLegalTerms(simplified, country, region);
  
  // Step 4: Adjust for literacy level
  simplified = adjustForLiteracyLevel(simplified, legal_literacy_level, language);
  
  // Step 5: Add jurisdiction context
  simplified = addJurisdictionContext(simplified, country, region, legal_system_type, language);
  
  // Step 6: Clean up formatting
  simplified = simplified
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s*##\s*/gm, '## ')
    .trim();
  
  return simplified;
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
    const requestData: SimplifyRequest = await req.json();
    
    if (!requestData.extracted_text) {
      return new Response(
        JSON.stringify({ error: 'extracted_text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const simplifiedText = simplifyLegalText(requestData);
    
    // Generate jurisdiction note for response
    const jurisdictionNote = requestData.country && requestData.region
      ? `${requestData.country} (${requestData.region}) - ${requestData.legal_system_type || 'general'} law`
      : 'General international principles';
    
    const response: SimplifyResponse = {
      simplified_summary: simplifiedText,
      reading_level: requestData.legal_literacy_level || 'basic',
      jurisdiction_note: jurisdictionNote
    };
    
    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        simplified_summary: 'Could not simplify the document.',
        reading_level: 'basic'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});