import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Sparkles, ChevronRight, Loader2, AlertCircle, BookOpen, MapPin, Scale, Home } from 'lucide-react';
import { Language, getTranslations } from '../utils/i18n';
import { supabase } from '../utils/supabaseClient';
import { generateStepByStepGuide } from '../utils/guideGenerator';
import { summarizeDocument } from '../utils/summarizer';
import { useNavigate } from 'react-router-dom';

interface SummaryPageProps {
  onNavigateBack: () => void;
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
  detected_language?: string;
}

interface SimplifiedGuide {
  id?: string;
  steps: string[];
  summary: string;
  reading_level: string;
  jurisdiction?: string;
  legal_framework?: string;
  created_at?: string;
}

export default function SummaryPage({ 
  onNavigateBack, 
  docId, 
  userId,
  language 
}: SummaryPageProps) {
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [simplifiedGuide, setSimplifiedGuide] = useState<SimplifiedGuide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docSummary, setDocSummary] = useState<{ summary: string; keyPoints: string[] }>({ summary: '', keyPoints: [] });

  const t = getTranslations(language);

  useEffect(() => {
    loadDocument();
    setSimplifiedGuide(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  // Cargar documento y mostrar resumen real
  const loadDocument = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', docId)
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        setError(language === 'es' ? 'No se encontró el documento.' : 'Document not found.');
        setIsLoading(false);
        return;
      }
      
      const realDocument: Document = {
        id: data.id,
        title: data.title,
        document_type: data.document_type,
        language: data.language,
        extracted_text: data.extracted_text || '',
        upload_date: data.upload_date || data.created_at || '',
        detected_language: data.detected_language
      };
      
      setDocument(realDocument);
      
      // Generar resumen y puntos clave EN EL IDIOMA DEL USUARIO
      if (data.extracted_text) {
        setDocSummary(summarizeDocument(data.extracted_text, language));
      } else {
        setDocSummary({ summary: '', keyPoints: [] });
      }
      
      // Buscar o generar la guía automáticamente
      await autoFetchOrGenerateGuide(data.id, data.extracted_text || '');
    } catch (err) {
      setError(language === 'es' ? 'Error al cargar el documento. Por favor intenta de nuevo.'
        : 'Failed to load document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar o generar la guía paso a paso automáticamente
  const autoFetchOrGenerateGuide = async (docId: string, extractedText: string) => {
    setIsSimplifying(true);
    try {
      // Buscar si ya existe la guía en Supabase
      const { data, error } = await supabase
        .from('simplified_guides')
        .select('*')
        .eq('document_id', docId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching guide:', error);
      }
      
      if (data) {
        setSimplifiedGuide(data);
        setIsSimplifying(false);
        return;
      }
      
      // Si no existe y hay texto, generar y guardar una nueva guía
      if (extractedText && extractedText.length > 0) {
        // CRÍTICO: Usar el idioma del USUARIO, no del documento detectado
        const guide = await generateStepByStepGuide(extractedText, language);
        const { data: insertData, error: insertError } = await supabase
          .from('simplified_guides')
          .insert([
            {
              document_id: docId,
              steps: guide.steps,
              summary: guide.summary,
              reading_level: guide.reading_level,
              created_at: new Date().toISOString()
            }
          ])
          .select('*')
          .maybeSingle();
        
        if (insertError) {
          console.error('Error inserting guide:', insertError);
        }
        
        // Agregar información de jurisdicción al guide
        const enhancedGuide = {
          ...(insertData || guide),
          jurisdiction: guide.jurisdiction,
          legal_framework: guide.legal_framework
        };
        
        setSimplifiedGuide(enhancedGuide);
      }
    } catch (err) {
      console.error('Error in autoFetchOrGenerateGuide:', err);
    } finally {
      setIsSimplifying(false);
    }
  };

  // Consultar la guía paso a paso manualmente (por si el usuario la quiere refrescar)
  const fetchStepByStepGuide = async (docId: string) => {
    setIsSimplifying(true);
    try {
      const { data, error } = await supabase
        .from('simplified_guides')
        .select('*')
        .eq('document_id', docId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching guide:', error);
      }
      
      if (data) {
        setSimplifiedGuide(data);
      }
    } catch (err) {
      console.error('Error in fetchStepByStepGuide:', err);
    } finally {
      setIsSimplifying(false);
    }
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
      {/* Header Mejorado con Botones Más Visibles */}
      <div className="bg-just-white dark:bg-gray-800 shadow-sm border-b border-just-sand dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Botones de Navegación Prominentes */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <button
              onClick={onNavigateBack}
              className="inline-flex items-center px-4 py-2 bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 rounded-xl hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 shadow-md"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="font-medium">{t.back}</span>
            </button>
            
            {/* BOTÓN PRINCIPAL: Volver al Panel - MUY VISIBLE */}
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-just-brown to-just-forest dark:from-just-moss dark:to-just-brown text-just-white rounded-xl font-semibold hover:from-just-forest hover:to-just-hunter dark:hover:from-just-brown dark:hover:to-just-forest transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5 mr-2" />
              <span className="text-lg">
                {language === 'es' ? 'Volver al Panel' : 'Back to Dashboard'}
              </span>
            </button>
          </div>

          {/* Información del Documento */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                  {document?.detected_language && (
                    <>
                      <span>•</span>
                      <span className="text-just-moss">
                        {document.detected_language === 'es' ? 'Español' : 'English'}
                      </span>
                    </>
                  )}
                  {simplifiedGuide?.jurisdiction && (
                    <>
                      <span>•</span>
                      <div className="flex items-center text-just-moss">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{simplifiedGuide.jurisdiction}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate(`/guides/${docId}`)}
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
                <pre className="whitespace-pre-wrap text-just-hunter dark:text-gray-300 font-mono text-sm leading-relaxed bg-just-beige/50 dark:bg-gray-700/50 p-4 rounded-xl border border-just-sand dark:border-gray-600 max-h-96 overflow-y-auto">
                  {document?.extracted_text}
                </pre>
              </div>
            </div>
          </div>

          {/* Simplified Summary / Step-by-step Guide */}
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="p-6 border-b border-just-sand dark:border-gray-700">
              <h2 className="text-xl font-semibold text-just-forest dark:text-just-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                {t.simplifiedSummary}
              </h2>
              <p className="text-just-gray dark:text-gray-400 text-sm mt-1">
                {language === 'es' ? 'Análisis inteligente con pasos específicos por país'
                  : 'Intelligent analysis with country-specific steps'
                }
              </p>
            </div>
            <div className="p-6">
              {/* Mostrar resumen mejorado */}
              <div className="mb-6 p-6 bg-gradient-to-br from-just-moss/10 to-just-beige/60 dark:from-just-moss/20 dark:to-gray-700/40 rounded-2xl border border-just-moss/30 dark:border-just-moss/40 shadow-sm">
                <h3 className="text-xl font-bold text-just-forest dark:text-just-moss mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-just-moss" />
                  {language === 'es' ? 'Resumen del Documento' : 'Document Summary'}
                </h3>
                <p className="text-just-hunter dark:text-gray-200 text-base leading-relaxed mb-4">
                  {docSummary.summary || (language === 'es' ? 'No se pudo generar un resumen.' : 'No summary available.')}
                </p>
                {docSummary.keyPoints.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-base font-semibold text-just-moss dark:text-just-moss mb-1">
                      {language === 'es' ? 'Puntos clave:' : 'Key Points:'}
                    </h4>
                    <ul className="list-disc pl-6 space-y-1">
                      {docSummary.keyPoints.map((point, idx) => (
                        <li key={idx} className="text-just-hunter dark:text-gray-300 text-sm">{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Información de Jurisdicción */}
              {simplifiedGuide?.jurisdiction && (
                <div className="mb-6 p-4 bg-gradient-to-r from-just-forest/10 to-just-hunter/10 dark:from-just-forest/20 dark:to-just-hunter/20 rounded-xl border border-just-forest/20 dark:border-just-forest/30">
                  <div className="flex items-center mb-2">
                    <Scale className="w-5 h-5 mr-2 text-just-forest dark:text-just-moss" />
                    <h4 className="text-base font-semibold text-just-forest dark:text-just-moss">
                      {language === 'es' ? 'Marco Legal Detectado' : 'Detected Legal Framework'}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-just-hunter dark:text-gray-300" />
                      <span className="text-just-hunter dark:text-gray-300">
                        <strong>{simplifiedGuide.jurisdiction}</strong>
                      </span>
                    </div>
                    {simplifiedGuide.legal_framework && (
                      <div className="text-just-hunter dark:text-gray-300">
                        <span className="text-xs opacity-75">{simplifiedGuide.legal_framework}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botón para refrescar la guía paso a paso */}
              <button
                onClick={() => fetchStepByStepGuide(docId)}
                className="bg-just-moss text-just-white px-4 py-2 rounded-xl font-medium hover:bg-just-brown transition-colors duration-200 mb-4 flex items-center shadow"
                disabled={isSimplifying}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                {isSimplifying
                  ? (language === 'es' ? 'Generando pasos...' : 'Generating steps...')
                  : (language === 'es' ? 'Actualizar pasos legales' : 'Update Legal Steps')
                }
              </button>

              {/* Mostrar la guía si ya está cargada */}
              {simplifiedGuide && simplifiedGuide.steps && simplifiedGuide.steps.length > 0 && (
                <div className="prose prose-sm max-w-none mt-4 bg-gradient-to-br from-just-moss/10 to-just-beige/60 dark:from-just-moss/20 dark:to-gray-700/40 rounded-2xl border border-just-moss/30 dark:border-just-moss/40 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-just-forest dark:text-just-moss mb-2 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-just-moss" />
                    {language === 'es' ? 'Pasos Legales Recomendados' : 'Recommended Legal Steps'}
                    {simplifiedGuide.jurisdiction && (
                      <span className="ml-2 text-sm font-normal text-just-hunter dark:text-gray-300">
                        ({simplifiedGuide.jurisdiction})
                      </span>
                    )}
                  </h3>
                  <ol className="list-decimal pl-6 space-y-3">
                    {simplifiedGuide.steps.map((step: string, idx: number) => (
                      <li key={idx} className="text-just-hunter dark:text-gray-300 text-sm leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                  <div className="bg-just-white/20 px-3 py-2 rounded-lg mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {language === 'es' ? 'Nivel de Lectura: ' : 'Reading Level: '}{simplifiedGuide.reading_level || 'B1'}
                    </span>
                    {simplifiedGuide.jurisdiction && (
                      <span className="text-xs text-just-hunter dark:text-gray-300 opacity-75">
                        {language === 'es' ? 'Específico para' : 'Specific to'} {simplifiedGuide.jurisdiction}
                      </span>
                    )}
                  </div>
                  <div className="bg-just-moss/20 dark:bg-just-moss/30 px-3 py-2 rounded-lg mt-2">
                    <span className="text-xs font-medium text-just-moss">
                      {language === 'es' ? '✓ Pasos generados en español según tu configuración' : '✓ Steps generated in English according to your settings'}
                    </span>
                  </div>
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
            <p className="text-just-white/80 mb-2">
              {language === 'es' ? 'Los pasos mostrados están adaptados específicamente para la legislación detectada y generados en español.'
                : 'The steps shown are specifically adapted for the detected legislation and generated in English.'
              }
            </p>
          </div>

          <div className="bg-gradient-to-br from-just-forest to-just-hunter rounded-2xl p-6 text-just-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{t.understandingTerms}</h3>
              <Scale className="w-8 h-8" />
            </div>
            <p className="text-just-white/80 mb-4">
              {language === 'es' ? 'Nuestra IA detecta automáticamente el país y genera pasos específicos en tu idioma preferido según la legislación local aplicable.'
                : 'Our AI automatically detects the country and generates specific steps in your preferred language according to applicable local legislation.'
              }
            </p>
            <div className="bg-just-white/20 px-3 py-2 rounded-lg">
              <span className="text-sm font-medium">
                {language === 'es' ? 'Nivel de Lectura: ' : 'Reading Level: '}{simplifiedGuide?.reading_level || 'B1'}
              </span>
            </div>
          </div>
        </div>

        {/* Botón Flotante Adicional para Volver al Panel */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-just-brown to-just-forest dark:from-just-moss dark:to-just-brown text-just-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
            title={language === 'es' ? 'Volver al Panel Principal' : 'Back to Main Dashboard'}
          >
            <Home className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
}