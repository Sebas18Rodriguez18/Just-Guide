// src/utils/guideGenerator.ts

export interface StepByStepGuide {
  steps: string[];
  summary: string;
  reading_level: string;
  jurisdiction?: string;
  legal_framework?: string;
}

interface JurisdictionInfo {
  country: string;
  legal_system: 'civil_law' | 'common_law' | 'mixed';
  language: 'es' | 'en';
  specific_laws?: string[];
}

// Detectar país y jurisdicción basado en el contenido del documento
function detectJurisdiction(text: string): JurisdictionInfo {
  const lowerText = text.toLowerCase();
  
  // Colombia - Sistema de derecho civil
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
      lowerText.includes('dane') ||
      lowerText.includes('ipc') ||
      lowerText.includes('colombia') ||
      lowerText.includes('colombiano')) {
    return {
      country: 'Colombia',
      legal_system: 'civil_law',
      language: 'es',
      specific_laws: ['Ley 820 de 2003', 'Código Civil Colombiano', 'Código de Procedimiento Civil']
    };
  }
  
  // México - Sistema de derecho civil
  if (lowerText.includes('ciudad de méxico') ||
      lowerText.includes('cdmx') ||
      lowerText.includes('guadalajara') ||
      lowerText.includes('monterrey') ||
      lowerText.includes('puebla') ||
      lowerText.includes('tijuana') ||
      lowerText.includes('pesos mexicanos') ||
      lowerText.includes('méxico') ||
      lowerText.includes('mexicano')) {
    return {
      country: 'México',
      legal_system: 'civil_law',
      language: 'es',
      specific_laws: ['Código Civil Federal', 'Ley Federal del Trabajo']
    };
  }
  
  // España - Sistema de derecho civil
  if (lowerText.includes('madrid') ||
      lowerText.includes('barcelona') ||
      lowerText.includes('valencia') ||
      lowerText.includes('sevilla') ||
      lowerText.includes('bilbao') ||
      lowerText.includes('euros') ||
      lowerText.includes('españa') ||
      lowerText.includes('español')) {
    return {
      country: 'España',
      legal_system: 'civil_law',
      language: 'es',
      specific_laws: ['Código Civil Español', 'Ley de Arrendamientos Urbanos']
    };
  }
  
  // Estados Unidos - Sistema de common law
  if (lowerText.includes('plaintiff') || 
      lowerText.includes('defendant') || 
      lowerText.includes('discovery') ||
      lowerText.includes('new york') ||
      lowerText.includes('california') ||
      lowerText.includes('texas') ||
      lowerText.includes('florida') ||
      lowerText.includes('dollars') ||
      lowerText.includes('united states') ||
      lowerText.includes('usd')) {
    return {
      country: 'United States',
      legal_system: 'common_law',
      language: 'en',
      specific_laws: ['Federal Civil Code', 'State Laws']
    };
  }
  
  // Reino Unido - Sistema de common law
  if (lowerText.includes('claimant') ||
      lowerText.includes('solicitor') ||
      lowerText.includes('barrister') ||
      lowerText.includes('london') ||
      lowerText.includes('manchester') ||
      lowerText.includes('birmingham') ||
      lowerText.includes('pounds') ||
      lowerText.includes('gbp') ||
      lowerText.includes('united kingdom')) {
    return {
      country: 'United Kingdom',
      legal_system: 'common_law',
      language: 'en',
      specific_laws: ['English Common Law', 'Contract Law']
    };
  }
  
  // Determinar por idioma si no se detecta país específico
  const spanishWords = ['el', 'la', 'de', 'que', 'y', 'contrato', 'arrendamiento', 'obligación'];
  const englishWords = ['the', 'of', 'and', 'contract', 'lease', 'obligation'];
  
  const words = lowerText.split(/\s+/).slice(0, 50);
  const spanishCount = words.filter(w => spanishWords.includes(w)).length;
  const englishCount = words.filter(w => englishWords.includes(w)).length;
  
  if (spanishCount > englishCount) {
    return {
      country: 'Latinoamérica',
      legal_system: 'civil_law',
      language: 'es',
      specific_laws: ['Código Civil', 'Derecho Civil']
    };
  } else {
    return {
      country: 'International',
      legal_system: 'common_law',
      language: 'en',
      specific_laws: ['Contract Law', 'Civil Law']
    };
  }
}

