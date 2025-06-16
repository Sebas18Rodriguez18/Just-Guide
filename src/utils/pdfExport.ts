import jsPDF from 'jspdf';
import { Language, getTranslations } from './i18n';

interface GuideStep {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  tips?: string[];
}

export const exportGuideToPDF = (
  steps: GuideStep[], 
  documentTitle: string, 
  userName: string,
  language: Language = 'en'
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
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(color[0], color[1], color[2]);
    
    const lines = pdf.splitTextToSize(text, maxWidth);
    
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
    pdf.text(text, margin, yPosition + 8);
    
    yPosition += 25;
  };

  // Header with logo and branding
  pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  // Logo placeholder (you can replace this with actual logo)
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
  addSectionHeader(`📄 ${documentTitle}`, colors.primary);
  
  const metadata = [
    `${t.createdOn}: ${new Date().toLocaleDateString()}`,
    `${language === 'es' ? 'Usuario' : language === 'fr' ? 'Utilisateur' : language === 'de' ? 'Benutzer' : language === 'pt' ? 'Usuário' : language === 'ar' ? 'المستخدم' : language === 'zh' ? '用户' : language === 'hi' ? 'उपयोगकर्ता' : 'User'}: ${userName}`,
    `${language === 'es' ? 'Idioma' : language === 'fr' ? 'Langue' : language === 'de' ? 'Sprache' : language === 'pt' ? 'Idioma' : language === 'ar' ? 'اللغة' : language === 'zh' ? '语言' : language === 'hi' ? 'भाषा' : 'Language'}: ${language.toUpperCase()}`,
    `${language === 'es' ? 'Total de pasos' : language === 'fr' ? 'Total des étapes' : language === 'de' ? 'Gesamte Schritte' : language === 'pt' ? 'Total de passos' : language === 'ar' ? 'إجمالي الخطوات' : language === 'zh' ? '总步骤' : language === 'hi' ? 'कुल चरण' : 'Total Steps'}: ${steps.length}`
  ];

  metadata.forEach(item => {
    addText(item, 11, false, colors.text);
  });
  
  yPosition += 10;

  // Introduction
  const intro = language === 'es' 
    ? 'Esta guía te ayudará a entender tu documento legal paso a paso. Cada sección incluye explicaciones claras y consejos útiles para completar el proceso correctamente.'
    : language === 'fr'
    ? 'Ce guide vous aidera à comprendre votre document juridique étape par étape. Chaque section comprend des explications claires et des conseils utiles pour compléter le processus correctement.'
    : language === 'de'
    ? 'Diese Anleitung hilft Ihnen dabei, Ihr Rechtsdokument Schritt für Schritt zu verstehen. Jeder Abschnitt enthält klare Erklärungen und hilfreiche Tipps zur ordnungsgemäßen Durchführung des Prozesses.'
    : language === 'pt'
    ? 'Este guia o ajudará a entender seu documento legal passo a passo. Cada seção inclui explicações claras e dicas úteis para completar o processo corretamente.'
    : language === 'ar'
    ? 'سيساعدك هذا الدليل على فهم وثيقتك القانونية خطوة بخطوة. يتضمن كل قسم تفسيرات واضحة ونصائح مفيدة لإكمال العملية بشكل صحيح.'
    : language === 'zh'
    ? '本指南将帮助您逐步理解您的法律文档。每个部分都包含清晰的解释和有用的提示，以正确完成流程。'
    : language === 'hi'
    ? 'यह गाइड आपको अपने कानूनी दस्तावेज़ को चरणबद्ध तरीके से समझने में मदद करेगी। प्रत्येक अनुभाग में स्पष्ट स्पष्टीकरण और प्रक्रिया को सही तरीके से पूरा करने के लिए उपयोगी सुझाव शामिल हैं।'
    : 'This guide will help you understand your legal document step by step. Each section includes clear explanations and helpful tips to complete the process correctly.';
  
  addText(intro, 12, false, colors.text);
  yPosition += 15;

  // Steps
  steps.forEach((step, index) => {
    // Step header with number and title
    addSectionHeader(`${t.step} ${index + 1}: ${step.title}`, colors.secondary);

    // Step content
    const cleanContent = step.content
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/## /g, '') // Remove heading markdown
      .replace(/\n\n/g, '\n') // Normalize line breaks
      .replace(/^#+ /gm, ''); // Remove any remaining markdown headers

    addText(cleanContent, 11, false, colors.text);
    yPosition += 8;

    // Completion checkbox
    const checkboxText = step.completed 
      ? `✅ ${t.completed}`
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
      
      addText(`💡 ${t.tips}:`, 12, true, colors.primary);
      yPosition += 5;
      
      step.tips.forEach(tip => {
        addText(`• ${tip}`, 10, false, colors.text);
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
    
    pdf.text(footerLeft, margin, pageHeight - 10);
    pdf.text(footerCenter, pageWidth / 2, pageHeight - 10, { align: 'center' });
    pdf.text(footerRight, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  // Save the PDF with language-specific filename
  const fileName = language === 'es' 
    ? `guia-paso-a-paso-${documentTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`
    : language === 'fr'
    ? `guide-etape-par-etape-${documentTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`
    : language === 'de'
    ? `schritt-fuer-schritt-anleitung-${documentTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`
    : language === 'pt'
    ? `guia-passo-a-passo-${documentTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`
    : language === 'ar'
    ? `دليل-خطوة-بخطوة-${documentTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`
    : language === 'zh'
    ? `逐步指南-${documentTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`
    : language === 'hi'
    ? `चरणबद्ध-गाइड-${documentTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`
    : `step-by-step-guide-${documentTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  
  pdf.save(fileName);
};