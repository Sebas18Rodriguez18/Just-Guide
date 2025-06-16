import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Sparkles, ChevronRight, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { Language, getTranslations } from '../utils/i18n';

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
      
      const mockDocument: Document = {
        id: docId,
        title: language === 'es' ? "Contrato de Arrendamiento" 
          : language === 'fr' ? "Contrat de Location"
          : language === 'de' ? "Mietvertrag"
          : language === 'pt' ? "Contrato de Aluguel"
          : language === 'ar' ? "عقد إيجار"
          : language === 'zh' ? "租赁合同"
          : language === 'hi' ? "किराया समझौता"
          : "Rental Agreement",
        document_type: language === 'es' ? "Contrato de Renta" 
          : language === 'fr' ? "Contrat de Location"
          : language === 'de' ? "Mietvertrag"
          : language === 'pt' ? "Contrato de Aluguel"
          : language === 'ar' ? "عقد إيجار"
          : language === 'zh' ? "租赁协议"
          : language === 'hi' ? "किराया समझौता"
          : "Rental Agreement",
        language: language,
        extracted_text: language === 'es' ? `CONTRATO DE ARRENDAMIENTO

PRIMERA: IDENTIFICACIÓN DE LAS PARTES
Arrendador: Juan Pérez García, mayor de edad, con domicilio en Calle Principal 123, Ciudad de México.
Arrendatario: María López Rodríguez, mayor de edad, con domicilio en Avenida Secundaria 456, Ciudad de México.

SEGUNDA: OBJETO DEL CONTRATO
El arrendador da en arrendamiento al arrendatario el inmueble ubicado en Calle Ejemplo 789, Colonia Centro, Ciudad de México, para uso habitacional.

TERCERA: PLAZO
El presente contrato tendrá una duración de 12 meses, iniciando el 1 de enero de 2024 y terminando el 31 de diciembre de 2024.

CUARTA: RENTA
La renta mensual será de $15,000.00 (quince mil pesos mexicanos), pagadera los primeros cinco días de cada mes.

QUINTA: DEPÓSITO
El arrendatario entregará un depósito equivalente a dos meses de renta como garantía del cumplimiento de sus obligaciones.

SEXTA: OBLIGACIONES DEL ARRENDADOR
- Entregar el inmueble en condiciones habitables
- Realizar reparaciones mayores
- Respetar el uso pacífico del inmueble

SÉPTIMA: OBLIGACIONES DEL ARRENDATARIO
- Pagar la renta puntualmente
- Usar el inmueble conforme a su destino
- Conservar el inmueble en buen estado
- No subarrendar sin autorización

OCTAVA: TERMINACIÓN
El contrato podrá terminarse por vencimiento del plazo o por incumplimiento de cualquiera de las partes.

Firmas:
_________________                    _________________
Juan Pérez García                    María López Rodríguez
Arrendador                          Arrendatario

Fecha: 15 de diciembre de 2023`
        : language === 'fr' ? `CONTRAT DE LOCATION

PREMIÈRE: IDENTIFICATION DES PARTIES
Bailleur: Juan Pérez García, majeur, domicilié Calle Principal 123, Mexico.
Locataire: María López Rodríguez, majeure, domiciliée Avenida Secundaria 456, Mexico.

DEUXIÈME: OBJET DU CONTRAT
Le bailleur loue au locataire le bien immobilier situé Calle Ejemplo 789, Colonia Centro, Mexico, à usage d'habitation.

TROISIÈME: DURÉE
Le présent contrat aura une durée de 12 mois, commençant le 1er janvier 2024 et se terminant le 31 décembre 2024.

QUATRIÈME: LOYER
Le loyer mensuel sera de 15 000,00 $ (quinze mille pesos mexicains), payable dans les cinq premiers jours de chaque mois.

CINQUIÈME: DÉPÔT
Le locataire versera un dépôt équivalent à deux mois de loyer comme garantie de l'exécution de ses obligations.

SIXIÈME: OBLIGATIONS DU BAILLEUR
- Livrer le bien en conditions habitables
- Effectuer les réparations majeures
- Respecter l'usage paisible du bien

SEPTIÈME: OBLIGATIONS DU LOCATAIRE
- Payer le loyer ponctuellement
- Utiliser le bien conformément à sa destination
- Conserver le bien en bon état
- Ne pas sous-louer sans autorisation

HUITIÈME: RÉSILIATION
Le contrat pourra être résilié par expiration du délai ou par manquement de l'une des parties.

Signatures:
_________________                    _________________
Juan Pérez García                    María López Rodríguez
Bailleur                            Locataire

Date: 15 décembre 2023`
        : `RENTAL AGREEMENT

FIRST: IDENTIFICATION OF PARTIES
Landlord: Juan Pérez García, of legal age, residing at 123 Main Street, Mexico City.
Tenant: María López Rodríguez, of legal age, residing at 456 Second Avenue, Mexico City.

SECOND: SUBJECT OF CONTRACT
The landlord rents to the tenant the property located at 789 Example Street, Downtown, Mexico City, for residential use.

THIRD: TERM
This contract shall have a duration of 12 months, starting January 1, 2024 and ending December 31, 2024.

FOURTH: RENT
The monthly rent shall be $15,000.00 (fifteen thousand Mexican pesos), payable within the first five days of each month.

FIFTH: DEPOSIT
The tenant shall provide a deposit equivalent to two months' rent as guarantee for compliance with obligations.

SIXTH: LANDLORD OBLIGATIONS
- Deliver the property in habitable conditions
- Perform major repairs
- Respect peaceful use of the property

SEVENTH: TENANT OBLIGATIONS
- Pay rent punctually
- Use property according to its intended purpose
- Maintain property in good condition
- Not sublease without authorization

EIGHTH: TERMINATION
The contract may be terminated by expiration of term or breach by either party.

Signatures:
_________________                    _________________
Juan Pérez García                    María López Rodríguez
Landlord                           Tenant

Date: December 15, 2023`,
        upload_date: new Date().toISOString()
      };

      setDocument(mockDocument);
      
      // Auto-generate simplified summary
      await generateSimplifiedSummary(mockDocument.extracted_text);
      
    } catch (err) {
      setError(language === 'es' ? 'Error al cargar el documento. Por favor intenta de nuevo.'
        : language === 'fr' ? 'Échec du chargement du document. Veuillez réessayer.'
        : language === 'de' ? 'Fehler beim Laden des Dokuments. Bitte versuchen Sie es erneut.'
        : language === 'pt' ? 'Falha ao carregar documento. Por favor, tente novamente.'
        : language === 'ar' ? 'فشل في تحميل الوثيقة. يرجى المحاولة مرة أخرى.'
        : language === 'zh' ? '加载文档失败。请重试。'
        : language === 'hi' ? 'दस्तावेज़ लोड करने में विफल। कृपया पुनः प्रयास करें।'
        : 'Failed to load document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSimplifiedSummary = async (extractedText: string) => {
    try {
      setIsSimplifying(true);
      
      // Simulate calling legal-simplifier function with language parameter
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSimplifiedGuide: SimplifiedGuide = {
        id: 'guide-' + Date.now(),
        summary: language === 'es' ? `## 1. Información de las personas

**Propietario:** Juan Pérez García vive en Calle Principal 123, Ciudad de México.
**Inquilino:** María López Rodríguez vive en Avenida Secundaria 456, Ciudad de México.

## 2. Qué se acuerda

Juan le renta a María una casa ubicada en Calle Ejemplo 789, Colonia Centro, Ciudad de México. Esta casa es solo para vivir, no para negocio.

## 3. Tiempo del acuerdo

El contrato dura 12 meses completos. Empieza el 1 de enero de 2024 y termina el 31 de diciembre de 2024.

## 4. Dinero y pagos

María debe pagar $15,000 pesos cada mes. Tiene que pagar en los primeros 5 días de cada mes.

## 5. Garantías

María debe dar $30,000 pesos (equivalente a 2 meses de renta) como garantía. Este dinero se devuelve al final si no hay daños.

## 6. Obligaciones del propietario (Juan)

- Entregar la casa en buenas condiciones para vivir
- Arreglar problemas grandes de la casa
- No molestar a María mientras vive ahí

## 7. Obligaciones del inquilino (María)

- Pagar la renta a tiempo cada mes
- Usar la casa solo para vivir
- Cuidar bien la casa
- No rentar la casa a otras personas sin permiso

## 8. Cómo termina el acuerdo

El contrato termina cuando:
- Se acaba el tiempo (31 de diciembre de 2024)
- Una de las dos personas no cumple lo acordado`
        : language === 'fr' ? `## 1. Informations des personnes

**Propriétaire:** Juan Pérez García vit à Calle Principal 123, Mexico.
**Locataire:** María López Rodríguez vit à Avenida Secundaria 456, Mexico.

## 2. Ce qui est convenu

Juan loue à María une maison située à Calle Ejemplo 789, Colonia Centro, Mexico. Cette maison est uniquement pour habiter, pas pour les affaires.

## 3. Durée de l'accord

Le contrat dure 12 mois complets. Il commence le 1er janvier 2024 et se termine le 31 décembre 2024.

## 4. Argent et paiements

María doit payer 15 000 pesos chaque mois. Elle doit payer dans les 5 premiers jours de chaque mois.

## 5. Garanties

María doit donner 30 000 pesos (équivalent à 2 mois de loyer) comme garantie. Cet argent est rendu à la fin s'il n'y a pas de dommages.

## 6. Obligations du propriétaire (Juan)

- Livrer la maison en bonnes conditions pour vivre
- Réparer les gros problèmes de la maison
- Ne pas déranger María pendant qu'elle y vit

## 7. Obligations du locataire (María)

- Payer le loyer à temps chaque mois
- Utiliser la maison uniquement pour vivre
- Bien prendre soin de la maison
- Ne pas louer la maison à d'autres personnes sans permission

## 8. Comment se termine l'accord

Le contrat se termine quand:
- Le temps est écoulé (31 décembre 2024)
- Une des deux personnes ne respecte pas ce qui est convenu`
        : `## 1. Personal Information

**Landlord:** Juan Pérez García lives at Calle Principal 123, Mexico City.
**Tenant:** María López Rodríguez lives at Avenida Secundaria 456, Mexico City.

## 2. What is agreed

Juan rents to María a house located at Calle Ejemplo 789, Colonia Centro, Mexico City. This house is only for living, not for business.

## 3. Agreement duration

The contract lasts 12 complete months. It starts January 1, 2024 and ends December 31, 2024.

## 4. Money and payments

María must pay $15,000 pesos each month. She has to pay within the first 5 days of each month.

## 5. Guarantees

María must give $30,000 pesos (equivalent to 2 months rent) as guarantee. This money is returned at the end if there are no damages.

## 6. Landlord obligations (Juan)

- Deliver the house in good conditions for living
- Fix major problems with the house
- Not disturb María while she lives there

## 7. Tenant obligations (María)

- Pay rent on time each month
- Use the house only for living
- Take good care of the house
- Not rent the house to other people without permission

## 8. How the agreement ends

The contract ends when:
- The time is up (December 31, 2024)
- One of the two people doesn't comply with what was agreed`,
        reading_level: 'B1'
      };

      setSimplifiedGuide(mockSimplifiedGuide);
      
    } catch (err) {
      setError(language === 'es' ? 'Error al generar el resumen simplificado. Por favor intenta de nuevo.'
        : language === 'fr' ? 'Échec de la génération du résumé simplifié. Veuillez réessayer.'
        : language === 'de' ? 'Fehler beim Erstellen der vereinfachten Zusammenfassung. Bitte versuchen Sie es erneut.'
        : language === 'pt' ? 'Falha ao gerar resumo simplificado. Por favor, tente novamente.'
        : language === 'ar' ? 'فشل في إنشاء الملخص المبسط. يرجى المحاولة مرة أخرى.'
        : language === 'zh' ? '生成简化摘要失败。请重试。'
        : language === 'hi' ? 'सरलीकृत सारांश बनाने में विफल। कृपया पुनः प्रयास करें।'
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
            {language === 'es' ? 'Cargando Documento'
              : language === 'fr' ? 'Chargement du Document'
              : language === 'de' ? 'Dokument Laden'
              : language === 'pt' ? 'Carregando Documento'
              : language === 'ar' ? 'تحميل الوثيقة'
              : language === 'zh' ? '加载文档'
              : language === 'hi' ? 'दस्तावेज़ लोड कर रहे हैं'
              : 'Loading Document'
            }
          </h2>
          <p className="text-just-gray dark:text-gray-400">
            {language === 'es' ? 'Por favor espera mientras preparamos el resumen de tu documento...'
              : language === 'fr' ? 'Veuillez patienter pendant que nous préparons le résumé de votre document...'
              : language === 'de' ? 'Bitte warten Sie, während wir die Zusammenfassung Ihres Dokuments vorbereiten...'
              : language === 'pt' ? 'Por favor, aguarde enquanto preparamos o resumo do seu documento...'
              : language === 'ar' ? 'يرجى الانتظار بينما نحضر ملخص وثيقتك...'
              : language === 'zh' ? '请稍候，我们正在准备您的文档摘要...'
              : language === 'hi' ? 'कृपया प्रतीक्षा करें जबकि हम आपके दस्तावेज़ का सारांश तैयार करते हैं...'
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
                <p className="text-just-gray dark:text-gray-400">
                  {document?.document_type} • {language === 'es' ? 'Subido' : language === 'fr' ? 'Téléchargé' : language === 'de' ? 'Hochgeladen' : language === 'pt' ? 'Enviado' : language === 'ar' ? 'تم التحميل' : language === 'zh' ? '已上传' : language === 'hi' ? 'अपलोड किया गया' : 'Uploaded'} {new Date(document?.upload_date || '').toLocaleDateString()}
                </p>
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
                  : language === 'fr' ? 'Texte extrait de votre document téléchargé'
                  : language === 'de' ? 'Aus Ihrem hochgeladenen Dokument extrahierter Text'
                  : language === 'pt' ? 'Texto extraído do seu documento enviado'
                  : language === 'ar' ? 'النص المستخرج من وثيقتك المحملة'
                  : language === 'zh' ? '从您上传的文档中提取的文本'
                  : language === 'hi' ? 'आपके अपलोड किए गए दस्तावेज़ से निकाला गया टेक्स्ट'
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
                  : language === 'fr' ? 'Explication en français clair au niveau B1'
                  : language === 'de' ? 'Erklärung in klarem Deutsch auf B1-Niveau'
                  : language === 'pt' ? 'Explicação em português claro no nível B1'
                  : language === 'ar' ? 'شرح بالعربية الواضحة في المستوى B1'
                  : language === 'zh' ? 'B1级别的清晰中文解释'
                  : language === 'hi' ? 'B1 स्तर पर स्पष्ट हिंदी में व्याख्या'
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
                      : language === 'fr' ? 'Génération du résumé simplifié...'
                      : language === 'de' ? 'Erstelle vereinfachte Zusammenfassung...'
                      : language === 'pt' ? 'Gerando resumo simplificado...'
                      : language === 'ar' ? 'إنشاء ملخص مبسط...'
                      : language === 'zh' ? '生成简化摘要...'
                      : language === 'hi' ? 'सरलीकृत सारांश बना रहे हैं...'
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
                      : language === 'fr' ? 'Aucun résumé simplifié disponible'
                      : language === 'de' ? 'Keine vereinfachte Zusammenfassung verfügbar'
                      : language === 'pt' ? 'Nenhum resumo simplificado disponível'
                      : language === 'ar' ? 'لا يوجد ملخص مبسط متاح'
                      : language === 'zh' ? '没有可用的简化摘要'
                      : language === 'hi' ? 'कोई सरलीकृत सारांश उपलब्ध नहीं'
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
              {language === 'es' ? 'Obtén una guía detallada paso a paso que te guíe a través de cada sección de tu documento.'
                : language === 'fr' ? 'Obtenez un guide détaillé étape par étape qui vous guide à travers chaque section de votre document.'
                : language === 'de' ? 'Erhalten Sie eine detaillierte Schritt-für-Schritt-Anleitung, die Sie durch jeden Abschnitt Ihres Dokuments führt.'
                : language === 'pt' ? 'Obtenha um guia detalhado passo a passo que o orienta através de cada seção do seu documento.'
                : language === 'ar' ? 'احصل على دليل مفصل خطوة بخطوة يرشدك عبر كل قسم من وثيقتك.'
                : language === 'zh' ? '获取详细的逐步指南，引导您完成文档的每个部分。'
                : language === 'hi' ? 'एक विस्तृत चरणबद्ध गाइड प्राप्त करें जो आपके दस्तावेज़ के प्रत्येक अनुभाग के माध्यम से आपका मार्गदर्शन करती है।'
                : 'Get a detailed step-by-step guide that walks you through each section of your document.'
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
              {language === 'es' ? 'Nuestra IA ha traducido el lenguaje legal complejo en español claro que puedes entender.'
                : language === 'fr' ? 'Notre IA a traduit le langage juridique complexe en français clair que vous pouvez comprendre.'
                : language === 'de' ? 'Unsere KI hat komplexe Rechtssprache in klares Deutsch übersetzt, das Sie verstehen können.'
                : language === 'pt' ? 'Nossa IA traduziu linguagem jurídica complexa em português claro que você pode entender.'
                : language === 'ar' ? 'لقد ترجم الذكاء الاصطناعي لدينا اللغة القانونية المعقدة إلى عربية واضحة يمكنك فهمها.'
                : language === 'zh' ? '我们的AI已将复杂的法律语言翻译成您可以理解的清晰中文。'
                : language === 'hi' ? 'हमारे AI ने जटिल कानूनी भाषा को स्पष्ट हिंदी में अनुवाद किया है जिसे आप समझ सकते हैं।'
                : 'Our AI has translated complex legal language into plain language you can understand.'
              }
            </p>
            <div className="bg-just-white/20 px-3 py-2 rounded-lg">
              <span className="text-sm font-medium">
                {language === 'es' ? 'Nivel de Lectura: ' : language === 'fr' ? 'Niveau de Lecture: ' : language === 'de' ? 'Leseniveau: ' : language === 'pt' ? 'Nível de Leitura: ' : language === 'ar' ? 'مستوى القراءة: ' : language === 'zh' ? '阅读水平: ' : language === 'hi' ? 'पठन स्तर: ' : 'Reading Level: '}{simplifiedGuide?.reading_level || 'B1'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}