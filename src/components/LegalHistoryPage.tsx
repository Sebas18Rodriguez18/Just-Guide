import React, { useState, useEffect } from 'react';
import { ArrowLeft, History, Calendar, CheckCircle, Clock, AlertCircle, FileText, Scale, Building, Home, Download, Eye, MapPin, Book } from 'lucide-react';
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
  document_id?: string;
  document_title?: string;
  jurisdiction?: string;
}

interface Document {
  id: string;
  title: string;
  document_type: string;
  extracted_text: string;
  upload_date: string;
  detected_language?: string;
}

export default function LegalHistoryPage() {
  const navigate = useNavigate();
  const { user, language } = useAppContext();
  const userId = user?.id || '';
  const [history, setHistory] = useState<LegalHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [documents, setDocuments] = useState<Document[]>([]);

  const t = getTranslations(language);

  // Cargar historial y documentos
  useEffect(() => {
    if (userId) {
      loadHistory();
      loadDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Cargar historial existente
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

  // Cargar documentos del usuario
  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, document_type, extracted_text, upload_date, detected_language')
        .eq('user_id', userId)
        .order('upload_date', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setDocuments(data);
        
        // Extraer información legal de los documentos y crear entradas de historial
        const newHistoryEntries = await extractLegalHistoryFromDocuments(data);
        
        if (newHistoryEntries.length > 0) {
          // Insertar nuevas entradas en la base de datos
          const { error: insertError } = await supabase
            .from('legal_history')
            .upsert(newHistoryEntries, { 
              onConflict: 'document_id',
              ignoreDuplicates: true 
            });
          
          if (insertError) {
            console.error('Error inserting legal history:', insertError);
          } else {
            // Recargar historial después de insertar nuevas entradas
            loadHistory();
          }
        }
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  // Extraer información legal de los documentos
  const extractLegalHistoryFromDocuments = async (docs: Document[]): Promise<any[]> => {
    const newEntries: any[] = [];
    
    for (const doc of docs) {
      // Solo procesar documentos con texto extraído
      if (!doc.extracted_text || doc.extracted_text.trim().length === 0) continue;
      
      const text = doc.extracted_text.toLowerCase();
      
      // Detectar tipo de procedimiento legal
      let procedureType = '';
      let description = '';
      let result = '';
      let entity = '';
      let status: 'completed' | 'in-progress' | 'pending' = 'completed';
      let jurisdiction = '';
      
      // Detectar jurisdicción
      if (text.includes('colombia') || text.includes('bogotá') || text.includes('medellín') || 
          text.includes('cali') || text.includes('barranquilla') || text.includes('pesos colombianos')) {
        jurisdiction = 'Colombia';
      } else if (text.includes('españa') || text.includes('madrid') || text.includes('barcelona') || 
                text.includes('sevilla') || text.includes('bilbao') || text.includes('euros')) {
        jurisdiction = 'España';
      } else if (text.includes('méxico') || text.includes('ciudad de méxico') || 
                text.includes('guadalajara') || text.includes('monterrey') || text.includes('pesos mexicanos')) {
        jurisdiction = 'México';
      } else if (text.includes('united states') || text.includes('usa') || text.includes('new york') || 
                text.includes('california') || text.includes('texas') || text.includes('dollars')) {
        jurisdiction = 'United States';
      } else if (text.includes('united kingdom') || text.includes('uk') || text.includes('london') || 
                text.includes('manchester') || text.includes('pounds')) {
        jurisdiction = 'United Kingdom';
      }
      
      // Detectar tipo de procedimiento
      if (text.includes('contrato') || text.includes('contract') || text.includes('agreement')) {
        if (text.includes('arrendamiento') || text.includes('lease') || text.includes('rental')) {
          procedureType = language === 'es' ? 'Contrato de Arrendamiento' : 'Lease Agreement';
          
          // Extraer descripción
          const sentences = doc.extracted_text.split(/(?<=[.!?])\s+/);
          const relevantSentences = sentences.filter(s => 
            s.toLowerCase().includes('arrendamiento') || 
            s.toLowerCase().includes('lease') || 
            s.toLowerCase().includes('rental') ||
            s.toLowerCase().includes('inmueble') ||
            s.toLowerCase().includes('property')
          );
          
          if (relevantSentences.length > 0) {
            description = relevantSentences[0];
          } else {
            description = language === 'es' 
              ? `Contrato de arrendamiento relacionado con ${doc.title}`
              : `Lease agreement related to ${doc.title}`;
          }
          
          // Extraer resultado
          if (text.includes('firmado') || text.includes('signed')) {
            result = language === 'es' ? 'Contrato firmado' : 'Contract signed';
          } else {
            result = language === 'es' ? 'Contrato en vigencia' : 'Contract in effect';
          }
          
          // Extraer entidad
          const entityPatterns = [
            /(?:arrendador|landlord):\s*([^,\n.]+)/i,
            /(?:propietario|owner):\s*([^,\n.]+)/i
          ];
          
          for (const pattern of entityPatterns) {
            const match = doc.extracted_text.match(pattern);
            if (match && match[1]) {
              entity = match[1].trim();
              break;
            }
          }
        } else if (text.includes('compraventa') || text.includes('purchase') || text.includes('sale')) {
          procedureType = language === 'es' ? 'Contrato de Compraventa' : 'Purchase Agreement';
          
          // Extraer descripción
          const sentences = doc.extracted_text.split(/(?<=[.!?])\s+/);
          const relevantSentences = sentences.filter(s => 
            s.toLowerCase().includes('compraventa') || 
            s.toLowerCase().includes('purchase') || 
            s.toLowerCase().includes('sale') ||
            s.toLowerCase().includes('venta') ||
            s.toLowerCase().includes('compra')
          );
          
          if (relevantSentences.length > 0) {
            description = relevantSentences[0];
          } else {
            description = language === 'es' 
              ? `Contrato de compraventa relacionado con ${doc.title}`
              : `Purchase agreement related to ${doc.title}`;
          }
          
          // Extraer resultado
          if (text.includes('firmado') || text.includes('signed')) {
            result = language === 'es' ? 'Contrato firmado' : 'Contract signed';
          } else {
            result = language === 'es' ? 'Contrato en vigencia' : 'Contract in effect';
          }
          
          // Extraer entidad
          const entityPatterns = [
            /(?:vendedor|seller):\s*([^,\n.]+)/i,
            /(?:comprador|buyer):\s*([^,\n.]+)/i
          ];
          
          for (const pattern of entityPatterns) {
            const match = doc.extracted_text.match(pattern);
            if (match && match[1]) {
              entity = match[1].trim();
              break;
            }
          }
        } else if (text.includes('laboral') || text.includes('employment') || text.includes('trabajo')) {
          procedureType = language === 'es' ? 'Contrato Laboral' : 'Employment Contract';
          
          // Extraer descripción
          const sentences = doc.extracted_text.split(/(?<=[.!?])\s+/);
          const relevantSentences = sentences.filter(s => 
            s.toLowerCase().includes('laboral') || 
            s.toLowerCase().includes('employment') || 
            s.toLowerCase().includes('trabajo') ||
            s.toLowerCase().includes('work')
          );
          
          if (relevantSentences.length > 0) {
            description = relevantSentences[0];
          } else {
            description = language === 'es' 
              ? `Contrato laboral relacionado con ${doc.title}`
              : `Employment contract related to ${doc.title}`;
          }
          
          // Extraer resultado
          if (text.includes('firmado') || text.includes('signed')) {
            result = language === 'es' ? 'Contrato firmado' : 'Contract signed';
          } else {
            result = language === 'es' ? 'Contrato en vigencia' : 'Contract in effect';
          }
          
          // Extraer entidad
          const entityPatterns = [
            /(?:empleador|employer):\s*([^,\n.]+)/i,
            /(?:empresa|company):\s*([^,\n.]+)/i
          ];
          
          for (const pattern of entityPatterns) {
            const match = doc.extracted_text.match(pattern);
            if (match && match[1]) {
              entity = match[1].trim();
              break;
            }
          }
        } else {
          procedureType = language === 'es' ? 'Contrato General' : 'General Contract';
          description = language === 'es' 
            ? `Contrato relacionado con ${doc.title}`
            : `Contract related to ${doc.title}`;
          result = language === 'es' ? 'Contrato registrado' : 'Contract registered';
        }
      } else if (text.includes('demanda') || text.includes('lawsuit') || text.includes('complaint')) {
        procedureType = language === 'es' ? 'Demanda Legal' : 'Legal Complaint';
        
        // Extraer descripción
        const sentences = doc.extracted_text.split(/(?<=[.!?])\s+/);
        const relevantSentences = sentences.filter(s => 
          s.toLowerCase().includes('demanda') || 
          s.toLowerCase().includes('lawsuit') || 
          s.toLowerCase().includes('complaint') ||
          s.toLowerCase().includes('tribunal') ||
          s.toLowerCase().includes('court')
        );
        
        if (relevantSentences.length > 0) {
          description = relevantSentences[0];
        } else {
          description = language === 'es' 
            ? `Demanda legal relacionada con ${doc.title}`
            : `Legal complaint related to ${doc.title}`;
        }
        
        // Extraer resultado
        if (text.includes('sentencia') || text.includes('judgment') || text.includes('verdict')) {
          result = language === 'es' ? 'Sentencia emitida' : 'Judgment issued';
          status = 'completed';
        } else if (text.includes('en curso') || text.includes('ongoing') || text.includes('in progress')) {
          result = language === 'es' ? 'Proceso en curso' : 'Ongoing process';
          status = 'in-progress';
        } else {
          result = language === 'es' ? 'Demanda presentada' : 'Complaint filed';
          status = 'in-progress';
        }
        
        // Extraer entidad
        const entityPatterns = [
          /(?:tribunal|court):\s*([^,\n.]+)/i,
          /(?:juzgado|courthouse):\s*([^,\n.]+)/i,
          /(?:demandado|defendant):\s*([^,\n.]+)/i
        ];
        
        for (const pattern of entityPatterns) {
          const match = doc.extracted_text.match(pattern);
          if (match && match[1]) {
            entity = match[1].trim();
            break;
          }
        }
      } else if (text.includes('testamento') || text.includes('will') || text.includes('testament')) {
        procedureType = language === 'es' ? 'Testamento' : 'Last Will and Testament';
        description = language === 'es' 
          ? `Testamento relacionado con ${doc.title}`
          : `Will related to ${doc.title}`;
        result = language === 'es' ? 'Testamento registrado' : 'Will registered';
        
        // Extraer entidad
        const entityPatterns = [
          /(?:notaría|notary):\s*([^,\n.]+)/i,
          /(?:notario|notary):\s*([^,\n.]+)/i
        ];
        
        for (const pattern of entityPatterns) {
          const match = doc.extracted_text.match(pattern);
          if (match && match[1]) {
            entity = match[1].trim();
            break;
          }
        }
      } else if (text.includes('poder') || text.includes('power of attorney')) {
        procedureType = language === 'es' ? 'Poder Legal' : 'Power of Attorney';
        description = language === 'es' 
          ? `Poder legal relacionado con ${doc.title}`
          : `Power of attorney related to ${doc.title}`;
        result = language === 'es' ? 'Poder otorgado' : 'Power granted';
        
        // Extraer entidad
        const entityPatterns = [
          /(?:apoderado|attorney):\s*([^,\n.]+)/i,
          /(?:otorgante|grantor):\s*([^,\n.]+)/i
        ];
        
        for (const pattern of entityPatterns) {
          const match = doc.extracted_text.match(pattern);
          if (match && match[1]) {
            entity = match[1].trim();
            break;
          }
        }
      } else {
        // Documento legal genérico
        procedureType = language === 'es' ? 'Documento Legal' : 'Legal Document';
        description = language === 'es' 
          ? `Documento legal: ${doc.title}`
          : `Legal document: ${doc.title}`;
        result = language === 'es' ? 'Documento registrado' : 'Document registered';
      }
      
      // Extraer fecha del documento o usar fecha de subida
      let date = doc.upload_date;
      const datePatterns = [
        /(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i,  // 15 de enero de 2024
        /(\d{1,2}\/\d{1,2}\/\d{4})/i,          // 15/01/2024
        /(\d{4}-\d{2}-\d{2})/i                 // 2024-01-15
      ];
      
      for (const pattern of datePatterns) {
        const match = doc.extracted_text.match(pattern);
        if (match && match[1]) {
          date = match[1];
          break;
        }
      }
      
      // Crear entrada de historial
      newEntries.push({
        user_id: userId,
        procedure_type: procedureType,
        result: result,
        date: date,
        status: status,
        description: description,
        entity: entity,
        document_id: doc.id,
        document_title: doc.title,
        jurisdiction: jurisdiction
      });
    }
    
    return newEntries;
  };

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
    if (type.toLowerCase().includes('demanda') || type.toLowerCase().includes('complaint') || type.toLowerCase().includes('lawsuit')) {
      return <Scale className="w-5 h-5 text-just-forest dark:text-just-moss" />;
    }
    if (type.toLowerCase().includes('testamento') || type.toLowerCase().includes('will')) {
      return <Book className="w-5 h-5 text-just-forest dark:text-just-moss" />;
    }
    if (type.toLowerCase().includes('poder') || type.toLowerCase().includes('power of attorney')) {
      return <FileText className="w-5 h-5 text-just-forest dark:text-just-moss" />;
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
              <div className="w-12 h-12 bg-just-brown/20 dark:bg-just-brown/30 rounded-xl flex items-center justify-center mr-4">
                <History className="w-6 h-6 text-just-brown" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-just-forest dark:text-just-white">{smartCapitalize(t.legalHistory, 'title', language)}</h1>
                <p className="text-just-gray dark:text-gray-400">
                  {smartCapitalize(
                    language === 'es' 
                      ? `${history.length} procedimientos extraídos de tus documentos`
                      : `${history.length} procedures extracted from your documents`,
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
            <p className="text-just-gray dark:text-gray-400 mb-6">
              {smartCapitalize(
                language === 'es' 
                  ? 'tus procedimientos legales aparecerán aquí una vez que subas documentos DOCX.'
                  : 'your legal procedures will appear here once you upload DOCX documents.',
                'sentence',
                language
              )}
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-just-brown dark:bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown transition-colors duration-300 flex items-center mx-auto"
            >
              <FileText className="w-5 h-5 mr-2" />
              {smartCapitalize(t.uploadDocument, 'title', language)}
            </button>
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
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                            {getStatusIcon(entry.status)}
                            <span className="ml-2">{getStatusText(entry.status)}</span>
                          </div>
                          <div className="flex items-center text-xs text-just-gray dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                          {entry.jurisdiction && (
                            <div className="flex items-center text-xs text-just-moss">
                              <MapPin className="w-4 h-4 mr-1" />
                              {entry.jurisdiction}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-just-hunter dark:text-gray-300 mb-4 leading-relaxed">
                      {entry.description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-just-sand dark:border-gray-700 gap-4">
                      <div className="flex flex-wrap items-center gap-4">
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

                      <div className="flex items-center space-x-2">
                        {/* Ver documento original */}
                        {entry.document_id && (
                          <button
                            onClick={() => navigate(`/summary/${entry.document_id}`)}
                            className="inline-flex items-center px-3 py-1.5 bg-just-moss text-white rounded-lg text-sm hover:bg-just-brown transition-colors duration-200"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            {language === 'es' ? 'Ver Documento' : 'View Document'}
                          </button>
                        )}
                        
                        {/* Eliminar entrada */}
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
                    
                    {/* Información del documento origen */}
                    {entry.document_id && entry.document_title && (
                      <div className="mt-4 pt-3 border-t border-just-sand/50 dark:border-gray-700/50">
                        <div className="flex items-center text-xs text-just-gray dark:text-gray-400">
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          <span>
                            {language === 'es' ? 'Extraído de: ' : 'Extracted from: '}
                            <span className="font-medium text-just-forest dark:text-just-white">
                              {entry.document_title}
                            </span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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