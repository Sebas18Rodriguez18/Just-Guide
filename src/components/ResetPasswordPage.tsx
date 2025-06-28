import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { smartCapitalize } from '../utils/textCapitalization';
import { supabase } from '../utils/supabaseClient';
import Swal from 'sweetalert2';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useAppContext();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingToken, setIsProcessingToken] = useState(true);

  // Process the reset token when the component mounts
  useEffect(() => {
    const processResetToken = async () => {
      try {
        // Check if we have a hash fragment in the URL (contains the token)
        const hash = location.hash;
        
        if (!hash) {
          setError(language === 'es' 
            ? 'No se encontró un token de restablecimiento en la URL.' 
            : 'No reset token found in the URL.');
          setIsProcessingToken(false);
          return;
        }
        
        // The hash contains the access_token and other parameters
        // Supabase will automatically handle this when the page loads
        const { error } = await supabase.auth.getUser();
        
        if (error) {
          if (error.message.includes('expired')) {
            setError(language === 'es'
              ? 'El enlace de restablecimiento ha expirado. Por favor solicita un nuevo enlace.'
              : 'The reset link has expired. Please request a new link.');
          } else {
            setError(error.message);
          }
          setIsProcessingToken(false);
          return;
        }
        
        // If we get here, the token is valid
        setIsProcessingToken(false);
      } catch (err) {
        console.error('Error processing reset token:', err);
        setError(language === 'es' 
          ? 'Ocurrió un error al procesar el token de restablecimiento.' 
          : 'An error occurred while processing the reset token.');
        setIsProcessingToken(false);
      }
    };

    processResetToken();
  }, [location, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: smartCapitalize(language === 'es' ? 'error' : 'error', 'title', language),
        text: smartCapitalize(language === 'es' ? 'las contraseñas no coinciden.' : 'passwords do not match.', 'sentence', language)
      });
      return;
    }
    
    if (password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: smartCapitalize(language === 'es' ? 'error' : 'error', 'title', language),
        text: smartCapitalize(language === 'es' ? 'la contraseña debe tener al menos 6 caracteres.' : 'password must be at least 6 characters.', 'sentence', language)
      });
      return;
    }
    
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    
    if (error) {
      Swal.fire({
        icon: 'error',
        title: smartCapitalize(language === 'es' ? 'error' : 'error', 'title', language),
        text: error.message || (language === 'es' ? 'No se pudo restablecer la contraseña.' : 'Could not reset password.')
      });
      return;
    }
    
    setSuccess(true);
    
    // Show success message
    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: smartCapitalize(language === 'es' ? '¡contraseña actualizada!' : 'password updated!', 'title', language),
        text: smartCapitalize(language === 'es' ? 'tu contraseña ha sido actualizada exitosamente. ahora puedes iniciar sesión con tu nueva contraseña.' : 'your password has been successfully updated. you can now sign in with your new password.', 'sentence', language),
        confirmButtonText: smartCapitalize(language === 'es' ? 'iniciar sesión' : 'sign in', 'title', language),
        confirmButtonColor: '#854D27'
      }).then(() => {
        navigate('/login');
      });
    }, 1000);
  };

  if (isProcessingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-just-beige to-just-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-just-moss mb-4"></div>
          <p className="text-just-gray">
            {smartCapitalize(language === 'es' ? 'verificando enlace de restablecimiento...' : 'verifying reset link...', 'sentence', language)}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-just-beige to-just-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-2xl mb-4 shadow-lg">
              <AlertCircle className="w-8 h-8 text-just-white" />
            </div>
            <h1 className="text-3xl font-bold text-just-forest mb-2">
              {smartCapitalize(language === 'es' ? 'enlace inválido' : 'invalid link', 'title', language)}
            </h1>
            <p className="text-just-hunter text-lg">
              {smartCapitalize(language === 'es' ? 'no pudimos validar tu enlace de restablecimiento' : 'we couldn\'t validate your reset link', 'sentence', language)}
            </p>
          </div>
          
          <div className="bg-just-white rounded-2xl shadow-lg p-8 animate-slide-up">
            <div className="text-center space-y-6">
              <p className="text-red-600">
                {error}
              </p>
              
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300"
              >
                {smartCapitalize(language === 'es' ? 'solicitar nuevo enlace' : 'request new link', 'title', language)}
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-300"
              >
                {smartCapitalize(language === 'es' ? 'volver a iniciar sesión' : 'back to sign in', 'title', language)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-just-beige to-just-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-just-moss rounded-2xl mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-just-white" />
          </div>
          <h1 className="text-3xl font-bold text-just-forest mb-2">
            {smartCapitalize(
              success 
                ? (language === 'es' ? '¡contraseña restablecida!' : 'password reset!') 
                : (language === 'es' ? 'establecer nueva contraseña' : 'set new password'),
              'title',
              language
            )}
          </h1>
          <p className="text-just-hunter text-lg">
            {smartCapitalize(
              success
                ? (language === 'es' ? 'tu contraseña ha sido actualizada exitosamente.' : 'your password has been updated successfully.')
                : (language === 'es' ? 'ingresa tu nueva contraseña a continuación.' : 'enter your new password below.'),
              'sentence',
              language
            )}
          </p>
        </div>
        <div className="bg-just-white rounded-2xl shadow-lg p-8 animate-slide-up">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-just-forest mb-2">
                  {smartCapitalize(language === 'es' ? 'nueva contraseña' : 'new password', 'title', language)}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-3 border border-just-sand rounded-xl text-just-forest placeholder-just-gray focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
                  placeholder={smartCapitalize(language === 'es' ? 'ingresa nueva contraseña' : 'enter new password', 'sentence', language)}
                  required
                  minLength={6}
                />
                <p className="mt-1 text-xs text-just-gray">
                  {smartCapitalize(language === 'es' ? 'mínimo 6 caracteres' : 'minimum 6 characters', 'sentence', language)}
                </p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-just-forest mb-2">
                  {smartCapitalize(language === 'es' ? 'confirmar contraseña' : 'confirm password', 'title', language)}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full px-3 py-3 border rounded-xl text-just-forest placeholder-just-gray focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 ${
                    confirmPassword && password === confirmPassword 
                      ? 'border-green-300 focus:ring-green-200' 
                      : 'border-just-sand focus:ring-just-moss'
                  }`}
                  placeholder={smartCapitalize(language === 'es' ? 'confirma nueva contraseña' : 'confirm new password', 'sentence', language)}
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {smartCapitalize(language === 'es' ? 'las contraseñas no coinciden' : 'passwords do not match', 'sentence', language)}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading 
                  ? smartCapitalize(language === 'es' ? 'guardando...' : 'saving...', 'sentence', language) 
                  : smartCapitalize(language === 'es' ? 'restablecer contraseña' : 'reset password', 'title', language)
                }
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full animate-fade-in">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-just-forest">
                {smartCapitalize(language === 'es' ? '¡contraseña actualizada!' : 'password updated!', 'title', language)}
              </h3>
              <p className="text-just-gray">
                {smartCapitalize(language === 'es' ? 'ahora puedes iniciar sesión con tu nueva contraseña.' : 'you can now log in with your new password.', 'sentence', language)}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300"
              >
                {smartCapitalize(language === 'es' ? 'ir a iniciar sesión' : 'go to login', 'title', language)}
              </button>
            </div>
          )}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-just-moss hover:text-just-brown font-medium transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {smartCapitalize(language === 'es' ? 'volver a iniciar sesión' : 'back to sign in', 'sentence', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}