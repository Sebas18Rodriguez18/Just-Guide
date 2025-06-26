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

// Detectar país y jurisdicción basado en el contenido REAL del documento
function detectJurisdiction(text: string): JurisdictionInfo {
  const lowerText = text.toLowerCase();
  
  // Detectar leyes específicas mencionadas en el documento
  const detectedLaws: string[] = [];
  
  // Colombia - Detectar leyes específicas mencionadas
  if (lowerText.includes('ley 820') || lowerText.includes('ley 820 de 2003')) {
    detectedLaws.push('Ley 820 de 2003');
  }
  if (lowerText.includes('código civil colombiano') || lowerText.includes('código civil de colombia')) {
    detectedLaws.push('Código Civil Colombiano');
  }
  if (lowerText.includes('código de procedimiento civil')) {
    detectedLaws.push('Código de Procedimiento Civil');
  }
  if (lowerText.includes('código de comercio')) {
    detectedLaws.push('Código de Comercio');
  }
  if (lowerText.includes('código sustantivo del trabajo')) {
    detectedLaws.push('Código Sustantivo del Trabajo');
  }
  if (lowerText.includes('ley 1564') || lowerText.includes('código general del proceso')) {
    detectedLaws.push('Código General del Proceso');
  }
  if (lowerText.includes('decreto 1077') || lowerText.includes('decreto único reglamentario')) {
    detectedLaws.push('Decreto 1077 de 2015');
  }
  
  // Colombia - Detectar por ubicación geográfica y términos específicos
  if (lowerText.includes('bogotá d.c') || 
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
      lowerText.includes('colombiano') ||
      lowerText.includes('cédula de ciudadanía')) {
    
    // Si no se detectaron leyes específicas, agregar las más comunes para Colombia
    if (detectedLaws.length === 0) {
      if (lowerText.includes('arrendamiento') || lowerText.includes('arriendo')) {
        detectedLaws.push('Ley 820 de 2003', 'Código Civil Colombiano');
      } else if (lowerText.includes('contrato') || lowerText.includes('obligación')) {
        detectedLaws.push('Código Civil Colombiano');
      } else if (lowerText.includes('demanda') || lowerText.includes('proceso')) {
        detectedLaws.push('Código General del Proceso');
      } else if (lowerText.includes('laboral') || lowerText.includes('trabajo')) {
        detectedLaws.push('Código Sustantivo del Trabajo');
      }
    }
    
    return {
      country: 'Colombia',
      legal_system: 'civil_law',
      language: 'es',
      specific_laws: detectedLaws
    };
  }
  
  // México - Detectar leyes específicas
  const mexicanLaws: string[] = [];
  if (lowerText.includes('código civil federal')) {
    mexicanLaws.push('Código Civil Federal');
  }
  if (lowerText.includes('ley federal del trabajo')) {
    mexicanLaws.push('Ley Federal del Trabajo');
  }
  if (lowerText.includes('código de comercio')) {
    mexicanLaws.push('Código de Comercio');
  }
  if (lowerText.includes('código federal de procedimientos civiles')) {
    mexicanLaws.push('Código Federal de Procedimientos Civiles');
  }
  
  if (lowerText.includes('ciudad de méxico') ||
      lowerText.includes('cdmx') ||
      lowerText.includes('guadalajara') ||
      lowerText.includes('monterrey') ||
      lowerText.includes('puebla') ||
      lowerText.includes('tijuana') ||
      lowerText.includes('pesos mexicanos') ||
      lowerText.includes('méxico') ||
      lowerText.includes('mexicano')) {
    
    if (mexicanLaws.length === 0) {
      mexicanLaws.push('Código Civil Federal');
    }
    
    return {
      country: 'México',
      legal_system: 'civil_law',
      language: 'es',
      specific_laws: mexicanLaws
    };
  }
  
  // España - Detectar leyes específicas
  const spanishLaws: string[] = [];
  if (lowerText.includes('código civil español') || lowerText.includes('código civil')) {
    spanishLaws.push('Código Civil Español');
  }
  if (lowerText.includes('ley de arrendamientos urbanos')) {
    spanishLaws.push('Ley de Arrendamientos Urbanos');
  }
  if (lowerText.includes('ley de enjuiciamiento civil')) {
    spanishLaws.push('Ley de Enjuiciamiento Civil');
  }
  if (lowerText.includes('estatuto de los trabajadores')) {
    spanishLaws.push('Estatuto de los Trabajadores');
  }
  
  if (lowerText.includes('madrid') ||
      lowerText.includes('barcelona') ||
      lowerText.includes('valencia') ||
      lowerText.includes('sevilla') ||
      lowerText.includes('bilbao') ||
      lowerText.includes('euros') ||
      lowerText.includes('españa') ||
      lowerText.includes('español')) {
    
    if (spanishLaws.length === 0) {
      spanishLaws.push('Código Civil Español');
    }
    
    return {
      country: 'España',
      legal_system: 'civil_law',
      language: 'es',
      specific_laws: spanishLaws
    };
  }
  
  // Estados Unidos - Detectar leyes específicas
  const usLaws: string[] = [];
  if (lowerText.includes('federal civil code') || lowerText.includes('civil code')) {
    usLaws.push('Federal Civil Code');
  }
  if (lowerText.includes('uniform commercial code') || lowerText.includes('ucc')) {
    usLaws.push('Uniform Commercial Code');
  }
  if (lowerText.includes('fair housing act')) {
    usLaws.push('Fair Housing Act');
  }
  if (lowerText.includes('americans with disabilities act') || lowerText.includes('ada')) {
    usLaws.push('Americans with Disabilities Act');
  }
  if (lowerText.includes('california civil code')) {
    usLaws.push('California Civil Code');
  }
  if (lowerText.includes('new york real property law')) {
    usLaws.push('New York Real Property Law');
  }
  if (lowerText.includes('texas property code')) {
    usLaws.push('Texas Property Code');
  }
  
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
    
    if (usLaws.length === 0) {
      usLaws.push('Federal Civil Code', 'State Laws');
    }
    
    return {
      country: 'United States',
      legal_system: 'common_law',
      language: 'en',
      specific_laws: usLaws
    };
  }
  
  // Reino Unido - Detectar leyes específicas
  const ukLaws: string[] = [];
  if (lowerText.includes('english common law')) {
    ukLaws.push('English Common Law');
  }
  if (lowerText.includes('contract law')) {
    ukLaws.push('Contract Law');
  }
  if (lowerText.includes('housing act')) {
    ukLaws.push('Housing Act');
  }
  if (lowerText.includes('landlord and tenant act')) {
    ukLaws.push('Landlord and Tenant Act');
  }
  if (lowerText.includes('employment rights act')) {
    ukLaws.push('Employment Rights Act');
  }
  
  if (lowerText.includes('claimant') ||
      lowerText.includes('solicitor') ||
      lowerText.includes('barrister') ||
      lowerText.includes('london') ||
      lowerText.includes('manchester') ||
      lowerText.includes('birmingham') ||
      lowerText.includes('pounds') ||
      lowerText.includes('gbp') ||
      lowerText.includes('united kingdom')) {
    
    if (ukLaws.length === 0) {
      ukLaws.push('English Common Law', 'Contract Law');
    }
    
    return {
      country: 'United Kingdom',
      legal_system: 'common_law',
      language: 'en',
      specific_laws: ukLaws
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
function generateStepsFromContent(text: string, jurisdiction: JurisdictionInfo, userLanguage: 'es' | 'en'): string[] {
  const steps: string[] = [];
  const docInfo = extractDocumentInfo(text);
  
  // IMPORTANTE: Usar userLanguage para determinar el idioma de los pasos, NO jurisdiction.language
  const language = userLanguage;
  
  // Pasos basados en el tipo de documento detectado
  if (docInfo.type === 'rental') {
    if (language === 'es') {
      steps.push('Verificar la identidad y capacidad legal de ambas partes (arrendador y arrendatario). Asegúrate de que ambas personas sean mayores de edad y tengan la documentación necesaria para firmar el contrato.');
      
      if (docInfo.payments.length > 0) {
        const paymentInfo = docInfo.payments[0];
        steps.push(`Cumplir con los pagos establecidos: ${paymentInfo}. Es fundamental realizar todos los pagos en las fechas acordadas para evitar incumplimientos contractuales.`);
      } else {
        steps.push('Realizar los pagos del canon de arrendamiento puntualmente según lo acordado. El pago debe hacerse en la fecha establecida en el contrato para mantener una buena relación contractual.');
      }
      
      if (docInfo.dates.length > 0) {
        const dateInfo = docInfo.dates[0];
        steps.push(`Respetar los plazos establecidos: ${dateInfo}. Todas las fechas mencionadas en el contrato son vinculantes y deben cumplirse estrictamente.`);
      } else {
        steps.push('Cumplir con la duración del contrato y fechas importantes. Mantén un calendario con todas las fechas relevantes del contrato para evitar olvidos.');
      }
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 2).forEach(obligation => {
          steps.push(`Cumplir obligación específica: ${obligation}. Esta obligación es parte integral del contrato y su incumplimiento puede tener consecuencias legales.`);
        });
      }
      
      // Agregar pasos específicos basados en las leyes detectadas
      if (jurisdiction.specific_laws && jurisdiction.specific_laws.length > 0) {
        jurisdiction.specific_laws.forEach(law => {
          if (law.includes('Ley 820')) {
            steps.push('Verificar cumplimiento con la Ley 820 de 2003 para arrendamientos en Colombia. Esta ley establece los derechos y deberes tanto del arrendador como del arrendatario, incluyendo las condiciones para el reajuste del canon.');
            steps.push('Asegurar que el reajuste anual se base en el IPC certificado por el DANE. El incremento del canon no puede exceder el porcentaje de inflación oficial del año anterior.');
          } else if (law.includes('Código Civil')) {
            steps.push(`Cumplir con las disposiciones del ${law}. Este código establece las normas generales para los contratos civiles y las obligaciones de las partes.`);
          }
        });
      }
      
      if (docInfo.termination.length > 0) {
        const terminationInfo = docInfo.termination[0];
        steps.push(`Procedimiento de terminación: ${terminationInfo}. Es importante conocer las condiciones bajo las cuales el contrato puede terminarse para evitar problemas legales.`);
      }
    } else {
      steps.push('Verify the identity and legal capacity of both parties (landlord and tenant). Ensure both individuals are of legal age and have the necessary documentation to sign the contract.');
      
      if (docInfo.payments.length > 0) {
        const paymentInfo = docInfo.payments[0];
        steps.push(`Comply with established payments: ${paymentInfo}. It is essential to make all payments on the agreed dates to avoid contractual breaches.`);
      } else {
        steps.push('Make rental payments punctually as agreed. Payment must be made on the date established in the contract to maintain a good contractual relationship.');
      }
      
      if (docInfo.dates.length > 0) {
        const dateInfo = docInfo.dates[0];
        steps.push(`Respect established deadlines: ${dateInfo}. All dates mentioned in the contract are binding and must be strictly complied with.`);
      } else {
        steps.push('Comply with contract duration and important dates. Keep a calendar with all relevant contract dates to avoid oversights.');
      }
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 2).forEach(obligation => {
          steps.push(`Fulfill specific obligation: ${obligation}. This obligation is an integral part of the contract and non-compliance may have legal consequences.`);
        });
      }
      
      // Agregar pasos específicos basados en las leyes detectadas
      if (jurisdiction.specific_laws && jurisdiction.specific_laws.length > 0) {
        jurisdiction.specific_laws.forEach(law => {
          if (law.includes('Fair Housing Act')) {
            steps.push('Verify compliance with Fair Housing Act regulations. This act prohibits discrimination in housing based on race, color, religion, sex, national origin, familial status, or disability.');
          } else if (law.includes('State Laws')) {
            steps.push('Ensure security deposit complies with state regulations. Each state has specific laws regarding the amount, handling, and return of security deposits.');
          }
        });
      }
    }
  } else if (docInfo.type === 'sale') {
    if (language === 'es') {
      steps.push('Verificar la titularidad y capacidad legal de las partes. Es fundamental confirmar que el vendedor sea el propietario legítimo del bien y que ambas partes tengan capacidad legal para contratar.');
      
      if (docInfo.payments.length > 0) {
        const paymentInfo = docInfo.payments[0];
        steps.push(`Realizar el pago según lo acordado: ${paymentInfo}. El pago debe realizarse en la forma y plazos establecidos en el contrato para completar la transacción.`);
      }
      
      steps.push('Verificar que el bien esté libre de gravámenes y cargas. Solicitar un certificado de libertad y tradición actualizado para confirmar que no existen deudas o limitaciones sobre la propiedad.');
      steps.push('Realizar la transferencia de propiedad ante notario público. Este paso es esencial para que la venta sea legalmente válida y el nuevo propietario quede debidamente registrado.');
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 2).forEach(obligation => {
          steps.push(`Cumplir obligación específica: ${obligation}. Esta obligación debe ser cumplida para completar exitosamente la transacción de compraventa.`);
        });
      }
    } else {
      steps.push('Verify ownership and legal capacity of the parties. It is essential to confirm that the seller is the legitimate owner of the property and that both parties have legal capacity to contract.');
      
      if (docInfo.payments.length > 0) {
        const paymentInfo = docInfo.payments[0];
        steps.push(`Make payment as agreed: ${paymentInfo}. Payment must be made in the manner and timeframes established in the contract to complete the transaction.`);
      }
      
      steps.push('Verify that the property is free of liens and encumbrances. Request an updated title report to confirm there are no debts or limitations on the property.');
      steps.push('Complete property transfer before a notary public. This step is essential for the sale to be legally valid and for the new owner to be properly registered.');
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 2).forEach(obligation => {
          steps.push(`Fulfill specific obligation: ${obligation}. This obligation must be met to successfully complete the purchase and sale transaction.`);
        });
      }
    }
  } else if (docInfo.type === 'employment') {
    if (language === 'es') {
      steps.push('Verificar que el contrato cumpla con la legislación laboral aplicable. El contrato debe incluir todas las cláusulas mínimas requeridas por la ley laboral del país correspondiente.');
      
      if (docInfo.payments.length > 0) {
        const paymentInfo = docInfo.payments[0];
        steps.push(`Cumplir con la remuneración acordada: ${paymentInfo}. El salario debe pagarse en los períodos establecidos y cumplir con el salario mínimo legal vigente.`);
      }
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 3).forEach(obligation => {
          steps.push(`Obligación laboral específica: ${obligation}. Esta obligación forma parte de las responsabilidades del empleado o empleador según corresponda.`);
        });
      }
      
      steps.push('Cumplir con horarios, funciones y responsabilidades establecidas. Es importante mantener un registro de cumplimiento para evitar conflictos laborales.');
      steps.push('Respetar las políticas de la empresa y código de conducta. El incumplimiento de estas normas puede resultar en medidas disciplinarias o terminación del contrato.');
    } else {
      steps.push('Verify that the contract complies with applicable labor legislation. The contract must include all minimum clauses required by the labor law of the corresponding country.');
      
      if (docInfo.payments.length > 0) {
        const paymentInfo = docInfo.payments[0];
        steps.push(`Comply with agreed compensation: ${paymentInfo}. Salary must be paid in the established periods and comply with the current legal minimum wage.`);
      }
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 3).forEach(obligation => {
          steps.push(`Specific employment obligation: ${obligation}. This obligation is part of the employee's or employer's responsibilities as applicable.`);
        });
      }
      
      steps.push('Comply with established schedules, functions and responsibilities. It is important to maintain a compliance record to avoid labor conflicts.');
      steps.push('Respect company policies and code of conduct. Non-compliance with these standards may result in disciplinary measures or contract termination.');
    }
  } else {
    // Documento general - extraer pasos del contenido
    if (language === 'es') {
      steps.push('Verificar que todas las partes tengan capacidad legal para contratar. Confirmar que todos los firmantes sean mayores de edad y tengan la autoridad necesaria para comprometerse legalmente.');
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 4).forEach(obligation => {
          const cleanObligation = obligation.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanObligation.length > 20) {
            steps.push(`Obligación contractual: ${cleanObligation}. Esta obligación debe cumplirse según los términos y condiciones establecidos en el documento.`);
          }
        });
      }
      
      if (docInfo.payments.length > 0) {
        docInfo.payments.forEach(payment => {
          const cleanPayment = payment.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanPayment.length > 20) {
            steps.push(`Pago requerido: ${cleanPayment}. Este pago debe realizarse en la forma y plazos especificados para cumplir con las obligaciones contractuales.`);
          }
        });
      }
      
      if (docInfo.dates.length > 0) {
        docInfo.dates.forEach(date => {
          const cleanDate = date.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanDate.length > 20) {
            steps.push(`Fecha importante: ${cleanDate}. Esta fecha debe ser respetada estrictamente para evitar incumplimientos contractuales.`);
          }
        });
      }
      
      if (docInfo.penalties.length > 0) {
        docInfo.penalties.forEach(penalty => {
          const cleanPenalty = penalty.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanPenalty.length > 20) {
            steps.push(`Evitar penalización: ${cleanPenalty}. Es importante conocer las consecuencias del incumplimiento para tomar las medidas preventivas necesarias.`);
          }
        });
      }
      
      steps.push('Mantener copias de todos los documentos y comprobantes relacionados. Guardar evidencia de cumplimiento de obligaciones y pagos realizados para futuras referencias.');
      steps.push('Consultar con un abogado en caso de dudas sobre interpretación. Si hay aspectos del contrato que no están claros, es recomendable buscar asesoría legal profesional.');
    } else {
      steps.push('Verify that all parties have legal capacity to contract. Confirm that all signatories are of legal age and have the necessary authority to legally commit themselves.');
      
      if (docInfo.obligations.length > 0) {
        docInfo.obligations.slice(0, 4).forEach(obligation => {
          const cleanObligation = obligation.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanObligation.length > 20) {
            steps.push(`Contractual obligation: ${cleanObligation}. This obligation must be fulfilled according to the terms and conditions established in the document.`);
          }
        });
      }
      
      if (docInfo.payments.length > 0) {
        docInfo.payments.forEach(payment => {
          const cleanPayment = payment.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanPayment.length > 20) {
            steps.push(`Required payment: ${cleanPayment}. This payment must be made in the manner and timeframes specified to fulfill contractual obligations.`);
          }
        });
      }
      
      if (docInfo.dates.length > 0) {
        docInfo.dates.forEach(date => {
          const cleanDate = date.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanDate.length > 20) {
            steps.push(`Important date: ${cleanDate}. This date must be strictly respected to avoid contractual breaches.`);
          }
        });
      }
      
      if (docInfo.penalties.length > 0) {
        docInfo.penalties.forEach(penalty => {
          const cleanPenalty = penalty.replace(/^[-–•\d.\s]+/, '').trim();
          if (cleanPenalty.length > 20) {
            steps.push(`Avoid penalty: ${cleanPenalty}. It is important to know the consequences of non-compliance to take necessary preventive measures.`);
          }
        });
      }
      
      steps.push('Keep copies of all related documents and receipts. Store evidence of obligation compliance and payments made for future reference.');
      steps.push('Consult with a lawyer in case of interpretation doubts. If there are aspects of the contract that are not clear, it is advisable to seek professional legal advice.');
    }
  }
  
  return steps.filter(step => step.length > 10).slice(0, 8); // Máximo 8 pasos
}

