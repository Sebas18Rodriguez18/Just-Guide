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

// Generar pasos específicos para Colombia
function generateColombianSteps(text: string): string[] {
  const steps: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Pasos para contratos de arrendamiento en Colombia
  if (lowerText.includes('arrendamiento') || lowerText.includes('arriendo')) {
    steps.push('Verificar que el contrato cumpla con la Ley 820 de 2003 que regula los arrendamientos en Colombia');
    steps.push('Confirmar que el canon de arrendamiento no exceda los límites legales y que el reajuste anual se base en el IPC certificado por el DANE');
    steps.push('Asegurar que el depósito en dinero no supere el equivalente a dos (2) meses de canon de arrendamiento');
    steps.push('Verificar que el inmueble se entregue en condiciones de habitabilidad según el Código Civil Colombiano');
    steps.push('Cumplir puntualmente con el pago del canon dentro de los primeros cinco (5) días de cada mes');
    steps.push('Usar el inmueble exclusivamente para vivienda urbana y no subarrendar sin autorización escrita');
    steps.push('En caso de terminación del contrato, seguir el procedimiento establecido en el artículo 22 de la Ley 820 de 2003');
  }
  
  // Pasos para contratos generales en Colombia
  else if (lowerText.includes('contrato')) {
    steps.push('Verificar que todas las partes sean mayores de edad y estén debidamente identificadas con cédula de ciudadanía');
    steps.push('Confirmar que el objeto del contrato sea lícito y esté claramente definido según el Código Civil Colombiano');
    steps.push('Cumplir con todas las obligaciones establecidas en las cláusulas del contrato');
    steps.push('Realizar los pagos en las fechas acordadas y conservar los comprobantes de pago');
    steps.push('En caso de incumplimiento, seguir el procedimiento legal establecido en el Código de Procedimiento Civil');
    steps.push('Consultar con un abogado si surgen dudas sobre la interpretación del contrato');
  }
  
  // Pasos para demandas civiles en Colombia
  else if (lowerText.includes('demanda') || lowerText.includes('civil')) {
    steps.push('Presentar la demanda ante el juez competente según la cuantía y la materia');
    steps.push('Adjuntar todas las pruebas documentales que soporten las pretensiones');
    steps.push('Notificar debidamente a la parte demandada según el Código de Procedimiento Civil');
    steps.push('Comparecer a todas las audiencias programadas por el juzgado');
    steps.push('Cumplir con los términos procesales establecidos por la ley colombiana');
    steps.push('En caso de sentencia favorable, iniciar el proceso de ejecución si es necesario');
  }
  
  // Pasos generales para documentos legales colombianos
  else {
    steps.push('Verificar que el documento cumpla con los requisitos legales establecidos en la legislación colombiana');
    steps.push('Confirmar que todas las partes involucradas tengan capacidad legal para contratar');
    steps.push('Cumplir con las obligaciones específicas establecidas en el documento');
    steps.push('Mantener copias del documento y todos los comprobantes relacionados');
    steps.push('Consultar con un profesional del derecho en caso de dudas o conflictos');
  }
  
  return steps;
}

// Generar pasos específicos para Estados Unidos
function generateUSSteps(text: string): string[] {
  const steps: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Pasos para contratos de arrendamiento en EE.UU.
  if (lowerText.includes('lease') || lowerText.includes('rental')) {
    steps.push('Review the lease agreement to ensure compliance with federal and state housing laws');
    steps.push('Verify that the security deposit does not exceed state-mandated limits');
    steps.push('Ensure the property meets habitability standards required by local housing codes');
    steps.push('Pay rent on time according to the lease terms to avoid late fees or eviction');
    steps.push('Document any property damage or maintenance issues in writing');
    steps.push('Provide proper notice before terminating the lease as required by state law');
    steps.push('Understand your rights as a tenant under federal and state tenant protection laws');
  }
  
  // Pasos para contratos generales en EE.UU.
  else if (lowerText.includes('contract') || lowerText.includes('agreement')) {
    steps.push('Ensure all parties have legal capacity to enter into the contract');
    steps.push('Verify that the contract terms are clear, specific, and legally enforceable');
    steps.push('Perform all obligations as specified in the contract terms');
    steps.push('Maintain detailed records of all payments and contract performance');
    steps.push('Follow dispute resolution procedures outlined in the contract');
    steps.push('Consult with a qualified attorney if contract interpretation issues arise');
  }
  
  // Pasos para demandas civiles en EE.UU.
  else if (lowerText.includes('lawsuit') || lowerText.includes('plaintiff') || lowerText.includes('defendant')) {
    steps.push('File the complaint in the appropriate court with proper jurisdiction');
    steps.push('Serve the defendant according to federal and state service of process rules');
    steps.push('Respond to discovery requests within the time limits set by court rules');
    steps.push('Attend all scheduled court hearings and depositions');
    steps.push('Comply with all court orders and procedural deadlines');
    steps.push('Consider settlement negotiations before trial to resolve the dispute');
  }
  
  // Pasos generales para documentos legales en EE.UU.
  else {
    steps.push('Verify that the document complies with applicable federal and state laws');
    steps.push('Ensure all required signatures and notarizations are properly completed');
    steps.push('Fulfill all obligations and responsibilities outlined in the document');
    steps.push('Keep detailed records and copies of all related documentation');
    steps.push('Seek legal counsel if you have questions about your rights or obligations');
  }
  
  return steps;
}

