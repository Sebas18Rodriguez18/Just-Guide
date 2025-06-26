// src/utils/summarizer.ts

export interface DocumentSummary {
  summary: string;
  keyPoints: string[];
}

export function summarizeDocument(text: string, language: 'es' | 'en' = 'es'): DocumentSummary {
  if (!text || text.trim().length === 0) {
    return {
      summary: language === 'es' ? 'No se pudo generar un resumen del documento.' : 'Could not generate a document summary.',
      keyPoints: []
    };
  }

  // Dividir el texto en oraciones
  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  
  // Palabras clave para identificar información importante
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

  const keywords = keywordsByLanguage[language];
  
  // Encontrar oraciones relevantes por categoría
  const categorizedSentences = {
    parties: sentences.filter(s => keywords.parties.some(k => s.toLowerCase().includes(k))),
    obligations: sentences.filter(s => keywords.obligations.some(k => s.toLowerCase().includes(k))),
    payments: sentences.filter(s => keywords.payments.some(k => s.toLowerCase().includes(k))),
    dates: sentences.filter(s => keywords.dates.some(k => s.toLowerCase().includes(k))),
    legal: sentences.filter(s => keywords.legal.some(k => s.toLowerCase().includes(k))),
    important: sentences.filter(s => keywords.important.some(k => s.toLowerCase().includes(k)))
  };

  // Generar resumen basado en las oraciones más relevantes
  let summaryParts = [];
  
  // Identificar las partes del documento
  if (categorizedSentences.parties.length > 0) {
    const partiesSentence = categorizedSentences.parties[0];
    if (language === 'es') {
      summaryParts.push(`Este documento involucra a las siguientes partes: ${partiesSentence.substring(0, 150)}...`);
    } else {
      summaryParts.push(`This document involves the following parties: ${partiesSentence.substring(0, 150)}...`);
    }
  }

  // Identificar el propósito principal
  const firstSentences = sentences.slice(0, 3);
  const purposeSentence = firstSentences.find(s => 
    s.toLowerCase().includes(language === 'es' ? 'contrato' : 'contract') ||
    s.toLowerCase().includes(language === 'es' ? 'acuerdo' : 'agreement') ||
    s.toLowerCase().includes(language === 'es' ? 'arrendamiento' : 'lease')
  );
  
  if (purposeSentence) {
    if (language === 'es') {
      summaryParts.push(`El propósito principal es: ${purposeSentence.substring(0, 200)}...`);
    } else {
      summaryParts.push(`The main purpose is: ${purposeSentence.substring(0, 200)}...`);
    }
  }

  // Generar resumen final
  let summary = '';
  if (summaryParts.length > 0) {
    summary = summaryParts.join(' ');
  } else {
    // Resumen genérico basado en las primeras oraciones
    const firstThreeSentences = sentences.slice(0, 3).join(' ');
    if (language === 'es') {
      summary = `Este es un documento legal que establece términos y condiciones específicas. ${firstThreeSentences.substring(0, 300)}...`;
    } else {
      summary = `This is a legal document that establishes specific terms and conditions. ${firstThreeSentences.substring(0, 300)}...`;
    }
  }

  // Generar puntos clave
  const keyPoints = [];
  
  // Puntos sobre obligaciones
  if (categorizedSentences.obligations.length > 0) {
    const obligationPoints = categorizedSentences.obligations.slice(0, 3).map(s => {
      const cleaned = s.replace(/^[-–•\d.\s]+/, '').trim();
      return cleaned.length > 20 ? cleaned.substring(0, 150) + '...' : cleaned;
    });
    keyPoints.push(...obligationPoints);
  }

  // Puntos sobre pagos
  if (categorizedSentences.payments.length > 0) {
    const paymentPoints = categorizedSentences.payments.slice(0, 2).map(s => {
      const cleaned = s.replace(/^[-–•\d.\s]+/, '').trim();
      return cleaned.length > 20 ? cleaned.substring(0, 150) + '...' : cleaned;
    });
    keyPoints.push(...paymentPoints);
  }

  // Puntos sobre fechas y plazos
  if (categorizedSentences.dates.length > 0) {
    const datePoints = categorizedSentences.dates.slice(0, 2).map(s => {
      const cleaned = s.replace(/^[-–•\d.\s]+/, '').trim();
      return cleaned.length > 20 ? cleaned.substring(0, 150) + '...' : cleaned;
    });
    keyPoints.push(...datePoints);
  }

  // Puntos sobre aspectos legales
  if (categorizedSentences.legal.length > 0) {
    const legalPoints = categorizedSentences.legal.slice(0, 2).map(s => {
      const cleaned = s.replace(/^[-–•\d.\s]+/, '').trim();
      return cleaned.length > 20 ? cleaned.substring(0, 150) + '...' : cleaned;
    });
    keyPoints.push(...legalPoints);
  }

  // Si no hay suficientes puntos clave, agregar oraciones importantes generales
  if (keyPoints.length < 3) {
    const importantSentences = sentences
      .filter(s => s.length > 50 && s.length < 200)
      .slice(0, 5 - keyPoints.length)
      .map(s => s.trim());
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