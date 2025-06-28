import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, User, Moon, Sun, Globe, ChevronDown, 
  TrendingUp, Upload, FileText, BookOpen, Settings, LogOut
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { getTranslations } from '../utils/i18n';
import { smartCapitalize } from '../utils/textCapitalization';

const languageNames: Record<string, string> = {
  es: 'Español',
  en: 'English'
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, language, theme, setLanguage, setTheme, setUser, setIsAuthenticated } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const t = getTranslations(language);

  const sidebarItems = [
    { id: 'dashboard', path: '/dashboard', label: t.dashboard, icon: TrendingUp },
    { id: 'upload', path: '/upload', label: t.uploadDocument, icon: Upload },
    { id: 'documents', path: '/documents', label: t.myDocuments, icon: FileText },
    { id: 'guides', path: '/guides', label: t.simplifiedGuides, icon: BookOpen },
    { id: 'settings', path: '/settings', label: t.settings, icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="bg-just-white dark:bg-gray-800 shadow-sm border-b border-just-sand dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and mobile menu button */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-just-sand dark:bg-gray-700 hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200 mr-4"
            >
              <Menu className="w-5 h-5 text-just-hunter dark:text-gray-300" />
            </button>
            
            <div className="flex items-center" onClick={() => navigate('/dashboard')} role="button">
              <div className="flex items-center justify-center w-10 h-10 bg-just-forest dark:bg-just-moss rounded-xl mr-3">
                <svg className="w-6 h-6 text-just-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-just-forest dark:text-just-white">JustGuide</h2>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-just-forest dark:bg-just-moss text-just-white'
                      : 'text-just-hunter dark:text-gray-300 hover:bg-just-sand dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span className="font-medium">{smartCapitalize(item.label, 'sentence', language)}</span>
                </button>
              );
            })}
          </div>

          {/* User controls */}
          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
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
                      {name}
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
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-xl bg-just-sand dark:bg-gray-700 hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="w-6 lg:w-8 h-6 lg:h-8 bg-just-forest dark:bg-just-moss rounded-lg flex items-center justify-center">
                  <User className="w-3 lg:w-4 h-3 lg:h-4 text-just-white" />
                </div>
                <span className="hidden sm:block text-just-forest dark:text-just-white font-medium">{user?.name || 'Usuario'}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-just-white dark:bg-gray-800 rounded-xl shadow-lg border border-just-sand dark:border-gray-700 z-50">
                  <div className="px-4 py-3 border-b border-just-sand dark:border-gray-700">
                    <p className="text-sm font-medium text-just-forest dark:text-just-white">{user?.name || 'Usuario'}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/settings');
                      }}
                      className="w-full px-4 py-2 text-left text-just-hunter dark:text-gray-300 hover:bg-just-sand dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {smartCapitalize(t.settings, 'sentence', language)}
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-just-hunter dark:text-gray-300 hover:bg-just-sand dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {smartCapitalize(t.logout, 'sentence', language)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setSidebarOpen(false)}
          ></div>
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-64 bg-just-white dark:bg-gray-800 shadow-lg p-4">
            <div className="flex items-center justify-between mb-6 border-b border-just-sand dark:border-gray-700 pb-4">
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
                className="p-2 rounded-lg hover:bg-just-sand dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-just-hunter dark:text-gray-300" />
              </button>
            </div>
            
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-just-forest dark:bg-just-moss text-just-white shadow-lg'
                        : 'text-just-hunter dark:text-gray-300 hover:bg-just-sand dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {smartCapitalize(item.label, 'sentence', language)}
                  </button>
                );
              })}
              
              <div className="pt-4 mt-4 border-t border-just-sand dark:border-gray-700">
                <button
                  onClick={() => {
                    handleLogout();
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-left rounded-xl text-just-hunter dark:text-gray-300 hover:bg-just-sand dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  {smartCapitalize(t.logout, 'sentence', language)}
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </nav>
  );
}