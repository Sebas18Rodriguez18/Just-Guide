import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, TrendingUp, Globe, Zap, Download, Calendar } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { AnalyticsService, UserMetrics, SystemMetrics } from '../utils/analyticsService';
import { smartCapitalize } from '../utils/textCapitalization';

export default function AnalyticsDashboard() {
  const { user, language } = useAppContext();
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const analytics = AnalyticsService.getInstance();

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      if (user?.id) {
        const userStats = await analytics.getUserMetrics(user.id);
        setUserMetrics(userStats);
      }
      
      const systemStats = analytics.getSystemMetrics();
      setSystemMetrics(systemStats);
      
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportAnalytics = () => {
    const data = analytics.exportAnalytics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `justguide-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-just-sand dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-just-sand dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-just-sand dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BarChart3 className="w-6 h-6 text-just-moss mr-2" />
          <h2 className="text-xl font-semibold text-just-forest dark:text-just-white">
            {smartCapitalize(language === 'es' ? 'análisis de uso' : 'usage analytics', 'sentence', language)}
          </h2>
        </div>
        <button
          onClick={exportAnalytics}
          className="flex items-center px-4 py-2 bg-just-moss text-just-white rounded-xl hover:bg-just-brown transition-colors duration-200"
        >
          <Download className="w-4 h-4 mr-2" />
          {smartCapitalize(language === 'es' ? 'exportar datos' : 'export data', 'sentence', language)}
        </button>
      </div>

      {/* User Metrics */}
      {userMetrics && (
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-just-forest dark:text-just-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            {smartCapitalize(language === 'es' ? 'tus estadísticas' : 'your statistics', 'sentence', language)}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-just-beige/50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-just-gray dark:text-gray-400">
                    {smartCapitalize(language === 'es' ? 'documentos procesados' : 'documents processed', 'sentence', language)}
                  </p>
                  <p className="text-2xl font-bold text-just-forest dark:text-just-white">
                    {userMetrics.documentsProcessed}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-just-moss" />
              </div>
            </div>

            <div className="bg-just-beige/50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-just-gray dark:text-gray-400">
                    {smartCapitalize(language === 'es' ? 'tiempo promedio' : 'average time', 'sentence', language)}
                  </p>
                  <p className="text-2xl font-bold text-just-forest dark:text-just-white">
                    {Math.round(userMetrics.averageProcessingTime / 1000)}s
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-just-beige/50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-just-gray dark:text-gray-400">
                    {smartCapitalize(language === 'es' ? 'tasa de éxito' : 'success rate', 'sentence', language)}
                  </p>
                  <p className="text-2xl font-bold text-just-forest dark:text-just-white">
                    {Math.round(userMetrics.successRate)}%
                  </p>
                </div>
                <Zap className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-just-beige/50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-just-gray dark:text-gray-400">
                    {smartCapitalize(language === 'es' ? 'idioma preferido' : 'preferred language', 'sentence', language)}
                  </p>
                  <p className="text-2xl font-bold text-just-forest dark:text-just-white">
                    {userMetrics.preferredLanguage === 'es' ? 'ES' : 'EN'}
                  </p>
                </div>
                <Globe className="w-8 h-8 text-just-brown" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Metrics */}
      {systemMetrics && (
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-just-forest dark:text-just-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            {smartCapitalize(language === 'es' ? 'estadísticas globales' : 'global statistics', 'sentence', language)}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Global Stats */}
            <div className="space-y-4">
              <h4 className="font-medium text-just-forest dark:text-just-white">
                {smartCapitalize(language === 'es' ? 'resumen general' : 'overview', 'sentence', language)}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-just-gray dark:text-gray-400">
                    {smartCapitalize(language === 'es' ? 'usuarios totales' : 'total users', 'sentence', language)}
                  </span>
                  <span className="font-semibold text-just-forest dark:text-just-white">
                    {systemMetrics.totalUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-just-gray dark:text-gray-400">
                    {smartCapitalize(language === 'es' ? 'documentos totales' : 'total documents', 'sentence', language)}
                  </span>
                  <span className="font-semibold text-just-forest dark:text-just-white">
                    {systemMetrics.totalDocuments}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-just-gray dark:text-gray-400">
                    {smartCapitalize(language === 'es' ? 'éxito promedio' : 'average success', 'sentence', language)}
                  </span>
                  <span className="font-semibold text-green-600">
                    {Math.round(systemMetrics.averageSuccessRate)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Popular Languages */}
            <div className="space-y-4">
              <h4 className="font-medium text-just-forest dark:text-just-white">
                {smartCapitalize(language === 'es' ? 'idiomas populares' : 'popular languages', 'sentence', language)}
              </h4>
              <div className="space-y-2">
                {Object.entries(systemMetrics.popularLanguages)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([lang, count]) => (
                    <div key={lang} className="flex items-center justify-between">
                      <span className="text-sm text-just-gray dark:text-gray-400">
                        {lang === 'es' ? 'Español' : lang === 'en' ? 'English' : lang}
                      </span>
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-just-sand dark:bg-gray-700 rounded-full mr-2">
                          <div 
                            className="h-2 bg-just-moss rounded-full"
                            style={{ 
                              width: `${(count / Math.max(...Object.values(systemMetrics.popularLanguages))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-just-forest dark:text-just-white">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Popular Document Types */}
            <div className="space-y-4">
              <h4 className="font-medium text-just-forest dark:text-just-white">
                {smartCapitalize(language === 'es' ? 'tipos de documento' : 'document types', 'sentence', language)}
              </h4>
              <div className="space-y-2">
                {Object.entries(systemMetrics.popularDocumentTypes)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-just-gray dark:text-gray-400">
                        {type}
                      </span>
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-just-sand dark:bg-gray-700 rounded-full mr-2">
                          <div 
                            className="h-2 bg-just-brown rounded-full"
                            style={{ 
                              width: `${(count / Math.max(...Object.values(systemMetrics.popularDocumentTypes))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-just-forest dark:text-just-white">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Enhancement Notice */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center">
          <Zap className="w-6 h-6 text-purple-600 mr-3" />
          <div>
            <h4 className="font-semibold text-purple-800 dark:text-purple-200">
              {smartCapitalize(language === 'es' ? 'potenciado por IA' : 'AI-powered', 'sentence', language)}
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {smartCapitalize(
                language === 'es'
                  ? 'estas métricas incluyen procesamiento con Hugging Face AI, OCR avanzado y análisis inteligente de documentos.'
                  : 'these metrics include Hugging Face AI processing, advanced OCR, and intelligent document analysis.',
                'sentence',
                language
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}