// Generar pasos específicos para México
function generateMexicanSteps(text: string): string[] {
  const steps: string[] = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('arrendamiento') || lowerText.includes('renta')) {
    steps.push('Verificar que el contrato cumpla con las disposiciones del Código Civil Federal mexicano');
    steps.push('Confirmar que la renta mensual esté dentro de los parámetros del mercado local');
    steps.push('Asegurar que el depósito de garantía no exceda dos meses de renta');
    steps.push('Verificar que el inmueble cuente con los servicios básicos y esté en condiciones habitables');
    steps.push('Realizar los pagos de renta puntualmente según lo acordado en el contrato');
    steps.push('Registrar el contrato ante las autoridades fiscales mexicanas si es requerido');
    steps.push('En caso de terminación, dar el aviso correspondiente según la ley mexicana');
  } else {
    steps.push('Verificar que el documento cumpla con la legislación mexicana aplicable');
    steps.push('Confirmar que todas las partes tengan capacidad legal según el derecho mexicano');
    steps.push('Cumplir con las obligaciones establecidas en el documento');
    steps.push('Mantener registros adecuados para efectos fiscales y legales');
    steps.push('Consultar con un abogado mexicano en caso de dudas legales');
  }
  
  return steps;
}

// Generar pasos específicos para España
function generateSpanishSteps(text: string): string[] {
  const steps: string[] = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('arrendamiento') || lowerText.includes('alquiler')) {
    steps.push('Verificar que el contrato cumpla con la Ley de Arrendamientos Urbanos española');
    steps.push('Confirmar que la renta esté dentro de los límites establecidos por la normativa autonómica');
    steps.push('Asegurar que la fianza no supere dos mensualidades según la ley española');
    steps.push('Verificar que el inmueble cumpla con los estándares de habitabilidad europeos');
    steps.push('Realizar los pagos según lo establecido en el contrato y la legislación española');
    steps.push('Cumplir con las obligaciones fiscales ante la Agencia Tributaria española');
    steps.push('En caso de conflicto, seguir los procedimientos establecidos en la legislación española');
  } else {
    steps.push('Verificar que el documento cumpla con el ordenamiento jurídico español');
    steps.push('Confirmar que todas las partes tengan capacidad según el Código Civil español');
    steps.push('Cumplir con las obligaciones establecidas en el documento');
    steps.push('Mantener registros para efectos fiscales y legales en España');
    steps.push('Consultar con un abogado español especializado en caso de dudas');
  }
  
  return steps;
}

