import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Circle, Download, Home, ChevronLeft, ChevronRight, BookOpen, FileDown, Globe, X } from 'lucide-react';
import { Language, getTranslations, languageNames } from '../utils/i18n';
import { exportGuideToPDF } from '../utils/pdfExport';
import { detectJurisdiction, detectLanguage, extractDocumentInfo, adaptContentForJurisdiction, LegalFramework } from '../utils/jurisdictionLogic';

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
  const [jurisdiction, setJurisdiction] = useState<LegalFramework | null>(null);
  const [documentInfo, setDocumentInfo] = useState<any>(null);

  const t = getTranslations(language);

  useEffect(() => {
    generateGuideSteps();
  }, [docId, language]);

  const generateGuideSteps = async () => {
    try {
      setIsLoading(true);
      
      // Simulate generating step-by-step guide
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sample Colombian rental contract text
      const colombianContractText = `CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA

PRIMERA: IDENTIFICACIÓN DE LAS PARTES
Arrendador: Carlos Eduardo Ramírez Gómez, mayor de edad, identificado con cédula de ciudadanía No. 80.123.456 de Bogotá D.C.
Arrendatario: Ana María Rodríguez López, mayor de edad, identificada con cédula de ciudadanía No. 52.987.654 de Medellín.

SEGUNDA: OBJETO DEL CONTRATO
El arrendador da en arriendo al arrendatario el inmueble ubicado en la Carrera 11 No. 85-23, Apartamento 501, Bogotá D.C.

TERCERA: PLAZO
El presente contrato tendrá una duración de doce (12) meses, contados a partir del 1 de febrero de 2024 hasta el 31 de enero de 2025.

CUARTA: CANON DE ARRENDAMIENTO
El canon mensual de arrendamiento será de DOS MILLONES QUINIENTOS MIL PESOS ($2.500.000) moneda corriente.

QUINTA: REAJUSTE DEL CANON
El canon de arrendamiento se reajustará anualmente en un porcentaje igual al IPC certificado por el DANE.

SEXTA: DEPÓSITO EN DINERO
El arrendatario entregará al arrendador la suma de CINCO MILLONES DE PESOS ($5.000.000) como depósito.

SÉPTIMA: OBLIGACIONES DEL ARRENDADOR
- Entregar el inmueble en condiciones de habitabilidad
- Realizar las reparaciones locativas mayores
- Cumplir con las disposiciones de la Ley 820 de 2003

OCTAVA: OBLIGACIONES DEL ARRENDATARIO
- Pagar puntualmente el canon de arrendamiento
- Usar el inmueble conforme a su destinación
- Cumplir con las disposiciones del Código Civil Colombiano

NOVENA: TERMINACIÓN
El contrato podrá terminarse por las causales establecidas en el artículo 22 de la Ley 820 de 2003.`;

      // Detect jurisdiction and extract information
      const detectedJurisdiction = detectJurisdiction(colombianContractText);
      const detectedLanguage = detectLanguage(colombianContractText);
      const extractedInfo = extractDocumentInfo(colombianContractText, detectedJurisdiction);
      
      setJurisdiction(detectedJurisdiction);
      setDocumentInfo(extractedInfo);
      setDocumentTitle('Contrato de Arrendamiento de Vivienda Urbana');
      
      // Generate personalized steps based on actual document content
      const { names, amounts, addresses, laws, articles, duration } = extractedInfo;
      
      const landlordName = names && names.length > 0 ? names[0] : 'Carlos Eduardo Ramírez Gómez';
      const tenantName = names && names.length > 1 ? names[1] : 'Ana María Rodríguez López';
      const propertyAddress = addresses && addresses.length > 0 ? addresses[0] : 'Carrera 11 No. 85-23, Apartamento 501, Bogotá D.C.';
      const monthlyRent = amounts && amounts.length > 0 ? amounts[0] : '$2.500.000';
      const deposit = amounts && amounts.length > 1 ? amounts[1] : '$5.000.000';
      const contractDuration = duration || '12 meses';

      const personalizedSteps: GuideStep[] = [
        {
          id: 'step-1',
          title: 'Verificar la información de las personas',
          content: `En esta sección debes revisar que toda la información personal esté correcta:

**Arrendador (Propietario):**
- Nombre completo: ${landlordName}
- Cédula: 80.123.456 de Bogotá D.C.
- Domicilio: Bogotá D.C.

**Arrendatario (Inquilino):**
- Nombre completo: ${tenantName}
- Cédula: 52.987.654 de Medellín
- Domicilio: Bogotá D.C.

**¿Qué hacer?**
Verifica que todos los nombres estén escritos correctamente y que las cédulas sean las correctas. Si hay errores, pide que se corrijan antes de firmar.

**Marco Legal:** Este contrato está regido por la Ley 820 de 2003 y el Código Civil Colombiano.`,
          completed: false,
          tips: [
            'Revisa que no haya errores de ortografía en los nombres',
            'Confirma que las cédulas de ciudadanía sean correctas',
            'Asegúrate de que ambas personas sean mayores de edad',
            'Verifica que el arrendador sea el propietario legítimo del inmueble'
          ]
        },
        {
          id: 'step-2',
          title: 'Entender qué se está arrendando',
          content: `Esta sección explica exactamente qué propiedad se está arrendando:

**Propiedad:**
- Ubicación: ${propertyAddress}
- Uso: Exclusivamente para vivienda urbana
- Tipo: Apartamento

**¿Qué significa esto?**
${landlordName} le está arrendando este apartamento específico a ${tenantName}. El apartamento solo se puede usar para vivir, no para hacer negocios.

**¿Qué hacer?**
Visita la propiedad antes de firmar para asegurarte de que esté en buenas condiciones y sea lo que esperas.`,
          completed: false,
          tips: [
            'Visita el apartamento antes de firmar',
            'Toma fotos del estado actual del inmueble',
            'Pregunta sobre servicios incluidos (administración, servicios públicos)',
            'Verifica que la dirección coincida exactamente con la del contrato'
          ]
        },
        {
          id: 'step-3',
          title: 'Revisar el tiempo del contrato',
          content: `Esta sección dice cuánto tiempo durará el contrato:

**Duración:** ${contractDuration}
**Fecha de inicio:** 1 de febrero de 2024
**Fecha de fin:** 31 de enero de 2025

**¿Qué significa esto?**
El contrato es por un año completo. Después del 31 de enero de 2025, el contrato termina automáticamente.

**¿Qué hacer?**
Marca estas fechas en tu calendario. Si quieres renovar, habla con ${landlordName} antes de que termine el contrato.`,
          completed: false,
          tips: [
            'Anota las fechas importantes en tu calendario',
            'Pregunta sobre la posibilidad de renovar',
            'Entiende qué pasa si quieres salir antes del tiempo acordado',
            'Conoce el proceso de entrega del inmueble al final del contrato'
          ]
        },
        {
          id: 'step-4',
          title: 'Entender los pagos del canon de arrendamiento',
          content: `Esta sección explica cuánto y cuándo pagar:

**Canon mensual:** ${monthlyRent} pesos colombianos
**Fecha de pago:** Primeros 5 días de cada mes
**Reajuste:** Anual según el IPC certificado por el DANE

**¿Qué significa esto?**
Cada mes, ${tenantName} debe pagar ${monthlyRent} pesos. Tiene hasta el día 5 de cada mes para hacer el pago. El valor se ajusta cada año según la inflación.

**¿Qué hacer?**
Programa recordatorios para pagar a tiempo. Pregunta cómo prefiere recibir el pago ${landlordName}.`,
          completed: false,
          tips: [
            'Programa recordatorios de pago para evitar retrasos',
            'Pregunta el método de pago preferido (transferencia, consignación)',
            'Siempre pide recibo o comprobante de pago',
            'Entiende cómo funciona el reajuste anual del IPC'
          ]
        },
        {
          id: 'step-5',
          title: 'Comprender el depósito en dinero',
          content: `Esta sección explica la garantía que debes dar:

**Depósito:** ${deposit} pesos (equivalente a 2 meses de canon)
**Propósito:** Garantía por daños o incumplimiento

**¿Qué significa esto?**
${tenantName} debe dar ${deposit} pesos extra como garantía. Este dinero se devuelve al final si no hay daños y se cumplió todo lo acordado.

**¿Qué hacer?**
Asegúrate de entender exactamente cuándo y cómo se devuelve este dinero. Pide que esto esté muy claro en el contrato.`,
          completed: false,
          tips: [
            'Pregunta cuándo y cómo se devuelve el depósito',
            'Entiende qué puede reducir el valor del depósito',
            'Documenta el estado inicial del inmueble con fotos',
            'Conoce tus derechos sobre la devolución del depósito'
          ]
        },
        {
          id: 'step-6',
          title: 'Conocer las obligaciones del arrendador',
          content: `Esta sección dice qué debe hacer ${landlordName}:

**Obligaciones del arrendador:**
- Entregar el inmueble en condiciones habitables
- Realizar reparaciones locativas mayores
- Respetar el uso pacífico del inmueble
- Cumplir con las disposiciones de la Ley 820 de 2003

**¿Qué significa esto?**
El arrendador debe asegurarse de que el apartamento esté en buenas condiciones para vivir y debe arreglar problemas grandes. También debe dejar que ${tenantName} viva tranquila.

**¿Qué hacer?**
Si hay problemas grandes en el apartamento, el arrendador debe arreglarlos. Si no lo hace, puedes exigir que cumpla según la ley.`,
          completed: false,
          tips: [
            'Documenta cualquier problema al momento de recibir el inmueble',
            'Reporta problemas mayores por escrito al arrendador',
            'Conoce tus derechos como arrendatario según la Ley 820 de 2003',
            'Mantén comunicación respetuosa pero firme con el arrendador'
          ]
        },
        {
          id: 'step-7',
          title: 'Entender tus obligaciones como arrendatario',
          content: `Esta sección dice qué debe hacer ${tenantName}:

**Obligaciones del arrendatario:**
- Pagar puntualmente el canon de arrendamiento
- Usar el inmueble conforme a su destinación (vivienda)
- Conservar el inmueble en buen estado
- No subarrendar sin autorización escrita
- Cumplir con las disposiciones del Código Civil Colombiano

**¿Qué significa esto?**
${tenantName} debe pagar puntualmente, cuidar el apartamento, usarlo solo para vivir, y no puede rentarlo a otras personas sin permiso escrito de ${landlordName}.

**¿Qué hacer?**
Cumple con todas estas obligaciones para evitar problemas. Si quieres que alguien más viva contigo, pregunta primero al arrendador.`,
          completed: false,
          tips: [
            'Paga siempre a tiempo para evitar problemas legales',
            'Mantén el apartamento limpio y en buen estado',
            'Pide permiso por escrito antes de hacer cambios o mejoras',
            'No subarriendes sin autorización del propietario'
          ]
        },
        {
          id: 'step-8',
          title: 'Saber cómo termina el contrato',
          content: `Esta sección explica cuándo y cómo termina el contrato:

**El contrato termina cuando:**
- Se acaba el tiempo (31 de enero de 2025)
- Se cumple alguna de las causales del artículo 22 de la Ley 820 de 2003
- Hay mutuo acuerdo entre las partes

**¿Qué significa esto?**
El contrato termina automáticamente en la fecha acordada. También puede terminar antes si se cumple alguna causal legal o si ambas partes están de acuerdo.

**¿Qué hacer?**
Si quieres terminar el contrato antes, revisa las causales legales. Si ${landlordName} no cumple, puedes terminar el contrato según la ley.

**Marco Legal:** Las causales de terminación están establecidas en el artículo 22 de la Ley 820 de 2003.`,
          completed: false,
          tips: [
            'Planifica con tiempo si no vas a renovar el contrato',
            'Documenta cualquier incumplimiento del arrendador',
            'Conoce el proceso legal para terminar el contrato',
            'Entiende tus derechos de restitución del inmueble'
          ]
        }
      ];

      // Apply jurisdiction-specific adaptations
      const adaptedSteps = personalizedSteps.map(step => ({
        ...step,
        content: adaptContentForJurisdiction(step.content, detectedJurisdiction, language, extractedInfo)
      }));

      setSteps(adaptedSteps);
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
    const jurisdictionInfo = jurisdiction ? {
      country: jurisdiction.country,
      region: jurisdiction.region,
      legal_system_type: jurisdiction.legal_system_type,
      notes: jurisdiction.legal_notes
    } : undefined;

    exportGuideToPDF(steps, documentTitle, userName, exportLanguage, jurisdictionInfo);
    setShowExportModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-just-beige dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 lg:p-8 text-center max-w-md w-full">
          <BookOpen className="w-12 h-12 text-just-moss mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">
            {language === 'es' ? 'Generando tu Guía Personalizada' : 'Generating Your Personalized Guide'}
          </h2>
          <p className="text-just-gray dark:text-gray-400">
            {language === 'es' ? 'Analizando tu contrato colombiano y creando instrucciones específicas...' : 'Analyzing your Colombian contract and creating specific instructions...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-just-beige dark:bg-gray-900">
      {/* Header */}
      <div className="bg-just-white dark:bg-gray-800 shadow-sm border-b border-just-sand dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
            <button
              onClick={onNavigateBack}
              className="inline-flex items-center text-just-hunter dark:text-gray-300 hover:text-just-forest dark:hover:text-just-white transition-colors duration-200 self-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Volver al Resumen' : 'Back to Summary'}
            </button>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
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
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-just-forest dark:text-just-white">{t.stepByStepGuide}</h1>
              <p className="text-just-gray dark:text-gray-400">
                {completedSteps} {language === 'es' ? 'de' : 'of'} {steps.length} {t.stepsCompleted}
              </p>
              {jurisdiction && (
                <p className="text-sm text-just-moss dark:text-just-moss mt-1">
                  {jurisdiction.country} ({jurisdiction.region || 'Nacional'}) - {jurisdiction.legal_system_type === 'civil_law' ? 'Derecho Civil' : jurisdiction.legal_system_type}
                </p>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center space-x-3">
              <div className="w-32 lg:w-48 bg-just-sand dark:bg-gray-700 rounded-full h-2">
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

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Steps Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6 sticky top-8">
              <h3 className="font-semibold text-just-forest dark:text-just-white mb-4">{t.allSteps}</h3>
              <div className="space-y-2 lg:space-y-3">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={`w-full flex items-center p-2 lg:p-3 rounded-xl text-left transition-all duration-200 hover:scale-105 ${
                      currentStep === index
                        ? 'bg-just-moss text-just-white shadow-lg'
                        : 'hover:bg-just-sand dark:hover:bg-gray-700 text-just-hunter dark:text-gray-300'
                    }`}
                  >
                    <div className="mr-3">
                      {step.completed ? (
                        <CheckCircle className="w-4 lg:w-5 h-4 lg:h-5 text-green-500" />
                      ) : (
                        <Circle className="w-4 lg:w-5 h-4 lg:h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs lg:text-sm font-medium truncate">
                        {language === 'es' ? 'Paso' : 'Step'} {index + 1}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3">
            <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg">
              {/* Step Header */}
              <div className="p-4 lg:p-6 border-b border-just-sand dark:border-gray-700">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-just-moss rounded-xl flex items-center justify-center mr-4">
                      <span className="text-just-white font-bold">{currentStep + 1}</span>
                    </div>
                    <div>
                      <h2 className="text-lg lg:text-xl font-semibold text-just-forest dark:text-just-white">
                        {steps[currentStep]?.title}
                      </h2>
                      <p className="text-just-gray dark:text-gray-400 text-sm">
                        {language === 'es' ? 'Paso' : 'Step'} {currentStep + 1} {language === 'es' ? 'de' : 'of'} {steps.length}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleStepCompletion(currentStep)}
                    className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
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
              <div className="p-4 lg:p-6">
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-just-sand dark:border-gray-700 space-y-4 sm:space-y-0">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center justify-center px-4 py-2 text-just-hunter dark:text-gray-300 hover:text-just-forest dark:hover:text-just-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    {t.previous}
                  </button>
                  
                  <span className="text-sm text-just-gray dark:text-gray-400 text-center">
                    {currentStep + 1} {language === 'es' ? 'de' : 'of'} {steps.length}
                  </span>
                  
                  <button
                    onClick={nextStep}
                    disabled={currentStep === steps.length - 1}
                    className="flex items-center justify-center px-4 py-2 bg-just-moss text-just-white rounded-xl hover:bg-just-brown transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {language === 'es' ? 'Vista Previa del PDF' : 'PDF Preview'}
                </h4>
                <ul className="text-sm text-just-hunter dark:text-gray-300 space-y-1">
                  <li>• {documentTitle}</li>
                  <li>• {steps.length} {language === 'es' ? 'pasos personalizados con consejos' : 'personalized steps with tips'}</li>
                  <li>• {language === 'es' ? 'Formato profesional con marca JustGuide' : 'Professional format with JustGuide branding'}</li>
                  {jurisdiction && (
                    <li>• {jurisdiction.country} ({jurisdiction.region || 'Nacional'}) {language === 'es' ? 'jurisdicción' : 'jurisdiction'}</li>
                  )}
                  {documentInfo && documentInfo.laws && documentInfo.laws.length > 0 && (
                    <li>• {language === 'es' ? 'Marco legal:' : 'Legal framework:'} {documentInfo.laws.join(', ')}</li>
                  )}
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
                {language === 'es' ? 'Exportar PDF' : 'Export PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}