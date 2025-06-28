import { useState } from 'react';
import { ArrowLeft, Settings, Globe, Moon, Sun, User, Trash2, RotateCcw, Save, AlertTriangle, BarChart3, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { getTranslations } from '../utils/i18n';
import { smartCapitalize } from '../utils/textCapitalization';
import AnalyticsDashboard from './AnalyticsDashboard';
import Swal from 'sweetalert2';
import { supabase } from '../utils/supabaseClient';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { language, theme, setLanguage, setTheme, user, setUser, setIsAuthenticated } = useAppContext();
  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const t = getTranslations(language);

  const tabs = [
    { id: 'general', label: smartCapitalize(language === 'es' ? 'general' : 'general', 'sentence', language), icon: Settings },
    { id: 'analytics', label: smartCapitalize(language === 'es' ? 'análisis' : 'analytics', 'sentence', language), icon: BarChart3 },
  ];

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Simulate saving settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    
    // Show success message
    Swal.fire({
      icon: 'success',
      title: smartCapitalize(language === 'es' ? 'configuración guardada' : 'settings saved', 'title', language),
      text: smartCapitalize(language === 'es' ? 'tus preferencias han sido actualizadas exitosamente.' : 'your preferences have been successfully updated.', 'sentence', language),
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      // First, get the user's email for notification purposes
      const userEmail = user && typeof user === 'object' && 'email' in user ? (user as { email?: string }).email : '';
      
      // Call the RPC function to delete the user completely
      const { error: deleteError } = await supabase.rpc('delete_user_completely');
      
      if (deleteError) {
        console.error('Error deleting account:', deleteError);
        throw deleteError;
      }
      
      // Close the confirmation dialog
      setShowDeleteConfirm(false);
      
      // Send notification email if we have the email
      if (userEmail) {
        try {
          // This would typically be handled by a server-side function
          // For demo purposes, we'll just log it
          console.log(`Sending account deletion confirmation email to: ${userEmail}`);
          
          // In a real implementation, you would call an edge function to send the email
          // const { error } = await supabase.functions.invoke('send-email', {
          //   body: {
          //     to: userEmail,
          //     subject: language === 'es' ? 'Tu cuenta ha sido eliminada' : 'Your account has been deleted',
          //     template: 'account-deletion',
          //     data: {
          //       language,
          //       registerUrl: `${window.location.origin}/register`
          //     }
          //   }
          // });
        } catch (emailError) {
          console.error('Error sending notification email:', emailError);
          // Continue with account deletion even if email fails
        }
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: smartCapitalize(language === 'es' ? 'cuenta eliminada' : 'account deleted', 'title', language),
        text: smartCapitalize(language === 'es' 
          ? 'tu cuenta ha sido eliminada completamente. Ahora puedes registrarte de nuevo con el mismo correo si lo deseas.' 
          : 'your account has been completely deleted. You can now register again with the same email if you wish.', 
          'sentence', language),
        confirmButtonText: smartCapitalize(language === 'es' ? 'entendido' : 'understood', 'sentence', language)
      }).then(() => {
        // Redirect to login page
        navigate('/login');
      });
      
      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      
      Swal.fire({
        icon: 'error',
        title: smartCapitalize(language === 'es' ? 'error' : 'error', 'title', language),
        text: error.message || (language === 'es' 
          ? 'Ocurrió un error al intentar eliminar la cuenta. Por favor intenta de nuevo más tarde.' 
          : 'An error occurred while trying to delete the account. Please try again later.'),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPreferences = async () => {
    // Reset to defaults
    setLanguage('en');
    setTheme('light');
    setShowResetConfirm(false);
    
    Swal.fire({
      icon: 'success',
      title: smartCapitalize(language === 'es' ? 'preferencias restablecidas' : 'preferences reset', 'title', language),
      text: smartCapitalize(language === 'es' 
        ? 'tus preferencias han sido restablecidas a los valores predeterminados.' 
        : 'your preferences have been reset to default values.', 
        'sentence', language),
      timer: 2000,
      showConfirmButton: false
    });
  };

  return (
    <div className="min-h-screen bg-just-beige dark:bg-gray-900">
      {/* Header */}
      <div className="bg-just-white dark:bg-gray-800 shadow-sm border-b border-just-sand dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-just-hunter dark:text-gray-300 hover:text-just-forest dark:hover:text-just-white transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {smartCapitalize(t.back, 'sentence', language)}
          </button>
          
          <div className="flex items-center">
            <div className="w-12 h-12 bg-just-hunter/20 dark:bg-just-hunter/30 rounded-xl flex items-center justify-center mr-4">
              <Settings className="w-6 h-6 text-just-hunter" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-just-forest dark:text-just-white">{smartCapitalize(t.settings, 'sentence', language)}</h1>
              <p className="text-just-gray dark:text-gray-400">
                {smartCapitalize(language === 'es' ? 'personaliza tu experiencia en JustGuide' : 'customize your JustGuide experience', 'sentence', language)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-just-moss text-just-white shadow-md'
                          : 'text-just-hunter dark:text-gray-300 hover:bg-just-sand dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <div className="flex items-center mb-6">
                    <User className="w-5 h-5 text-just-forest dark:text-just-moss mr-2" />
                    <h2 className="text-xl font-semibold text-just-forest dark:text-just-white">
                      {smartCapitalize(language === 'es' ? 'perfil' : 'profile', 'sentence', language)}
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-just-forest dark:text-just-white mb-2">
                        {smartCapitalize(t.fullName, 'sentence', language)}
                      </label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-just-sand dark:border-gray-600 rounded-xl text-just-forest dark:text-just-white dark:bg-gray-700 bg-just-beige/50 dark:bg-gray-700/50 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-just-forest dark:text-just-white mb-2">
                        {smartCapitalize(t.email, 'sentence', language)}
                      </label>
                      <input
                        type="email"
                        value={user && typeof user === 'object' && 'email' in user ? (user as { email?: string }).email || '' : ''}
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
                      {smartCapitalize(language === 'es' ? 'preferencias' : 'preferences', 'sentence', language)}
                    </h2>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Language Setting */}
                    <div>
                      <div className="flex items-center mb-3">
                        <Globe className="w-5 h-5 text-just-moss mr-2" />
                        <label className="block text-sm font-medium text-just-forest dark:text-just-white">
                          {smartCapitalize(t.language, 'sentence', language)}
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setLanguage('en')}
                          className={`p-4 rounded-xl border-2 transition-colors duration-200 ${
                            language === 'en'
                              ? 'border-just-moss bg-just-moss/10 dark:bg-just-moss/20 text-just-forest dark:text-just-moss'
                              : 'border-just-sand dark:border-gray-600 hover:border-just-moss/50 text-just-hunter dark:text-gray-300'
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-medium">English</p>
                            <p className="text-sm opacity-75">{smartCapitalize(language === 'es' ? 'idioma predeterminado' : 'default language', 'sentence', language)}</p>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => setLanguage('es')}
                          className={`p-4 rounded-xl border-2 transition-colors duration-200 ${
                            language === 'es'
                              ? 'border-just-moss bg-just-moss/10 dark:bg-just-moss/20 text-just-forest dark:text-just-moss'
                              : 'border-just-sand dark:border-gray-600 hover:border-just-moss/50 text-just-hunter dark:text-gray-300'
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-medium">Español</p>
                            <p className="text-sm opacity-75">{smartCapitalize(language === 'es' ? 'idioma principal' : 'main language', 'sentence', language)}</p>
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
                          {smartCapitalize(language === 'es' ? 'tema' : 'theme', 'sentence', language)}
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setTheme('light')}
                          className={`p-4 rounded-xl border-2 transition-colors duration-200 ${
                            theme === 'light'
                              ? 'border-just-moss bg-just-moss/10 dark:bg-just-moss/20 text-just-forest dark:text-just-moss'
                              : 'border-just-sand dark:border-gray-600 hover:border-just-moss/50 text-just-hunter dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <Sun className="w-5 h-5 mr-3" />
                            <div className="text-left">
                              <p className="font-medium">{smartCapitalize(t.lightMode, 'sentence', language)}</p>
                              <p className="text-sm opacity-75">
                                {smartCapitalize(language === 'es' ? 'tema claro' : 'light theme', 'sentence', language)}
                              </p>
                            </div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => setTheme('dark')}
                          className={`p-4 rounded-xl border-2 transition-colors duration-200 ${
                            theme === 'dark'
                              ? 'border-just-moss bg-just-moss/10 dark:bg-just-moss/20 text-just-forest dark:text-just-moss'
                              : 'border-just-sand dark:border-gray-600 hover:border-just-moss/50 text-just-hunter dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <Moon className="w-5 h-5 mr-3" />
                            <div className="text-left">
                              <p className="font-medium">{smartCapitalize(t.darkMode, 'sentence', language)}</p>
                              <p className="text-sm opacity-75">
                                {smartCapitalize(language === 'es' ? 'tema oscuro' : 'dark theme', 'sentence', language)}
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
                    {smartCapitalize(language === 'es' ? 'acciones' : 'actions', 'sentence', language)}
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
                          {smartCapitalize(language === 'es' ? 'guardando...' : 'saving...', 'sentence', language)}
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          {smartCapitalize(t.save, 'sentence', language)}
                        </>
                      )}
                    </button>

                    {/* Reset Preferences */}
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="w-full bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-300 flex items-center justify-center"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      {smartCapitalize(t.resetPreferences, 'sentence', language)}
                    </button>

                    {/* Delete Account */}
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-6 py-3 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-300 flex items-center justify-center"
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      {smartCapitalize(t.deleteAccount, 'sentence', language)}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && <AnalyticsDashboard />}
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
                {smartCapitalize(language === 'es' ? 'eliminar cuenta permanentemente' : 'permanently delete account', 'sentence', language)}
              </h3>
            </div>
            <p className="text-just-gray dark:text-gray-400 mb-6">
              {smartCapitalize(
                language === 'es' 
                  ? '¿estás seguro de que quieres eliminar permanentemente tu cuenta? Esta acción eliminará todos tus datos y no se puede deshacer.'
                  : 'are you sure you want to permanently delete your account? This action will remove all your data and cannot be undone.',
                'sentence',
                language
              )}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 px-4 py-2 rounded-xl font-medium hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {smartCapitalize(t.cancel, 'sentence', language)}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {smartCapitalize(language === 'es' ? 'procesando...' : 'processing...', 'sentence', language)}
                  </div>
                ) : (
                  smartCapitalize(language === 'es' ? 'eliminar permanentemente' : 'permanently delete', 'sentence', language)
                )}
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
                {smartCapitalize(t.resetPreferences, 'sentence', language)}
              </h3>
            </div>
            <p className="text-just-gray dark:text-gray-400 mb-6">
              {smartCapitalize(
                language === 'es' 
                  ? '¿quieres restablecer todas las preferencias a sus valores predeterminados?'
                  : 'do you want to reset all preferences to their default values?',
                'sentence',
                language
              )}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 px-4 py-2 rounded-xl font-medium hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {smartCapitalize(t.cancel, 'sentence', language)}
              </button>
              <button
                onClick={handleResetPreferences}
                className="flex-1 bg-just-moss text-white px-4 py-2 rounded-xl font-medium hover:bg-just-brown transition-colors duration-200"
              >
                {smartCapitalize(language === 'es' ? 'restablecer' : 'reset', 'sentence', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}