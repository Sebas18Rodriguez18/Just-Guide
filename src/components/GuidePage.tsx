import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { generateStepByStepGuide } from '../utils/guideGenerator';
import { ArrowLeft, Home, BookOpen, MapPin, Scale, CheckCircle, Clock } from 'lucide-react';
import { Language, getTranslations } from '../utils/i18n';
import { smartCapitalize } from '../utils/textCapitalization';
import VoicePlayer from './VoicePlayer';
import Navbar from './Navbar';

interface GuidePageProps {
  onNavigateBack: () => void;
  onNavigateToDashboard: () => void;
  docId: string;
  userId: string;
  language: Language;
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

export default function GuidePage({ 
  onNavigateBack, 
  onNavigateToDashboard, 
  docId, 
  userId,
  language
}: GuidePageProps) {
  const [guide, setGuide] = useState<GuideWithJurisdiction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const t = getTranslations(language);

  useEffect(() => {
    fetchGuide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  const fetchGuide = async () => {
    setIsLoading(true);
    try {
      // Buscar guía en Supabase
      const { data, error } = await supabase
        .from('simplified_guides')
        .select('*')
        .eq('document_id', docId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching guide:', error);
      }
      
      if (data) {
        setGuide(data);
        setCompletedSteps(new Array(data.steps.length).fill(false));
        setIsLoading(false);
        return;
      }
      
      // Si no existe, buscar el texto del documento y generar la guía
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', docId)
        .eq('user_id', userId)
        .single();
      
      if (docError) {
        console.error('Error fetching document:', docError);
        setIsLoading(false);
        return;
      }
      
      if (docData && docData.extracted_text) {
        // CRÍTICO: Usar el idioma del USUARIO, no del documento detectado
        const generated = await generateStepByStepGuide(docData.extracted_text, language);
        const { data: insertData, error: insertError } = await supabase
          .from('simplified_guides')
          .insert([
            {
              document_id: docId,
              steps: generated.steps,
              summary: generated.summary,
              reading_level: generated.reading_level,
              created_at: new Date().toISOString()
            }
          ])
          .select('*')
          .maybeSingle();
        
        if (insertError) {
          console.error('Error inserting guide:', insertError);
        }
        
        // Agregar información de jurisdicción
        const enhancedGuide = {
          ...(insertData || generated),
          jurisdiction: generated.jurisdiction,
          legal_framework: generated.legal_framework
        };
        
        setGuide(enhancedGuide);
        setCompletedSteps(new Array(generated.steps.length).fill(false));
      }
    } catch (err) {
      console.error('Error in fetchGuide:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshGuide = async () => {
    setIsRefreshing(true);
    try {
      // Buscar el texto del documento y regenerar la guía
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', docId)
        .eq('user_id', userId)
        .single();
      
      if (docError) {
        console.error('Error fetching document:', docError);
        setIsRefreshing(false);
        return;
      }
      
      if (docData && docData.extracted_text) {
        // CRÍTICO: Usar el idioma del USUARIO, no del documento detectado
        const generated = await generateStepByStepGuide(docData.extracted_text, language);
        const { data: insertData, error: insertError } = await supabase
          .from('simplified_guides')
          .upsert([
            {
              document_id: docId,
              steps: generated.steps,
              summary: generated.summary,
              reading_level: generated.reading_level,
              created_at: new Date().toISOString()
            }
          ], { onConflict: 'document_id' })
          .select('*')
          .maybeSingle();
        
        if (insertError) {
          console.error('Error upserting guide:', insertError);
        }
        
        // Agregar información de jurisdicción
        const enhancedGuide = {
          ...(insertData || generated),
          jurisdiction: generated.jurisdiction,
          legal_framework: generated.legal_framework
        };
        
        setGuide(enhancedGuide);
        setCompletedSteps(new Array(generated.steps.length).fill(false));
      }
    } catch (err) {
      console.error('Error in handleRefreshGuide:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleStepCompletion = (index: number) => {
    setCompletedSteps(prev => {
      const newCompleted = [...prev];
      newCompleted[index] = !newCompleted[index];
      return newCompleted;
    });
  };

  const completedCount = completedSteps.filter(Boolean).length;
  const totalSteps = completedSteps.length;
  const progressPercentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-just-beige dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center p-8">
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 lg:p-8 text-center max-w-md w-full">
            <BookOpen className="w-12 h-12 text-just-moss mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">
              {smartCapitalize(language === 'es' ? 'generando tu guía paso a paso' : 'generating your step-by-step guide', 'sentence', language)}
            </h2>
            <p className="text-just-gray dark:text-gray-400">
              {smartCapitalize(language === 'es' ? 'analizando tu documento y detectando jurisdicción...' : 'analyzing your document and detecting jurisdiction...', 'sentence', language)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-just-beige dark:bg-gray-900">
      <Navbar />
      
      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-start space-x-4">
            <button
              onClick={onNavigateBack}
              className="inline-flex items-center px-4 py-2 bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 rounded-xl hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 shadow-md"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="font-medium">{smartCapitalize(t.back, 'sentence', language)}</span>
            </button>
            
            <button
              onClick={onNavigateToDashboard}
              className="inline-flex items-center px-4 py-2 bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 rounded-xl hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 shadow-md"
            >
              <Home className="w-4 h-4 mr-2" />
              <span className="font-medium">
                {smartCapitalize(language === 'es' ? 'panel' : 'dashboard', 'sentence', language)}
              </span>
            </button>
          </div>
          
          <h1 className="text-2xl font-bold text-just-forest dark:text-just-white flex items-center">
            <BookOpen className="w-6 h-6 mr-3 text-just-moss" />
            {smartCapitalize(language === 'es' ? 'guía paso a paso' : 'step-by-step guide', 'sentence', language)}
            {guide?.jurisdiction && (
              <span className="ml-3 text-lg font-normal text-just-hunter dark:text-gray-300">
                - {guide.jurisdiction}
              </span>
            )}
          </h1>
        </div>

        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
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

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-just-forest dark:text-just-white">
                {smartCapitalize(language === 'es' ? 'progreso' : 'progress', 'sentence', language)}: {completedCount}/{totalSteps}
              </span>
              <span className="text-sm text-just-gray dark:text-gray-400">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-just-sand dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-just-moss h-3 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-just-gray dark:text-gray-400">
              {guide?.summary || (smartCapitalize(language === 'es' ? 'sigue estos pasos clave para cumplir con la legislación aplicable.' : 'follow these key steps to comply with applicable legislation.', 'sentence', language))}
            </p>
            {guide?.summary && (
              <VoicePlayer 
                text={guide.summary} 
                language={language}
                size="md"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={handleRefreshGuide}
              className="bg-just-moss text-just-white px-4 py-2 rounded-xl font-medium hover:bg-just-brown transition-colors duration-200 flex items-center shadow"
              disabled={isRefreshing}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {isRefreshing
                ? (smartCapitalize(language === 'es' ? 'regenerando...' : 'regenerating...', 'sentence', language))
                : (smartCapitalize(language === 'es' ? 'regenerar guía' : 'regenerate guide', 'sentence', language))
              }
            </button>
            
            {totalSteps > 0 && (
              <button
                onClick={() => setCompletedSteps(new Array(totalSteps).fill(true))}
                className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors duration-200 flex items-center"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {smartCapitalize(language === 'es' ? 'marcar todos' : 'mark all complete', 'sentence', language)}
              </button>
            )}
          </div>

          {/* Steps List - TEXTO COMPLETO SIN CORTES */}
          {guide && guide.steps && guide.steps.length > 0 && (
            <div className="space-y-6">
              {guide.steps.map((step: string, idx: number) => (
                <div 
                  key={idx} 
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    completedSteps[idx] 
                      ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-600' 
                      : 'border-just-sand dark:border-gray-600 bg-just-beige/30 dark:bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <button
                      onClick={() => toggleStepCompletion(idx)}
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-200 mt-1 ${
                        completedSteps[idx]
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-just-gray dark:border-gray-500 hover:border-just-moss dark:hover:border-just-moss'
                      }`}
                    >
                      {completedSteps[idx] ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-semibold text-just-moss mr-3">
                          {smartCapitalize(language === 'es' ? 'paso' : 'step', 'sentence', language)} {idx + 1}
                        </span>
                        <div className="flex items-center space-x-2">
                          {completedSteps[idx] && (
                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full font-medium">
                              {smartCapitalize(language === 'es' ? 'completado' : 'completed', 'sentence', language)}
                            </span>
                          )}
                          <VoicePlayer 
                            text={step} 
                            language={language}
                            size="sm"
                          />
                        </div>
                      </div>
                      
                      {/* TEXTO COMPLETO SIN LÍMITES DE CARACTERES */}
                      <div className={`text-base leading-relaxed ${
                        completedSteps[idx] 
                          ? 'text-green-800 dark:text-green-200' 
                          : 'text-just-hunter dark:text-gray-300'
                      }`}>
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
                  {smartCapitalize(language === 'es' ? 'nivel de lectura: ' : 'reading level: ', 'sentence', language)}{guide?.reading_level || 'B1'}
                </span>
                {guide?.jurisdiction && (
                  <span>
                    {smartCapitalize(language === 'es' ? 'específico para' : 'specific to', 'sentence', language)} {guide.jurisdiction}
                  </span>
                )}
                <span className="text-xs bg-just-moss/20 dark:bg-just-moss/30 text-just-moss px-2 py-1 rounded-full">
                  {language === 'es' ? 'Idioma: español' : 'Language: English'}
                </span>
              </div>
              
              {completedCount === totalSteps && totalSteps > 0 && (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    {smartCapitalize(language === 'es' ? '¡todos los pasos completados!' : 'all steps completed!', 'sentence', language)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botón Flotante Adicional para Volver al Panel */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={onNavigateToDashboard}
            className="bg-gradient-to-r from-just-brown to-just-forest dark:from-just-moss dark:to-just-brown text-just-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
            title={smartCapitalize(language === 'es' ? 'volver al panel principal' : 'back to main dashboard', 'sentence', language)}
          >
            <Home className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
}