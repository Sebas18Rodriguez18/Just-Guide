import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAppContext } from '../contexts/AppContext';
import { smartCapitalize } from '../utils/textCapitalization';
import Swal from 'sweetalert2';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useAppContext();

  // Check if the reset token is valid
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setIsCheckingToken(true);
        
        // Get hash from location state or URL
        const hash = location.state?.hash || location.hash;
        
        if (!hash) {
          setError(language === 'es' 
            ? 'No se encontró un token de restablecimiento válido. Por favor solicita un nuevo enlace.' 
            : 'No valid reset token found. Please request a new reset link.');
          setIsTokenValid(false);
          return;
        }
        
        // Verify the token by trying to get the user
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
          throw new Error(error?.message || 'Invalid or expired token');
        }
        
        setIsTokenValid(true);
      } catch (err) {
        console.error('Token verification error:', err);
        setError(language === 'es' 
          ? 'El enlace de restablecimiento es inválido o ha expirado. Por favor solicita un nuevo enlace.' 
          : 'The reset link is invalid or has expired. Please request a new reset link.');
        setIsTokenValid(false);
      } finally {
        setIsCheckingToken(false);
      }
    };
    
    verifyToken();
  }, [location, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError(language === 'es' 
        ? 'Las contraseñas no coinciden.' 
        : 'Passwords do not match.');
      return;
    }
    
    if (password.length < 6) {
      setError(language === 'es' 
        ? 'La contraseña debe tener al menos 6 caracteres.' 
        : 'Password must be at least 6 characters.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: smartCapitalize(language === 'es' ? '¡contraseña actualizada!' : 'password updated!', 'title', language),
        text: smartCapitalize(language === 'es' 
          ? 'tu contraseña ha sido actualizada exitosamente. ahora puedes iniciar sesión con tu nueva contraseña.' 
          : 'your password has been successfully updated. you can now sign in with your new password.', 'sentence', language),
        confirmButtonText: smartCapitalize(language === 'es' ? 'ir a iniciar sesión' : 'go to sign in', 'title', language),
        confirmButtonColor: '#854D27'
      }).then(() => {
        navigate('/login');
      });
      
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || (language === 'es' 
        ? 'No se pudo actualizar la contraseña. Por favor intenta de nuevo.' 
        : 'Could not update password. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-just-beige to-just-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-just-moss rounded-2xl mb-4 shadow-lg">
              <div className="w-8 h-8 border-4 border-just-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h1 className="text-3xl font-bold text-just-forest mb-2">
              {smartCapitalize(language === 'es' ? 'verificando enlace...' : 'verifying link...', 'title', language)}
            </h1>
            <p className="text-just-hunter text-lg">
              {smartCapitalize(language === 'es' ? 'por favor espera mientras verificamos tu enlace de restablecimiento...' : 'please wait while we verify your reset link...', 'sentence', language)}
            </p>
          </div>
          <div className="bg-just-white rounded-2xl shadow-lg p-8 animate-slide-up text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-just-moss border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-just-beige to-just-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-just-forest mb-2">
              {smartCapitalize(language === 'es' ? 'enlace inválido' : 'invalid link', 'title', language)}
            </h1>
            <p className="text-just-hunter text-lg">
              {error}
            </p>
          </div>
          <div className="bg-just-white rounded-2xl shadow-lg p-8 animate-slide-up text-center">
            <div className="space-y-6">
              <p className="text-just-gray">
                {smartCapitalize(language === 'es' 
                  ? 'por favor solicita un nuevo enlace de restablecimiento para continuar.' 
                  : 'please request a new reset link to continue.', 'sentence', language)}
              </p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300"
              >
                {smartCapitalize(language === 'es' ? 'solicitar nuevo enlace' : 'request new link', 'title', language)}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-just-sand text-just-hunter py-3 px-4 rounded-xl font-medium hover:bg-just-sand/80 focus:outline-none focus:ring-2 focus:ring-just-sand focus:ring-offset-2 transition-colors duration-300"
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
            {success 
              ? smartCapitalize(language === 'es' ? '¡contraseña restablecida!' : 'password reset!', 'title', language)
              : smartCapitalize(language === 'es' ? 'establecer nueva contraseña' : 'set new password', 'title', language)
            }
          </h1>
          <p className="text-just-hunter text-lg">
            {success
              ? smartCapitalize(language === 'es' ? 'tu contraseña ha sido actualizada exitosamente.' : 'your password has been successfully updated.', 'sentence', language)
              : smartCapitalize(language === 'es' ? 'ingresa tu nueva contraseña a continuación.' : 'enter your new password below.', 'sentence', language)
            }
          </p>
        </div>
        <div className="bg-just-white rounded-2xl shadow-lg p-8 animate-slide-up">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-just-forest mb-2">
                  {smartCapitalize(language === 'es' ? 'nueva contraseña' : 'new password', 'title', language)}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-just-hunter" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-just-sand rounded-xl text-just-forest placeholder-just-gray focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
                    placeholder={smartCapitalize(language === 'es' ? 'ingresa nueva contraseña' : 'enter new password', 'sentence', language)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-just-hunter hover:text-just-forest transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-just-forest mb-2">
                  {smartCapitalize(language === 'es' ? 'confirmar contraseña' : 'confirm password', 'title', language)}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-just-hunter" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full pl-10 pr-12 py-3 border rounded-xl text-just-forest placeholder-just-gray focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 ${
                      confirmPassword && password === confirmPassword 
                        ? 'border-green-300 focus:ring-green-200' 
                        : 'border-just-sand focus:ring-just-moss'
                    }`}
                    placeholder={smartCapitalize(language === 'es' ? 'confirma nueva contraseña' : 'confirm new password', 'sentence', language)}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    {confirmPassword && password === confirmPassword && (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="pr-3 text-just-hunter hover:text-just-forest transition-colors duration-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-just-white mr-2"></div>
                    {smartCapitalize(language === 'es' ? 'actualizando...' : 'updating...', 'sentence', language)}
                  </div>
                ) : (
                  smartCapitalize(language === 'es' ? 'restablecer contraseña' : 'reset password', 'title', language)
                )}
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
                {smartCapitalize(language === 'es' ? 'ahora puedes iniciar sesión con tu nueva contraseña.' : 'you can now sign in with your new password.', 'sentence', language)}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300"
              >
                {smartCapitalize(language === 'es' ? 'ir a iniciar sesión' : 'go to sign in', 'title', language)}
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