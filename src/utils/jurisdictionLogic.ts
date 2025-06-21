export type LegalSystem = 'common_law' | 'civil_law' | 'islamic_law' | 'hybrid' | 'international';

export interface LegalFramework {
  id: string;
  country: string;
  region?: string;
  legal_system_type: LegalSystem;
  supported_document_types: string[];
  legal_notes: string;
  official_sources: string[];
  terminology: Record<string, string>;
}

export interface JurisdictionContext {
  framework: LegalFramework;
  language: string;
  literacy_level: string;
}

// Enhanced legal frameworks database with better Colombian support
export const legalFrameworks: LegalFramework[] = [
  // Colombia - Enhanced
  {
    id: 'colombia-nacional',
    country: 'Colombia',
    region: 'Nacional',
    legal_system_type: 'civil_law',
    supported_document_types: ['contrato', 'arrendamiento', 'testamento', 'poder_notarial', 'demanda_civil', 'contrato_laboral'],
    legal_notes: 'Derecho civil colombiano regido por el Código Civil y leyes especiales como la Ley 820 de 2003 para arrendamientos.',
    official_sources: ['https://www.funcionpublica.gov.co', 'https://www.corteconstitucional.gov.co'],
    terminology: {
      'arrendador': 'la persona que da en arriendo (propietario)',
      'arrendatario': 'la persona que recibe en arriendo (inquilino)',
      'canon de arrendamiento': 'valor mensual que se paga por el arriendo',
      'ley 820 de 2003': 'ley que regula los contratos de arrendamiento en Colombia',
      'código civil': 'conjunto de normas que regulan las relaciones civiles',
      'ipc': 'índice de precios al consumidor para ajustar arriendos',
      'artículo': 'sección específica de una ley',
      'incumplimiento': 'no cumplir con las obligaciones del contrato',
      'terminación': 'finalización del contrato de arriendo',
      'restitución': 'devolución del inmueble al propietario',
      'depósito': 'dinero que se entrega como garantía',
      'cláusula': 'condición específica del contrato'
    }
  },
  // USA
  {
    id: 'usa-federal',
    country: 'USA',
    region: 'Federal',
    legal_system_type: 'common_law',
    supported_document_types: ['contract', 'lease', 'will', 'power_of_attorney', 'civil_complaint', 'employment_agreement'],
    legal_notes: 'Federal laws apply across all states. State-specific variations may apply.',
    official_sources: ['https://www.law.cornell.edu', 'https://www.justia.com'],
    terminology: {
      'plaintiff': 'the person who is suing',
      'defendant': 'the person being sued',
      'discovery': 'the process of gathering evidence',
      'deposition': 'sworn testimony given outside of court',
      'motion': 'a formal request to the court',
      'injunction': 'a court order to stop doing something',
      'damages': 'money awarded to compensate for harm',
      'liability': 'legal responsibility for something',
      'breach of contract': 'breaking the terms of an agreement',
      'statute of limitations': 'time limit for filing a lawsuit'
    }
  },
  // Mexico
  {
    id: 'mexico-federal',
    country: 'Mexico',
    region: 'Federal',
    legal_system_type: 'civil_law',
    supported_document_types: ['contrato', 'arrendamiento', 'testamento', 'poder_notarial', 'demanda_civil', 'contrato_laboral'],
    legal_notes: 'Sistema jurídico basado en derecho civil. Requiere notarización para muchos documentos.',
    official_sources: ['https://www.diputados.gob.mx', 'https://www.scjn.gob.mx'],
    terminology: {
      'demandante': 'la persona que presenta la demanda',
      'demandado': 'la persona contra quien se presenta la demanda',
      'juicio': 'proceso legal ante un juez',
      'sentencia': 'decisión final del juez',
      'apelación': 'pedir que otro juez revise la decisión',
      'notificación': 'aviso oficial',
      'embargo': 'retener bienes por deudas',
      'fianza': 'dinero que se deja como garantía'
    }
  },
  // Spain
  {
    id: 'spain-national',
    country: 'Spain',
    region: 'Nacional',
    legal_system_type: 'civil_law',
    supported_document_types: ['contrato', 'arrendamiento', 'testamento', 'poder_notarial', 'demanda_civil', 'contrato_laboral'],
    legal_notes: 'Derecho civil español con normativas de la UE aplicables.',
    official_sources: ['https://www.boe.es', 'https://www.poderjudicial.es'],
    terminology: {
      'demandante': 'la persona que presenta la demanda',
      'demandado': 'la persona contra quien se presenta la demanda',
      'auto': 'decisión del juez sobre un tema específico',
      'sentencia': 'decisión final del juez',
      'recurso': 'pedir que otro juez revise la decisión',
      'emplazamiento': 'citación oficial para comparecer'
    }
  },
  // UK
  {
    id: 'uk-england-wales',
    country: 'United Kingdom',
    region: 'England and Wales',
    legal_system_type: 'common_law',
    supported_document_types: ['contract', 'lease', 'will', 'power_of_attorney', 'civil_claim', 'employment_contract'],
    legal_notes: 'English common law system. Post-Brexit regulations apply.',
    official_sources: ['https://www.legislation.gov.uk', 'https://www.gov.uk/courts-tribunals'],
    terminology: {
      'claimant': 'the person making a legal claim',
      'defendant': 'the person defending against a claim',
      'solicitor': 'a type of lawyer who gives legal advice',
      'barrister': 'a type of lawyer who represents clients in court',
      'chambers': 'a barrister\'s office',
      'statutory': 'required by law'
    }
  }
];

