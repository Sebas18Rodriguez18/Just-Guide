import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { generateStepByStepGuide } from '../utils/guideGenerator';
import { ArrowLeft, Home, BookOpen, MapPin, Scale, CheckCircle, Clock, Sparkles, Save, Download } from 'lucide-react';
import { Language, getTranslations } from '../utils/i18n';
import Swal from 'sweetalert2';

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

interface GuideWithJurisdiction {
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
  const [guide, setGuide] = useState<GuideWithJurisdiction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGuideSaved, setIsGuideSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docSummary, setDocSummary] = useState<{ summary: string; keyPoints: string[] }>({ summary: '', keyPoints: [] });

  const t = getTranslations(language);

  useEffect(() => {
    loadDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  // Cargar documento y verificar si ya tiene guía guardada
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
      
      // Generar resumen básico
      if (data.extracted_text) {
        const { summarizeDocument } = await import('../utils/summarizer');
        setDocSummary(summarizeDocument(data.extracted_text, language));
      }
      
      // Verificar si ya existe una guía guardada
      await checkIfGuideExists(data.id);
      
    } catch (err) {
      setError(language === 'es' ? 'Error al cargar el documento. Por favor intenta de nuevo.'
        : 'Failed to load document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar si ya existe una guía guardada para este documento
  const checkIfGuideExists = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('simplified_guides')
        .select('*')
        .eq('document_id', documentId)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking guide:', error);
        return;
      }
      
      if (data) {
        setIsGuideSaved(true);
        setGuide({
          id: data.id,
          steps: data.steps || [],
          summary: data.summary || '',
          reading_level: data.reading_level || 'B1',
          created_at: data.created_at
        });
      }
    } catch (err) {
      console.error('Error checking guide:', err);
    }
  };

  // Generar guía paso a paso
  const handleGenerateGuide = async () => {
    if (!document || !document.extracted_text) {
      Swal.fire({
        icon: 'warning',
        title: language === 'es' ? 'Sin texto' : 'No text',
        text: language === 'es' ? 'No hay texto extraído para generar la guía.' : 'No extracted text available to generate guide.',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Generar guía usando el idioma del usuario
      const generated = await generateStepByStepGuide(document.extracted_text, language);
      
      setGuide({
        steps: generated.steps,
        summary: generated.summary,
        reading_level: generated.reading_level,
        jurisdiction: generated.jurisdiction,
        legal_framework: generated.legal_framework
      });

      Swal.fire({
        icon: 'success',
        title: language === 'es' ? '¡Guía generada!' : 'Guide generated!',
        text: language === 'es' ? 'Tu guía paso a paso ha sido generada exitosamente.' : 'Your step-by-step guide has been generated successfully.',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err) {
      console.error('Error generating guide:', err);
      Swal.fire({
        icon: 'error',
        title: language === 'es' ? 'Error' : 'Error',
        text: language === 'es' ? 'No se pudo generar la guía. Intenta de nuevo.' : 'Could not generate guide. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Guardar guía en Guías Simplificadas
  const handleSaveGuide = async () => {
    if (!guide || !document) {
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('simplified_guides')
        .upsert([
          {
            document_id: docId,
            summary: guide.summary,
            steps: guide.steps,
            reading_level: guide.reading_level,
            created_at: new Date().toISOString()
          }
        ], { onConflict: 'document_id' })
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      setIsGuideSaved(true);
      setGuide(prev => ({ ...prev!, id: data.id, created_at: data.created_at }));
      
      Swal.fire({
        icon: 'success',
        title: language === 'es' ? '¡Guía guardada!' : 'Guide saved!',
        text: language === 'es' ? 'Tu guía ha sido guardada en "Guías Simplificadas".' : 'Your guide has been saved to "Simplified Guides".',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err) {
      console.error('Error saving guide:', err);
      Swal.fire({
        icon: 'error',
        title: language === 'es' ? 'Error' : 'Error',
        text: language === 'es' ? 'No se pudo guardar la guía. Intenta de nuevo.' : 'Could not save guide. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Exportar guía como archivo de texto
  const handleExportGuide = () => {
    if (!guide || !document) return;
    
    const content = `${document.title}\n\n${guide.summary}\n\nPasos:\n${guide.steps.map((step, index) => `${index + 1}. ${step}`).join('\n\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/\s+/g, '-').toLowerCase()}-guia.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-just-beige dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 lg:p-8 text-center max-w-md w-full">
          <BookOpen className="w-12 h-12 text-just-moss mx-auto mb-4 animate-pulse" />
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
              {guide?.jurisdiction && (
                <span className="ml-3 text-lg font-normal text-just-hunter dark:text-gray-300">
                  - {guide.jurisdiction}
                </span>
              )}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          {/* Document Info */}
          <div className="mb-6 p-4 bg-gradient-to-r from-just-forest/10 to-just-hunter/10 dark:from-just-forest/20 dark:to-just-hunter/20 rounded-xl border border-just-forest/20 dark:border-just-forest/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-just-forest dark:text-just-white">{document?.title}</h2>
                <div className="flex items-center space-x-4 text-just-gray dark:text-gray-400 mt-1">
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
                </div>
              </div>
              
              {/* Status de la guía */}
              {isGuideSaved && (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium text-sm">
                    {language === 'es' ? 'Guía guardada' : 'Guide saved'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Jurisdiction Info */}
          {guide?.jurisdiction && (
            <div className="mb-6 p-4 bg-gradient-to-r from-just-forest/10 to-just-hunter/10 dark:from-just-forest/20 dark:to-just-hunter/20 rounded-xl border border-just-forest/20 dark:border-just-forest/30">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-just-forest dark:text-just-moss" />
                  <span className="font-medium text-just-forest dark:text-just-moss">
                    {guide.jurisdiction}
                  </span>
                </div>
                {guide.legal_framework && (
                  <div className="flex items-center">
                    <Scale className="w-5 h-5 mr-2 text-just-hunter dark:text-gray-300" />
                    <span className="text-sm text-just-hunter dark:text-gray-300">
                      {guide.legal_framework}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Document Summary */}
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

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {!guide && (
              <button
                onClick={handleGenerateGuide}
                className="bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-brown transition-colors duration-200 flex items-center shadow disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-just-white mr-2"></div>
                    {language === 'es' ? 'Generando...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5 mr-2" />
                    {language === 'es' ? 'Generar Guía Paso a Paso' : 'Generate Step-by-Step Guide'}
                  </>
                )}
              </button>
            )}

            {guide && !isGuideSaved && (
              <button
                onClick={handleSaveGuide}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors duration-200 flex items-center shadow disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {language === 'es' ? 'Guardando...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    {language === 'es' ? 'Guardar en Guías Simplificadas' : 'Save to Simplified Guides'}
                  </>
                )}
              </button>
            )}

            {guide && (
              <button
                onClick={handleExportGuide}
                className="bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center shadow"
              >
                <Download className="w-5 h-5 mr-2" />
                {language === 'es' ? 'Exportar Guía' : 'Export Guide'}
              </button>
            )}

            {isGuideSaved && (
              <button
                onClick={() => window.location.href = '/guides'}
                className="bg-just-brown dark:bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown transition-colors duration-200 flex items-center shadow"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                {language === 'es' ? 'Ver en Guías Simplificadas' : 'View in Simplified Guides'}
              </button>
            )}
          </div>

          {/* Generated Guide Preview */}
          {guide && guide.steps && guide.steps.length > 0 && (
            <div className="prose prose-sm max-w-none mt-4 bg-gradient-to-br from-just-moss/10 to-just-beige/60 dark:from-just-moss/20 dark:to-gray-700/40 rounded-2xl border border-just-moss/30 dark:border-just-moss/40 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-just-forest dark:text-just-moss mb-2 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-just-moss" />
                {language === 'es' ? 'Guía Paso a Paso Generada' : 'Generated Step-by-Step Guide'}
                {guide.jurisdiction && (
                  <span className="ml-2 text-sm font-normal text-just-hunter dark:text-gray-300">
                    ({guide.jurisdiction})
                  </span>
                )}
              </h3>
              
              <p className="text-just-hunter dark:text-gray-300 mb-4">{guide.summary}</p>
              
              <ol className="list-decimal pl-6 space-y-3">
                {guide.steps.slice(0, 3).map((step: string, idx: number) => (
                  <li key={idx} className="text-just-hunter dark:text-gray-300 text-sm leading-relaxed">
                    {step.length > 200 ? step.substring(0, 200) + '...' : step}
                  </li>
                ))}
                {guide.steps.length > 3 && (
                  <li className="text-just-moss font-medium text-sm">
                    {language === 'es' 
                      ? `... y ${guide.steps.length - 3} pasos más`
                      : `... and ${guide.steps.length - 3} more steps`
                    }
                  </li>
                )}
              </ol>
              
              <div className="bg-just-white/20 px-3 py-2 rounded-lg mt-4 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {language === 'es' ? 'Nivel de Lectura: ' : 'Reading Level: '}{guide.reading_level || 'B1'}
                </span>
                {guide.jurisdiction && (
                  <span className="text-xs text-just-hunter dark:text-gray-300 opacity-75">
                    {language === 'es' ? 'Específico para' : 'Specific to'} {guide.jurisdiction}
                  </span>
                )}
              </div>
              
              {isGuideSaved && (
                <div className="bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg mt-2 flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    {language === 'es' ? '✓ Guía guardada en "Guías Simplificadas"' : '✓ Guide saved to "Simplified Guides"'}
                  </span>
                </div>
              )}
            </div>
          )}
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