// Extraer información específica del documento
function extractDocumentInfo(text: string) {
  const info = {
    parties: [] as string[],
    obligations: [] as string[],
    payments: [] as string[],
    dates: [] as string[],
    penalties: [] as string[],
    termination: [] as string[],
    type: 'general'
  };

  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  
  // Detectar tipo de documento
  if (text.toLowerCase().includes('arrendamiento') || text.toLowerCase().includes('lease')) {
    info.type = 'rental';
  } else if (text.toLowerCase().includes('compraventa') || text.toLowerCase().includes('purchase')) {
    info.type = 'sale';
  } else if (text.toLowerCase().includes('laboral') || text.toLowerCase().includes('employment')) {
    info.type = 'employment';
  } else if (text.toLowerCase().includes('demanda') || text.toLowerCase().includes('lawsuit')) {
    info.type = 'lawsuit';
  }

  // Extraer partes involucradas
  const partyPatterns = [
    /(?:arrendador|landlord|demandante|plaintiff|comprador|buyer|empleador|employer):\s*([^,\n.]+)/gi,
    /(?:arrendatario|tenant|demandado|defendant|vendedor|seller|empleado|employee):\s*([^,\n.]+)/gi
  ];
  
  partyPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      info.parties.push(match[1].trim());
    }
  });

  // Extraer obligaciones
  const obligationKeywords = ['deberá', 'debe', 'obligación', 'responsabilidad', 'shall', 'must', 'obligation', 'responsibility'];
  info.obligations = sentences.filter(s => 
    obligationKeywords.some(keyword => s.toLowerCase().includes(keyword))
  ).slice(0, 5);

  // Extraer información de pagos
  const paymentKeywords = ['pagar', 'canon', 'precio', 'valor', 'suma', 'pay', 'rent', 'price', 'amount'];
  info.payments = sentences.filter(s => 
    paymentKeywords.some(keyword => s.toLowerCase().includes(keyword))
  ).slice(0, 3);

  // Extraer fechas y plazos
  const dateKeywords = ['plazo', 'fecha', 'duración', 'término', 'vencimiento', 'term', 'date', 'duration', 'deadline'];
  info.dates = sentences.filter(s => 
    dateKeywords.some(keyword => s.toLowerCase().includes(keyword))
  ).slice(0, 3);

  // Extraer información sobre penalizaciones
  const penaltyKeywords = ['multa', 'sanción', 'penalización', 'incumplimiento', 'penalty', 'fine', 'breach', 'violation'];
  info.penalties = sentences.filter(s => 
    penaltyKeywords.some(keyword => s.toLowerCase().includes(keyword))
  ).slice(0, 2);

  // Extraer información sobre terminación
  const terminationKeywords = ['terminación', 'rescisión', 'finalización', 'termination', 'cancellation', 'expiration'];
  info.termination = sentences.filter(s => 
    terminationKeywords.some(keyword => s.toLowerCase().includes(keyword))
  ).slice(0, 2);

  return info;
}

