import jsPDF from 'jspdf';
import { Language, getTranslations } from './i18n';

interface GuideStep {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  tips?: string[];
}

// Clean character normalization mapping - only valid key-value pairs
const characterMap: Record<string, string> = {
  // Spanish accented characters
  'ñ': 'n',
  'Ñ': 'N',
  'á': 'a',
  'é': 'e',
  'í': 'i',
  'ó': 'o',
  'ú': 'u',
  'Á': 'A',
  'É': 'E',
  'Í': 'I',
  'Ó': 'O',
  'Ú': 'U',
  'ü': 'u',
  'Ü': 'U',
  
  // French accented characters
  'à': 'a',
  'â': 'a',
  'ä': 'a',
  'ç': 'c',
  'è': 'e',
  'ê': 'e',
  'ë': 'e',
  'î': 'i',
  'ï': 'i',
  'ô': 'o',
  'ö': 'o',
  'ù': 'u',
  'û': 'u',
  'ÿ': 'y',
  'À': 'A',
  'Â': 'A',
  'Ä': 'A',
  'Ç': 'C',
  'È': 'E',
  'Ê': 'E',
  'Ë': 'E',
  'Î': 'I',
  'Ï': 'I',
  'Ô': 'O',
  'Ö': 'O',
  'Ù': 'U',
  'Û': 'U',
  'Ÿ': 'Y',
  
  // German characters
  'ä': 'ae',
  'ö': 'oe',
  'ß': 'ss',
  'Ä': 'AE',
  'Ö': 'OE',
  
  // Portuguese characters
  'ã': 'a',
  'õ': 'o',
  'Ã': 'A',
  'Õ': 'O',
  
  // Currency symbols
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  '₹': 'INR',
  '¢': 'cents',
  '₽': 'RUB',
  
  // Special punctuation
  '¿': '?',
  '¡': '!',
  '"': '"',
  '"': '"',
  ''': "'",
  ''': "'",
  '–': '-',
  '—': '-',
  '…': '...',
  '«': '"',
  '»': '"',
  '‚': ',',
  '„': '"',
  '‹': '<',
  '›': '>',
  
  // Problematic characters that cause encoding issues
  'Ø': 'O',
  'ø': 'o',
  'Æ': 'AE',
  'æ': 'ae',
  'Œ': 'OE',
  'œ': 'oe',
  'Ð': 'D',
  'ð': 'd',
  'Þ': 'TH',
  'þ': 'th'
};

/**
 * Normalizes text by replacing accented and special characters with ASCII equivalents
 * This prevents encoding issues in PDF exports
 */
function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Replace characters using the character map
  let normalized = text.replace(/[ñÑüÜ¿¡€£–—''""áéíóúÁÉÍÓÚàâäçèêëîïôöùûÿÀÂÄÇÈÊËÎÏÔÖÙÛŸäöößÄÖãõÃÕØøÆæŒœÐðÞþ]/g, (char) => {
    return characterMap[char] || char;
  });
  
  // Remove any remaining non-ASCII characters that might cause issues
  normalized = normalized.replace(/[^\x00-\x7F]/g, (char) => {
    console.warn(`Unsupported character removed: "${char}" (Unicode: ${char.charCodeAt(0)})`);
    return '';
  });
  
  // Clean up whitespace
  normalized = normalized
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
  
  return normalized;
}

/**
 * Validates and cleans text before PDF generation
 */
function validateTextForPDF(text: string, context: string = ''): string {
  const cleaned = normalizeText(text);
  
  // Check for problematic patterns that indicate encoding issues
  const problematicPatterns = [
    /Ø=Ü/g,
    /[^\x00-\x7F]/g,
    /\uFFFD/g
  ];
  
  problematicPatterns.forEach((pattern) => {
    const matches = cleaned.match(pattern);
    if (matches && matches.length > 0) {
      console.warn(`PDF Export Warning in ${context}: Found ${matches.length} potentially problematic character(s)`);
    }
  });
  
  return cleaned;
}

