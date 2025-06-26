import { useEffect, useState } from 'react';
import {
  Upload, FileText, History, Settings, User, Moon, Sun, TrendingUp, CheckCircle, Clock, Search, Filter, MoreVertical, BookOpen, Sparkles, Globe, ChevronDown, Menu, X, Users, Award, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { getTranslations } from '../utils/i18n';
import { supabase } from '../utils/supabaseClient';
import { smartCapitalize, capitalizeUI } from '../utils/textCapitalization';
import Swal from 'sweetalert2';
import HackathonBadge from './HackathonBadge';

// Solo idiomas soportados: español e inglés
const languageNames: Record<string, string> = {
  es: 'Español',
  en: 'English'
};

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = getTranslations(language);

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
    { id: 'history', label: t.legalHistory, icon: History },
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
      case 'completed': return t.completed;
      case 'in-progress': return t.inProgress;
      case 'pending': return t.pending;
      default: return t.pending;
    }
  };

  // Sidebar navigation using React Router
  const handleSidebarClick = (itemId: string) => {
    switch (itemId) {
      case 'upload':
        navigate('/upload');
        break;
      case 'documents':
        navigate('/documents');
        break;
      case 'simplified':
        navigate('/guides');
        break;
      case 'history':
        navigate('/history');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        setActiveTab(itemId);
    }
    setSidebarOpen(false);
  };

  // Logout usando contexto
  const handleLogout = async () => {
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
            title: language === 'es' ? 'Sin documentos' : 'No documents',
            text: language === 'es' ? 'Aún no has subido ningún documento.' : 'You have not uploaded any documents yet.',
            timer: 2500,
            showConfirmButton: false
          });
        }
      }
    }
    fetchDocuments();
  }, [language, user]);

  return (
    <div className="min-h-screen bg-just-beige dark:bg-gray-900 flex relative">
      {/* Hackathon Badge - Fixed position */}
      <div className="fixed bottom-4 right-4 z-50">
        <HackathonBadge />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-just-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-just-sand dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-just-forest dark:bg-just-moss rounded-xl mr-3">
                <svg className="w-6 h-6 text-just-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-just-forest dark:text-just-white">JustGuide</h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-just-sand dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-just-hunter dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleSidebarClick(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 hover:scale-105 ${
                      activeTab === item.id
                        ? 'bg-just-forest dark:bg-just-moss text-just-white shadow-lg'
                        : 'text-just-hunter dark:text-gray-300 hover:bg-just-sand dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-just-white dark:bg-gray-800 shadow-sm border-b border-just-sand dark:border-gray-700">
          <div className="px-4 lg:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-just-sand dark:bg-gray-700 hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200 mr-4"
              >
                <Menu className="w-5 h-5 text-just-hunter dark:text-gray-300" />
              </button>

              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-just-forest dark:text-just-white">
                  {smartCapitalize(`${t.hello}, ${userName}!`, 'sentence', language)} 👋
                </h1>
                <p className="text-sm lg:text-base text-just-hunter dark:text-gray-300">
                  {smartCapitalize(
                    language === 'es' ? 'simplificando documentos legales con IA' : 'simplifying legal documents with AI',
                    'sentence',
                    language
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Language Switcher - Solo español e inglés */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center p-2 rounded-xl bg-just-sand dark:bg-gray-700 hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <Globe className="w-4 lg:w-5 h-4 lg:h-5 text-just-hunter dark:text-gray-300 mr-1 lg:mr-2" />
                  <span className="hidden sm:block text-sm font-medium text-just-hunter dark:text-gray-300">
                    {language === 'es' ? 'ES' : 'EN'}
                  </span>
                  <ChevronDown className="w-3 lg:w-4 h-3 lg:h-4 text-just-hunter dark:text-gray-300 ml-1" />
                </button>

                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-just-white dark:bg-gray-800 rounded-xl shadow-lg border border-just-sand dark:border-gray-700 z-50">
                    {Object.entries(languageNames).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLanguage(code as 'es' | 'en');
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-just-sand dark:hover:bg-gray-700 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                          language === code ? 'bg-just-moss/20 dark:bg-just-moss/30 text-just-forest dark:text-just-moss' : 'text-just-hunter dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{name}</span>
                          {language === code && <CheckCircle className="w-4 h-4 text-just-moss" />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-xl bg-just-sand dark:bg-gray-700 hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 lg:w-5 h-4 lg:h-5 text-just-hunter dark:text-gray-300" />
                ) : (
                  <Moon className="w-4 lg:w-5 h-4 lg:h-5 text-just-hunter dark:text-gray-300" />
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-xl bg-just-sand dark:bg-gray-700 hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200">
                  <div className="w-6 lg:w-8 h-6 lg:h-8 bg-just-forest dark:bg-just-moss rounded-lg flex items-center justify-center">
                    <User className="w-3 lg:w-4 h-3 lg:h-4 text-just-white" />
                  </div>
                  <span className="hidden sm:block text-just-forest dark:text-just-white font-medium">{userName}</span>
                </button>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="hidden lg:block px-4 py-2 text-just-hunter dark:text-gray-300 hover:text-just-forest dark:hover:text-just-white transition-colors duration-200"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {activeTab === 'overview' && (
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
                      <p className="text-just-gray dark:text-gray-400 text-sm font-medium">{t.totalDocuments}</p>
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
                      <p className="text-just-gray dark:text-gray-400 text-sm font-medium">{t.processedThisMonth}</p>
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
                      <p className="text-just-gray dark:text-gray-400 text-sm font-medium">{t.successRate}</p>
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
                    <h3 className="text-lg lg:text-xl font-semibold">{smartCapitalize(t.uploadNew, 'title', language)}</h3>
                    <Upload className="w-6 lg:w-8 h-6 lg:h-8" />
                  </div>
                  <p className="text-just-white/80 mb-4 text-sm lg:text-base">
                    {smartCapitalize(
                      language === 'es'
                        ? 'sube archivos PDF o DOCX en español o inglés. Nuestro sistema extrae el texto y lo capitaliza correctamente.'
                        : 'upload PDF or DOCX files in Spanish or English. Our system extracts text and capitalizes it correctly.',
                      'sentence',
                      language
                    )}
                  </p>
                  <button
                    onClick={() => navigate('/upload')}
                    className="bg-just-white text-just-forest px-4 py-2 rounded-xl font-medium hover:bg-just-beige transition-colors duration-200"
                  >
                    {t.uploadDocument}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-just-moss to-just-brown rounded-2xl p-6 text-just-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg lg:text-xl font-semibold">{smartCapitalize(t.aiPoweredSimplification, 'title', language)}</h3>
                    <Sparkles className="w-6 lg:w-8 h-6 lg:h-8" />
                  </div>
                  <p className="text-just-white/80 mb-4 text-sm lg:text-base">
                    {smartCapitalize(
                      language === 'es'
                        ? 'tecnología de IA optimizada para documentos legales en español e inglés con capitalización inteligente.'
                        : 'AI technology optimized for legal documents in Spanish and English with intelligent capitalization.',
                      'sentence',
                      language
                    )}
                  </p>
                  <button className="bg-just-white text-just-moss px-4 py-2 rounded-xl font-medium hover:bg-just-beige transition-colors duration-200">
                    {smartCapitalize(language === 'es' ? 'aprende más' : 'learn more', 'title', language)}
                  </button>
                </div>
              </div>

              {/* Recent Documents */}
              <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="p-4 lg:p-6 border-b border-just-sand dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg lg:text-xl font-semibold text-just-forest dark:text-just-white">{t.recentDocuments}</h3>
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
                              {smartCapitalize(doc.title, 'title', language)}
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

                          <button className="p-2 rounded-lg hover:bg-just-sand dark:hover:bg-gray-700 transition-colors duration-200 self-end sm:self-auto">
                            <MoreVertical className="w-4 h-4 text-just-hunter dark:text-gray-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

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
                      language === 'es' ? 'sube tu primer documento PDF o DOCX para comenzar' : 'upload your first PDF or DOCX document to get started',
                      'sentence',
                      language
                    )}
                  </p>
                  <button
                    onClick={() => navigate('/upload')}
                    className="bg-just-brown dark:bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown transition-colors duration-300"
                  >
                    {smartCapitalize(
                      language === 'es' ? 'sube tu primer documento' : 'upload your first document',
                      'title',
                      language
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Other tab content */}
          {activeTab !== 'overview' && (
            <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 lg:p-8 text-center animate-fade-in">
              <div className="w-16 h-16 bg-just-sand dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {activeTab === 'documents' && <FileText className="w-8 h-8 text-just-hunter dark:text-gray-400" />}
                {activeTab === 'simplified' && <BookOpen className="w-8 h-8 text-just-hunter dark:text-gray-400" />}
                {activeTab === 'history' && <History className="w-8 h-8 text-just-hunter dark:text-gray-400" />}
                {activeTab === 'settings' && <Settings className="w-8 h-8 text-just-hunter dark:text-gray-400" />}
              </div>
              <h3 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h3>
              <p className="text-just-gray dark:text-gray-400 mb-4">
                {smartCapitalize(
                  language === 'es'
                    ? 'esta sección estará disponible pronto. Estamos trabajando duro para brindarte la mejor experiencia con documentos legales.'
                    : 'this section is coming soon. We\'re working hard to bring you the best legal document experience.',
                  'sentence',
                  language
                )}
              </p>
              {activeTab === 'documents' && (
                <button
                  onClick={() => navigate('/upload')}
                  className="bg-just-brown dark:bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown transition-colors duration-300"
                >
                  {smartCapitalize(
                    language === 'es' ? 'sube tu primer documento' : 'upload your first document',
                    'title',
                    language
                  )}
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}