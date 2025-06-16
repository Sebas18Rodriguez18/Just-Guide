import React, { useState, useEffect } from 'react';
import { ArrowLeft, History, Calendar, CheckCircle, Clock, AlertCircle, FileText, Scale, Building } from 'lucide-react';
import { Language, getTranslations } from '../utils/i18n';

interface LegalHistoryPageProps {
  onNavigateBack: () => void;
  userId: string;
  language: Language;
}

interface LegalHistoryEntry {
  id: string;
  procedure_type: string;
  result: string;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
  description: string;
  entity?: string;
}

export default function LegalHistoryPage({ 
  onNavigateBack, 
  userId, 
  language 
}: LegalHistoryPageProps) {
  const [history, setHistory] = useState<LegalHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const t = getTranslations(language);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockHistory: LegalHistoryEntry[] = [
        {
          id: 'hist-1',
          procedure_type: language === 'es' ? 'Contrato de Arrendamiento' : 'Rental Agreement',
          result: language === 'es' ? 'Firmado exitosamente' : 'Successfully signed',
          date: '2024-01-15T10:30:00Z',
          status: 'completed',
          description: language === 'es' 
            ? 'Contrato de renta firmado para propiedad en Calle Ejemplo 789. Duración: 12 meses.'
            : 'Rental contract signed for property at Calle Ejemplo 789. Duration: 12 months.',
          entity: language === 'es' ? 'Notaría Pública No. 15' : 'Public Notary No. 15'
        },
        {
          id: 'hist-2',
          procedure_type: language === 'es' ? 'Demanda Civil' : 'Civil Complaint',
          result: language === 'es' ? 'En proceso' : 'In process',
          date: '2024-01-14T14:20:00Z',
          status: 'in-progress',
          description: language === 'es'
            ? 'Demanda presentada por incumplimiento de contrato. Esperando respuesta de la contraparte.'
            : 'Complaint filed for breach of contract. Awaiting response from counterpart.',
          entity: language === 'es' ? 'Juzgado Civil No. 3' : 'Civil Court No. 3'
        },
        {
          id: 'hist-3',
          procedure_type: language === 'es' ? 'Registro de Testamento' : 'Will Registration',
          result: language === 'es' ? 'Registrado' : 'Registered',
          date: '2024-01-10T09:15:00Z',
          status: 'completed',
          description: language === 'es'
            ? 'Testamento registrado ante notario público. Todos los herederos notificados.'
            : 'Will registered with public notary. All heirs notified.',
          entity: language === 'es' ? 'Registro Público de la Propiedad' : 'Public Property Registry'
        },
        {
          id: 'hist-4',
          procedure_type: language === 'es' ? 'Poder Notarial' : 'Power of Attorney',
          result: language === 'es' ? 'Pendiente de firma' : 'Pending signature',
          date: '2024-01-08T16:45:00Z',
          status: 'pending',
          description: language === 'es'
            ? 'Poder notarial preparado para representación legal. Falta firma del otorgante.'
            : 'Power of attorney prepared for legal representation. Grantor signature pending.',
          entity: language === 'es' ? 'Notaría Pública No. 8' : 'Public Notary No. 8'
        }
      ];

      setHistory(mockHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
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
      case 'completed': return t.completed;
      case 'in-progress': return t.inProgress;
      case 'pending': return t.pending;
      default: return t.pending;
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
          <h2 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">{t.loading}</h2>
          <p className="text-just-gray dark:text-gray-400">
            {language === 'es' ? 'Cargando tu historial legal...' : 'Loading your legal history...'}
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
            onClick={onNavigateBack}
            className="inline-flex items-center text-just-hunter dark:text-gray-300 hover:text-just-forest dark:hover:text-just-white transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-just-brown/20 dark:bg-just-brown/30 rounded-xl flex items-center justify-center mr-4">
                <History className="w-6 h-6 text-just-brown" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-just-forest dark:text-just-white">{t.legalHistory}</h1>
                <p className="text-just-gray dark:text-gray-400">
                  {language === 'es' 
                    ? `${history.length} procedimientos registrados`
                    : `${history.length} procedures recorded`
                  }
                </p>
              </div>
            </div>
            
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-just-sand dark:border-gray-600 rounded-xl text-just-forest dark:text-just-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
            >
              <option value="all">{language === 'es' ? 'Todos' : 'All'}</option>
              <option value="completed">{t.completed}</option>
              <option value="in-progress">{t.inProgress}</option>
              <option value="pending">{t.pending}</option>
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
              {language === 'es' ? 'No hay historial disponible' : 'No history available'}
            </h3>
            <p className="text-just-gray dark:text-gray-400">
              {language === 'es' 
                ? 'Tus procedimientos legales aparecerán aquí una vez que comiences a usar JustGuide.'
                : 'Your legal procedures will appear here once you start using JustGuide.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-just-sand dark:bg-gray-700"></div>
              
              {sortedHistory.map((entry, index) => (
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
                          {entry.procedure_type}
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
                            {language === 'es' ? 'Resultado:' : 'Result:'}
                          </p>
                          <p className="text-sm text-just-hunter dark:text-gray-300">{entry.result}</p>
                        </div>
                        {entry.entity && (
                          <div>
                            <p className="text-sm font-medium text-just-forest dark:text-just-white">
                              {language === 'es' ? 'Entidad:' : 'Entity:'}
                            </p>
                            <p className="text-sm text-just-hunter dark:text-gray-300">{entry.entity}</p>
                          </div>
                        )}
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