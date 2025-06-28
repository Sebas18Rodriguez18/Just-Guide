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

  // Parse hash parameters from URL
  useEffect(() => {
    // Check if we have error parameters in the URL
    const searchParams = new URLSearchParams(location.search);
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    
    if (errorCode && errorDescription) {
      setError(decodeURIComponent(errorDescription));
      
      Swal.fire({
        icon: 'error',
        title: smartCapitalize(language === 'es' ? 'error' : 'error', 'title', language),
        text: decodeURIComponent(errorDescription),
        confirmButtonText: smartCapitalize(language === 'es' ? 'volver a iniciar sesión' : 'back to login', 'sentence', language)
      }).then(() => {
        navigate('/login');
      });
    }
  }, [location, language, navigate]);

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
    setIsLoading(true);
    
    try {
      // Get access token from URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (!accessToken) {
        throw new Error(language === 'es' ? 'Token de acceso no encontrado' : 'Access token not found');
      }
      
      // Set session with the access token
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      });
      
      if (sessionError) throw sessionError;
      
      // Update password
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      setSuccess(true);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      Swal.fire({
        icon: 'error',
        title: smartCapitalize(language === 'es' ? 'error' : 'error', 'title', language),
        text: err.message || (language === 'es' ? 'No se pudo restablecer la contraseña.' : 'Could not reset password.')
      });
    }
  };

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
              {error}
            </p>
          </div>
          
          <div className="bg-just-white rounded-2xl shadow-lg p-8 animate-slide-up text-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-just-moss text-just-white py-3 px-6 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300"
            >
              {smartCapitalize(language === 'es' ? 'volver a iniciar sesión' : 'back to login', 'sentence', language)}
            </button>
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
                />
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
                  className="block w-full px-3 py-3 border border-just-sand rounded-xl text-just-forest placeholder-just-gray focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
                  placeholder={smartCapitalize(language === 'es' ? 'confirma nueva contraseña' : 'confirm new password', 'sentence', language)}
                  required
                />
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