// Generar pasos específicos basados en el contenido real del documento
function generateStepsFromContent(text: string, jurisdiction: JurisdictionInfo, language: 'es' | 'en'): string[] {
  const steps: string[] = [];
  const docInfo = extractDocumentInfo(text);
  
  // Pasos basados en el tipo de documento detectado
  if (docInfo.type === 'rental') {
    if (language === 'es') {
      steps.push('Verificar la identidad y capacidad legal de ambas partes (arrendador y arrendatario)');
      
      if (docInfo.payments.length > 0) {
        const paymentInfo = docInfo.payments[0].substring(0, 100);
        steps.push(`Cumplir con los pagos establecidos: ${paymentInfo}...`);
      } else {
        steps.push('Realizar los pagos del canon de arrendamiento puntualmente según lo acordado');
      }
      
      if (docInfo.dates.length > 0) {
        const dateInfo = docInfo.dates[0].substring(0, 100);
        steps.push(`Respetar los plazos establecidos: ${dateInfo}...`);
      } else {
        steps.push('Cumplir con la duración del contrato y fechas importantes');
      }
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 2).forEach(obligation => {
          steps.push(`Cumplir obligación: ${obligation.substring(0, 120)}...`);
        });
      }
      
      if (jurisdiction.country === 'Colombia') {
        steps.push('Verificar cumplimiento con la Ley 820 de 2003 para arrendamientos en Colombia');
        steps.push('Asegurar que el reajuste anual se base en el IPC certificado por el DANE');
      }
      
      if (docInfo.termination.length > 0) {
        const terminationInfo = docInfo.termination[0].substring(0, 100);
        steps.push(`Procedimiento de terminación: ${terminationInfo}...`);
      }
    } else {
      steps.push('Verify the identity and legal capacity of both parties (landlord and tenant)');
      
      if (docInfo.payments.length > 0) {
        const paymentInfo = docInfo.payments[0].substring(0, 100);
        steps.push(`Comply with established payments: ${paymentInfo}...`);
      } else {
        steps.push('Make rental payments punctually as agreed');
      }
      
      if (docInfo.dates.length > 0) {
        const dateInfo = docInfo.dates[0].substring(0, 100);
        steps.push(`Respect established deadlines: ${dateInfo}...`);
      } else {
        steps.push('Comply with contract duration and important dates');
      }
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 2).forEach(obligation => {
          steps.push(`Fulfill obligation: ${obligation.substring(0, 120)}...`);
        });
      }
      
      if (jurisdiction.country === 'United States') {
        steps.push('Verify compliance with federal and state housing laws');
        steps.push('Ensure security deposit complies with state regulations');
      }
    }
  } else if (docInfo.type === 'sale') {
    if (language === 'es') {
      steps.push('Verificar la titularidad y capacidad legal de las partes');
      
      if (docInfo.payments.length > 0) {
        const paymentInfo = docInfo.payments[0].substring(0, 100);
        steps.push(`Realizar el pago según lo acordado: ${paymentInfo}...`);
      }
      
      steps.push('Verificar que el bien esté libre de gravámenes y cargas');
      steps.push('Realizar la transferencia de propiedad ante notario público');
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 2).forEach(obligation => {
          steps.push(`Cumplir: ${obligation.substring(0, 120)}...`);
        });
      }
    } else {
      steps.push('Verify ownership and legal capacity of the parties');
      
      if (docInfo.payments.length > 0) {
        const paymentInfo = docInfo.payments[0].substring(0, 100);
        steps.push(`Make payment as agreed: ${paymentInfo}...`);
      }
      
      steps.push('Verify that the property is free of liens and encumbrances');
      steps.push('Complete property transfer before a notary public');
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 2).forEach(obligation => {
          steps.push(`Fulfill: ${obligation.substring(0, 120)}...`);
        });
      }
    }
  } else if (docInfo.type === 'employment') {
    if (language === 'es') {
      steps.push('Verificar que el contrato cumpla con la legislación laboral aplicable');
      
      if (docInfo.payments.length > 0) {
        const paymentInfo = docInfo.payments[0].substring(0, 100);
        steps.push(`Cumplir con la remuneración acordada: ${paymentInfo}...`);
      }
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 3).forEach(obligation => {
          steps.push(`Obligación laboral: ${obligation.substring(0, 120)}...`);
        });
      }
      
      steps.push('Cumplir con horarios, funciones y responsabilidades establecidas');
      steps.push('Respetar las políticas de la empresa y código de conducta');
    } else {
      steps.push('Verify that the contract complies with applicable labor legislation');
      
      if (docInfo.payments.length > 0) {
        const paymentInfo = docInfo.payments[0].substring(0, 100);
        steps.push(`Comply with agreed compensation: ${paymentInfo}...`);
      }
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 3).forEach(obligation => {
          steps.push(`Employment obligation: ${obligation.substring(0, 120)}...`);
        });
      }
      
      steps.push('Comply with established schedules, functions and responsibilities');
      steps.push('Respect company policies and code of conduct');
    }
  } else {
    // Documento general - extraer pasos del contenido
    if (language === 'es') {
      steps.push('Verificar que todas las partes tengan capacidad legal para contratar');
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 4).forEach(obligation => {
          const cleanObligation = obligation.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanObligation.length > 20) {
            steps.push(`${cleanObligation.substring(0, 150)}...`);
          }
        });
      }
      
      if (docInfo.payments.length > 0) {
        docInfo.payments.forEach(payment => {
          const cleanPayment = payment.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanPayment.length > 20) {
            steps.push(`Pago requerido: ${cleanPayment.substring(0, 120)}...`);
          }
        });
      }
      
      if (docInfo.dates.length > 0) {
        docInfo.dates.forEach(date => {
          const cleanDate = date.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanDate.length > 20) {
            steps.push(`Fecha importante: ${cleanDate.substring(0, 120)}...`);
          }
        });
      }
      
      if (docInfo.penalties.length > 0) {
        docInfo.penalties.forEach(penalty => {
          const cleanPenalty = penalty.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanPenalty.length > 20) {
            steps.push(`Evitar penalización: ${cleanPenalty.substring(0, 120)}...`);
          }
        });
      }
      
      steps.push('Mantener copias de todos los documentos y comprobantes relacionados');
      steps.push('Consultar con un abogado en caso de dudas sobre interpretación');
    } else {
      steps.push('Verify that all parties have legal capacity to contract');
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 4).forEach(obligation => {
          const cleanObligation = obligation.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanObligation.length > 20) {
            steps.push(`${cleanObligation.substring(0, 150)}...`);
          }
        });
      }
      
      if (docInfo.payments.length > 0) {
        docInfo.payments.forEach(payment => {
          const cleanPayment = payment.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanPayment.length > 20) {
            steps.push(`Required payment: ${cleanPayment.substring(0, 120)}...`);
          }
        });
      }
      
      if (docInfo.dates.length > 0) {
        docInfo.dates.forEach(date => {
          const cleanDate = date.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanDate.length > 20) {
            steps.push(`Important date: ${cleanDate.substring(0, 120)}...`);
          }
        });
      }
      
      if (docInfo.penalties.length > 0) {
        docInfo.penalties.forEach(penalty => {
          const cleanPenalty = penalty.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanPenalty.length > 20) {
            steps.push(`Avoid penalty: ${cleanPenalty.substring(0, 120)}...`);
          }
        });
      }
      
      steps.push('Keep copies of all related documents and receipts');
      steps.push('Consult with a lawyer in case of interpretation doubts');
    }
  }
  
  // Agregar pasos específicos de jurisdicción
  if (jurisdiction.specific_laws && jurisdiction.specific_laws.length > 0) {
    const lawsText = jurisdiction.specific_laws.join(', ');
    if (language === 'es') {
      steps.push(`Verificar cumplimiento con: ${lawsText}`);
    } else {
      steps.push(`Verify compliance with: ${lawsText}`);
    }
  }
  
  return steps.filter(step => step.length > 10).slice(0, 8); // Máximo 8 pasos
}

