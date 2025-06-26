// src/utils/guideGenerator.ts

export interface StepByStepGuide {
  steps: string[];
  summary: string;
  reading_level: string;
}

export async function generateStepByStepGuide(text: string, lang: string): Promise<StepByStepGuide> {
  // 1. Extraer frases de obligaciones, pagos, fechas, uso, y acciones importantes
  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  const actionKeywords = [
    'deberá', 'debe', 'obligación', 'pagar', 'entregar', 'cumplir', 'usar', 'responsabilidad', 'importante', 'plazo', 'fecha',
    'must', 'shall', 'pay', 'deliver', 'comply', 'use', 'responsibility', 'important', 'term', 'date'
  ];
  // 2. Filtrar y priorizar por importancia (pagos y obligaciones primero)
  const paymentSteps = sentences.filter(s => /pagar|canon|payment|rent/i.test(s)).map(s => lang === 'es' ? `Asegúrate de ${s.toLowerCase().replace(/^[-–•\d.\s]+/, '')}` : `Make sure to ${s}`);
  const obligationSteps = sentences.filter(s => /obligación|deberá|debe|must|shall|responsabilidad|comply|cumplir/i.test(s)).map(s => lang === 'es' ? `Cumple con: ${s.toLowerCase().replace(/^[-–•\d.\s]+/, '')}` : `Comply with: ${s}`);
  const deliverySteps = sentences.filter(s => /entregar|deliver/i.test(s)).map(s => lang === 'es' ? `Entrega: ${s.toLowerCase().replace(/^[-–•\d.\s]+/, '')}` : `Deliver: ${s}`);
  const usageSteps = sentences.filter(s => /usar|use/i.test(s)).map(s => lang === 'es' ? `Usa el inmueble según: ${s.toLowerCase().replace(/^[-–•\d.\s]+/, '')}` : `Use the property as: ${s}`);
  const dateSteps = sentences.filter(s => /plazo|fecha|term|date/i.test(s)).map(s => lang === 'es' ? `Ten en cuenta: ${s.toLowerCase().replace(/^[-–•\d.\s]+/, '')}` : `Note: ${s}`);
  // 3. Unir y eliminar duplicados, priorizando pagos > obligaciones > entrega > uso > fechas > otros
  const allSteps = [
    ...paymentSteps,
    ...obligationSteps,
    ...deliverySteps,
    ...usageSteps,
    ...dateSteps
  ];
  const uniqueSteps: string[] = [];
  allSteps.forEach(s => {
    if (!uniqueSteps.includes(s) && s.length > 30) uniqueSteps.push(s);
  });
  // 4. Si no hay suficientes pasos, agregar frases importantes
  if (uniqueSteps.length < 3) {
    const importantSteps = sentences.filter(s => actionKeywords.some(k => s.toLowerCase().includes(k)));
    importantSteps.forEach(s => {
      if (!uniqueSteps.includes(s) && s.length > 30) uniqueSteps.push(lang === 'es' ? `Recuerda: ${s.toLowerCase().replace(/^[-–•\d.\s]+/, '')}` : `Remember: ${s}`);
    });
  }
  // 5. Limitar a 5 pasos concisos
  const steps = uniqueSteps.slice(0, 5);
  // 6. Resumen de pasos
  const summary = lang === 'es'
    ? 'Sigue estos pasos clave para cumplir los acuerdos más importantes del contrato y evitar problemas.'
    : 'Follow these key steps to comply with the most important contract agreements and avoid issues.';
  return {
    steps,
    summary,
    reading_level: 'B1',
  };
}
