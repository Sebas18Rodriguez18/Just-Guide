import { useEffect, useState } from 'react';
import {
  Upload, FileText, Settings, User, Moon, Sun, TrendingUp, CheckCircle, Clock, Search, Filter, MoreVertical, BookOpen, Sparkles, Globe, ChevronDown, Menu, X, Users, Award, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { getTranslations } from '../utils/i18n';
import { supabase } from '../utils/supabaseClient';
import { smartCapitalize, capitalizeUI } from '../utils/textCapitalization';
import Swal from 'sweetalert2';
import HackathonBadge from './HackathonBadge';
import AnalyticsDashboard from './AnalyticsDashboard';
import { AnalyticsService } from '../utils/analyticsService';

interface Document {
  id: string;
  title: string;
  status: string;
  type?: string;
  jurisdiction?: string;
  date?: string;
  [key: string]: unknown;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, language, theme, setLanguage, setTheme, setUser, setIsAuthenticated } = useAppContext();
  const userName = user?.name || 'Usuario';
  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const t = getTranslations(language);
  const analytics = AnalyticsService.getInstance();

  // Set user ID for analytics
  useEffect(() => {
    if (user?.id) {
      analytics.setUserId(user.id);
      analytics.trackEvent('dashboard_view', { userName: user.name });
    }
  }, [user]);

  // Enhanced stats with global impact
  const stats = {
    totalDocuments: 12,
    processedThisMonth: 8,
    successRate: 94,
    globalUsers: 15420,
    countriesSupported: 25,
    languagesSupported: 2, // Solo español e inglés
    avgSatisfaction: 4.8
  };

  const impactStats = [
    {
      icon: Users,
      value: '15.4K+',
      label: smartCapitalize(language === 'es' ? 'usuarios globales' : 'global users', 'title', language),
      color: 'text-just-moss',
      bgColor: 'bg-just-moss/10 dark:bg-just-moss/20'
    },
    {
      icon: Globe,
      value: '2',
      label: smartCapitalize(language === 'es' ? 'idiomas soportados' : 'languages supported', 'title', language),
      color: 'text-just-brown',
      bgColor: 'bg-just-brown/10 dark:bg-just-brown/20'
    },
    {
      icon: Award,
      value: '94%',
      label: smartCapitalize(language === 'es' ? 'tasa de éxito' : 'success rate', 'title', language),
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      icon: Zap,
      value: '4.8/5',
      label: smartCapitalize(language === 'es' ? 'satisfacción' : 'user rating', 'title', language),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    }
  ];

  const sidebarItems = [
    { id: 'overview', label: t.dashboard, icon: TrendingUp },
    { id: 'upload', label: t.uploadDocument, icon: Upload },
    { id: 'documents', label: t.myDocuments, icon: FileText },
    { id: 'simplified', label: t.simplifiedGuides, icon: BookOpen },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'in-progress': return 'bg-just-moss/20 dark:bg-just-moss/30 text-just-brown dark:text-just-moss';
      case 'pending': return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return smartCapitalize(t.completed, 'sentence', language);
      case 'in-progress': return smartCapitalize(t.inProgress, 'sentence', language);
      case 'pending': return smartCapitalize(t.pending, 'sentence', language);
      default: return smartCapitalize(t.pending, 'sentence', language);
    }
  };

  // Sidebar navigation using React Router
  const handleSidebarClick = (itemId: string) => {
    switch (itemId) {
      case 'upload':
        navigate('/upload');
        analytics.trackUserEngagement('navigation', 'upload_page');
        break;
      case 'documents':
        navigate('/documents');
        analytics.trackUserEngagement('navigation', 'documents_page');
        break;
      case 'simplified':
        navigate('/guides');
        analytics.trackUserEngagement('navigation', 'guides_page');
        break;
      case 'settings':
        navigate('/settings');
        analytics.trackUserEngagement('navigation', 'settings_page');
        break;
      default:
        setActiveTab(itemId);
        analytics.trackUserEngagement('tab_change', itemId);
    }
  };

  // Logout usando contexto
  const handleLogout = async () => {
    analytics.trackEvent('user_logout');
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  useEffect(() => {
    async function fetchDocuments() {
      if (user?.id) {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!error && data) setDocuments(data);
        if (!error && data && data.length === 0) {
          Swal.fire({
            icon: 'info',
            title: smartCapitalize(language === 'es' ? 'sin documentos' : 'no documents', 'sentence', language),
            text: smartCapitalize(language === 'es' ? 'aún no has subido ningún documento.' : 'you have not uploaded any documents yet.', 'sentence', language),
            timer: 2500,
            showConfirmButton: false
          });
        }
      }
    }
    fetchDocuments();
  }, [language, user]);

  return (
    <div className="min-h-screen bg-just-beige dark:bg-gray-900">
      {/* Hackathon Badge - Fixed position */}
      <div className="fixed bottom-4 right-4 z-50">
        <HackathonBadge />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6 animate-fade-in">
          {/* Global Impact Stats */}
          <div className="bg-gradient-to-r from-just-forest to-just-hunter rounded-2xl p-6 text-just-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {capitalizeUI(
                    language === 'es' ? 'JustGuide - documentos legales simplificados' : 'JustGuide - simplified legal documents',
                    language
                  )}
                </h2>
                <p className="text-just-white/80">
                  {smartCapitalize(
                    language === 'es'
                      ? 'procesamiento inteligente de PDF y DOCX en español e inglés'
                      : 'intelligent processing of PDF and DOCX in Spanish and English',
                    'sentence',
                    language
                  )}
                </p>
              </div>
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {impactStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-just-white">{stat.value}</div>
                    <div className="text-sm text-just-white/80">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personal Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-just-white dark:bg-gray-800 rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-just-gray dark:text-gray-400 text-sm font-medium">{smartCapitalize(t.totalDocuments, 'sentence', language)}</p>
                  <p className="text-2xl lg:text-3xl font-bold text-just-forest dark:text-just-white">{stats.totalDocuments}</p>
                </div>
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-just-forest/10 dark:bg-just-moss/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 lg:w-6 h-5 lg:h-6 text-just-forest dark:text-just-moss" />
                </div>
              </div>
            </div>

            <div className="bg-just-white dark:bg-gray-800 rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-just-gray dark:text-gray-400 text-sm font-medium">{smartCapitalize(t.processedThisMonth, 'sentence', language)}</p>
                  <p className="text-2xl lg:text-3xl font-bold text-just-moss dark:text-just-moss">{stats.processedThisMonth}</p>
                </div>
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-just-moss/10 dark:bg-just-moss/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 lg:w-6 h-5 lg:h-6 text-just-moss" />
                </div>
              </div>
            </div>

            <div className="bg-just-white dark:bg-gray-800 rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-just-gray dark:text-gray-400 text-sm font-medium">{smartCapitalize(t.successRate, 'sentence', language)}</p>
                  <p className="text-2xl lg:text-3xl font-bold text-green-600">{stats.successRate}%</p>
                </div>
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 lg:w-6 h-5 lg:h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-gradient-to-br from-just-forest to-just-hunter rounded-2xl p-6 text-just-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg lg:text-xl font-semibold">{smartCapitalize(t.uploadNew, 'sentence', language)}</h3>
                <Upload className="w-6 lg:w-8 h-6 lg:h-8" />
              </div>
              <p className="text-just-white/80 mb-4 text-sm lg:text-base">
                {smartCapitalize(
                  language === 'es'
                    ? 'sube archivos PDF, DOCX o imágenes en español o inglés. Nuestro sistema extrae el texto y lo capitaliza correctamente.'
                    : 'upload PDF, DOCX or image files in Spanish or English. Our system extracts text and capitalizes it correctly.',
                  'sentence',
                  language
                )}
              </p>
              <button
                onClick={() => {
                  navigate('/upload');
                  analytics.trackUserEngagement('button_click', 'upload_document');
                }}
                className="bg-just-white text-just-forest px-4 py-2 rounded-xl font-medium hover:bg-just-beige transition-colors duration-200"
              >
                {smartCapitalize(t.uploadDocument, 'sentence', language)}
              </button>
            </div>

            <div className="bg-gradient-to-br from-just-moss to-just-brown rounded-2xl p-6 text-just-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg lg:text-xl font-semibold">{smartCapitalize(t.aiPoweredSimplification, 'sentence', language)}</h3>
                <Zap className="w-6 lg:w-8 h-6 lg:h-8" />
              </div>
              <p className="text-just-white/80 mb-4 text-sm lg:text-base">
                {smartCapitalize(
                  language === 'es'
                    ? 'tecnología de IA optimizada para documentos legales en español e inglés con capitalización inteligente y síntesis de voz.'
                    : 'AI technology optimized for legal documents in Spanish and English with intelligent capitalization and voice synthesis.',
                  'sentence',
                  language
                )}
              </p>
              <button 
                className="bg-just-white text-just-moss px-4 py-2 rounded-xl font-medium hover:bg-just-beige transition-colors duration-200"
                onClick={() => analytics.trackUserEngagement('button_click', 'learn_more_ai')}
              >
                {smartCapitalize(language === 'es' ? 'aprende más' : 'learn more', 'sentence', language)}
              </button>
            </div>
          </div>

          {/* Recent Documents */}
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="p-4 lg:p-6 border-b border-just-sand dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg lg:text-xl font-semibold text-just-forest dark:text-just-white">{smartCapitalize(t.recentDocuments, 'sentence', language)}</h3>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg hover:bg-just-sand dark:hover:bg-gray-700 transition-colors duration-200">
                    <Search className="w-4 h-4 text-just-hunter dark:text-gray-400" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-just-sand dark:hover:bg-gray-700 transition-colors duration-200">
                    <Filter className="w-4 h-4 text-just-hunter dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 lg:p-6">
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-just-sand dark:border-gray-700 rounded-xl hover:bg-just-beige/50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105">
                    <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                      <div className="w-10 h-10 bg-just-forest/10 dark:bg-just-moss/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-just-forest dark:text-just-moss" />
                      </div>
                      <div>
                        <h4 className="font-medium text-just-forest dark:text-just-white">
                          {smartCapitalize(doc.title, 'sentence', language)}
                        </h4>
                        <p className="text-sm text-just-gray dark:text-gray-400">
                          {smartCapitalize(String(doc.type ?? ''), 'proper', language)} • {smartCapitalize(String(doc.jurisdiction ?? ''), 'proper', language)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className="text-left sm:text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {getStatusIcon(doc.status)}
                          <span className="ml-1 capitalize">{getStatusText(doc.status)}</span>
                        </div>
                        <p className="text-xs text-just-gray dark:text-gray-400 mt-1">{String(doc.date ?? '')}</p>
                      </div>

                      <button 
                        className="p-2 rounded-lg hover:bg-just-sand dark:hover:bg-gray-700 transition-colors duration-200 self-end sm:self-auto"
                        onClick={() => analytics.trackUserEngagement('document_action', doc.id)}
                      >
                        <MoreVertical className="w-4 h-4 text-just-hunter dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <AnalyticsDashboard />

          {/* Friendly message when no documents */}
          {documents.length === 0 && (
            <div className="bg-just-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-just-sand dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-just-hunter dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">
                {smartCapitalize(
                  language === 'es' ? 'no se encontraron documentos' : 'no documents found',
                  'sentence',
                  language
                )}
              </h3>
              <p className="text-just-gray dark:text-gray-400 mb-4">
                {smartCapitalize(
                  language === 'es' ? 'sube tu primer documento PDF, DOCX o imagen para comenzar' : 'upload your first PDF, DOCX or image document to get started',
                  'sentence',
                  language
                )}
              </p>
              <button
                onClick={() => {
                  navigate('/upload');
                  analytics.trackUserEngagement('button_click', 'upload_first_document');
                }}
                className="bg-just-brown dark:bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown transition-colors duration-300"
              >
                {smartCapitalize(
                  language === 'es' ? 'sube tu primer documento' : 'upload your first document',
                  'sentence',
                  language
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}