// Función principal para generar guía paso a paso
export async function generateStepByStepGuide(text: string, language: 'es' | 'en'): Promise<StepByStepGuide> {
  try {
    if (!text || text.trim().length < 50) {
      throw new Error('El texto del documento es demasiado corto para generar una guía');
    }

    // Detectar jurisdicción
    const jurisdiction = detectJurisdiction(text);
    
    // Generar pasos basados en el contenido real del documento
    const steps = generateStepsFromContent(text, jurisdiction, language);
    
    // Generar resumen basado en el contenido
    let summary = '';
    const docInfo = extractDocumentInfo(text);
    
    if (language === 'es') {
      summary = `Guía paso a paso para cumplir con este documento legal de tipo ${docInfo.type}. `;
      summary += `Detectado en ${jurisdiction.country} bajo el sistema de ${jurisdiction.legal_system}. `;
      summary += `Sigue estos ${steps.length} pasos para asegurar el cumplimiento legal.`;
    } else {
      summary = `Step-by-step guide to comply with this ${docInfo.type} legal document. `;
      summary += `Detected in ${jurisdiction.country} under ${jurisdiction.legal_system} system. `;
      summary += `Follow these ${steps.length} steps to ensure legal compliance.`;
    }
    
    // Marco legal específico
    let legalFramework = '';
    if (jurisdiction.specific_laws && jurisdiction.specific_laws.length > 0) {
      legalFramework = `${jurisdiction.country} - ${jurisdiction.specific_laws.join(', ')}`;
    } else {
      legalFramework = `${jurisdiction.country} - ${jurisdiction.legal_system}`;
    }
    
    return {
      steps,
      summary,
      reading_level: 'B1',
      jurisdiction: jurisdiction.country,
      legal_framework: legalFramework
    };
    
  } catch (error) {
    console.error('Error generating step-by-step guide:', error);
    
    // Fallback en caso de error
    const fallbackSteps = language === 'es' ? [
      'Leer el documento completo cuidadosamente',
      'Identificar las partes involucradas y sus obligaciones',
      'Verificar fechas importantes y plazos de cumplimiento',
      'Cumplir con los pagos y obligaciones acordadas',
      'Mantener registros de todas las transacciones',
      'Consultar con un abogado en caso de dudas'
    ] : [
      'Read the complete document carefully',
      'Identify the parties involved and their obligations',
      'Verify important dates and compliance deadlines',
      'Fulfill agreed payments and obligations',
      'Keep records of all transactions',
      'Consult with a lawyer in case of doubts'
    ];
    
    return {
      steps: fallbackSteps,
      summary: language === 'es' 
        ? 'Guía básica para documentos legales basada en principios generales'
        : 'Basic guide for legal documents based on general principles',
      reading_level: 'B1',
      jurisdiction: 'General',
      legal_framework: 'General Legal Principles'
    };
  }
}