// Enhanced jurisdiction detection with Colombian legal patterns
export function detectJurisdiction(text: string, userCountry?: string): LegalFramework {
  const lowerText = text.toLowerCase();
  
  // Colombian legal indicators
  if (lowerText.includes('ley 820') || 
      lowerText.includes('código civil colombiano') ||
      lowerText.includes('bogotá d.c') ||
      lowerText.includes('bogotá dc') ||
      lowerText.includes('medellín') ||
      lowerText.includes('cali') ||
      lowerText.includes('barranquilla') ||
      lowerText.includes('cartagena') ||
      lowerText.includes('bucaramanga') ||
      lowerText.includes('pereira') ||
      lowerText.includes('manizales') ||
      lowerText.includes('pesos colombianos') ||
      lowerText.includes('cop') ||
      lowerText.includes('arrendador') ||
      lowerText.includes('arrendatario') ||
      lowerText.includes('canon de arrendamiento') ||
      lowerText.includes('ipc') ||
      lowerText.includes('colombia') ||
      lowerText.includes('colombiano')) {
    return legalFrameworks.find(f => f.id === 'colombia-nacional') || legalFrameworks[0];
  }
  
  // Mexican legal indicators
  if (lowerText.includes('ciudad de méxico') ||
      lowerText.includes('cdmx') ||
      lowerText.includes('guadalajara') ||
      lowerText.includes('monterrey') ||
      lowerText.includes('puebla') ||
      lowerText.includes('tijuana') ||
      lowerText.includes('pesos mexicanos') ||
      lowerText.includes('mxn') ||
      lowerText.includes('méxico') ||
      lowerText.includes('mexicano')) {
    return legalFrameworks.find(f => f.id === 'mexico-federal') || legalFrameworks[0];
  }
  
  // Spanish legal indicators
  if (lowerText.includes('madrid') ||
      lowerText.includes('barcelona') ||
      lowerText.includes('valencia') ||
      lowerText.includes('sevilla') ||
      lowerText.includes('bilbao') ||
      lowerText.includes('euros') ||
      lowerText.includes('eur') ||
      lowerText.includes('españa') ||
      lowerText.includes('español')) {
    return legalFrameworks.find(f => f.id === 'spain-national') || legalFrameworks[0];
  }
  
  // US legal indicators
  if (lowerText.includes('plaintiff') || 
      lowerText.includes('defendant') || 
      lowerText.includes('discovery') ||
      lowerText.includes('new york') ||
      lowerText.includes('california') ||
      lowerText.includes('texas') ||
      lowerText.includes('florida') ||
      lowerText.includes('dollars') ||
      lowerText.includes('usd')) {
    return legalFrameworks.find(f => f.id === 'usa-federal') || legalFrameworks[0];
  }
  
  // UK legal indicators
  if (lowerText.includes('claimant') ||
      lowerText.includes('solicitor') ||
      lowerText.includes('barrister') ||
      lowerText.includes('london') ||
      lowerText.includes('manchester') ||
      lowerText.includes('birmingham') ||
      lowerText.includes('pounds') ||
      lowerText.includes('gbp')) {
    return legalFrameworks.find(f => f.id === 'uk-england-wales') || legalFrameworks[0];
  }
  
  // Fallback to user's country or default
  if (userCountry) {
    const countryFramework = legalFrameworks.find(f => f.country.toLowerCase() === userCountry.toLowerCase());
    if (countryFramework) return countryFramework;
  }
  
  // Default to international
  return {
    id: 'international',
    country: 'Global',
    region: 'International',
    legal_system_type: 'international',
    supported_document_types: ['contract', 'agreement', 'document', 'legal_text'],
    legal_notes: 'General international legal principles. Consult local legal experts for jurisdiction-specific advice.',
    official_sources: ['https://www.un.org', 'https://www.icj-cij.org'],
    terminology: {}
  };
}

