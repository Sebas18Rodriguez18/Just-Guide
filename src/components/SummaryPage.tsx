import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Sparkles, ChevronRight, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { Language, getTranslations } from '../utils/i18n';
import { detectJurisdiction, detectLanguage, extractDocumentInfo, adaptContentForJurisdiction, LegalFramework } from '../utils/jurisdictionLogic';

interface SummaryPageProps {
  onNavigateBack: () => void;
  onNavigateToGuide: (docId: string) => void;
  docId: string;
  userId: string;
  language: Language;
}

interface Document {
  id: string;
  title: string;
  document_type: string;
  language: string;
  extracted_text: string;
  upload_date: string;
  jurisdiction?: LegalFramework;
  documentInfo?: any;
}

interface SimplifiedGuide {
  id: string;
  summary: string;
  reading_level: string;
}

export default function SummaryPage({ 
  onNavigateBack, 
  onNavigateToGuide, 
  docId, 
  userId,
  language 
}: SummaryPageProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [simplifiedGuide, setSimplifiedGuide] = useState<SimplifiedGuide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = getTranslations(language);

  useEffect(() => {
    loadDocument();
  }, [docId]);

  const loadDocument = async () => {
    try {
      setIsLoading(true);
      
      // Simulate fetching document data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample Colombian rental contract text
      const colombianContractText = `CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA

PRIMERA: IDENTIFICACIÓN DE LAS PARTES
Arrendador: Carlos Eduardo Ramírez Gómez, mayor de edad, identificado con cédula de ciudadanía No. 80.123.456 de Bogotá D.C., domiciliado en la Carrera 15 No. 93-47, Bogotá D.C.

Arrendatario: Ana María Rodríguez López, mayor de edad, identificada con cédula de ciudadanía No. 52.987.654 de Medellín, domiciliada en la Calle 72 No. 10-34, Bogotá D.C.

SEGUNDA: OBJETO DEL CONTRATO
El arrendador da en arriendo al arrendatario el inmueble ubicado en la Carrera 11 No. 85-23, Apartamento 501, Bogotá D.C., destinado exclusivamente para vivienda urbana.

TERCERA: PLAZO
El presente contrato tendrá una duración de doce (12) meses, contados a partir del 1 de febrero de 2024 hasta el 31 de enero de 2025.

CUARTA: CANON DE ARRENDAMIENTO
El canon mensual de arrendamiento será de DOS MILLONES QUINIENTOS MIL PESOS ($2.500.000) moneda corriente, pagaderos dentro de los primeros cinco (5) días de cada mes.

QUINTA: REAJUSTE DEL CANON
El canon de arrendamiento se reajustará anualmente en un porcentaje igual al IPC certificado por el DANE para el año inmediatamente anterior.

SEXTA: DEPÓSITO EN DINERO
El arrendatario entregará al arrendador la suma de CINCO MILLONES DE PESOS ($5.000.000) como depósito en dinero, equivalente a dos (2) meses de canon.

SÉPTIMA: OBLIGACIONES DEL ARRENDADOR
- Entregar el inmueble en condiciones de habitabilidad
- Realizar las reparaciones locativas mayores
- Respetar el uso pacífico del inmueble por parte del arrendatario
- Cumplir con las disposiciones de la Ley 820 de 2003

OCTAVA: OBLIGACIONES DEL ARRENDATARIO
- Pagar puntualmente el canon de arrendamiento
- Usar el inmueble conforme a su destinación
- Conservar el inmueble en buen estado
- No subarrendar sin autorización escrita del arrendador
- Cumplir con las disposiciones del Código Civil Colombiano

NOVENA: TERMINACIÓN
El contrato podrá terminarse por vencimiento del plazo, mutuo acuerdo, o por las causales establecidas en el artículo 22 de la Ley 820 de 2003.

En constancia de lo anterior, las partes firman en Bogotá D.C., a los quince (15) días del mes de enero de 2024.

_____________________________          _____________________________
Carlos Eduardo Ramírez Gómez           Ana María Rodríguez López
Arrendador                             Arrendatario
C.C. 80.123.456                       C.C. 52.987.654`;

      // Detect jurisdiction and language from the document
      const detectedJurisdiction = detectJurisdiction(colombianContractText);
      const detectedLanguage = detectLanguage(colombianContractText);
      const documentInfo = extractDocumentInfo(colombianContractText, detectedJurisdiction);

      const mockDocument: Document = {
        id: docId,
        title: "Contrato de Arrendamiento de Vivienda Urbana",
        document_type: "Contrato de Arrendamiento",
        language: detectedLanguage,
        extracted_text: colombianContractText,
        upload_date: new Date().toISOString(),
        jurisdiction: detectedJurisdiction,
        documentInfo: documentInfo
      };

      setDocument(mockDocument);
      
      // Auto-generate simplified summary
      await generateSimplifiedSummary(mockDocument);
      
    } catch (err) {
      setError(language === 'es' ? 'Error al cargar el documento. Por favor intenta de nuevo.'
        : language === 'fr' ? 'Échec du chargement du document. Veuillez réessayer.'
        : 'Failed to load document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSimplifiedSummary = async (doc: Document) => {
    try {
      setIsSimplifying(true);
      
      // Simulate calling legal-simplifier function
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate content based on actual document information
      const { names, amounts, addresses, laws, articles, duration } = doc.documentInfo || {};
      
      const landlordName = names && names.length > 0 ? names[0] : 'Carlos Eduardo Ramírez Gómez';
      const tenantName = names && names.length > 1 ? names[1] : 'Ana María Rodríguez López';
      const propertyAddress = addresses && addresses.length > 0 ? addresses[0] : 'Carrera 11 No. 85-23, Apartamento 501, Bogotá D.C.';
      const monthlyRent = amounts && amounts.length > 0 ? amounts[0] : '$2.500.000';
      const contractDuration = duration || '12 meses';
      const relevantLaws = laws && laws.length > 0 ? laws.join(', ') : 'Ley 820 de 2003';
      const relevantArticles = articles && articles.length > 0 ? articles.join(', ') : 'artículo 22';

      const mockSimplifiedGuide: SimplifiedGuide = {
        id: 'guide-' + Date.now(),
        summary: `## 1. Información de las personas

**Arrendador (Propietario):** ${landlordName} vive en Bogotá D.C.
**Arrendatario (Inquilino):** ${tenantName} vive en Bogotá D.C.

## 2. Qué se acuerda

${landlordName} le arrienda a ${tenantName} un apartamento ubicado en ${propertyAddress}. Este inmueble es exclusivamente para vivienda.

## 3. Tiempo del acuerdo

El contrato dura ${contractDuration} completos. Empieza el 1 de febrero de 2024 y termina el 31 de enero de 2025.

## 4. Dinero y pagos

${tenantName} debe pagar ${monthlyRent} pesos cada mes. Tiene que pagar en los primeros 5 días de cada mes.

## 5. Reajuste del canon

El valor del arriendo se ajusta cada año según el IPC (Índice de Precios al Consumidor) que certifica el DANE.

## 6. Depósito de garantía

${tenantName} debe dar $5.000.000 pesos (equivalente a 2 meses de arriendo) como depósito de garantía. Este dinero se devuelve al final si no hay daños.

## 7. Obligaciones del arrendador (${landlordName})

- Entregar el apartamento en buenas condiciones para vivir
- Hacer reparaciones grandes cuando sea necesario
- No molestar a ${tenantName} mientras vive ahí
- Cumplir con la ${relevantLaws}

## 8. Obligaciones del arrendatario (${tenantName})

- Pagar el arriendo a tiempo cada mes
- Usar el apartamento solo para vivir
- Cuidar bien el apartamento
- No arrendar a otras personas sin permiso escrito
- Cumplir con el Código Civil Colombiano

## 9. Cómo termina el acuerdo

El contrato termina cuando:
- Se acaba el tiempo (31 de enero de 2025)
- Las dos personas están de acuerdo en terminarlo
- Se cumple alguna de las causales del ${relevantArticles} de la ${relevantLaws}

**Marco Legal:** Este contrato está regido por la ${relevantLaws} y el Código Civil Colombiano.

**Nota Jurisdiccional:** Colombia (Nacional) - Esta jurisdicción sigue el derecho civil, donde los códigos escritos son primarios.`,
        reading_level: 'B1'
      };

      setSimplifiedGuide(mockSimplifiedGuide);
      
    } catch (err) {
      setError(language === 'es' ? 'Error al generar el resumen simplificado. Por favor intenta de nuevo.'
        : 'Failed to generate simplified summary. Please try again.');
    } finally {
      setIsSimplifying(false);
    }
  };

  const handleGenerateGuide = () => {
    onNavigateToGuide(docId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-just-beige dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <Loader2 className="w-12 h-12 text-just-moss animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">
            {language === 'es' ? 'Cargando Documento' : 'Loading Document'}
          </h2>
          <p className="text-just-gray dark:text-gray-400">
            {language === 'es' ? 'Por favor espera mientras preparamos el resumen de tu documento...'
              : 'Please wait while we prepare your document summary...'
            }
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-just-beige dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">{t.error}</h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={onNavigateBack}
            className="bg-just-brown dark:bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown transition-colors duration-300"
          >
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-just-beige dark:bg-gray-900">
      {/* Header */}
      <div className="bg-just-white dark:bg-gray-800 shadow-sm border-b border-just-sand dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={onNavigateBack}
            className="inline-flex items-center text-just-hunter dark:text-gray-300 hover:text-just-forest dark:hover:text-just-white transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-just-forest dark:bg-just-moss rounded-xl flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-just-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-just-forest dark:text-just-white">{document?.title}</h1>
                <div className="flex items-center space-x-4 text-just-gray dark:text-gray-400">
                  <span>{document?.document_type}</span>
                  <span>•</span>
                  <span>{language === 'es' ? 'Subido' : 'Uploaded'} {new Date(document?.upload_date || '').toLocaleDateString()}</span>
                  {document?.jurisdiction && (
                    <>
                      <span>•</span>
                      <span className="text-just-moss">{document.jurisdiction.country} ({document.jurisdiction.region})</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleGenerateGuide}
              className="bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300 flex items-center"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {t.generateGuide}
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original Text */}
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="p-6 border-b border-just-sand dark:border-gray-700">
              <h2 className="text-xl font-semibold text-just-forest dark:text-just-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                {t.originalDocument}
              </h2>
              <p className="text-just-gray dark:text-gray-400 text-sm mt-1">
                {language === 'es' ? 'Texto extraído de tu documento subido'
                  : 'Extracted text from your uploaded document'
                }
              </p>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-just-hunter dark:text-gray-300 font-mono text-sm leading-relaxed bg-just-beige/50 dark:bg-gray-700/50 p-4 rounded-xl border border-just-sand dark:border-gray-600">
                  {document?.extracted_text}
                </pre>
              </div>
            </div>
          </div>

          {/* Simplified Summary */}
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="p-6 border-b border-just-sand dark:border-gray-700">
              <h2 className="text-xl font-semibold text-just-forest dark:text-just-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                {t.simplifiedSummary}
              </h2>
              <p className="text-just-gray dark:text-gray-400 text-sm mt-1">
                {language === 'es' ? 'Explicación en español claro a nivel B1'
                  : 'Plain language explanation at B1 reading level'
                }
              </p>
            </div>
            <div className="p-6">
              {isSimplifying ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-just-moss animate-spin mx-auto mb-4" />
                  <p className="text-just-gray dark:text-gray-400">
                    {language === 'es' ? 'Generando resumen simplificado...'
                      : 'Generating simplified summary...'
                    }
                  </p>
                </div>
              ) : simplifiedGuide ? (
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="text-just-hunter dark:text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: simplifiedGuide.summary
                        .replace(/## /g, '<h3 class="text-lg font-semibold text-just-forest dark:text-just-white mt-6 mb-3">')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-just-forest dark:text-just-white">$1</strong>')
                        .replace(/\n\n/g, '</p><p class="mb-4">')
                        .replace(/^/, '<p class="mb-4">')
                        .replace(/$/, '</p>')
                        .replace(/- /g, '• ')
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-just-gray dark:text-gray-400 mx-auto mb-4" />
                  <p className="text-just-gray dark:text-gray-400">
                    {language === 'es' ? 'No hay resumen simplificado disponible'
                      : 'No simplified summary available'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-just-moss to-just-brown rounded-2xl p-6 text-just-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{t.needMoreHelp}</h3>
              <BookOpen className="w-8 h-8" />
            </div>
            <p className="text-just-white/80 mb-4">
              {language === 'es' ? 'Obtén una guía detallada paso a paso que te guíe a través de cada sección de tu contrato de arrendamiento colombiano.'
                : 'Get a detailed step-by-step guide that walks you through each section of your Colombian rental contract.'
              }
            </p>
            <button 
              onClick={handleGenerateGuide}
              className="bg-just-white text-just-moss px-4 py-2 rounded-xl font-medium hover:bg-just-beige transition-colors duration-200"
            >
              {t.generateGuide}
            </button>
          </div>

          <div className="bg-gradient-to-br from-just-forest to-just-hunter rounded-2xl p-6 text-just-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{t.understandingTerms}</h3>
              <Sparkles className="w-8 h-8" />
            </div>
            <p className="text-just-white/80 mb-4">
              {language === 'es' ? 'Nuestra IA ha traducido el lenguaje legal complejo en español claro basado en la legislación colombiana.'
                : 'Our AI has translated complex legal language into plain language based on Colombian legislation.'
              }
            </p>
            <div className="bg-just-white/20 px-3 py-2 rounded-lg">
              <span className="text-sm font-medium">
                {language === 'es' ? 'Nivel de Lectura: ' : 'Reading Level: '}{simplifiedGuide?.reading_level || 'B1'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}