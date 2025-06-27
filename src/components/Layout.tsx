import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Upload, FileText, Settings, User, Moon, Sun, Globe, ChevronDown, Menu, X, Home, BookOpen, History
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { getTranslations } from '../utils/i18n';
import { smartCapitalize } from '../utils/textCapitalization';
import { supabase } from '../utils/supabaseClient';
import HackathonBadge from './HackathonBadge';

// Solo idiomas soportados: español e inglés
const languageNames: Record<string, string> = {
  es: 'Español',
  en: 'English'
};

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, language, theme, setLanguage, setTheme, setUser, setIsAuthenticated } = useAppContext();
  const userName = user?.name || 'Usuario';
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = getTranslations(language);

  const sidebarItems = [
    { id: 'dashboard', label: smartCapitalize(t.dashboard, 'sentence', language), icon: Home, path: '/dashboard' },
    { id: 'upload', label: smartCapitalize(t.uploadDocument, 'sentence', language), icon: Upload, path: '/upload' },
    { id: 'documents', label: smartCapitalize(t.myDocuments, 'sentence', language), icon: FileText, path: '/documents' },
    { id: 'simplified', label: smartCapitalize(t.simplifiedGuides, 'sentence', language), icon: BookOpen, path: '/guides' },
    { id: 'history', label: smartCapitalize('historial legal', 'sentence', language), icon: History, path: '/history' },
    { id: 'settings', label: smartCapitalize(t.settings, 'sentence', language), icon: Settings, path: '/settings' },
  ];

  const handleSidebarClick = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

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
              const isActive = isActivePath(item.path);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleSidebarClick(item.path)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 hover:scale-105 ${
                      isActive
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
                        <div className="flex items-center justify-between">
                          <span>{name}</span>
                          {language === code && <div className="w-2 h-2 bg-just-moss rounded-full" />}
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
                {smartCapitalize(t.logout, 'sentence', language)}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}