// Enhanced language detection
export function detectLanguage(text: string): string {
  const cleanText = text.toLowerCase().trim();
  
  // Colombian/Spanish indicators
  const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'una', 'del', 'los', 'las', 'este', 'esta', 'como', 'pero', 'sus', 'fue', 'ser', 'tiene', 'todo', 'más', 'muy', 'puede', 'hacer', 'tiempo', 'año', 'años', 'estado', 'gobierno', 'nacional', 'trabajo', 'día', 'grupo', 'caso', 'parte', 'lugar', 'forma', 'manera', 'vida', 'mundo', 'casa', 'país', 'ejemplo', 'nombre', 'número', 'agua', 'historia', 'derecho', 'ley', 'legal', 'tribunal', 'juez', 'demanda', 'contrato', 'documento', 'firma', 'fecha', 'artículo', 'código', 'civil', 'penal', 'administrativo', 'arrendador', 'arrendatario', 'canon', 'arriendo', 'colombia', 'colombiano', 'bogotá', 'medellín', 'cali', 'pesos'];
  
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

// Extract real information from document text
export function extractDocumentInfo(text: string, jurisdiction: LegalFramework): any {
  const info: any = {
    names: [],
    dates: [],
    addresses: [],
    amounts: [],
    laws: [],
    articles: [],
    duration: null,
    obligations: [],
    penalties: []
  };
  
  // Extract names (capitalized words that appear to be names)
  const namePattern = /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/g;
  const names = text.match(namePattern) || [];
  info.names = [...new Set(names.filter(name => 
    name.length > 3 && 
    !['PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA', 'QUINTA', 'SEXTA', 'SÉPTIMA', 'OCTAVA'].includes(name)
  ))];
  
  // Extract dates
  const datePattern = /(\d{1,2}\s+de\s+\w+\s+de\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/g;
  info.dates = text.match(datePattern) || [];
  
  // Extract addresses (Colombian cities and addresses)
  const addressPattern = /(Bogotá\s+D\.?C\.?|Medellín|Cali|Barranquilla|Cartagena|Bucaramanga|Pereira|Manizales|Calle\s+\w+\s+\d+|Carrera\s+\d+|Avenida\s+\w+)/gi;
  info.addresses = text.match(addressPattern) || [];
  
  // Extract monetary amounts
  const amountPattern = /(\$[\d,]+(?:\.\d{2})?|\d+\s*pesos)/gi;
  info.amounts = text.match(amountPattern) || [];
  
  // Extract Colombian laws
  const lawPattern = /(Ley\s+\d+\s+de\s+\d{4}|Código\s+Civil|Decreto\s+\d+)/gi;
  info.laws = text.match(lawPattern) || [];
  
  // Extract articles
  const articlePattern = /(artículo\s+\d+|Art\.\s*\d+)/gi;
  info.articles = text.match(articlePattern) || [];
  
  // Extract contract duration
  const durationPattern = /(\d+\s*(?:meses?|años?|días?))/gi;
  const durations = text.match(durationPattern) || [];
  if (durations.length > 0) {
    info.duration = durations[0];
  }
  
  return info;
}

export function adaptContentForJurisdiction(
  content: string, 
  framework: LegalFramework, 
  language: string,
  documentInfo?: any
): string {
  let adaptedContent = content;
  
  // Apply jurisdiction-specific terminology
  Object.entries(framework.terminology).forEach(([term, explanation]) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    adaptedContent = adaptedContent.replace(regex, `${term} (${explanation})`);
  });
  
  // Add jurisdiction context
  const jurisdictionNote = getJurisdictionNote(framework, language);
  if (jurisdictionNote) {
    adaptedContent += `\n\n${jurisdictionNote}`;
  }
  
  // Add document-specific information if available
  if (documentInfo) {
    let specificInfo = '';
    
    if (language === 'es') {
      if (documentInfo.laws && documentInfo.laws.length > 0) {
        specificInfo += `\n\n**Marco Legal:** Este documento está regido por ${documentInfo.laws.join(', ')}.`;
      }
      if (documentInfo.articles && documentInfo.articles.length > 0) {
        specificInfo += `\n\n**Artículos Relevantes:** ${documentInfo.articles.join(', ')}.`;
      }
    } else {
      if (documentInfo.laws && documentInfo.laws.length > 0) {
        specificInfo += `\n\n**Legal Framework:** This document is governed by ${documentInfo.laws.join(', ')}.`;
      }
      if (documentInfo.articles && documentInfo.articles.length > 0) {
        specificInfo += `\n\n**Relevant Articles:** ${documentInfo.articles.join(', ')}.`;
      }
    }
    
    adaptedContent += specificInfo;
  }
  
  return adaptedContent;
}