// Función principal para generar guía paso a paso
export async function generateStepByStepGuide(text: string, language: 'es' | 'en'): Promise<StepByStepGuide> {
  try {
    // Detectar jurisdicción
    const jurisdiction = detectJurisdiction(text);
    
    let steps: string[] = [];
    let summary = '';
    let legalFramework = '';
    
    // Generar pasos específicos según el país detectado
    switch (jurisdiction.country) {
      case 'Colombia':
        steps = generateColombianSteps(text);
        summary = language === 'es' 
          ? 'Guía paso a paso para cumplir con la legislación colombiana. Sigue estos pasos para asegurar el cumplimiento legal según la Ley 820 de 2003 y el Código Civil Colombiano.'
          : 'Step-by-step guide to comply with Colombian legislation. Follow these steps to ensure legal compliance according to Law 820 of 2003 and the Colombian Civil Code.';
        legalFramework = 'Legislación Colombiana - Ley 820 de 2003, Código Civil Colombiano';
        break;
        
      case 'México':
        steps = generateMexicanSteps(text);
        summary = language === 'es'
          ? 'Guía paso a paso para cumplir con la legislación mexicana. Sigue estos pasos para asegurar el cumplimiento legal según el Código Civil Federal mexicano.'
          : 'Step-by-step guide to comply with Mexican legislation. Follow these steps to ensure legal compliance according to the Mexican Federal Civil Code.';
        legalFramework = 'Legislación Mexicana - Código Civil Federal';
        break;
        
      case 'España':
        steps = generateSpanishSteps(text);
        summary = language === 'es'
          ? 'Guía paso a paso para cumplir con la legislación española. Sigue estos pasos para asegurar el cumplimiento legal según la Ley de Arrendamientos Urbanos y el Código Civil español.'
          : 'Step-by-step guide to comply with Spanish legislation. Follow these steps to ensure legal compliance according to the Urban Leasing Law and Spanish Civil Code.';
        legalFramework = 'Legislación Española - Ley de Arrendamientos Urbanos, Código Civil';
        break;
        
      case 'United States':
        steps = generateUSSteps(text);
        summary = language === 'es'
          ? 'Guía paso a paso para cumplir con la legislación estadounidense. Sigue estos pasos para asegurar el cumplimiento legal según las leyes federales y estatales.'
          : 'Step-by-step guide to comply with US legislation. Follow these steps to ensure legal compliance according to federal and state laws.';
        legalFramework = 'US Federal and State Laws';
        break;
        
      case 'United Kingdom':
        steps = generateUSSteps(text); // Usar pasos similares a EE.UU. por ser common law
        summary = language === 'es'
          ? 'Guía paso a paso para cumplir con la legislación del Reino Unido. Sigue estos pasos para asegurar el cumplimiento legal según el derecho común inglés.'
          : 'Step-by-step guide to comply with UK legislation. Follow these steps to ensure legal compliance according to English common law.';
        legalFramework = 'English Common Law';
        break;
        
      default:
        // Pasos genéricos basados en el idioma
        if (language === 'es') {
          steps = [
            'Verificar que el documento cumpla con la legislación local aplicable',
            'Confirmar que todas las partes tengan capacidad legal para contratar',
            'Cumplir con todas las obligaciones establecidas en el documento',
            'Realizar los pagos y cumplir con los plazos acordados',
            'Mantener registros y comprobantes de todas las transacciones',
            'Consultar con un abogado local en caso de dudas o conflictos',
            'Seguir los procedimientos legales establecidos en su jurisdicción'
          ];
          summary = 'Guía paso a paso general para documentos legales. Sigue estos pasos básicos para asegurar el cumplimiento legal.';
          legalFramework = 'Legislación General';
        } else {
          steps = [
            'Verify that the document complies with applicable local legislation',
            'Confirm that all parties have legal capacity to contract',
            'Fulfill all obligations established in the document',
            'Make payments and comply with agreed deadlines',
            'Maintain records and receipts of all transactions',
            'Consult with a local attorney in case of doubts or conflicts',
            'Follow legal procedures established in your jurisdiction'
          ];
          summary = 'General step-by-step guide for legal documents. Follow these basic steps to ensure legal compliance.';
          legalFramework = 'General Legislation';
        }
    }
    
    // Si no se generaron pasos específicos, crear pasos genéricos
    if (steps.length === 0) {
      if (language === 'es') {
        steps = [
          'Leer cuidadosamente todo el documento legal',
          'Identificar todas las obligaciones y derechos establecidos',
          'Verificar fechas importantes y plazos de cumplimiento',
          'Cumplir con los pagos y obligaciones en las fechas acordadas',
          'Mantener copias de todos los documentos relacionados',
          'Consultar con un profesional del derecho si hay dudas'
        ];
      } else {
        steps = [
          'Carefully read the entire legal document',
          'Identify all obligations and rights established',
          'Verify important dates and compliance deadlines',
          'Fulfill payments and obligations on agreed dates',
          'Keep copies of all related documents',
          'Consult with a legal professional if there are doubts'
        ];
      }
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
      'Verificar fechas importantes y plazos',
      'Cumplir con los pagos y obligaciones acordadas',
      'Mantener registros de todas las transacciones',
      'Consultar con un abogado en caso de dudas'
    ] : [
      'Read the complete document carefully',
      'Identify the parties involved and their obligations',
      'Verify important dates and deadlines',
      'Fulfill agreed payments and obligations',
      'Keep records of all transactions',
      'Consult with a lawyer in case of doubts'
    ];
    
    return {
      steps: fallbackSteps,
      summary: language === 'es' 
        ? 'Guía básica para documentos legales'
        : 'Basic guide for legal documents',
      reading_level: 'B1',
      jurisdiction: 'General',
      legal_framework: 'General'
    };
  }
}