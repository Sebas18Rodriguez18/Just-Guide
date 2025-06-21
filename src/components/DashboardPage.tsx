import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  History, 
  Settings, 
  User, 
  Moon, 
  Sun,
  Plus,
  Eye,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Search,
  Filter,
  MoreVertical,
  BookOpen,
  Sparkles,
  Globe,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { Language, getTranslations, languageNames } from '../utils/i18n';
import { Theme } from '../utils/theme';

interface DashboardPageProps {
  onLogout: () => void;
  onNavigateToUpload?: () => void;
  onNavigateToMyDocuments?: () => void;
  onNavigateToSimplifiedGuides?: () => void;
  onNavigateToLegalHistory?: () => void;
  onNavigateToSettings?: () => void;
  userName?: string;
  language: Language;
  theme: Theme;
  onLanguageChange: (language: Language) => void;
  onThemeChange: (theme: Theme) => void;
}

export default function DashboardPage({ 
  onLogout, 
  onNavigateToUpload,
  onNavigateToMyDocuments,
  onNavigateToSimplifiedGuides,
  onNavigateToLegalHistory,
  onNavigateToSettings,
  userName = "María",
  language,
  theme,
  onLanguageChange,
  onThemeChange
}: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const t = getTranslations(language);

  // Mock data
  const stats = {
    totalDocuments: 12,
    processedThisMonth: 8,
    successRate: 94
  };

  const recentDocuments = [
    {
      id: 1,
      title: language === 'es' ? "Contrato de Arrendamiento" : language === 'fr' ? "Contrat de Location" : language === 'de' ? "Mietvertrag" : language === 'pt' ? "Contrato de Aluguel" : language === 'ar' ? "عقد إيجار" : language === 'zh' ? "租赁合同" : language === 'hi' ? "किराया समझौता" : "Rental Agreement",
      type: language === 'es' ? "Contrato de Renta" : language === 'fr' ? "Contrat de Location" : language === 'de' ? "Mietvertrag" : language === 'pt' ? "Contrato de Aluguel" : language === 'ar' ? "عقد إيجار" : language === 'zh' ? "租赁协议" : language === 'hi' ? "किराया समझौता" : "Rental Agreement",
      status: "completed",
      date: "2024-01-15",
      progress: 100
    },
    {
      id: 2,
      title: language === 'es' ? "Demanda Civil" : language === 'fr' ? "Plainte Civile" : language === 'de' ? "Zivilklage" : language === 'pt' ? "Ação Civil" : language === 'ar' ? "دعوى مدنية" : language === 'zh' ? "民事诉讼" : language === 'hi' ? "सिविल मुकदमा" : "Civil Complaint",
      type: language === 'es' ? "Demanda Civil" : language === 'fr' ? "Plainte Civile" : language === 'de' ? "Zivilklage" : language === 'pt' ? "Ação Civil" : language === 'ar' ? "دعوى مدنية" : language === 'zh' ? "民事诉讼" : language === 'hi' ? "सिविल मुकदमा" : "Civil Complaint",
      status: "in-progress",
      date: "2024-01-14",
      progress: 65
    },
    {
      id: 3,
      title: language === 'es' ? "Testamento" : language === 'fr' ? "Testament" : language === 'de' ? "Testament" : language === 'pt' ? "Testamento" : language === 'ar' ? "وصية" : language === 'zh' ? "遗嘱" : language === 'hi' ? "वसीयत" : "Will",
      type: language === 'es' ? "Testamento" : language === 'fr' ? "Testament" : language === 'de' ? "Testament" : language === 'pt' ? "Testamento" : language === 'ar' ? "وصية" : language === 'zh' ? "遗嘱" : language === 'hi' ? "वसीयत" : "Will",
      status: "pending",
      date: "2024-01-13",
      progress: 0
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

  const handleSidebarClick = (itemId: string) => {
    switch (itemId) {
      case 'upload':
        onNavigateToUpload?.();
        break;
      case 'documents':
        onNavigateToMyDocuments?.();
        break;
      case 'simplified':
        onNavigateToSimplifiedGuides?.();
        break;
      case 'history':
        onNavigateToLegalHistory?.();
        break;
      case 'settings':
        onNavigateToSettings?.();
        break;
      default:
        setActiveTab(itemId);
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-just-beige dark:bg-gray-900 flex">
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
                  {t.hello}, {userName}! 👋
                </h1>
                <p className="text-sm lg:text-base text-just-hunter dark:text-gray-300">{t.readyToSimplify}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center p-2 rounded-xl bg-just-sand dark:bg-gray-700 hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <Globe className="w-4 lg:w-5 h-4 lg:h-5 text-just-hunter dark:text-gray-300 mr-1 lg:mr-2" />
                  <span className="hidden sm:block text-sm font-medium text-just-hunter dark:text-gray-300">
                    {languageNames[language]}
                  </span>
                  <ChevronDown className="w-3 lg:w-4 h-3 lg:h-4 text-just-hunter dark:text-gray-300 ml-1" />
                </button>
                
                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-just-white dark:bg-gray-800 rounded-xl shadow-lg border border-just-sand dark:border-gray-700 z-50 max-h-64 overflow-y-auto">
                    {Object.entries(languageNames).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => {
                          onLanguageChange(code as Language);
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
                onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
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
                onClick={onLogout}
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
              {/* Stats Cards */}
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
                    <h3 className="text-lg lg:text-xl font-semibold">{t.uploadNew}</h3>
                    <Upload className="w-6 lg:w-8 h-6 lg:h-8" />
                  </div>
                  <p className="text-just-white/80 mb-4 text-sm lg:text-base">
                    {language === 'es' 
                      ? 'Comienza subiendo tu documento legal y deja que nuestra IA te guíe a través de él.'
                      : language === 'fr'
                      ? 'Commencez par télécharger votre document juridique et laissez notre IA vous guider.'
                      : language === 'de'
                      ? 'Beginnen Sie mit dem Hochladen Ihres Rechtsdokuments und lassen Sie unsere KI Sie führen.'
                      : language === 'pt'
                      ? 'Comece enviando seu documento legal e deixe nossa IA guiá-lo através dele.'
                      : language === 'ar'
                      ? 'ابدأ بتحميل وثيقتك القانونية ودع الذكاء الاصطناعي يرشدك خلالها.'
                      : language === 'zh'
                      ? '首先上传您的法律文档，让我们的AI指导您完成。'
                      : language === 'hi'
                      ? 'अपने कानूनी दस्तावेज़ को अपलोड करके शुरुआत करें और हमारे AI को आपका मार्गदर्शन करने दें।'
                      : 'Start by uploading your legal document and let our AI guide you through it.'
                    }
                  </p>
                  <button 
                    onClick={onNavigateToUpload}
                    className="bg-just-white text-just-forest px-4 py-2 rounded-xl font-medium hover:bg-just-beige transition-colors duration-200"
                  >
                    {t.uploadDocument}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-just-moss to-just-brown rounded-2xl p-6 text-just-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg lg:text-xl font-semibold">{t.aiPoweredSimplification}</h3>
                    <Sparkles className="w-6 lg:w-8 h-6 lg:h-8" />
                  </div>
                  <p className="text-just-white/80 mb-4 text-sm lg:text-base">
                    {language === 'es'
                      ? 'Nuestra IA convierte el lenguaje legal complejo en español claro que puedes entender.'
                      : language === 'fr'
                      ? 'Notre IA convertit le langage juridique complexe en français clair que vous pouvez comprendre.'
                      : language === 'de'
                      ? 'Unsere KI wandelt komplexe Rechtssprache in klares Deutsch um, das Sie verstehen können.'
                      : language === 'pt'
                      ? 'Nossa IA converte linguagem jurídica complexa em português claro que você pode entender.'
                      : language === 'ar'
                      ? 'يحول الذكاء الاصطناعي لدينا اللغة القانونية المعقدة إلى عربية واضحة يمكنك فهمها.'
                      : language === 'zh'
                      ? '我们的AI将复杂的法律语言转换为您可以理解的清晰中文。'
                      : language === 'hi'
                      ? 'हमारा AI जटिल कानूनी भाषा को स्पष्ट हिंदी में बदल देता है जिसे आप समझ सकते हैं।'
                      : 'Our AI converts complex legal language into plain language you can understand.'
                    }
                  </p>
                  <button className="bg-just-white text-just-moss px-4 py-2 rounded-xl font-medium hover:bg-just-beige transition-colors duration-200">
                    {language === 'es' ? 'Aprende Más' : language === 'fr' ? 'En Savoir Plus' : language === 'de' ? 'Mehr Erfahren' : language === 'pt' ? 'Saiba Mais' : language === 'ar' ? 'اعرف أكثر' : language === 'zh' ? '了解更多' : language === 'hi' ? 'और जानें' : 'Learn More'}
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
                    {recentDocuments.map((doc) => (
                      <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-just-sand dark:border-gray-700 rounded-xl hover:bg-just-beige/50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105">
                        <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                          <div className="w-10 h-10 bg-just-forest/10 dark:bg-just-moss/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-just-forest dark:text-just-moss" />
                          </div>
                          <div>
                            <h4 className="font-medium text-just-forest dark:text-just-white">{doc.title}</h4>
                            <p className="text-sm text-just-gray dark:text-gray-400">{doc.type}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                          <div className="text-left sm:text-right">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                              {getStatusIcon(doc.status)}
                              <span className="ml-1 capitalize">{getStatusText(doc.status)}</span>
                            </div>
                            <p className="text-xs text-just-gray dark:text-gray-400 mt-1">{doc.date}</p>
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
                {language === 'es' 
                  ? 'Esta sección estará disponible pronto. Estamos trabajando duro para brindarte la mejor experiencia con documentos legales.'
                  : language === 'fr'
                  ? 'Cette section sera bientôt disponible. Nous travaillons dur pour vous offrir la meilleure expérience avec les documents juridiques.'
                  : language === 'de'
                  ? 'Dieser Bereich wird bald verfügbar sein. Wir arbeiten hart daran, Ihnen die beste Erfahrung mit Rechtsdokumenten zu bieten.'
                  : language === 'pt'
                  ? 'Esta seção estará disponível em breve. Estamos trabalhando duro para oferecer a melhor experiência com documentos legais.'
                  : language === 'ar'
                  ? 'سيكون هذا القسم متاحًا قريبًا. نحن نعمل بجد لنقدم لك أفضل تجربة مع الوثائق القانونية.'
                  : language === 'zh'
                  ? '此部分即将推出。我们正在努力为您提供最佳的法律文档体验。'
                  : language === 'hi'
                  ? 'यह अनुभाग जल्द ही उपलब्ध होगा। हम आपको कानूनी दस्तावेजों के साथ सर्वोत्तम अनुभव प्रदान करने के लिए कड़ी मेहनत कर रहे हैं।'
                  : 'This section is coming soon. We\'re working hard to bring you the best legal document experience.'
                }
              </p>
              {activeTab === 'documents' && (
                <button
                  onClick={onNavigateToUpload}
                  className="bg-just-brown dark:bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown transition-colors duration-300"
                >
                  {language === 'es' ? 'Sube tu Primer Documento' : language === 'fr' ? 'Téléchargez Votre Premier Document' : language === 'de' ? 'Laden Sie Ihr Erstes Dokument Hoch' : language === 'pt' ? 'Envie Seu Primeiro Documento' : language === 'ar' ? 'ارفع وثيقتك الأولى' : language === 'zh' ? '上传您的第一个文档' : language === 'hi' ? 'अपना पहला दस्तावेज़ अपलोड करें' : 'Upload Your First Document'}
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}