export const exportGuideToPDF = (
  steps: GuideStep[], 
  documentTitle: string, 
  userName: string,
  language: Language = 'en',
  country?: string,
  region?: string,
  legalSystemType?: string
): void => {
  const pdf = new jsPDF();
  const t = getTranslations(language);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Color scheme
  const colors = {
    primary: [38, 64, 39], // just-forest
    secondary: [166, 161, 94], // just-moss
    accent: [133, 77, 39], // just-brown
    text: [62, 86, 65], // just-hunter
    light: [245, 243, 240], // just-beige
    white: [254, 254, 255] // just-white
  };

  // Helper function to add text with proper normalization
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: number[] = colors.text) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(color[0], color[1], color[2]);
    
    // Normalize text to prevent encoding issues
    const cleanText = validateTextForPDF(text, 'addText');
    
    const lines = pdf.splitTextToSize(cleanText, maxWidth);
    
    // Check if we need a new page
    if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * fontSize * 0.5 + 5;
  };

  // Helper function to add a colored section header
  const addSectionHeader = (text: string, bgColor: number[] = colors.secondary) => {
    // Check if we need a new page
    if (yPosition + 20 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    // Background rectangle
    pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    pdf.rect(margin - 5, yPosition - 5, maxWidth + 10, 18, 'F');
    
    // Text
    pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    
    // Normalize header text
    const cleanHeaderText = validateTextForPDF(text, 'sectionHeader');
    pdf.text(cleanHeaderText, margin, yPosition + 8);
    
    yPosition += 25;
  };

  // Header with logo and branding
  pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  // Logo placeholder
  pdf.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  pdf.circle(margin + 15, 25, 12, 'F');
  pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('JG', margin + 10, 30);
  
  // Company name and title
  pdf.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('JustGuide', margin + 35, 25);
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text(t.stepByStepGuide, margin + 35, 40);

  yPosition = 70;

  // Document metadata section
  const cleanDocumentTitle = validateTextForPDF(documentTitle, 'documentTitle');
  addSectionHeader(`${cleanDocumentTitle}`, colors.primary);
  
  const metadata = [
    `${t.createdOn}: ${new Date().toLocaleDateString()}`,
    `${language === 'es' ? 'Usuario' : language === 'fr' ? 'Utilisateur' : language === 'de' ? 'Benutzer' : language === 'pt' ? 'Usuario' : language === 'ar' ? 'المستخدم' : language === 'zh' ? '用户' : language === 'hi' ? 'उपयोगकर्ता' : 'User'}: ${normalizeText(userName)}`,
    `${language === 'es' ? 'Idioma' : language === 'fr' ? 'Langue' : language === 'de' ? 'Sprache' : language === 'pt' ? 'Idioma' : language === 'ar' ? 'اللغة' : language === 'zh' ? '语言' : language === 'hi' ? 'भाषा' : 'Language'}: ${language.toUpperCase()}`,
    `${language === 'es' ? 'Total de pasos' : language === 'fr' ? 'Total des etapes' : language === 'de' ? 'Gesamte Schritte' : language === 'pt' ? 'Total de passos' : language === 'ar' ? 'إجمالي الخطوات' : language === 'zh' ? '总步骤' : language === 'hi' ? 'कुल चरण' : 'Total Steps'}: ${steps.length}`
  ];

  if (country && region) {
    metadata.push(`${language === 'es' ? 'Jurisdiccion' : language === 'fr' ? 'Juridiction' : language === 'de' ? 'Gerichtsbarkeit' : language === 'pt' ? 'Jurisdicao' : language === 'ar' ? 'الولاية القضائية' : language === 'zh' ? '管辖权' : language === 'hi' ? 'न्यायाधिकार' : 'Jurisdiction'}: ${normalizeText(country)} (${normalizeText(region)})`);
  }

  if (legalSystemType) {
    metadata.push(`${language === 'es' ? 'Sistema legal' : language === 'fr' ? 'Systeme juridique' : language === 'de' ? 'Rechtssystem' : language === 'pt' ? 'Sistema legal' : language === 'ar' ? 'النظام القانوني' : language === 'zh' ? '法律制度' : language === 'hi' ? 'कानूनी प्रणाली' : 'Legal System'}: ${normalizeText(legalSystemType)}`);
  }

  metadata.forEach(item => {
    addText(item, 11, false, colors.text);
  });
  
  yPosition += 10;

  // Introduction
  const intro = language === 'es' 
    ? 'Esta guia te ayudara a entender tu documento legal paso a paso. Cada seccion incluye explicaciones claras y consejos utiles para completar el proceso correctamente.'
    : language === 'fr'
    ? 'Ce guide vous aidera a comprendre votre document juridique etape par etape. Chaque section comprend des explications claires et des conseils utiles pour completer le processus correctement.'
    : language === 'de'
    ? 'Diese Anleitung hilft Ihnen dabei, Ihr Rechtsdokument Schritt fur Schritt zu verstehen. Jeder Abschnitt enthalt klare Erklarungen und hilfreiche Tipps zur ordnungsgemassen Durchfuhrung des Prozesses.'
    : language === 'pt'
    ? 'Este guia o ajudara a entender seu documento legal passo a passo. Cada secao inclui explicacoes claras e dicas uteis para completar o processo corretamente.'
    : language === 'ar'
    ? 'سيساعدك هذا الدليل على فهم وثيقتك القانونية خطوة بخطوة. يتضمن كل قسم تفسيرات واضحة ونصائح مفيدة لإكمال العملية بشكل صحيح.'
    : language === 'zh'
    ? '本指南将帮助您逐步理解您的法律文档。每个部分都包含清晰的解释和有用的提示，以正确完成流程。'
    : language === 'hi'
    ? 'यह गाइड आपको अपने कानूनी दस्तावेज़ को चरणबद्ध तरीके से समझने में मदद करेगी। प्रत्येक अनुभाग में स्पष्ट स्पष्टीकरण और प्रक्रिया को सही तरीके से पूरा करने के लिए उपयोगी सुझाव शामिल हैं।'
    : 'This guide will help you understand your legal document step by step. Each section includes clear explanations and helpful tips to complete the process correctly.';
  
  addText(intro, 12, false, colors.text);
  yPosition += 15;

  // Jurisdiction disclaimer if applicable
  if (country && region && legalSystemType) {
    const disclaimer = language === 'es'
      ? `IMPORTANTE: Esta guia se basa en las leyes de ${normalizeText(country)} (${normalizeText(region)}) bajo el sistema ${normalizeText(legalSystemType)}. Consulte con un abogado local para asesoramiento especifico.`
      : language === 'fr'
      ? `IMPORTANT: Ce guide est base sur les lois de ${normalizeText(country)} (${normalizeText(region)}) sous le systeme ${normalizeText(legalSystemType)}. Consultez un avocat local pour des conseils specifiques.`
      : `IMPORTANT: This guide is based on the laws of ${normalizeText(country)} (${normalizeText(region)}) under the ${normalizeText(legalSystemType)} system. Consult with a local attorney for specific advice.`;
    
    addText(disclaimer, 10, true, colors.accent);
    yPosition += 10;
  }

  // Steps
  steps.forEach((step, index) => {
    // Normalize step title and content
    const cleanTitle = validateTextForPDF(step.title, `step-${index + 1}-title`);
    
    const cleanContent = validateTextForPDF(
      step.content
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
        .replace(/## /g, '') // Remove heading markdown
        .replace(/\n\n/g, '\n') // Normalize line breaks
        .replace(/^#+ /gm, ''), // Remove any remaining markdown headers
      `step-${index + 1}-content`
    );

    // Step header with number and title
    addSectionHeader(`${t.step} ${index + 1}: ${cleanTitle}`, colors.secondary);

    // Step content
    addText(cleanContent, 11, false, colors.text);
    yPosition += 8;

    // Completion checkbox
    const checkboxText = step.completed 
      ? `✓ ${t.completed}`
      : `☐ ${language === 'es' ? 'Pendiente' : language === 'fr' ? 'En attente' : language === 'de' ? 'Ausstehend' : language === 'pt' ? 'Pendente' : language === 'ar' ? 'معلق' : language === 'zh' ? '待处理' : language === 'hi' ? 'लंबित' : 'Pending'}`;
    
    addText(checkboxText, 10, true, step.completed ? [34, 197, 94] : colors.text);
    yPosition += 5;

    // Tips section
    if (step.tips && step.tips.length > 0) {
      // Tips header with background
      if (yPosition + 30 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
      pdf.rect(margin - 5, yPosition - 5, maxWidth + 10, 15, 'F');
      
      addText(`${t.tips}:`, 12, true, colors.primary);
      yPosition += 5;
      
      step.tips.forEach((tip, tipIndex) => {
        const cleanTip = validateTextForPDF(tip, `step-${index + 1}-tip-${tipIndex + 1}`);
        addText(`• ${cleanTip}`, 10, false, colors.text);
      });
      
      yPosition += 10;
    }

    // Add space between steps
    yPosition += 15;
  });

  // Footer on all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Footer background
    pdf.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
    
    // Footer content
    pdf.setFontSize(9);
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    const footerLeft = `${t.generatedBy} • ${new Date().toLocaleDateString()}`;
    const footerCenter = `${t.pageOf} ${i} ${language === 'es' ? 'de' : language === 'fr' ? 'de' : language === 'de' ? 'von' : language === 'pt' ? 'de' : language === 'ar' ? 'من' : language === 'zh' ? '共' : language === 'hi' ? 'का' : 'of'} ${totalPages}`;
    const footerRight = t.forMoreInfo;
    
    pdf.text(normalizeText(footerLeft), margin, pageHeight - 10);
    pdf.text(normalizeText(footerCenter), pageWidth / 2, pageHeight - 10, { align: 'center' });
    pdf.text(normalizeText(footerRight), pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  // Save the PDF with normalized filename
  const baseFileName = language === 'es' 
    ? 'guia-paso-a-paso'
    : language === 'fr'
    ? 'guide-etape-par-etape'
    : language === 'de'
    ? 'schritt-fuer-schritt-anleitung'
    : language === 'pt'
    ? 'guia-passo-a-passo'
    : language === 'ar'
    ? 'دليل-خطوة-بخطوة'
    : language === 'zh'
    ? '逐步指南'
    : language === 'hi'
    ? 'चरणबद्ध-गाइड'
    : 'step-by-step-guide';
  
  const normalizedTitle = normalizeText(cleanDocumentTitle)
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, ''); // Remove any remaining special characters
  
  const fileName = `${baseFileName}-${normalizedTitle}.pdf`;
  
  console.log(`PDF Export: Generated "${fileName}" with ${steps.length} steps`);
  pdf.save(fileName);
};