// Función principal para generar guía paso a paso
export async function generateStepByStepGuide(text: string, userLanguage: 'es' | 'en'): Promise<StepByStepGuide> {
  try {
    if (!text || text.trim().length < 50) {
      throw new Error('El texto del documento es demasiado corto para generar una guía');
    }

    // Detectar jurisdicción basada en el contenido REAL del documento
    const jurisdiction = detectJurisdiction(text);
    
    // CRÍTICO: Generar pasos en el idioma del USUARIO, no del documento
    const steps = generateStepsFromContent(text, jurisdiction, userLanguage);
    
    // Generar resumen basado en el contenido EN EL IDIOMA DEL USUARIO
    let summary = '';
    const docInfo = extractDocumentInfo(text);
    
    if (userLanguage === 'es') {
      summary = `Guía paso a paso para cumplir con este documento legal de tipo ${docInfo.type}. `;
      summary += `Detectado en ${jurisdiction.country} bajo el sistema de ${jurisdiction.legal_system}. `;
      summary += `Sigue estos ${steps.length} pasos para asegurar el cumplimiento legal completo.`;
    } else {
      summary = `Step-by-step guide to comply with this ${docInfo.type} legal document. `;
      summary += `Detected in ${jurisdiction.country} under ${jurisdiction.legal_system} system. `;
      summary += `Follow these ${steps.length} steps to ensure complete legal compliance.`;
    }
    
    // Marco legal específico basado en las leyes REALMENTE detectadas en el documento
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
    
    // Fallback en caso de error EN EL IDIOMA CORRECTO
    const fallbackSteps = userLanguage === 'es' ? [
      'Leer el documento completo cuidadosamente para entender todos los términos y condiciones establecidos.',
      'Identificar las partes involucradas y sus obligaciones específicas según lo establecido en el contrato.',
      'Verificar fechas importantes y plazos de cumplimiento para evitar incumplimientos contractuales.',
      'Cumplir con los pagos y obligaciones acordadas en los términos y condiciones especificados.',
      'Mantener registros detallados de todas las transacciones y comunicaciones relacionadas con el contrato.',
      'Consultar con un abogado especializado en caso de dudas sobre interpretación o cumplimiento de cláusulas.'
    ] : [
      'Read the complete document carefully to understand all established terms and conditions.',
      'Identify the parties involved and their specific obligations as established in the contract.',
      'Verify important dates and compliance deadlines to avoid contractual breaches.',
      'Fulfill agreed payments and obligations under the specified terms and conditions.',
      'Keep detailed records of all transactions and communications related to the contract.',
      'Consult with a specialized lawyer in case of doubts about interpretation or clause compliance.'
    ];
    
    return {
      steps: fallbackSteps,
      summary: userLanguage === 'es' 
        ? 'Guía básica para documentos legales basada en principios generales de cumplimiento contractual'
        : 'Basic guide for legal documents based on general principles of contractual compliance',
      reading_level: 'B1',
      jurisdiction: 'General',
      legal_framework: 'General Legal Principles'
    };
  }
}