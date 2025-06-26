// src/utils/summarizer.ts

export interface DocumentSummary {
  summary: string;
  keyPoints: string[];
}

// ✅ CRÍTICO: Generar resumen SIEMPRE en el idioma configurado por el usuario
export function summarizeDocument(text: string, userLanguage: 'es' | 'en' = 'es'): DocumentSummary {
  if (!text || text.trim().length === 0) {
    return {
      summary: userLanguage === 'es' ? 'No se pudo generar un resumen del documento.' : 'Could not generate a document summary.',
      keyPoints: []
    };
  }

  // Dividir el texto en oraciones
  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  
  // ✅ Palabras clave para identificar información importante EN AMBOS IDIOMAS
  // Pero generar la salida en el idioma del usuario
  const keywordsByLanguage = {
    es: {
      parties: ['arrendador', 'arrendatario', 'demandante', 'demandado', 'contratante', 'contratista', 'comprador', 'vendedor'],
      obligations: ['deberá', 'obligación', 'debe', 'responsabilidad', 'compromete', 'obliga'],
      payments: ['pagar', 'canon', 'precio', 'valor', 'suma', 'dinero', 'pesos', 'dólares', 'euros'],
      dates: ['plazo', 'fecha', 'duración', 'término', 'vencimiento', 'vigencia'],
      legal: ['ley', 'código', 'artículo', 'decreto', 'norma', 'reglamento'],
      important: ['importante', 'fundamental', 'esencial', 'crítico', 'vital', 'necesario']
    },
    en: {
      parties: ['landlord', 'tenant', 'plaintiff', 'defendant', 'contractor', 'buyer', 'seller', 'party'],
      obligations: ['shall', 'must', 'obligation', 'responsibility', 'duty', 'required'],
      payments: ['pay', 'payment', 'rent', 'price', 'amount', 'sum', 'dollars', 'fee'],
      dates: ['term', 'date', 'duration', 'period', 'expiration', 'deadline'],
      legal: ['law', 'code', 'article', 'statute', 'regulation', 'act'],
      important: ['important', 'essential', 'critical', 'vital', 'necessary', 'required']
    }
  };

  // ✅ Buscar palabras clave en AMBOS idiomas para detectar contenido
  const spanishKeywords = keywordsByLanguage.es;
  const englishKeywords = keywordsByLanguage.en;
  
  // Encontrar oraciones relevantes por categoría (buscar en ambos idiomas)
  const categorizedSentences = {
    parties: sentences.filter(s => 
      [...spanishKeywords.parties, ...englishKeywords.parties].some(k => s.toLowerCase().includes(k))
    ),
    obligations: sentences.filter(s => 
      [...spanishKeywords.obligations, ...englishKeywords.obligations].some(k => s.toLowerCase().includes(k))
    ),
    payments: sentences.filter(s => 
      [...spanishKeywords.payments, ...englishKeywords.payments].some(k => s.toLowerCase().includes(k))
    ),
    dates: sentences.filter(s => 
      [...spanishKeywords.dates, ...englishKeywords.dates].some(k => s.toLowerCase().includes(k))
    ),
    legal: sentences.filter(s => 
      [...spanishKeywords.legal, ...englishKeywords.legal].some(k => s.toLowerCase().includes(k))
    ),
    important: sentences.filter(s => 
      [...spanishKeywords.important, ...englishKeywords.important].some(k => s.toLowerCase().includes(k))
    )
  };

  // ✅ Generar resumen basado en las oraciones más relevantes EN EL IDIOMA DEL USUARIO
  let summaryParts = [];
  
  // Identificar las partes del documento
  if (categorizedSentences.parties.length > 0) {
    const partiesSentence = categorizedSentences.parties[0];
    if (userLanguage === 'es') {
      summaryParts.push(`Este documento involucra a las siguientes partes: ${partiesSentence.substring(0, 150)}...`);
    } else {
      summaryParts.push(`This document involves the following parties: ${partiesSentence.substring(0, 150)}...`);
    }
  }

  // Identificar el propósito principal
  const firstSentences = sentences.slice(0, 3);
  const purposeSentence = firstSentences.find(s => 
    s.toLowerCase().includes('contrato') || s.toLowerCase().includes('contract') ||
    s.toLowerCase().includes('acuerdo') || s.toLowerCase().includes('agreement') ||
    s.toLowerCase().includes('arrendamiento') || s.toLowerCase().includes('lease')
  );
  
  if (purposeSentence) {
    if (userLanguage === 'es') {
      summaryParts.push(`El propósito principal es: ${purposeSentence.substring(0, 200)}...`);
    } else {
      summaryParts.push(`The main purpose is: ${purposeSentence.substring(0, 200)}...`);
    }
  }

  // ✅ Generar resumen final EN EL IDIOMA DEL USUARIO
  let summary = '';
  if (summaryParts.length > 0) {
    summary = summaryParts.join(' ');
  } else {
    // Resumen genérico basado en las primeras oraciones
    const firstThreeSentences = sentences.slice(0, 3).join(' ');
    if (userLanguage === 'es') {
      summary = `Este es un documento legal que establece términos y condiciones específicas. ${firstThreeSentences.substring(0, 300)}...`;
    } else {
      summary = `This is a legal document that establishes specific terms and conditions. ${firstThreeSentences.substring(0, 300)}...`;
    }
  }

  // ✅ Generar puntos clave EN EL IDIOMA DEL USUARIO
  const keyPoints = [];
  
  // Puntos sobre obligaciones
  if (categorizedSentences.obligations.length > 0) {
    const obligationPoints = categorizedSentences.obligations.slice(0, 3).map(s => {
      const cleaned = s.replace(/^[-–•\d.\s]+/, '').trim();
      const truncated = cleaned.length > 20 ? cleaned.substring(0, 150) + '...' : cleaned;
      
      // ✅ Traducir contexto al idioma del usuario
      if (userLanguage === 'es') {
        return `Obligación: ${truncated}`;
      } else {
        return `Obligation: ${truncated}`;
      }
    });
    keyPoints.push(...obligationPoints);
  }

  // Puntos sobre pagos
  if (categorizedSentences.payments.length > 0) {
    const paymentPoints = categorizedSentences.payments.slice(0, 2).map(s => {
      const cleaned = s.replace(/^[-–•\d.\s]+/, '').trim();
      const truncated = cleaned.length > 20 ? cleaned.substring(0, 150) + '...' : cleaned;
      
      // ✅ Traducir contexto al idioma del usuario
      if (userLanguage === 'es') {
        return `Pago requerido: ${truncated}`;
      } else {
        return `Required payment: ${truncated}`;
      }
    });
    keyPoints.push(...paymentPoints);
  }

  // Puntos sobre fechas y plazos
  if (categorizedSentences.dates.length > 0) {
    const datePoints = categorizedSentences.dates.slice(0, 2).map(s => {
      const cleaned = s.replace(/^[-–•\d.\s]+/, '').trim();
      const truncated = cleaned.length > 20 ? cleaned.substring(0, 150) + '...' : cleaned;
      
      // ✅ Traducir contexto al idioma del usuario
      if (userLanguage === 'es') {
        return `Fecha importante: ${truncated}`;
      } else {
        return `Important date: ${truncated}`;
      }
    });
    keyPoints.push(...datePoints);
  }

  // Puntos sobre aspectos legales
  if (categorizedSentences.legal.length > 0) {
    const legalPoints = categorizedSentences.legal.slice(0, 2).map(s => {
      const cleaned = s.replace(/^[-–•\d.\s]+/, '').trim();
      const truncated = cleaned.length > 20 ? cleaned.substring(0, 150) + '...' : cleaned;
      
      // ✅ Traducir contexto al idioma del usuario
      if (userLanguage === 'es') {
        return `Marco legal: ${truncated}`;
      } else {
        return `Legal framework: ${truncated}`;
      }
    });
    keyPoints.push(...legalPoints);
  }

  // Si no hay suficientes puntos clave, agregar oraciones importantes generales
  if (keyPoints.length < 3) {
    const allKeywords = [
      ...spanishKeywords.obligations, ...englishKeywords.obligations,
      ...spanishKeywords.important, ...englishKeywords.important
    ];
    
    const importantSentences = sentences
      .filter(s => s.length > 50 && s.length < 200)
      .filter(s => allKeywords.some(k => s.toLowerCase().includes(k)))
      .slice(0, 5 - keyPoints.length)
      .map(s => {
        const cleaned = s.trim();
        // ✅ Agregar contexto en el idioma del usuario
        if (userLanguage === 'es') {
          return `Punto clave: ${cleaned}`;
        } else {
          return `Key point: ${cleaned}`;
        }
      });
    keyPoints.push(...importantSentences);
  }

  // Limpiar y limitar puntos clave
  const cleanedKeyPoints = keyPoints
    .filter(point => point && point.length > 10)
    .slice(0, 7)
    .map(point => point.charAt(0).toUpperCase() + point.slice(1));

  return {
    summary: summary.trim(),
    keyPoints: cleanedKeyPoints
  };
}