import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { generateStepByStepGuide } from '../utils/guideGenerator';
import { ArrowLeft, Home, BookOpen, MapPin, Scale, CheckCircle, Clock } from 'lucide-react';
import { Language, getTranslations } from '../utils/i18n';

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
        const { summarizeDocument } = await import('../utils/summarizer');
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
          <BookOpen className="w-12 h-12 text-just-moss animate-spin mx-auto mb-4" />
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
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
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
              onClick={() => window.location.href = '/dashboard'}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-just-brown to-just-forest dark:from-just-moss dark:to-just-brown text-just-white rounded-xl font-semibold hover:from-just-forest hover:to-just-hunter dark:hover:from-just-brown dark:hover:to-just-forest transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5 mr-2" />
              <span className="text-lg">
                {language === 'es' ? 'Volver al Panel' : 'Back to Dashboard'}
              </span>
            </button>
          </div>

          {/* Título de la Página */}
          <div className="text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-just-forest dark:text-just-white mb-2 flex items-center justify-center">
              <BookOpen className="w-7 h-7 mr-3 text-just-moss" />
              {language === 'es' ? 'Resumen del Documento' : 'Document Summary'}
              {simplifiedGuide?.jurisdiction && (
                <span className="ml-3 text-lg font-normal text-just-hunter dark:text-gray-300">
                  - {simplifiedGuide.jurisdiction}
                </span>
              )}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          {/* Jurisdiction Info */}
          {simplifiedGuide?.jurisdiction && (
            <div className="mb-6 p-4 bg-gradient-to-r from-just-forest/10 to-just-hunter/10 dark:from-just-forest/20 dark:to-just-hunter/20 rounded-xl border border-just-forest/20 dark:border-just-forest/30">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-just-forest dark:text-just-moss" />
                  <span className="font-medium text-just-forest dark:text-just-moss">
                    {simplifiedGuide.jurisdiction}
                  </span>
                </div>
                {simplifiedGuide.legal_framework && (
                  <div className="flex items-center">
                    <Scale className="w-5 h-5 mr-2 text-just-hunter dark:text-gray-300" />
                    <span className="text-sm text-just-hunter dark:text-gray-300">
                      {simplifiedGuide.legal_framework}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-just-gray dark:text-gray-400 mb-6">
            {simplifiedGuide?.summary || (language === 'es' ? 'Sigue estos pasos clave para cumplir con la legislación aplicable.' : 'Follow these key steps to comply with applicable legislation.')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => fetchStepByStepGuide(docId)}
              className="bg-just-moss text-just-white px-4 py-2 rounded-xl font-medium hover:bg-just-brown transition-colors duration-200 flex items-center shadow"
              disabled={isSimplifying}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {isSimplifying
                ? (language === 'es' ? 'Regenerando...' : 'Regenerating...')
                : (language === 'es' ? 'Regenerar guía' : 'Regenerate Guide')
              }
            </button>
          </div>

          {/* Steps List - TEXTO COMPLETO SIN CORTES */}
          {simplifiedGuide && simplifiedGuide.steps && simplifiedGuide.steps.length > 0 && (
            <div className="space-y-6">
              {simplifiedGuide.steps.map((step: string, idx: number) => (
                <div 
                  key={idx} 
                  className="p-6 rounded-xl border-2 transition-all duration-200 border-just-sand dark:border-gray-600 bg-just-beige/30 dark:bg-gray-700/30"
                >
                  <div className="flex items-start space-x-4">
                    <button
                      className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-200 mt-1 border-just-gray dark:border-gray-500 hover:border-just-moss dark:hover:border-just-moss"
                    >
                      <Clock className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-3">
                        <span className="text-lg font-semibold text-just-moss mr-3">
                          {language === 'es' ? 'Paso' : 'Step'} {idx + 1}
                        </span>
                      </div>
                      
                      {/* TEXTO COMPLETO SIN LÍMITES DE CARACTERES */}
                      <div className="text-base leading-relaxed text-just-hunter dark:text-gray-300">
                        <p className="whitespace-pre-wrap break-words">
                          {step}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-just-sand dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4 text-sm text-just-gray dark:text-gray-400">
                <span>
                  {language === 'es' ? 'Nivel de Lectura: ' : 'Reading Level: '}{simplifiedGuide?.reading_level || 'B1'}
                </span>
                {simplifiedGuide?.jurisdiction && (
                  <span>
                    {language === 'es' ? 'Específico para' : 'Specific to'} {simplifiedGuide.jurisdiction}
                  </span>
                )}
                <span className="text-xs bg-just-moss/20 dark:bg-just-moss/30 text-just-moss px-2 py-1 rounded-full">
                  {language === 'es' ? 'Idioma: Español' : 'Language: English'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botón Flotante Adicional para Volver al Panel */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => window.location.href = '/dashboard'}
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