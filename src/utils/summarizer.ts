// src/utils/summarizer.ts

export interface DocumentSummary {
  summary: string;
  keyPoints: string[];
}

export function summarizeDocument(text: string): DocumentSummary {
  // Mejor resumen: buscar párrafo con palabras clave y extraer puntos clave
  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  const summaryKeywords = [
    'contrato', 'acuerdo', 'arrendamiento', 'arrendador', 'arrendatario', 'inmueble', 'duración', 'canon', 'obligación',
    'agreement', 'lease', 'lessor', 'lessee', 'property', 'term', 'rent', 'obligation'
  ];
  const summary = sentences.find(s => summaryKeywords.some(k => s.toLowerCase().includes(k))) || sentences[0] || '';
  // Puntos clave: obligaciones, pagos, fechas, garantías
  const keyWords = [
    'deberá', 'obligación', 'importante', 'responsabilidad', 'plazo', 'pago', 'prohibido', 'garantía', 'terminación', 'requisito',
    'entregar', 'reparaciones', 'cumplir', 'pagar', 'usar', 'ley', 'código', 'canon', 'meses', 'fecha',
    'must', 'shall', 'important', 'responsibility', 'term', 'payment', 'forbidden', 'guarantee', 'termination', 'requirement',
    'deliver', 'repairs', 'comply', 'pay', 'use', 'law', 'code', 'rent', 'months', 'date'
  ];
  const keyPoints = sentences.filter(s => keyWords.some(k => s.toLowerCase().includes(k))).slice(0, 7);
  return {
    summary,
    keyPoints
  };
}
