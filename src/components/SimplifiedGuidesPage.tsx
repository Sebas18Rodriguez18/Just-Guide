import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Search, Eye, Download, Calendar, Sparkles, Trash } from 'lucide-react';
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
}

export default function SimplifiedGuidesPage() {
  const navigate = useNavigate();
  const { user, language } = useAppContext();
  const userId = user?.id || '';
  const [guides, setGuides] = useState<SimplifiedGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const t = getTranslations(language);

  useEffect(() => {
    const loadGuides = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('simplified_guides')
          .select(`
            id,
            document_id,
            summary,
            reading_level,
            created_at,
            documents (
              title,
              document_type,
              user_id
            )
          `)
          .order('created_at', { ascending: false });
        if (error) throw error;
        const userGuides = (data || [])
          .map((g: {
            id: string;
            document_id: string;
            summary: string;
            reading_level: string;
            created_at: string;
            documents: { title: string; document_type: string; user_id: string } | Array<{ title: string; document_type: string; user_id: string }>;
          }) => {
            const doc = Array.isArray(g.documents) ? g.documents[0] : g.documents;
            if (!doc || doc.user_id !== userId) return null;
            return {
              id: g.id,
              document_id: g.document_id,
              document_title: doc.title,
              document_type: doc.document_type,
              summary: g.summary,
              reading_level: g.reading_level,
              created_at: g.created_at,
              word_count: g.summary ? g.summary.split(/\s+/).length : 0,
            };
          })
          .filter(Boolean) as SimplifiedGuide[];
        setGuides(userGuides);
      } catch (error) {
        console.error('Failed to load guides:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadGuides();
  }, [userId]);

  const handleDeleteGuide = async (guideId: string) => {
    try {
      await supabase.from('simplified_guides').delete().eq('id', guideId);
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
    const content = `${guide.document_title}\n\n${guide.summary}`;
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
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-just-hunter dark:text-gray-300 hover:text-just-forest dark:hover:text-just-white transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {smartCapitalize(t.back, 'title', language)}
          </button>
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
            <p className="text-just-gray dark:text-gray-400">
              {searchTerm 
                ? smartCapitalize(language === 'es' ? 'intenta con diferentes términos de búsqueda' : 'try different search terms', 'sentence', language)
                : smartCapitalize(language === 'es' ? 'sube documentos para generar guías simplificadas' : 'upload documents to generate simplified guides', 'sentence', language)
              }
            </p>
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
    </div>
  );
}