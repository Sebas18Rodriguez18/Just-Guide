import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Circle, Download, Home, ChevronLeft, ChevronRight, BookOpen, FileDown, Globe, X } from 'lucide-react';
import { Language, getTranslations, languageNames } from '../utils/i18n';
import { exportGuideToPDF } from '../utils/pdfExport';

interface GuidePageProps {
  onNavigateBack: () => void;
  onNavigateToDashboard: () => void;
  docId: string;
  userId: string;
  userName: string;
  language: Language;
}

interface GuideStep {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  tips?: string[];
}

export default function GuidePage({ 
  onNavigateBack, 
  onNavigateToDashboard, 
  docId, 
  userId,
  userName,
  language
}: GuidePageProps) {
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [documentTitle, setDocumentTitle] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLanguage, setExportLanguage] = useState<Language>(language);

  const t = getTranslations(language);

  useEffect(() => {
    generateGuideSteps();
  }, [docId, language]);

  const generateGuideSteps = async () => {
    try {
      setIsLoading(true);
      
      // Simulate generating step-by-step guide
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const title = language === 'es' ? 'Contrato de Arrendamiento' 
        : language === 'fr' ? 'Contrat de Location'
        : language === 'de' ? 'Mietvertrag'
        : language === 'pt' ? 'Contrato de Aluguel'
        : language === 'ar' ? 'عقد إيجار'
        : language === 'zh' ? '租赁合同'
        : language === 'hi' ? 'किराया समझौता'
        : 'Rental Agreement';
      setDocumentTitle(title);
      
      const mockSteps: GuideStep[] = language === 'es' ? [
        {
          id: 'step-1',
          title: 'Verificar la información de las personas',
          content: `En esta sección debes revisar que toda la información personal esté correcta:

**Propietario (Arrendador):**
- Nombre completo: Juan Pérez García
- Dirección: Calle Principal 123, Ciudad de México

**Inquilino (Arrendatario):**
- Nombre completo: María López Rodríguez  
- Dirección: Avenida Secundaria 456, Ciudad de México

**¿Qué hacer?**
Verifica que todos los nombres estén escritos correctamente y que las direcciones sean las correctas. Si hay errores, pide que se corrijan antes de firmar.`,
          completed: false,
          tips: [
            'Revisa que no haya errores de ortografía en los nombres',
            'Confirma que las direcciones sean completas y correctas',
            'Asegúrate de que ambas personas sean mayores de edad'
          ]
        },
        {
          id: 'step-2',
          title: 'Entender qué se está rentando',
          content: `Esta sección explica exactamente qué propiedad se está rentando:

**Propiedad:**
- Ubicación: Calle Ejemplo 789, Colonia Centro, Ciudad de México
- Uso: Solo para vivir (habitacional)

**¿Qué significa esto?**
El propietario le está rentando esta casa específica a María. La casa solo se puede usar para vivir, no para hacer negocios.

**¿Qué hacer?**
Visita la propiedad antes de firmar para asegurarte de que esté en buenas condiciones y sea lo que esperas.`,
          completed: false,
          tips: [
            'Visita la propiedad antes de firmar',
            'Toma fotos del estado actual',
            'Pregunta sobre servicios incluidos (agua, luz, gas)'
          ]
        },
        {
          id: 'step-3',
          title: 'Revisar el tiempo del contrato',
          content: `Esta sección dice cuánto tiempo durará el contrato:

**Duración:** 12 meses
**Fecha de inicio:** 1 de enero de 2024
**Fecha de fin:** 31 de diciembre de 2024

**¿Qué significa esto?**
El contrato es por un año completo. Después del 31 de diciembre de 2024, el contrato termina automáticamente.

**¿Qué hacer?**
Marca estas fechas en tu calendario. Si quieres renovar, habla con el propietario antes de que termine el contrato.`,
          completed: false,
          tips: [
            'Anota las fechas importantes en tu calendario',
            'Pregunta sobre la posibilidad de renovar',
            'Entiende qué pasa si quieres salir antes'
          ]
        },
        {
          id: 'step-4',
          title: 'Entender los pagos',
          content: `Esta sección explica cuánto y cuándo pagar:

**Renta mensual:** $15,000 pesos mexicanos
**Fecha de pago:** Primeros 5 días de cada mes

**¿Qué significa esto?**
Cada mes, María debe pagar $15,000 pesos. Tiene hasta el día 5 de cada mes para hacer el pago.

**¿Qué hacer?**
Programa recordatorios para pagar a tiempo. Pregunta cómo prefiere recibir el pago el propietario (efectivo, transferencia, etc.).`,
          completed: false,
          tips: [
            'Programa recordatorios de pago',
            'Pregunta el método de pago preferido',
            'Siempre pide recibo de pago'
          ]
        },
        {
          id: 'step-5',
          title: 'Comprender el depósito',
          content: `Esta sección explica la garantía que debes dar:

**Depósito:** $30,000 pesos (equivalente a 2 meses de renta)
**Propósito:** Garantía por daños o incumplimiento

**¿Qué significa esto?**
María debe dar $30,000 pesos extra como garantía. Este dinero se devuelve al final si no hay daños y se cumplió todo lo acordado.

**¿Qué hacer?**
Asegúrate de entender exactamente cuándo y cómo se devuelve este dinero. Pide que esto esté muy claro en el contrato.`,
          completed: false,
          tips: [
            'Pregunta cuándo se devuelve el depósito',
            'Entiende qué puede reducir el depósito',
            'Documenta el estado inicial de la propiedad'
          ]
        },
        {
          id: 'step-6',
          title: 'Conocer las obligaciones del propietario',
          content: `Esta sección dice qué debe hacer el propietario:

**Obligaciones de Juan (propietario):**
- Entregar la casa en condiciones habitables
- Hacer reparaciones mayores
- Respetar el uso pacífico de la casa

**¿Qué significa esto?**
El propietario debe asegurarse de que la casa esté en buenas condiciones para vivir y debe arreglar problemas grandes. También debe dejar que María viva tranquila.

**¿Qué hacer?**
Si hay problemas grandes en la casa, el propietario debe arreglarlos. Si no lo hace, puedes exigir que cumpla.`,
          completed: false,
          tips: [
            'Documenta cualquier problema al mudarte',
            'Reporta problemas mayores por escrito',
            'Conoce tus derechos como inquilino'
          ]
        },
        {
          id: 'step-7',
          title: 'Entender tus obligaciones como inquilino',
          content: `Esta sección dice qué debe hacer María (inquilino):

**Obligaciones de María:**
- Pagar la renta a tiempo
- Usar la casa solo para vivir
- Cuidar bien la casa
- No rentar a otras personas sin permiso

**¿Qué significa esto?**
María debe pagar puntualmente, cuidar la casa, usarla solo para vivir, y no puede rentarla a otras personas sin pedir permiso al propietario.

**¿Qué hacer?**
Cumple con todas estas obligaciones para evitar problemas. Si quieres que alguien más viva contigo, pregunta primero al propietario.`,
          completed: false,
          tips: [
            'Paga siempre a tiempo',
            'Mantén la casa limpia y en buen estado',
            'Pide permiso antes de hacer cambios'
          ]
        },
        {
          id: 'step-8',
          title: 'Saber cómo termina el contrato',
          content: `Esta sección explica cuándo y cómo termina el contrato:

**El contrato termina cuando:**
- Se acaba el tiempo (31 de diciembre de 2024)
- Una persona no cumple lo acordado

**¿Qué significa esto?**
El contrato termina automáticamente en la fecha acordada. También puede terminar antes si alguien no cumple sus obligaciones.

**¿Qué hacer?**
Si quieres terminar el contrato antes, revisa qué dice sobre esto. Si el propietario no cumple, puedes terminar el contrato.`,
          completed: false,
          tips: [
            'Planifica con tiempo si no vas a renovar',
            'Documenta cualquier incumplimiento',
            'Conoce el proceso para terminar el contrato'
          ]
        }
      ] : [
        {
          id: 'step-1',
          title: 'Verify personal information',
          content: `In this section you should review that all personal information is correct:

**Landlord:**
- Full name: Juan Pérez García
- Address: Calle Principal 123, Mexico City

**Tenant:**
- Full name: María López Rodríguez  
- Address: Avenida Secundaria 456, Mexico City

**What to do?**
Verify that all names are spelled correctly and that the addresses are correct. If there are errors, ask for corrections before signing.`,
          completed: false,
          tips: [
            'Check for spelling errors in names',
            'Confirm addresses are complete and correct',
            'Ensure both parties are of legal age'
          ]
        },
        {
          id: 'step-2',
          title: 'Understand what is being rented',
          content: `This section explains exactly what property is being rented:

**Property:**
- Location: Calle Ejemplo 789, Colonia Centro, Mexico City
- Use: Residential only

**What does this mean?**
The landlord is renting this specific house to María. The house can only be used for living, not for business.

**What to do?**
Visit the property before signing to ensure it's in good condition and meets your expectations.`,
          completed: false,
          tips: [
            'Visit the property before signing',
            'Take photos of current condition',
            'Ask about included utilities (water, electricity, gas)'
          ]
        },
        {
          id: 'step-3',
          title: 'Review contract duration',
          content: `This section states how long the contract will last:

**Duration:** 12 months
**Start date:** January 1, 2024
**End date:** December 31, 2024

**What does this mean?**
The contract is for a full year. After December 31, 2024, the contract ends automatically.

**What to do?**
Mark these dates on your calendar. If you want to renew, talk to the landlord before the contract ends.`,
          completed: false,
          tips: [
            'Note important dates on your calendar',
            'Ask about renewal possibilities',
            'Understand what happens if you want to leave early'
          ]
        },
        {
          id: 'step-4',
          title: 'Understand payments',
          content: `This section explains how much and when to pay:

**Monthly rent:** $15,000 Mexican pesos
**Payment date:** First 5 days of each month

**What does this mean?**
Each month, María must pay $15,000 pesos. She has until the 5th of each month to make the payment.

**What to do?**
Set up payment reminders. Ask how the landlord prefers to receive payment (cash, transfer, etc.).`,
          completed: false,
          tips: [
            'Set up payment reminders',
            'Ask about preferred payment method',
            'Always request payment receipts'
          ]
        },
        {
          id: 'step-5',
          title: 'Understand the deposit',
          content: `This section explains the security deposit you must provide:

**Deposit:** $30,000 pesos (equivalent to 2 months rent)
**Purpose:** Security for damages or non-compliance

**What does this mean?**
María must provide an extra $30,000 pesos as security. This money is returned at the end if there are no damages and all agreements were met.

**What to do?**
Make sure you understand exactly when and how this money is returned. Ask for this to be very clear in the contract.`,
          completed: false,
          tips: [
            'Ask when the deposit is returned',
            'Understand what can reduce the deposit',
            'Document the initial condition of the property'
          ]
        },
        {
          id: 'step-6',
          title: 'Know the landlord\'s obligations',
          content: `This section states what the landlord must do:

**Juan's obligations (landlord):**
- Deliver the house in habitable conditions
- Make major repairs
- Respect peaceful use of the house

**What does this mean?**
The landlord must ensure the house is in good living condition and must fix major problems. They must also let María live peacefully.

**What to do?**
If there are major problems with the house, the landlord must fix them. If they don't, you can demand compliance.`,
          completed: false,
          tips: [
            'Document any problems when moving in',
            'Report major issues in writing',
            'Know your rights as a tenant'
          ]
        },
        {
          id: 'step-7',
          title: 'Understand your obligations as tenant',
          content: `This section states what María (tenant) must do:

**María's obligations:**
- Pay rent on time
- Use the house only for living
- Take good care of the house
- Not rent to others without permission

**What does this mean?**
María must pay punctually, take care of the house, use it only for living, and cannot rent it to others without asking the landlord's permission.

**What to do?**
Comply with all these obligations to avoid problems. If you want someone else to live with you, ask the landlord first.`,
          completed: false,
          tips: [
            'Always pay on time',
            'Keep the house clean and in good condition',
            'Ask permission before making changes'
          ]
        },
        {
          id: 'step-8',
          title: 'Know how the contract ends',
          content: `This section explains when and how the contract ends:

**The contract ends when:**
- The time period expires (December 31, 2024)
- One party fails to comply with agreements

**What does this mean?**
The contract ends automatically on the agreed date. It can also end early if someone doesn't fulfill their obligations.

**What to do?**
If you want to end the contract early, review what it says about this. If the landlord doesn't comply, you can terminate the contract.`,
          completed: false,
          tips: [
            'Plan ahead if you won\'t renew',
            'Document any non-compliance',
            'Know the process to terminate the contract'
          ]
        }
      ];

      setSteps(mockSteps);
    } catch (error) {
      console.error('Failed to generate guide steps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStepCompletion = (stepIndex: number) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, completed: !step.completed } : step
    ));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  const handleExportPDF = () => {
    const exportTranslations = getTranslations(exportLanguage);
    exportGuideToPDF(steps, documentTitle, userName, exportLanguage);
    setShowExportModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-just-beige dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <BookOpen className="w-12 h-12 text-just-moss mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">
            {language === 'es' ? 'Generando tu Guía' : language === 'fr' ? 'Génération de Votre Guide' : language === 'de' ? 'Erstelle Deine Anleitung' : language === 'pt' ? 'Gerando Seu Guia' : language === 'ar' ? 'إنشاء دليلك' : language === 'zh' ? '生成您的指南' : language === 'hi' ? 'आपकी गाइड बना रहे हैं' : 'Generating Your Guide'}
          </h2>
          <p className="text-just-gray dark:text-gray-400">
            {language === 'es' ? 'Creando instrucciones personalizadas paso a paso...' : language === 'fr' ? 'Création d\'instructions personnalisées étape par étape...' : language === 'de' ? 'Erstelle personalisierte Schritt-für-Schritt-Anleitungen...' : language === 'pt' ? 'Criando instruções personalizadas passo a passo...' : language === 'ar' ? 'إنشاء تعليمات مخصصة خطوة بخطوة...' : language === 'zh' ? '创建个性化的逐步说明...' : language === 'hi' ? 'व्यक्तिगत चरणबद्ध निर्देश बना रहे हैं...' : 'Creating personalized step-by-step instructions...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-just-beige dark:bg-gray-900">
      {/* Header */}
      <div className="bg-just-white dark:bg-gray-800 shadow-sm border-b border-just-sand dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onNavigateBack}
              className="inline-flex items-center text-just-hunter dark:text-gray-300 hover:text-just-forest dark:hover:text-just-white transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Volver al Resumen' : language === 'fr' ? 'Retour au Résumé' : language === 'de' ? 'Zurück zur Zusammenfassung' : language === 'pt' ? 'Voltar ao Resumo' : language === 'ar' ? 'العودة إلى الملخص' : language === 'zh' ? '返回摘要' : language === 'hi' ? 'सारांश पर वापस जाएं' : 'Back to Summary'}
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center px-4 py-2 text-just-hunter dark:text-gray-300 hover:text-just-forest dark:hover:text-just-white transition-colors duration-200"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {t.exportGuide}
              </button>
              
              <button
                onClick={onNavigateToDashboard}
                className="inline-flex items-center px-4 py-2 bg-just-brown dark:bg-just-moss text-just-white rounded-xl hover:bg-just-forest dark:hover:bg-just-brown transition-colors duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                {t.dashboard}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-just-forest dark:text-just-white">{t.stepByStepGuide}</h1>
              <p className="text-just-gray dark:text-gray-400">
                {completedSteps} {language === 'es' ? 'de' : language === 'fr' ? 'de' : language === 'de' ? 'von' : language === 'pt' ? 'de' : language === 'ar' ? 'من' : language === 'zh' ? '共' : language === 'hi' ? 'का' : 'of'} {steps.length} {t.stepsCompleted}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-just-sand dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-just-moss h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-just-forest dark:text-just-white">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="font-semibold text-just-forest dark:text-just-white mb-4">{t.allSteps}</h3>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={`w-full flex items-center p-3 rounded-xl text-left transition-colors duration-200 ${
                      currentStep === index
                        ? 'bg-just-moss text-just-white'
                        : 'hover:bg-just-sand dark:hover:bg-gray-700 text-just-hunter dark:text-gray-300'
                    }`}
                  >
                    <div className="mr-3">
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {language === 'es' ? 'Paso' : language === 'fr' ? 'Étape' : language === 'de' ? 'Schritt' : language === 'pt' ? 'Passo' : language === 'ar' ? 'خطوة' : language === 'zh' ? '步骤' : language === 'hi' ? 'चरण' : 'Step'} {index + 1}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg">
              {/* Step Header */}
              <div className="p-6 border-b border-just-sand dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-just-moss rounded-xl flex items-center justify-center mr-4">
                      <span className="text-just-white font-bold">{currentStep + 1}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-just-forest dark:text-just-white">
                        {steps[currentStep]?.title}
                      </h2>
                      <p className="text-just-gray dark:text-gray-400 text-sm">
                        {language === 'es' ? 'Paso' : language === 'fr' ? 'Étape' : language === 'de' ? 'Schritt' : language === 'pt' ? 'Passo' : language === 'ar' ? 'خطوة' : language === 'zh' ? '步骤' : language === 'hi' ? 'चरण' : 'Step'} {currentStep + 1} {language === 'es' ? 'de' : language === 'fr' ? 'de' : language === 'de' ? 'von' : language === 'pt' ? 'de' : language === 'ar' ? 'من' : language === 'zh' ? '共' : language === 'hi' ? 'का' : 'of'} {steps.length}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleStepCompletion(currentStep)}
                    className={`flex items-center px-4 py-2 rounded-xl font-medium transition-colors duration-200 ${
                      steps[currentStep]?.completed
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                        : 'bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 hover:bg-just-moss hover:text-just-white dark:hover:bg-gray-600'
                    }`}
                  >
                    {steps[currentStep]?.completed ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t.completed}
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 mr-2" />
                        {t.markComplete}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6">
                <div className="prose prose-sm max-w-none mb-6">
                  <div 
                    className="text-just-hunter dark:text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: steps[currentStep]?.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-just-forest dark:text-just-white">$1</strong>')
                        .replace(/\n\n/g, '</p><p class="mb-4">')
                        .replace(/^/, '<p class="mb-4">')
                        .replace(/$/, '</p>')
                        .replace(/- /g, '• ')
                    }}
                  />
                </div>

                {/* Tips Section */}
                {steps[currentStep]?.tips && (
                  <div className="bg-just-beige/50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-just-forest dark:text-just-white mb-3 flex items-center">
                      💡 {t.helpfulTips}
                    </h4>
                    <ul className="space-y-2">
                      {steps[currentStep].tips?.map((tip, index) => (
                        <li key={index} className="flex items-start text-just-hunter dark:text-gray-300 text-sm">
                          <span className="text-just-moss mr-2">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-just-sand dark:border-gray-700">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center px-4 py-2 text-just-hunter dark:text-gray-300 hover:text-just-forest dark:hover:text-just-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    {t.previous}
                  </button>
                  
                  <span className="text-sm text-just-gray dark:text-gray-400">
                    {currentStep + 1} {language === 'es' ? 'de' : language === 'fr' ? 'de' : language === 'de' ? 'von' : language === 'pt' ? 'de' : language === 'ar' ? 'من' : language === 'zh' ? '共' : language === 'hi' ? 'का' : 'of'} {steps.length}
                  </span>
                  
                  <button
                    onClick={nextStep}
                    disabled={currentStep === steps.length - 1}
                    className="flex items-center px-4 py-2 bg-just-moss text-just-white rounded-xl hover:bg-just-brown transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.next}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-just-forest dark:text-just-white flex items-center">
                <FileDown className="w-5 h-5 mr-2" />
                {t.exportOptions}
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 rounded-lg hover:bg-just-sand dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <X className="w-4 h-4 text-just-hunter dark:text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-just-forest dark:text-just-white mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  {t.exportLanguage}
                </label>
                <select
                  value={exportLanguage}
                  onChange={(e) => setExportLanguage(e.target.value as Language)}
                  className="w-full px-4 py-3 border border-just-sand dark:border-gray-600 rounded-xl text-just-forest dark:text-just-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
                >
                  {Object.entries(languageNames).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>
              
              <div className="bg-just-beige/50 dark:bg-gray-700/50 rounded-xl p-4">
                <h4 className="font-medium text-just-forest dark:text-just-white mb-2">
                  {language === 'es' ? 'Vista Previa del PDF' : language === 'fr' ? 'Aperçu du PDF' : language === 'de' ? 'PDF-Vorschau' : language === 'pt' ? 'Visualização do PDF' : language === 'ar' ? 'معاينة PDF' : language === 'zh' ? 'PDF预览' : language === 'hi' ? 'PDF पूर्वावलोकन' : 'PDF Preview'}
                </h4>
                <ul className="text-sm text-just-hunter dark:text-gray-300 space-y-1">
                  <li>• {documentTitle}</li>
                  <li>• {steps.length} {language === 'es' ? 'pasos con consejos' : language === 'fr' ? 'étapes avec conseils' : language === 'de' ? 'Schritte mit Tipps' : language === 'pt' ? 'passos com dicas' : language === 'ar' ? 'خطوات مع نصائح' : language === 'zh' ? '步骤和提示' : language === 'hi' ? 'सुझावों के साथ चरण' : 'steps with tips'}</li>
                  <li>• {language === 'es' ? 'Formato profesional' : language === 'fr' ? 'Format professionnel' : language === 'de' ? 'Professionelles Format' : language === 'pt' ? 'Formato profissional' : language === 'ar' ? 'تنسيق احترافي' : language === 'zh' ? '专业格式' : language === 'hi' ? 'पेशेवर प्रारूप' : 'Professional format'}</li>
                  <li>• {language === 'es' ? 'Marca JustGuide' : language === 'fr' ? 'Marque JustGuide' : language === 'de' ? 'JustGuide Branding' : language === 'pt' ? 'Marca JustGuide' : language === 'ar' ? 'علامة JustGuide التجارية' : language === 'zh' ? 'JustGuide品牌' : language === 'hi' ? 'JustGuide ब्रांडिंग' : 'JustGuide branding'}</li>
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 px-4 py-3 rounded-xl font-medium hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleExportPDF}
                className="flex-1 bg-just-moss text-just-white px-4 py-3 rounded-xl font-medium hover:bg-just-brown transition-colors duration-200 flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Exportar PDF' : language === 'fr' ? 'Exporter PDF' : language === 'de' ? 'PDF Exportieren' : language === 'pt' ? 'Exportar PDF' : language === 'ar' ? 'تصدير PDF' : language === 'zh' ? '导出PDF' : language === 'hi' ? 'PDF निर्यात करें' : 'Export PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}