import React, { useState } from 'react';
import { ArrowLeft, Settings, Globe, Moon, Sun, User, Trash2, RotateCcw, Save, AlertTriangle } from 'lucide-react';
import { Language, getTranslations } from '../utils/i18n';
import { Theme } from '../utils/theme';

interface SettingsPageProps {
  onNavigateBack: () => void;
  language: Language;
  theme: Theme;
  onLanguageChange: (language: Language) => void;
  onThemeChange: (theme: Theme) => void;
  userName: string;
}

export default function SettingsPage({ 
  onNavigateBack, 
  language, 
  theme, 
  onLanguageChange, 
  onThemeChange,
  userName 
}: SettingsPageProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const t = getTranslations(language);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Simulate saving settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    
    // Show success message (in a real app, you'd use a toast notification)
    alert(language === 'es' ? 'Configuración guardada exitosamente' : 'Settings saved successfully');
  };

  const handleDeleteAccount = async () => {
    // In a real app, this would call the API to delete the account
    alert(language === 'es' ? 'Cuenta eliminada' : 'Account deleted');
    setShowDeleteConfirm(false);
  };

  const handleResetPreferences = async () => {
    // Reset to defaults
    onLanguageChange('en');
    onThemeChange('light');
    setShowResetConfirm(false);
    
    alert(language === 'es' ? 'Preferencias restablecidas' : 'Preferences reset');
  };

  return (
    <div className="min-h-screen bg-just-beige dark:bg-gray-900">
      {/* Header */}
      <div className="bg-just-white dark:bg-gray-800 shadow-sm border-b border-just-sand dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onNavigateBack}
            className="inline-flex items-center text-just-hunter dark:text-gray-300 hover:text-just-forest dark:hover:text-just-white transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </button>
          
          <div className="flex items-center">
            <div className="w-12 h-12 bg-just-hunter/20 dark:bg-just-hunter/30 rounded-xl flex items-center justify-center mr-4">
              <Settings className="w-6 h-6 text-just-hunter" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-just-forest dark:text-just-white">{t.settings}</h1>
              <p className="text-just-gray dark:text-gray-400">
                {language === 'es' ? 'Personaliza tu experiencia en JustGuide' : 'Customize your JustGuide experience'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <User className="w-5 h-5 text-just-forest dark:text-just-moss mr-2" />
              <h2 className="text-xl font-semibold text-just-forest dark:text-just-white">
                {language === 'es' ? 'Perfil' : 'Profile'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-just-forest dark:text-just-white mb-2">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  value={userName}
                  readOnly
                  className="w-full px-4 py-3 border border-just-sand dark:border-gray-600 rounded-xl text-just-forest dark:text-just-white dark:bg-gray-700 bg-just-beige/50 dark:bg-gray-700/50 cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-just-forest dark:text-just-white mb-2">
                  {t.email}
                </label>
                <input
                  type="email"
                  value="maria@example.com"
                  readOnly
                  className="w-full px-4 py-3 border border-just-sand dark:border-gray-600 rounded-xl text-just-forest dark:text-just-white dark:bg-gray-700 bg-just-beige/50 dark:bg-gray-700/50 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Settings className="w-5 h-5 text-just-forest dark:text-just-moss mr-2" />
              <h2 className="text-xl font-semibold text-just-forest dark:text-just-white">
                {language === 'es' ? 'Preferencias' : 'Preferences'}
              </h2>
            </div>
            
            <div className="space-y-6">
              {/* Language Setting */}
              <div>
                <div className="flex items-center mb-3">
                  <Globe className="w-5 h-5 text-just-moss mr-2" />
                  <label className="block text-sm font-medium text-just-forest dark:text-just-white">
                    {t.language}
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onLanguageChange('en')}
                    className={`p-4 rounded-xl border-2 transition-colors duration-200 ${
                      language === 'en'
                        ? 'border-just-moss bg-just-moss/10 dark:bg-just-moss/20 text-just-forest dark:text-just-moss'
                        : 'border-just-sand dark:border-gray-600 hover:border-just-moss/50 text-just-hunter dark:text-gray-300'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium">English</p>
                      <p className="text-sm opacity-75">Default language</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => onLanguageChange('es')}
                    className={`p-4 rounded-xl border-2 transition-colors duration-200 ${
                      language === 'es'
                        ? 'border-just-moss bg-just-moss/10 dark:bg-just-moss/20 text-just-forest dark:text-just-moss'
                        : 'border-just-sand dark:border-gray-600 hover:border-just-moss/50 text-just-hunter dark:text-gray-300'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium">Español</p>
                      <p className="text-sm opacity-75">Idioma principal</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Theme Setting */}
              <div>
                <div className="flex items-center mb-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-just-moss mr-2" />
                  ) : (
                    <Sun className="w-5 h-5 text-just-moss mr-2" />
                  )}
                  <label className="block text-sm font-medium text-just-forest dark:text-just-white">
                    {language === 'es' ? 'Tema' : 'Theme'}
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onThemeChange('light')}
                    className={`p-4 rounded-xl border-2 transition-colors duration-200 ${
                      theme === 'light'
                        ? 'border-just-moss bg-just-moss/10 dark:bg-just-moss/20 text-just-forest dark:text-just-moss'
                        : 'border-just-sand dark:border-gray-600 hover:border-just-moss/50 text-just-hunter dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Sun className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <p className="font-medium">{t.lightMode}</p>
                        <p className="text-sm opacity-75">
                          {language === 'es' ? 'Tema claro' : 'Light theme'}
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => onThemeChange('dark')}
                    className={`p-4 rounded-xl border-2 transition-colors duration-200 ${
                      theme === 'dark'
                        ? 'border-just-moss bg-just-moss/10 dark:bg-just-moss/20 text-just-forest dark:text-just-moss'
                        : 'border-just-sand dark:border-gray-600 hover:border-just-moss/50 text-just-hunter dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Moon className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <p className="font-medium">{t.darkMode}</p>
                        <p className="text-sm opacity-75">
                          {language === 'es' ? 'Tema oscuro' : 'Dark theme'}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-just-forest dark:text-just-white mb-6">
              {language === 'es' ? 'Acciones' : 'Actions'}
            </h2>
            
            <div className="space-y-4">
              {/* Save Settings */}
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-just-white mr-2"></div>
                    {language === 'es' ? 'Guardando...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    {t.save}
                  </>
                )}
              </button>

              {/* Reset Preferences */}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-300 flex items-center justify-center"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                {t.resetPreferences}
              </button>

              {/* Delete Account */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-6 py-3 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-300 flex items-center justify-center"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                {t.deleteAccount}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-just-forest dark:text-just-white">
                {language === 'es' ? 'Eliminar Cuenta' : 'Delete Account'}
              </h3>
            </div>
            <p className="text-just-gray dark:text-gray-400 mb-6">
              {language === 'es' 
                ? '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
                : 'Are you sure you want to delete your account? This action cannot be undone.'
              }
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 px-4 py-2 rounded-xl font-medium hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors duration-200"
              >
                {language === 'es' ? 'Eliminar' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Preferences Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <RotateCcw className="w-6 h-6 text-just-moss mr-3" />
              <h3 className="text-lg font-semibold text-just-forest dark:text-just-white">
                {t.resetPreferences}
              </h3>
            </div>
            <p className="text-just-gray dark:text-gray-400 mb-6">
              {language === 'es' 
                ? '¿Quieres restablecer todas las preferencias a sus valores predeterminados?'
                : 'Do you want to reset all preferences to their default values?'
              }
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 px-4 py-2 rounded-xl font-medium hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleResetPreferences}
                className="flex-1 bg-just-moss text-white px-4 py-2 rounded-xl font-medium hover:bg-just-brown transition-colors duration-200"
              >
                {language === 'es' ? 'Restablecer' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}