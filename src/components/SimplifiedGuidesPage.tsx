import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Search, Eye, Download, Calendar, Sparkles, Trash, Home, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { getTranslations } from '../utils/i18n';
import { smartCapitalize } from '../utils/textCapitalization';
import { supabase } from '../utils/supabaseClient';

interface SimplifiedGuide {
  id: string;
  document_id: string;
  document_title: string;
  document_type: string;
  summary: string;
  reading_level: string;
  created_at: string;
  word_count: number;
  steps: string[];
}

export default function SimplifiedGuidesPage() {
  const navigate = useNavigate();
  const { user, language } = useAppContext();
  const userId = user?.id || '';
  const [guides, setGuides] = useState<SimplifiedGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const t = getTranslations(language);

  useEffect(() => {
    const loadGuides = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Cargando guías para usuario:', userId);
        
        // Primero, verificar si hay documentos del usuario
        const { data: userDocuments, error: docsError } = await supabase
          .from('documents')
          .select('id, title, document_type')
          .eq('user_id', userId);
        
        console.log('📄 Documentos del usuario:', userDocuments);
        
        if (docsError) {
          console.error('❌ Error cargando documentos:', docsError);
          setDebugInfo({ error: 'Error cargando documentos', details: docsError });
          return;
        }
        
        if (!userDocuments || userDocuments.length === 0) {
          console.log('📭 No hay documentos para este usuario');
          setGuides([]);
          setDebugInfo({ message: 'No hay documentos subidos aún' });
          return;
        }
        
        // Luego, buscar guías para esos documentos
        const documentIds = userDocuments.map(doc => doc.id);
        console.log('🔍 Buscando guías para documentos:', documentIds);
        
        const { data: guidesData, error: guidesError } = await supabase
          .from('simplified_guides')
          .select('*')
          .in('document_id', documentIds)
          .order('created_at', { ascending: false });
        
        console.log('📚 Guías encontradas:', guidesData);
        
        if (guidesError) {
          console.error('❌ Error cargando guías:', guidesError);
          setDebugInfo({ error: 'Error cargando guías', details: guidesError });
          return;
        }
        
        if (!guidesData || guidesData.length === 0) {
          console.log('📭 No hay guías generadas aún');
          setGuides([]);
          setDebugInfo({ 
            message: 'No hay guías generadas', 
            documents: userDocuments.length,
            suggestion: 'Sube un documento y ve al resumen para generar una guía'
          });
          return;
        }
        
        // Combinar datos de guías con información de documentos
        const enrichedGuides = guidesData.map(guide => {
          const document = userDocuments.find(doc => doc.id === guide.document_id);
          return {
            id: guide.id,
            document_id: guide.document_id,
            document_title: document?.title || 'Documento sin título',
            document_type: document?.document_type || 'Tipo desconocido',
            summary: guide.summary,
            reading_level: guide.reading_level,
            created_at: guide.created_at,
            word_count: guide.summary ? guide.summary.split(/\s+/).length : 0,
            steps: guide.steps || []
          };
        });
        
        console.log('✅ Guías procesadas:', enrichedGuides);
        setGuides(enrichedGuides);
        setDebugInfo({ 
          success: true, 
          guidesCount: enrichedGuides.length,
          documentsCount: userDocuments.length 
        });
        
      } catch (error) {
        console.error('💥 Error general:', error);
        setDebugInfo({ error: 'Error general', details: error });
        setGuides([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      loadGuides();
    } else {
      setIsLoading(false);
      setDebugInfo({ error: 'No hay usuario autenticado' });
    }
  }, [userId]);

  const handleDeleteGuide = async (guideId: string) => {
    try {
      const { error } = await supabase
        .from('simplified_guides')
        .delete()
        .eq('id', guideId);
      
      if (error) {
        console.error('Error deleting guide:', error);
        return;
      }
      
      setGuides((guides) => guides.filter((g) => g.id !== guideId));
    } catch (error) {
      console.error('Error deleting guide:', error);
    }
  };

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.document_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'all' || guide.reading_level === filterLevel;
    return matchesSearch && matchesFilter;
  });

  const exportGuide = (guide: SimplifiedGuide) => {
    const content = `${guide.document_title}\n\n${guide.summary}\n\nPasos:\n${guide.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guide.document_title.replace(/\s+/g, '-').toLowerCase()}-simplified.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-just-beige dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <BookOpen className="w-12 h-12 text-just-moss mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">{smartCapitalize(t.loading, 'title', language)}</h2>
          <p className="text-just-gray dark:text-gray-400">
            {smartCapitalize(language === 'es' ? 'cargando tus guías simplificadas...' : 'loading your simplified guides...', 'sentence', language)}
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
          {/* Botones de Navegación Prominentes */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 rounded-xl hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 shadow-md"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="font-medium">{smartCapitalize(t.back, 'title', language)}</span>
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-just-moss/20 dark:bg-just-moss/30 rounded-xl flex items-center justify-center mr-4">
                <BookOpen className="w-6 h-6 text-just-moss" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-just-forest dark:text-just-white">{smartCapitalize(t.simplifiedGuides, 'title', language)}</h1>
                <p className="text-just-gray dark:text-gray-400">
                  {smartCapitalize(
                    language === 'es' 
                      ? `${guides.length} guías simplificadas disponibles`
                      : `${guides.length} simplified guides available`,
                    'sentence',
                    language
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-just-moss/10 dark:bg-just-moss/20 px-3 py-2 rounded-xl">
                <div className="flex items-center">
                  <Sparkles className="w-4 h-4 text-just-moss mr-2" />
                  <span className="text-sm font-medium text-just-moss">
                    {smartCapitalize(language === 'es' ? 'nivel B1' : 'B1 level', 'title', language)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Debug Info - Solo mostrar si hay problemas */}
        {debugInfo && !debugInfo.success && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  {language === 'es' ? 'Información de diagnóstico' : 'Debug Information'}
                </h3>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  {debugInfo.error && <p><strong>Error:</strong> {debugInfo.error}</p>}
                  {debugInfo.message && <p><strong>Estado:</strong> {debugInfo.message}</p>}
                  {debugInfo.documents !== undefined && <p><strong>Documentos:</strong> {debugInfo.documents}</p>}
                  {debugInfo.suggestion && <p><strong>Sugerencia:</strong> {debugInfo.suggestion}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-just-gray dark:text-gray-400" />
              <input
                type="text"
                placeholder={smartCapitalize(language === 'es' ? 'buscar guías...' : 'search guides...', 'sentence', language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-just-sand dark:border-gray-600 rounded-xl text-just-forest dark:text-just-white dark:bg-gray-700 placeholder-just-gray dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
              />
            </div>
            {/* Filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-just-sand dark:border-gray-600 rounded-xl text-just-forest dark:text-just-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
            >
              <option value="all">{smartCapitalize(language === 'es' ? 'todos los niveles' : 'all levels', 'title', language)}</option>
              <option value="A1">{smartCapitalize(language === 'es' ? 'nivel A1 (básico)' : 'A1 level (basic)', 'title', language)}</option>
              <option value="B1">{smartCapitalize(language === 'es' ? 'nivel B1 (intermedio)' : 'B1 level (intermediate)', 'title', language)}</option>
              <option value="B2">{smartCapitalize(language === 'es' ? 'nivel B2 (avanzado)' : 'B2 level (advanced)', 'title', language)}</option>
            </select>
          </div>
        </div>

        {/* Guides List */}
        {filteredGuides.length === 0 ? (
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-just-gray dark:text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">
              {smartCapitalize(language === 'es' ? 'no se encontraron guías' : 'no guides found', 'sentence', language)}
            </h3>
            <p className="text-just-gray dark:text-gray-400 mb-6">
              {searchTerm 
                ? smartCapitalize(language === 'es' ? 'intenta con diferentes términos de búsqueda' : 'try different search terms', 'sentence', language)
                : smartCapitalize(language === 'es' ? 'sube documentos DOCX y ve al resumen para generar guías automáticamente' : 'upload DOCX documents and go to summary to automatically generate guides', 'sentence', language)
              }
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/upload')}
                className="bg-just-brown dark:bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown transition-colors duration-300 mr-3"
              >
                {smartCapitalize(t.uploadDocument, 'title', language)}
              </button>
              {debugInfo && debugInfo.documents > 0 && (
                <p className="text-sm text-just-gray dark:text-gray-400">
                  {language === 'es' 
                    ? `Tienes ${debugInfo.documents} documento(s) subido(s). Ve al resumen de algún documento para generar su guía.`
                    : `You have ${debugInfo.documents} document(s) uploaded. Go to a document summary to generate its guide.`
                  }
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredGuides.map((guide) => (
              <div key={guide.id} className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  {/* Guide Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1">
                      <div className="w-12 h-12 bg-just-moss/20 dark:bg-just-moss/30 rounded-xl flex items-center justify-center mr-4">
                        <BookOpen className="w-6 h-6 text-just-moss" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-just-forest dark:text-just-white mb-1">
                          {smartCapitalize(guide.document_title, 'title', language)}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-just-gray dark:text-gray-400">
                          <span>{smartCapitalize(guide.document_type, 'proper', language)}</span>
                          <span>•</span>
                          <span>{guide.word_count} {smartCapitalize(language === 'es' ? 'palabras' : 'words', 'title', language)}</span>
                          <span>•</span>
                          <span>{guide.steps.length} {smartCapitalize(language === 'es' ? 'pasos' : 'steps', 'title', language)}</span>
                          <span>•</span>
                          <span>{new Date(guide.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-just-moss/10 dark:bg-just-moss/20 px-3 py-1 rounded-full">
                        <span className="text-xs font-medium text-just-moss">{guide.reading_level}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Guide Preview */}
                  <div className="mb-6">
                    <p className="text-just-hunter dark:text-gray-300 leading-relaxed line-clamp-3">
                      {guide.summary}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-just-sand dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => navigate(`/guides/${guide.document_id}`)}
                        className="bg-just-moss text-just-white px-6 py-2 rounded-xl font-medium hover:bg-just-brown transition-colors duration-200 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {smartCapitalize(language === 'es' ? 'ver guía completa' : 'view full guide', 'title', language)}
                      </button>
                      <button
                        onClick={() => exportGuide(guide)}
                        className="bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 px-4 py-2 rounded-xl font-medium hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {smartCapitalize(language === 'es' ? 'exportar' : 'export', 'title', language)}
                      </button>
                      <button
                        onClick={() => handleDeleteGuide(guide.id)}
                        className="bg-red-500 text-just-white px-4 py-2 rounded-xl font-medium hover:bg-red-600 transition-colors duration-200 flex items-center"
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        {smartCapitalize(language === 'es' ? 'eliminar' : 'delete', 'title', language)}
                      </button>
                    </div>
                    <div className="flex items-center text-sm text-just-gray dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {smartCapitalize(language === 'es' ? 'creado' : 'created', 'title', language)} {new Date(guide.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
  );
}