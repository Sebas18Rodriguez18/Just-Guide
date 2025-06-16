import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import DashboardPage from './components/DashboardPage';
import UploadDocumentPage from './components/UploadDocumentPage';
import SummaryPage from './components/SummaryPage';
import GuidePage from './components/GuidePage';
import MyDocumentsPage from './components/MyDocumentsPage';
import SimplifiedGuidesPage from './components/SimplifiedGuidesPage';
import LegalHistoryPage from './components/LegalHistoryPage';
import SettingsPage from './components/SettingsPage';
import { Language, getLanguageFromStorage, setLanguageInStorage } from './utils/i18n';
import { Theme, getThemeFromStorage, setThemeInStorage, initializeTheme } from './utils/theme';

type AppState = 'login' | 'register' | 'forgot-password' | 'dashboard' | 'upload-document' | 'summary' | 'guide' | 'my-documents' | 'simplified-guides' | 'legal-history' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<AppState>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: 'user-123', name: 'María' });
  const [currentDocId, setCurrentDocId] = useState<string>('');
  const [language, setLanguage] = useState<Language>(getLanguageFromStorage());
  const [theme, setTheme] = useState<Theme>(getThemeFromStorage());

  useEffect(() => {
    initializeTheme();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
    setCurrentDocId('');
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setLanguageInStorage(newLanguage);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setThemeInStorage(newTheme);
  };

  const navigateToLogin = () => setCurrentPage('login');
  const navigateToRegister = () => setCurrentPage('register');
  const navigateToForgotPassword = () => setCurrentPage('forgot-password');
  
  const navigateToUploadDocument = () => {
    if (!isAuthenticated) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage('upload-document');
  };
  
  const navigateToSummary = (docId: string) => {
    if (!isAuthenticated) {
      setCurrentPage('login');
      return;
    }
    setCurrentDocId(docId);
    setCurrentPage('summary');
  };
  
  const navigateToGuide = (docId: string) => {
    if (!isAuthenticated) {
      setCurrentPage('login');
      return;
    }
    setCurrentDocId(docId);
    setCurrentPage('guide');
  };
  
  const navigateToDashboard = () => {
    if (!isAuthenticated) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage('dashboard');
  };

  const navigateToMyDocuments = () => {
    if (!isAuthenticated) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage('my-documents');
  };

  const navigateToSimplifiedGuides = () => {
    if (!isAuthenticated) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage('simplified-guides');
  };

  const navigateToLegalHistory = () => {
    if (!isAuthenticated) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage('legal-history');
  };

  const navigateToSettings = () => {
    if (!isAuthenticated) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage('settings');
  };

  // Render the appropriate page based on current state
  switch (currentPage) {
    case 'login':
      return (
        <LoginPage
          onLogin={handleLogin}
          onNavigateToRegister={navigateToRegister}
          onNavigateToForgotPassword={navigateToForgotPassword}
          language={language}
        />
      );
    
    case 'register':
      return (
        <RegisterPage
          onRegister={handleRegister}
          onNavigateToLogin={navigateToLogin}
          language={language}
        />
      );
    
    case 'forgot-password':
      return (
        <ForgotPasswordPage
          onNavigateToLogin={navigateToLogin}
          language={language}
        />
      );
    
    case 'dashboard':
      return (
        <DashboardPage
          onLogout={handleLogout}
          onNavigateToUpload={navigateToUploadDocument}
          onNavigateToMyDocuments={navigateToMyDocuments}
          onNavigateToSimplifiedGuides={navigateToSimplifiedGuides}
          onNavigateToLegalHistory={navigateToLegalHistory}
          onNavigateToSettings={navigateToSettings}
          userName={currentUser.name}
          language={language}
          theme={theme}
          onLanguageChange={handleLanguageChange}
          onThemeChange={handleThemeChange}
        />
      );
    
    case 'upload-document':
      return (
        <UploadDocumentPage
          onNavigateBack={navigateToDashboard}
          onNavigateToSummary={navigateToSummary}
          userId={currentUser.id}
          language={language}
        />
      );
    
    case 'summary':
      return (
        <SummaryPage
          onNavigateBack={navigateToDashboard}
          onNavigateToGuide={navigateToGuide}
          docId={currentDocId}
          userId={currentUser.id}
          language={language}
        />
      );
    
    case 'guide':
      return (
        <GuidePage
          onNavigateBack={() => setCurrentPage('summary')}
          onNavigateToDashboard={navigateToDashboard}
          docId={currentDocId}
          userId={currentUser.id}
          userName={currentUser.name}
          language={language}
        />
      );

    case 'my-documents':
      return (
        <MyDocumentsPage
          onNavigateBack={navigateToDashboard}
          onNavigateToSummary={navigateToSummary}
          onNavigateToUpload={navigateToUploadDocument}
          userId={currentUser.id}
          language={language}
        />
      );

    case 'simplified-guides':
      return (
        <SimplifiedGuidesPage
          onNavigateBack={navigateToDashboard}
          onNavigateToGuide={navigateToGuide}
          userId={currentUser.id}
          language={language}
        />
      );

    case 'legal-history':
      return (
        <LegalHistoryPage
          onNavigateBack={navigateToDashboard}
          userId={currentUser.id}
          language={language}
        />
      );

    case 'settings':
      return (
        <SettingsPage
          onNavigateBack={navigateToDashboard}
          language={language}
          theme={theme}
          onLanguageChange={handleLanguageChange}
          onThemeChange={handleThemeChange}
          userName={currentUser.name}
        />
      );
    
    default:
      return (
        <LoginPage
          onLogin={handleLogin}
          onNavigateToRegister={navigateToRegister}
          onNavigateToForgotPassword={navigateToForgotPassword}
          language={language}
        />
      );
  }
}

export default App;