function getJurisdictionNote(framework: LegalFramework, language: string): string {
  const systemExplanations: Record<string, Record<string, string>> = {
    'en': {
      'common_law': 'This jurisdiction follows common law, where court decisions create legal precedents.',
      'civil_law': 'This jurisdiction follows civil law, where written codes and statutes are primary.',
      'islamic_law': 'This jurisdiction incorporates Islamic law (Sharia) principles.',
      'hybrid': 'This jurisdiction combines elements from different legal systems.',
      'international': 'This follows general international legal principles.'
    },
    'es': {
      'common_law': 'Esta jurisdicción sigue el derecho anglosajón, donde las decisiones judiciales crean precedentes.',
      'civil_law': 'Esta jurisdicción sigue el derecho civil, donde los códigos escritos son primarios.',
      'islamic_law': 'Esta jurisdicción incorpora principios de la ley islámica (Sharia).',
      'hybrid': 'Esta jurisdicción combina elementos de diferentes sistemas legales.',
      'international': 'Esto sigue principios legales internacionales generales.'
    },
    'fr': {
      'common_law': 'Cette juridiction suit la common law, où les décisions judiciaires créent des précédents.',
      'civil_law': 'Cette juridiction suit le droit civil, où les codes écrits sont primaires.',
      'islamic_law': 'Cette juridiction incorpore les principes de la loi islamique (Charia).',
      'hybrid': 'Cette juridiction combine des éléments de différents systèmes juridiques.',
      'international': 'Ceci suit les principes juridiques internationaux généraux.'
    }
  };
  
  const explanations = systemExplanations[language] || systemExplanations['en'];
  const systemExplanation = explanations[framework.legal_system_type] || '';
  
  if (language === 'es') {
    return `**Nota Jurisdiccional:** ${framework.country} (${framework.region || 'Nacional'}) - ${systemExplanation}`;
  } else if (language === 'fr') {
    return `**Note Juridictionnelle:** ${framework.country} (${framework.region || 'National'}) - ${systemExplanation}`;
  } else {
    return `**Jurisdiction Note:** ${framework.country} (${framework.region || 'National'}) - ${systemExplanation}`;
  }
}

export function getSupportedDocumentTypes(framework: LegalFramework): string[] {
  return framework.supported_document_types;
}

export function validateDocumentForJurisdiction(
  documentType: string, 
  framework: LegalFramework
): boolean {
  return framework.supported_document_types.includes(documentType.toLowerCase());
}