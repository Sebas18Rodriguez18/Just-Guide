import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { generateStepByStepGuide } from '../utils/guideGenerator';
import { ArrowLeft, Home, FileText, Sparkles, ChevronRight, Loader2, AlertCircle, BookOpen, MapPin, Scale } from 'lucide-react';
import { Language, getTranslations } from '../utils/i18n';
import { summarizeDocument } from '../utils/summarizer';
import { useNavigate } from 'react-router-dom';
import { smartCapitalize } from '../utils/textCapitalization';
import VoicePlayer from './VoicePlayer';

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
  criminal_procedure_location?: string; // Nueva propiedad para ubicación del procedimiento penal
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
        setError(smartCapitalize(language === 'es' ? 'no se encontró el documento.' : 'document not found.', 'sentence', language));
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
        detected_language: data.detected_language,
        criminal_procedure_location: data.criminal_procedure_location // Obtener la ubicación del procedimiento penal
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
      setError(smartCapitalize(
        language === 'es' ? 'error al cargar el documento. Por favor intenta de nuevo.'
          : 'failed to load document. Please try again.',
        'sentence',
        language
      ));
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
        
        // Guardar en la base de datos
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-just-beige dark:bg-gray-900">
        <div className="flex items-center justify-center p-8">
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center max-w-md">
            <Loader2 className="w-12 h-12 text-just-moss animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">
              {smartCapitalize(language === 'es' ? 'cargando documento' : 'loading document', 'sentence', language)}
            </h2>
            <p className="text-just-gray dark:text-gray-400">
              {smartCapitalize(
                language === 'es' ? 'por favor espera mientras preparamos el resumen de tu documento...'
                  : 'please wait while we prepare your document summary...',
                'sentence',
                language
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-just-beige dark:bg-gray-900">
        <div className="flex items-center justify-center p-8">
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">{smartCapitalize(t.error, 'sentence', language)}</h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={onNavigateBack}
              className="bg-just-brown dark:bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown transition-colors duration-300"
            >
              {smartCapitalize(t.back, 'sentence', language)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-just-beige dark:bg-gray-900">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-start">
            <button
              onClick={onNavigateBack}
              className="inline-flex items-center px-4 py-2 bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 rounded-xl hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 shadow-md mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="font-medium">{smartCapitalize(t.back, 'sentence', language)}</span>
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 rounded-xl hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 shadow-md"
            >
              <Home className="w-4 h-4 mr-2" />
              <span className="font-medium">
                {smartCapitalize(language === 'es' ? 'panel' : 'dashboard', 'sentence', language)}
              </span>
            </button>
          </div>
          
          <button
            onClick={() => navigate(`/guides/${docId}`)}
            className="bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300 flex items-center self-start lg:self-auto"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            {smartCapitalize(t.generateGuide, 'sentence', language)}
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Información del Documento */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-just-forest dark:bg-just-moss rounded-xl flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-just-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-just-forest dark:text-just-white">{smartCapitalize(document?.title || '', 'sentence', language)}</h1>
              <div className="flex items-center space-x-4 text-just-gray dark:text-gray-400">
                <span>{smartCapitalize(document?.document_type || '', 'sentence', language)}</span>
                <span>•</span>
                <span>{smartCapitalize(language === 'es' ? 'subido' : 'uploaded', 'sentence', language)} {new Date(document?.upload_date || '').toLocaleDateString()}</span>
                {document?.detected_language && (
                  <>
                    <span>•</span>
                    <span className="text-just-moss">
                      {document.detected_language === 'es' ? 'Español' : 'English'}
                    </span>
                  </>
                )}
                {document?.criminal_procedure_location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center text-just-moss">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{document.criminal_procedure_location}</span>
                    </div>
                  </>
                )}
                {simplifiedGuide?.jurisdiction && !document?.criminal_procedure_location && (
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original Text */}
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="p-6 border-b border-just-sand dark:border-gray-700">
              <h2 className="text-xl font-semibold text-just-forest dark:text-just-white flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                {smartCapitalize(t.originalDocument, 'sentence', language)}
              </h2>
              <p className="text-just-gray dark:text-gray-400 text-sm mt-1">
                {smartCapitalize(
                  language === 'es' ? 'texto extraído de tu documento subido'
                    : 'extracted text from your uploaded document',
                  'sentence',
                  language
                )}
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
                {smartCapitalize(t.simplifiedSummary, 'sentence', language)}
              </h2>
              <p className="text-just-gray dark:text-gray-400 text-sm mt-1">
                {smartCapitalize(
                  language === 'es' ? 'análisis inteligente con pasos específicos por país'
                    : 'intelligent analysis with country-specific steps',
                  'sentence',
                  language
                )}
              </p>
            </div>
            <div className="p-6">
              {/* Mostrar resumen mejorado */}
              <div className="mb-6 p-6 bg-gradient-to-br from-just-moss/10 to-just-beige/60 dark:from-just-moss/20 dark:to-gray-700/40 rounded-2xl border border-just-moss/30 dark:border-just-moss/40 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-just-forest dark:text-just-moss flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-just-moss" />
                    {smartCapitalize(language === 'es' ? 'resumen del documento' : 'document summary', 'sentence', language)}
                  </h3>
                  {docSummary.summary && (
                    <VoicePlayer 
                      text={docSummary.summary} 
                      language={language}
                      size="sm"
                    />
                  )}
                </div>
                <p className="text-just-hunter dark:text-gray-200 text-base leading-relaxed mb-4">
                  {docSummary.summary || (smartCapitalize(language === 'es' ? 'no se pudo generar un resumen.' : 'no summary available.', 'sentence', language))}
                </p>
                {docSummary.keyPoints.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-base font-semibold text-just-moss dark:text-just-moss mb-1">
                      {smartCapitalize(language === 'es' ? 'puntos clave:' : 'key points:', 'sentence', language)}
                    </h4>
                    <ul className="list-disc pl-6 space-y-1">
                      {docSummary.keyPoints.map((point, idx) => (
                        <li key={idx} className="text-just-hunter dark:text-gray-300 text-sm">{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Información de Jurisdicción y Procedimiento Penal */}
              {(simplifiedGuide?.jurisdiction || document?.criminal_procedure_location) && (
                <div className="mb-6 p-4 bg-gradient-to-r from-just-forest/10 to-just-hunter/10 dark:from-just-forest/20 dark:to-just-hunter/20 rounded-xl border border-just-forest/20 dark:border-just-forest/30">
                  <div className="flex items-center mb-2">
                    <Scale className="w-5 h-5 mr-2 text-just-forest dark:text-just-moss" />
                    <h4 className="text-base font-semibold text-just-forest dark:text-just-moss">
                      {smartCapitalize(language === 'es' ? 'marco legal detectado' : 'detected legal framework', 'sentence', language)}
                    </h4>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {document?.criminal_procedure_location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-just-hunter dark:text-gray-300" />
                        <span className="text-just-hunter dark:text-gray-300">
                          <strong>{smartCapitalize(language === 'es' ? 'ubicación del procedimiento penal:' : 'criminal procedure location:', 'sentence', language)}</strong> {document.criminal_procedure_location}
                        </span>
                      </div>
                    )}
                    {simplifiedGuide?.jurisdiction && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-just-hunter dark:text-gray-300" />
                        <span className="text-just-hunter dark:text-gray-300">
                          <strong>{smartCapitalize(language === 'es' ? 'jurisdicción:' : 'jurisdiction:', 'sentence', language)}</strong> {simplifiedGuide.jurisdiction}
                        </span>
                      </div>
                    )}
                    {simplifiedGuide?.legal_framework && (
                      <div className="text-just-hunter dark:text-gray-300 ml-5">
                        <span className="text-xs opacity-75">{simplifiedGuide.legal_framework}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mostrar la guía si ya está cargada */}
              {simplifiedGuide && simplifiedGuide.steps && simplifiedGuide.steps.length > 0 && (
                <div className="prose prose-sm max-w-none mt-4 bg-gradient-to-br from-just-moss/10 to-just-beige/60 dark:from-just-moss/20 dark:to-gray-700/40 rounded-2xl border border-just-moss/30 dark:border-just-moss/40 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-just-forest dark:text-just-moss flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-just-moss" />
                      {smartCapitalize(language === 'es' ? 'pasos legales recomendados' : 'recommended legal steps', 'sentence', language)}
                      {simplifiedGuide.jurisdiction && (
                        <span className="ml-2 text-sm font-normal text-just-hunter dark:text-gray-300">
                          ({simplifiedGuide.jurisdiction})
                        </span>
                      )}
                    </h3>
                    <VoicePlayer 
                      text={simplifiedGuide.steps.join('. ')} 
                      language={language}
                      size="sm"
                    />
                  </div>
                  <ol className="list-decimal pl-6 space-y-3">
                    {simplifiedGuide.steps.map((step: string, idx: number) => (
                      <li key={idx} className="text-just-hunter dark:text-gray-300 text-sm leading-relaxed flex items-start">
                        <span className="flex-1">{step}</span>
                        <VoicePlayer 
                          text={step} 
                          language={language}
                          size="sm"
                          className="ml-2 flex-shrink-0"
                        />
                      </li>
                    ))}
                  </ol>
                  <div className="bg-just-white/20 px-3 py-2 rounded-lg mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {smartCapitalize(language === 'es' ? 'nivel de lectura: ' : 'reading level: ', 'sentence', language)}{simplifiedGuide.reading_level || 'B1'}
                    </span>
                    {simplifiedGuide.jurisdiction && (
                      <span className="text-xs text-just-hunter dark:text-gray-300 opacity-75">
                        {smartCapitalize(language === 'es' ? 'específico para' : 'specific to', 'sentence', language)} {simplifiedGuide.jurisdiction}
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

              {/* Loading state for guide generation */}
              {isSimplifying && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 text-just-moss animate-spin mr-3" />
                  <span className="text-just-hunter dark:text-gray-300">
                    {smartCapitalize(language === 'es' ? 'generando pasos legales...' : 'generating legal steps...', 'sentence', language)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-just-moss to-just-brown rounded-2xl p-6 text-just-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{smartCapitalize(t.needMoreHelp, 'sentence', language)}</h3>
              <BookOpen className="w-8 h-8" />
            </div>
            <p className="text-just-white/80 mb-2">
              {smartCapitalize(
                language === 'es' ? 'los pasos mostrados están adaptados específicamente para la legislación detectada y generados en español.'
                  : 'the steps shown are specifically adapted for the detected legislation and generated in English.',
                'sentence',
                language
              )}
            </p>
          </div>

          <div className="bg-gradient-to-br from-just-forest to-just-hunter rounded-2xl p-6 text-just-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{smartCapitalize(t.understandingTerms, 'sentence', language)}</h3>
              <Scale className="w-8 h-8" />
            </div>
            <p className="text-just-white/80 mb-4">
              {smartCapitalize(
                language === 'es' ? 'nuestra IA detecta automáticamente el país y genera pasos específicos en tu idioma preferido según la legislación local aplicable.'
                  : 'our AI automatically detects the country and generates specific steps in your preferred language according to applicable local legislation.',
                'sentence',
                language
              )}
            </p>
            <div className="bg-just-white/20 px-3 py-2 rounded-lg">
              <span className="text-sm font-medium">
                {smartCapitalize(language === 'es' ? 'nivel de lectura: ' : 'reading level: ', 'sentence', language)}{simplifiedGuide?.reading_level || 'B1'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}