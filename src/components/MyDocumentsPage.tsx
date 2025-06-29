import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Search, Eye, Download, MoreVertical, Upload, CheckCircle, Clock, AlertCircle, Trash, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { getTranslations } from '../utils/i18n';
import { smartCapitalize } from '../utils/textCapitalization';
import { supabase } from '../utils/supabaseClient';

interface Document {
  id: string;
  title: string;
  document_type: string;
  language: string;
  upload_date: string;
  status: 'completed' | 'processing' | 'failed';
  file_size: string;
  simplified: boolean;
  criminal_procedure_location?: string; // Nueva propiedad para ubicación del procedimiento penal
}

export default function MyDocumentsPage() {
  const navigate = useNavigate();
  const { user, language } = useAppContext();
  const userId = user?.id || '';
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const t = getTranslations(language);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('upload_date', { ascending: false });
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleDeleteDocument = async (docId: string) => {
    try {
      await supabase.from('documents').delete().eq('id', docId);
      setDocuments((docs) => docs.filter((d) => d.id !== docId));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing': return <Clock className="w-4 h-4 text-just-moss animate-pulse" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'processing': return 'bg-just-moss/20 dark:bg-just-moss/30 text-just-brown dark:text-just-moss';
      case 'failed': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return smartCapitalize(t.completed, 'title', language);
      case 'processing': return smartCapitalize(language === 'es' ? 'procesando' : 'processing', 'title', language);
      case 'failed': return smartCapitalize(t.failed, 'title', language);
      default: return smartCapitalize(t.pending, 'title', language);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.status === filterType;
    return matchesSearch && matchesFilter;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime();
      case 'name':
        return a.title.localeCompare(b.title);
      case 'type':
        return a.document_type.localeCompare(b.document_type);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-just-beige dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <FileText className="w-12 h-12 text-just-moss mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">{smartCapitalize(t.loading, 'title', language)}</h2>
          <p className="text-just-gray dark:text-gray-400">
            {smartCapitalize(language === 'es' ? 'cargando tus documentos...' : 'loading your documents...', 'sentence', language)}
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
              <div className="w-12 h-12 bg-just-forest dark:bg-just-moss rounded-xl flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-just-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-just-forest dark:text-just-white">{smartCapitalize(t.myDocuments, 'title', language)}</h1>
                <p className="text-just-gray dark:text-gray-400">
                  {smartCapitalize(
                    language === 'es' 
                      ? `${documents.length} documentos en total`
                      : `${documents.length} documents total`,
                    'sentence',
                    language
                  )}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/upload')}
              className="bg-just-brown dark:bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300 flex items-center"
            >
              <Upload className="w-5 h-5 mr-2" />
              {smartCapitalize(t.uploadDocument, 'title', language)}
            </button>
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
                placeholder={smartCapitalize(language === 'es' ? 'buscar documentos...' : 'search documents...', 'sentence', language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-just-sand dark:border-gray-600 rounded-xl text-just-forest dark:text-just-white dark:bg-gray-700 placeholder-just-gray dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-just-sand dark:border-gray-600 rounded-xl text-just-forest dark:text-just-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
              >
                <option value="all">{smartCapitalize(language === 'es' ? 'todos' : 'all', 'title', language)}</option>
                <option value="completed">{smartCapitalize(t.completed, 'title', language)}</option>
                <option value="processing">{smartCapitalize(language === 'es' ? 'procesando' : 'processing', 'title', language)}</option>
                <option value="failed">{smartCapitalize(t.failed, 'title', language)}</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-just-sand dark:border-gray-600 rounded-xl text-just-forest dark:text-just-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
              >
                <option value="date">{smartCapitalize(language === 'es' ? 'fecha' : 'date', 'title', language)}</option>
                <option value="name">{smartCapitalize(language === 'es' ? 'nombre' : 'name', 'title', language)}</option>
                <option value="type">{smartCapitalize(language === 'es' ? 'tipo' : 'type', 'title', language)}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        {sortedDocuments.length === 0 ? (
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-just-gray dark:text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">
              {smartCapitalize(language === 'es' ? 'no se encontraron documentos' : 'no documents found', 'sentence', language)}
            </h3>
            <p className="text-just-gray dark:text-gray-400 mb-6">
              {searchTerm 
                ? smartCapitalize(language === 'es' ? 'intenta con diferentes términos de búsqueda' : 'try different search terms', 'sentence', language)
                : smartCapitalize(language === 'es' ? 'sube tu primer documento para comenzar' : 'upload your first document to get started', 'sentence', language)
              }
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-just-brown dark:bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown transition-colors duration-300"
            >
              {smartCapitalize(t.uploadDocument, 'title', language)}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDocuments.map((doc) => (
              <div key={doc.id} className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  {/* Document Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-just-forest/10 dark:bg-just-moss/20 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="w-5 h-5 text-just-forest dark:text-just-moss" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-just-forest dark:text-just-white truncate">
                          {smartCapitalize(doc.title, 'title', language)}
                        </h3>
                        <p className="text-sm text-just-gray dark:text-gray-400">
                          {smartCapitalize(doc.document_type, 'proper', language)}
                        </p>
                      </div>
                    </div>
                    <button className="p-1 rounded-lg hover:bg-just-sand dark:hover:bg-gray-700 transition-colors duration-200">
                      <MoreVertical className="w-4 h-4 text-just-gray dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Status */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4 ${getStatusColor(doc.status)}`}>
                    {getStatusIcon(doc.status)}
                    <span className="ml-2">{getStatusText(doc.status)}</span>
                  </div>

                  {/* Document Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-just-gray dark:text-gray-400">
                        {smartCapitalize(language === 'es' ? 'subido' : 'uploaded', 'title', language)}
                      </span>
                      <span className="text-just-hunter dark:text-gray-300">
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-just-gray dark:text-gray-400">
                        {smartCapitalize(language === 'es' ? 'tamaño' : 'size', 'title', language)}
                      </span>
                      <span className="text-just-hunter dark:text-gray-300">{doc.file_size}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-just-gray dark:text-gray-400">
                        {smartCapitalize(language === 'es' ? 'simplificado' : 'simplified', 'title', language)}
                      </span>
                      <span className={`${doc.simplified ? 'text-green-600' : 'text-just-gray dark:text-gray-400'}`}>
                        {doc.simplified 
                          ? smartCapitalize(language === 'es' ? 'sí' : 'yes', 'title', language) 
                          : smartCapitalize(language === 'es' ? 'no' : 'no', 'title', language)
                        }
                      </span>
                    </div>
                    {doc.criminal_procedure_location && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-just-gray dark:text-gray-400">
                          {smartCapitalize(language === 'es' ? 'procedimiento penal' : 'criminal procedure', 'title', language)}
                        </span>
                        <span className="text-just-moss flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {doc.criminal_procedure_location}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {doc.status === 'completed' && (
                      <button
                        onClick={() => navigate(`/summary/${doc.id}`)}
                        className="flex-1 bg-just-moss text-just-white px-4 py-2 rounded-xl font-medium hover:bg-just-brown transition-colors duration-200 flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {smartCapitalize(language === 'es' ? 'ver' : 'view', 'title', language)}
                      </button>
                    )}
                    {doc.status === 'processing' && (
                      <button
                        disabled
                        className="flex-1 bg-just-gray/20 text-just-gray px-4 py-2 rounded-xl font-medium cursor-not-allowed flex items-center justify-center"
                      >
                        <Clock className="w-4 h-4 mr-2 animate-pulse" />
                        {smartCapitalize(language === 'es' ? 'procesando' : 'processing', 'title', language)}
                      </button>
                    )}
                    {doc.status === 'failed' && (
                      <button
                        className="flex-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-4 py-2 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200 flex items-center justify-center"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {smartCapitalize(language === 'es' ? 'reintentar' : 'retry', 'title', language)}
                      </button>
                    )}
                    <button className="p-2 rounded-xl bg-just-sand dark:bg-gray-700 hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200">
                      <Download className="w-4 h-4 text-just-hunter dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 rounded-xl bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200"
                    >
                      <Trash className="w-4 h-4 text-red-600 dark:text-red-200" />
                    </button>
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