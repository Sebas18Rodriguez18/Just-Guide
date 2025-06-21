import jsPDF from 'jspdf';
import { Language, getTranslations } from './i18n';
import { normalizeText } from './textNormalization';

interface GuideStep {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  tips?: string[];
}

interface JurisdictionInfo {
  country: string;
  region?: string;
  legal_system_type: string;
  notes?: string;
}

export const exportGuideToPDF = (
  steps: GuideStep[], 
  documentTitle: string, 
  userName: string,
  language: Language = 'en',
  jurisdiction?: JurisdictionInfo
): void => {
  const pdf = new jsPDF();
  const t = getTranslations(language);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Color scheme
  type RGB = [number, number, number];

  const colors: { [key: string]: RGB } = {
    primary: [38, 64, 39], // just-forest
    secondary: [166, 161, 94], // just-moss
    accent: [133, 77, 39], // just-brown
    text: [62, 86, 65], // just-hunter
    light: [245, 243, 240], // just-beige
    white: [254, 254, 255] // just-white
  };

  // Helper function to add text with word wrapping
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: number[] = colors.text) => {
    // Normalize text to prevent encoding issues
    const cleanText = normalizeText(text);
    
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(color[0], color[1], color[2]);
    
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
    const cleanText = normalizeText(text);
    
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
    pdf.text(cleanText, margin, yPosition + 8);
    
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
  pdf.text(normalizeText(t.stepByStepGuide), margin + 35, 40);

  yPosition = 70;

  // Document metadata section
  addSectionHeader(`📄 ${normalizeText(documentTitle)}`, colors.primary);
  
  const currentDate = new Date().toLocaleDateString();
  const metadata = [
    `${t.createdOn}: ${currentDate}`,
    `${getLocalizedLabel('user', language)}: ${normalizeText(userName)}`,
    `${getLocalizedLabel('language', language)}: ${language.toUpperCase()}`,
    `${getLocalizedLabel('totalSteps', language)}: ${steps.length}`
  ];

  // Add jurisdiction info if available
  if (jurisdiction) {
    metadata.push(`${getLocalizedLabel('jurisdiction', language)}: ${normalizeText(jurisdiction.country)} (${normalizeText(jurisdiction.region || 'National')})`);
    metadata.push(`${getLocalizedLabel('legalSystem', language)}: ${getLocalizedLabel(jurisdiction.legal_system_type, language)}`);
  }

  metadata.forEach(item => {
    addText(item, 11, false, colors.text);
  });
  
  yPosition += 10;

  // Introduction
  const intro = getLocalizedIntroduction(language);
  addText(intro, 12, false, colors.text);
  yPosition += 15;

  // Steps
  steps.forEach((step, index) => {
    // Step header with number and title
    const stepTitle = `${t.step} ${index + 1}: ${step.title}`;
    addSectionHeader(stepTitle, colors.secondary);

    // Step content
    const cleanContent = normalizeText(step.content)
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/## /g, '') // Remove heading markdown
      .replace(/\n\n/g, '\n') // Normalize line breaks
      .replace(/^#+ /gm, ''); // Remove any remaining markdown headers

    addText(cleanContent, 11, false, colors.text);
    yPosition += 8;

    // Completion checkbox
    const checkboxText = step.completed 
      ? `✅ ${t.completed}`
      : `☐ ${getLocalizedLabel('pending', language)}`;
    
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
      
      addText(`💡 ${t.tips}:`, 12, true, colors.primary);
      yPosition += 5;
      
      step.tips.forEach(tip => {
        addText(`• ${normalizeText(tip)}`, 10, false, colors.text);
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
    
    const footerLeft = normalizeText(`${t.generatedBy} • ${currentDate}`);
    const footerCenter = normalizeText(`${t.pageOf} ${i} ${getLocalizedLabel('of', language)} ${totalPages}`);
    const footerRight = normalizeText(t.forMoreInfo);
    
    pdf.text(footerLeft, margin, pageHeight - 10);
    pdf.text(footerCenter, pageWidth / 2, pageHeight - 10, { align: 'center' });
    pdf.text(footerRight, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  // Save the PDF with language-specific filename
  const fileName = getLocalizedFileName(documentTitle, language);
  pdf.save(fileName);
};

function getLocalizedLabel(key: string, language: Language): string {
  const labels: Record<Language, Record<string, string>> = {
    en: {
      user: 'User',
      language: 'Language',
      totalSteps: 'Total Steps',
      jurisdiction: 'Jurisdiction',
      legalSystem: 'Legal System',
      pending: 'Pending',
      of: 'of',
      common_law: 'Common Law',
      civil_law: 'Civil Law',
      islamic_law: 'Islamic Law',
      hybrid: 'Hybrid System',
      international: 'International'
    },
    es: {
      user: 'Usuario',
      language: 'Idioma',
      totalSteps: 'Total de Pasos',
      jurisdiction: 'Jurisdicción',
      legalSystem: 'Sistema Legal',
      pending: 'Pendiente',
      of: 'de',
      common_law: 'Derecho Anglosajón',
      civil_law: 'Derecho Civil',
      islamic_law: 'Derecho Islámico',
      hybrid: 'Sistema Híbrido',
      international: 'Internacional'
    },
    fr: {
      user: 'Utilisateur',
      language: 'Langue',
      totalSteps: 'Total des Étapes',
      jurisdiction: 'Juridiction',
      legalSystem: 'Système Juridique',
      pending: 'En Attente',
      of: 'de',
      common_law: 'Common Law',
      civil_law: 'Droit Civil',
      islamic_law: 'Droit Islamique',
      hybrid: 'Système Hybride',
      international: 'International'
    },
    pt: {
      user: 'Usuário',
      language: 'Idioma',
      totalSteps: 'Total de Passos',
      jurisdiction: 'Jurisdição',
      legalSystem: 'Sistema Legal',
      pending: 'Pendente',
      of: 'de',
      common_law: 'Common Law',
      civil_law: 'Direito Civil',
      islamic_law: 'Direito Islâmico',
      hybrid: 'Sistema Híbrido',
      international: 'Internacional'
    },
    de: {
      user: 'Benutzer',
      language: 'Sprache',
      totalSteps: 'Gesamte Schritte',
      jurisdiction: 'Gerichtsbarkeit',
      legalSystem: 'Rechtssystem',
      pending: 'Ausstehend',
      of: 'von',
      common_law: 'Common Law',
      civil_law: 'Zivilrecht',
      islamic_law: 'Islamisches Recht',
      hybrid: 'Hybridsystem',
      international: 'International'
    },
    ar: {
      user: 'المستخدم',
      language: 'اللغة',
      totalSteps: 'إجمالي الخطوات',
      jurisdiction: 'الولاية القضائية',
      legalSystem: 'النظام القانوني',
      pending: 'معلق',
      of: 'من',
      common_law: 'القانون العام',
      civil_law: 'القانون المدني',
      islamic_law: 'الشريعة الإسلامية',
      hybrid: 'نظام مختلط',
      international: 'دولي'
    },
    zh: {
      user: '用户',
      language: '语言',
      totalSteps: '总步骤',
      jurisdiction: '司法管辖区',
      legalSystem: '法律体系',
      pending: '待处理',
      of: '共',
      common_law: '普通法',
      civil_law: '民法',
      islamic_law: '伊斯兰法',
      hybrid: '混合制度',
      international: '国际'
    },
    hi: {
      user: 'उपयोगकर्ता',
      language: 'भाषा',
      totalSteps: 'कुल चरण',
      jurisdiction: 'न्यायाधिकार क्षेत्र',
      legalSystem: 'कानूनी प्रणाली',
      pending: 'लंबित',
      of: 'का',
      common_law: 'सामान्य कानून',
      civil_law: 'नागरिक कानून',
      islamic_law: 'इस्लामी कानून',
      hybrid: 'मिश्रित प्रणाली',
      international: 'अंतर्राष्ट्रीय'
    }
  };

  return labels[language]?.[key] || labels['en'][key] || key;
}

function getLocalizedIntroduction(language: Language): string {
  const introductions: Record<Language, string> = {
    en: 'This guide will help you understand your legal document step by step. Each section includes clear explanations and helpful tips to complete the process correctly.',
    es: 'Esta guía te ayudará a entender tu documento legal paso a paso. Cada sección incluye explicaciones claras y consejos útiles para completar el proceso correctamente.',
    fr: 'Ce guide vous aidera à comprendre votre document juridique étape par étape. Chaque section comprend des explications claires et des conseils utiles pour compléter le processus correctement.',
    pt: 'Este guia o ajudará a entender seu documento legal passo a passo. Cada seção inclui explicações claras e dicas úteis para completar o processo corretamente.',
    de: 'Diese Anleitung hilft Ihnen dabei, Ihr Rechtsdokument Schritt für Schritt zu verstehen. Jeder Abschnitt enthält klare Erklärungen und hilfreiche Tipps zur ordnungsgemäßen Durchführung des Prozesses.',
    ar: 'سيساعدك هذا الدليل على فهم وثيقتك القانونية خطوة بخطوة. يتضمن كل قسم تفسيرات واضحة ونصائح مفيدة لإكمال العملية بشكل صحيح.',
    zh: '本指南将帮助您逐步理解您的法律文档。每个部分都包含清晰的解释和有用的提示，以正确完成流程。',
    hi: 'यह गाइड आपको अपने कानूनी दस्तावेज़ को चरणबद्ध तरीके से समझने में मदद करेगी। प्रत्येक अनुभाग में स्पष्ट स्पष्टीकरण और प्रक्रिया को सही तरीके से पूरा करने के लिए उपयोगी सुझाव शामिल हैं।'
  };

  return introductions[language] || introductions['en'];
}

function getLocalizedFileName(documentTitle: string, language: Language): string {
  const cleanTitle = normalizeText(documentTitle.replace(/\s+/g, '-').toLowerCase());
  
  const prefixes: Record<Language, string> = {
    en: 'step-by-step-guide',
    es: 'guia-paso-a-paso',
    fr: 'guide-etape-par-etape',
    pt: 'guia-passo-a-passo',
    de: 'schritt-fuer-schritt-anleitung',
    ar: 'دليل-خطوة-بخطوة',
    zh: '逐步指南',
    hi: 'चरणबद्ध-गाइड'
  };

  const prefix = prefixes[language] || prefixes['en'];
  return `${prefix}-${cleanTitle}.pdf`;
}