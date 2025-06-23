import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { generateStepByStepGuide } from '../utils/guideGenerator';
import { ArrowLeft, Home, BookOpen } from 'lucide-react';
import { Language, getTranslations } from '../utils/i18n';

interface GuidePageProps {
  onNavigateBack: () => void;
  onNavigateToDashboard: () => void;
  docId: string;
  userId: string;
  language: Language;
}

export default function GuidePage({ 
  onNavigateBack, 
  onNavigateToDashboard, 
  docId, 
  userId,
  language
}: GuidePageProps) {
  const [guide, setGuide] = useState<{ steps: string[]; summary: string; reading_level: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const t = getTranslations(language);

  useEffect(() => {
    fetchGuide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  const fetchGuide = async () => {
    setIsLoading(true);
    // Buscar guía en Supabase
    const { data } = await supabase
      .from('simplified_guides')
      .select('*')
      .eq('document_id', docId)
      .single();
    if (data) {
      setGuide(data);
      setIsLoading(false);
      return;
    }
    // Si no existe, buscar el texto del documento y generar la guía
    const { data: docData } = await supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .eq('user_id', userId)
      .single();
    if (docData && docData.extracted_text) {
      const generated = await generateStepByStepGuide(docData.extracted_text, language);
      const insertResult = await supabase.from('simplified_guides').insert([
        {
          document_id: docId,
          steps: generated.steps,
          summary: generated.summary,
          reading_level: generated.reading_level,
          created_at: new Date().toISOString()
        }
      ]).select('*').single();
      setGuide(insertResult.data || generated);
    }
    setIsLoading(false);
  };

  const handleRefreshGuide = async () => {
    setIsRefreshing(true);
    // Buscar el texto del documento y regenerar la guía
    const { data: docData } = await supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .eq('user_id', userId)
      .single();
    if (docData && docData.extracted_text) {
      const generated = await generateStepByStepGuide(docData.extracted_text, language);
      const insertResult = await supabase.from('simplified_guides')
        .upsert([
          {
            document_id: docId,
            steps: generated.steps,
            summary: generated.summary,
            reading_level: generated.reading_level,
            created_at: new Date().toISOString()
          }
        ], { onConflict: 'document_id' })
        .select('*').single();
      setGuide(insertResult.data || generated);
    }
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-just-beige dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 lg:p-8 text-center max-w-md w-full">
          <BookOpen className="w-12 h-12 text-just-moss mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">
            {language === 'es' ? 'Generando tu Guía Paso a Paso' : 'Generating Your Step-by-Step Guide'}
          </h2>
          <p className="text-just-gray dark:text-gray-400">
            {language === 'es' ? 'Analizando tu contrato y creando pasos clave...' : 'Analyzing your contract and creating key steps...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-just-beige dark:bg-gray-900">
      <div className="bg-just-white dark:bg-gray-800 shadow-sm border-b border-just-sand dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onNavigateBack}
            className="inline-flex items-center text-just-hunter dark:text-gray-300 hover:text-just-forest dark:hover:text-just-white transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-just-forest dark:text-just-white mb-2 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-just-moss" />
            {language === 'es' ? 'Guía Paso a Paso' : 'Step-by-Step Guide'}
          </h1>
          <p className="text-just-gray dark:text-gray-400 mb-4">
            {guide?.summary || (language === 'es' ? 'Sigue estos pasos clave para cumplir el contrato.' : 'Follow these key steps to comply with the contract.')}
          </p>
          <button
            onClick={handleRefreshGuide}
            className="bg-just-moss text-just-white px-4 py-2 rounded-xl font-medium hover:bg-just-brown transition-colors duration-200 mb-4 flex items-center shadow"
            disabled={isRefreshing}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            {isRefreshing
              ? (language === 'es' ? 'Generando...' : 'Generating...')
              : (language === 'es' ? 'Regenerar guía' : 'Regenerate Guide')
            }
          </button>
          {guide && guide.steps && guide.steps.length > 0 && (
            <ol className="list-decimal pl-6 space-y-3 mt-4">
              {guide.steps.map((step: string, idx: number) => (
                <li key={idx} className="text-just-hunter dark:text-gray-300 text-base leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          )}
          <div className="bg-just-white/20 px-3 py-2 rounded-lg mt-6">
            <span className="text-sm font-medium">
              {language === 'es' ? 'Nivel de Lectura: ' : 'Reading Level: '}{guide?.reading_level || 'B1'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}