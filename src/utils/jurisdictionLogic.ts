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

// Comprehensive legal frameworks database
export const legalFrameworks: LegalFramework[] = [
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
  {
    id: 'usa-california',
    country: 'USA',
    region: 'California',
    legal_system_type: 'common_law',
    supported_document_types: ['contract', 'lease', 'will', 'power_of_attorney', 'civil_complaint', 'employment_agreement', 'tenant_rights'],
    legal_notes: 'California has strong tenant protection laws and specific employment regulations.',
    official_sources: ['https://leginfo.legislature.ca.gov', 'https://www.courts.ca.gov'],
    terminology: {
      'tenant': 'renter with strong protection rights',
      'landlord': 'property owner with specific obligations',
      'security deposit': 'refundable money (max 2 months rent)',
      'eviction': 'removal process with strict legal requirements',
      'at-will employment': 'employment that can be terminated by either party'
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
  },
  // China
  {
    id: 'china-national',
    country: 'China',
    region: 'National',
    legal_system_type: 'civil_law',
    supported_document_types: ['合同', '租赁', '遗嘱', '委托书', '民事诉讼', '劳动合同'],
    legal_notes: '中国民法典体系，具有社会主义特色。',
    official_sources: ['http://www.npc.gov.cn', 'http://www.court.gov.cn'],
    terminology: {
      '合同': '双方约定的法律文件',
      '当事人': '合同中的参与方',
      '违约': '不履行合同义务',
      '仲裁': '第三方解决争议',
      '诉讼': '法院审理案件',
      '判决': '法院的最终决定'
    }
  },
  // India
  {
    id: 'india-federal',
    country: 'India',
    region: 'Federal',
    legal_system_type: 'common_law',
    supported_document_types: ['contract', 'lease', 'will', 'power_of_attorney', 'civil_suit', 'employment_agreement'],
    legal_notes: 'Common law system with Indian statutory modifications. State laws may vary.',
    official_sources: ['https://legislative.gov.in', 'https://main.sci.gov.in'],
    terminology: {
      'petitioner': 'the person filing a case',
      'respondent': 'the person responding to a case',
      'advocate': 'a lawyer representing clients',
      'magistrate': 'a judicial officer',
      'bail': 'temporary release from custody',
      'cognizable offense': 'serious crime where police can arrest without warrant'
    }
  },
  // UAE
  {
    id: 'uae-federal',
    country: 'UAE',
    region: 'Federal',
    legal_system_type: 'civil_law',
    supported_document_types: ['عقد', 'إيجار', 'وصية', 'وكالة', 'دعوى_مدنية', 'عقد_عمل'],
    legal_notes: 'نظام القانون المدني مع تأثيرات الشريعة الإسلامية.',
    official_sources: ['https://www.moj.gov.ae', 'https://www.adjd.gov.ae'],
    terminology: {
      'المدعي': 'الشخص الذي يقدم الدعوى',
      'المدعى عليه': 'الشخص المقاضى',
      'العقد': 'اتفاق قانوني بين الأطراف',
      'الإخلال': 'عدم الوفاء بالالتزامات',
      'التحكيم': 'حل النزاعات خارج المحكمة',
      'الحكم': 'قرار المحكمة النهائي'
    }
  }
];

export function detectJurisdiction(text: string, userCountry?: string): LegalFramework {
  // Try to detect jurisdiction from document content
  const lowerText = text.toLowerCase();
  
  // Check for specific legal terms or patterns
  if (lowerText.includes('plaintiff') || lowerText.includes('defendant') || lowerText.includes('discovery')) {
    if (userCountry === 'USA') {
      return legalFrameworks.find(f => f.id === 'usa-federal') || legalFrameworks[0];
    }
    return legalFrameworks.find(f => f.country === 'United Kingdom') || legalFrameworks[0];
  }
  
  if (lowerText.includes('demandante') || lowerText.includes('demandado')) {
    if (userCountry === 'Mexico') {
      return legalFrameworks.find(f => f.id === 'mexico-federal') || legalFrameworks[0];
    }
    return legalFrameworks.find(f => f.country === 'Spain') || legalFrameworks[0];
  }
  
  if (lowerText.includes('合同') || lowerText.includes('当事人')) {
    return legalFrameworks.find(f => f.country === 'China') || legalFrameworks[0];
  }
  
  if (lowerText.includes('المدعي') || lowerText.includes('العقد')) {
    return legalFrameworks.find(f => f.country === 'UAE') || legalFrameworks[0];
  }
  
  // Fallback to user's country or default
  if (userCountry) {
    const countryFramework = legalFrameworks.find(f => f.country === userCountry);
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

export function adaptContentForJurisdiction(
  content: string, 
  framework: LegalFramework, 
  language: string
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
    },
    'ar': {
      'common_law': 'تتبع هذه الولاية القضائية القانون العام، حيث تخلق القرارات القضائية سوابق قانونية.',
      'civil_law': 'تتبع هذه الولاية القضائية القانون المدني، حيث تكون القوانين المكتوبة أساسية.',
      'islamic_law': 'تدمج هذه الولاية القضائية مبادئ الشريعة الإسلامية.',
      'hybrid': 'تجمع هذه الولاية القضائية عناصر من أنظمة قانونية مختلفة.',
      'international': 'يتبع هذا المبادئ القانونية الدولية العامة.'
    },
    'zh': {
      'common_law': '该司法管辖区遵循普通法，法院判决创造法律先例。',
      'civil_law': '该司法管辖区遵循民法，成文法典是主要依据。',
      'islamic_law': '该司法管辖区融入了伊斯兰法（伊斯兰教法）原则。',
      'hybrid': '该司法管辖区结合了不同法律体系的要素。',
      'international': '这遵循一般国际法律原则。'
    }
  };
  
  const explanations = systemExplanations[language] || systemExplanations['en'];
  const systemExplanation = explanations[framework.legal_system_type] || '';
  
  if (language === 'es') {
    return `**Nota Jurisdiccional:** ${framework.country} (${framework.region || 'Nacional'}) - ${systemExplanation}`;
  } else if (language === 'fr') {
    return `**Note Juridictionnelle:** ${framework.country} (${framework.region || 'National'}) - ${systemExplanation}`;
  } else if (language === 'ar') {
    return `**ملاحظة قضائية:** ${framework.country} (${framework.region || 'وطني'}) - ${systemExplanation}`;
  } else if (language === 'zh') {
    return `**司法管辖区说明:** ${framework.country} (${framework.region || '全国'}) - ${systemExplanation}`;
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