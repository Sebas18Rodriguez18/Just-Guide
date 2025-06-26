import React, { useState, useEffect } from 'react';
import { ArrowLeft, History, Calendar, CheckCircle, Clock, AlertCircle, FileText, Scale, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { getTranslations } from '../utils/i18n';
import { smartCapitalize } from '../utils/textCapitalization';
import { supabase } from '../utils/supabaseClient';

interface LegalHistoryEntry {
  id: string;
  procedure_type: string;
  result: string;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
  description: string;
  entity?: string;
}

export default function LegalHistoryPage() {
  const navigate = useNavigate();
  const { user, language } = useAppContext();
  const userId = user?.id || '';
  const [history, setHistory] = useState<LegalHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const t = getTranslations(language);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('legal_history')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleDeleteHistory = async (entryId: string) => {
    try {
      await supabase.from('legal_history').delete().eq('id', entryId);
      setHistory((hist) => hist.filter((h) => h.id !== entryId));
    } catch (error) {
      console.error('Error deleting history:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-just-moss animate-pulse" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'in-progress': return 'bg-just-moss/20 dark:bg-just-moss/30 text-just-brown dark:text-just-moss';
      case 'pending': return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return smartCapitalize(t.completed, 'title', language);
      case 'in-progress': return smartCapitalize(t.inProgress, 'title', language);
      case 'pending': return smartCapitalize(t.pending, 'title', language);
      default: return smartCapitalize(t.pending, 'title', language);
    }
  };

  const getProcedureIcon = (type: string) => {
    if (type.toLowerCase().includes('contrato') || type.toLowerCase().includes('contract')) {
      return <FileText className="w-5 h-5 text-just-forest dark:text-just-moss" />;
    }
    if (type.toLowerCase().includes('demanda') || type.toLowerCase().includes('complaint')) {
      return <Scale className="w-5 h-5 text-just-forest dark:text-just-moss" />;
    }
    return <Building className="w-5 h-5 text-just-forest dark:text-just-moss" />;
  };

  const filteredHistory = history.filter(entry => {
    return filterStatus === 'all' || entry.status === filterStatus;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-just-beige dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <History className="w-12 h-12 text-just-moss mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">{smartCapitalize(t.loading, 'title', language)}</h2>
          <p className="text-just-gray dark:text-gray-400">
            {smartCapitalize(language === 'es' ? 'cargando tu historial legal...' : 'loading your legal history...', 'sentence', language)}
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
              <div className="w-12 h-12 bg-just-brown/20 dark:bg-just-brown/30 rounded-xl flex items-center justify-center mr-4">
                <History className="w-6 h-6 text-just-brown" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-just-forest dark:text-just-white">{smartCapitalize(t.legalHistory, 'title', language)}</h1>
                <p className="text-just-gray dark:text-gray-400">
                  {smartCapitalize(
                    language === 'es' 
                      ? `${history.length} procedimientos registrados`
                      : `${history.length} procedures recorded`,
                    'sentence',
                    language
                  )}
                </p>
              </div>
            </div>
            
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-just-sand dark:border-gray-600 rounded-xl text-just-forest dark:text-just-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
            >
              <option value="all">{smartCapitalize(language === 'es' ? 'todos' : 'all', 'title', language)}</option>
              <option value="completed">{smartCapitalize(t.completed, 'title', language)}</option>
              <option value="in-progress">{smartCapitalize(t.inProgress, 'title', language)}</option>
              <option value="pending">{smartCapitalize(t.pending, 'title', language)}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {sortedHistory.length === 0 ? (
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <History className="w-16 h-16 text-just-gray dark:text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">
              {smartCapitalize(language === 'es' ? 'no hay historial disponible' : 'no history available', 'sentence', language)}
            </h3>
            <p className="text-just-gray dark:text-gray-400">
              {smartCapitalize(
                language === 'es' 
                  ? 'tus procedimientos legales aparecerán aquí una vez que comiences a usar JustGuide.'
                  : 'your legal procedures will appear here once you start using JustGuide.',
                'sentence',
                language
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-just-sand dark:bg-gray-700"></div>
              
              {sortedHistory.map((entry) => (
                <div key={entry.id} className="relative flex items-start space-x-6 pb-8">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-just-white dark:bg-gray-800 border-4 border-just-sand dark:border-gray-700 rounded-full">
                    {getProcedureIcon(entry.procedure_type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-just-forest dark:text-just-white mb-2">
                          {smartCapitalize(entry.procedure_type, 'title', language)}
                        </h3>
                        <div className="flex items-center space-x-4 mb-3">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(entry.status)}`}>
                            {getStatusIcon(entry.status)}
                            <span className="ml-2">{getStatusText(entry.status)}</span>
                          </div>
                          <div className="flex items-center text-sm text-just-gray dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-just-hunter dark:text-gray-300 mb-4 leading-relaxed">
                      {entry.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-just-sand dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-medium text-just-forest dark:text-just-white">
                            {smartCapitalize(language === 'es' ? 'resultado:' : 'result:', 'title', language)}
                          </p>
                          <p className="text-sm text-just-hunter dark:text-gray-300">{entry.result}</p>
                        </div>
                        {entry.entity && (
                          <div>
                            <p className="text-sm font-medium text-just-forest dark:text-just-white">
                              {smartCapitalize(language === 'es' ? 'entidad:' : 'entity:', 'title', language)}
                            </p>
                            <p className="text-sm text-just-hunter dark:text-gray-300">{entry.entity}</p>
                          </div>
                        )}
                      </div>

                      {/* Delete button */}
                      <div>
                        <button
                          onClick={() => handleDeleteHistory(entry.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition-colors duration-300"
                          aria-label={smartCapitalize(language === 'es' ? 'eliminar entrada' : 'delete entry', 'sentence', language)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}