import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAppContext } from '../contexts/AppContext';
import { smartCapitalize } from '../utils/textCapitalization';
import Swal from 'sweetalert2';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { language } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Get the current origin for the redirect URL
      const origin = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
      const redirectTo = "https://google.com";
      
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });
      
      
      setEmailSent(true);
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: smartCapitalize(language === 'es' ? 'error' : 'error', 'title', language),
        text: error.message || (language === 'es' ? 'No se pudo enviar el correo de restablecimiento.' : 'Could not send reset email.'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setEmailSent(false);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-just-beige to-just-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-just-moss rounded-2xl mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-just-white" />
          </div>
          <h1 className="text-3xl font-bold text-just-forest mb-2">
            {smartCapitalize(emailSent ? language === 'es' ? 'revisa tu email' : 'check your email' : language === 'es' ? 'restablecer contraseña' : 'reset password', 'title', language)}
          </h1>
          <p className="text-just-hunter text-lg">
            {emailSent 
              ? smartCapitalize(language === 'es' ? 'te hemos enviado un enlace para restablecer tu contraseña' : 'we\'ve sent you a password reset link', 'sentence', language)
              : smartCapitalize(language === 'es' ? 'te ayudaremos a recuperar el acceso a tu cuenta' : 'we\'ll help you get back into your account', 'sentence', language)
            }
          </p>
        </div>

        {/* Content */}
        <div className="bg-just-white rounded-2xl shadow-lg p-8 animate-slide-up">
          {!emailSent ? (
            // Reset Form
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-just-forest mb-2">
                  {smartCapitalize(language === 'es' ? 'dirección de email' : 'email address', 'title', language)}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-just-hunter" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-just-sand rounded-xl text-just-forest placeholder-just-gray focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
                    placeholder={smartCapitalize(language === 'es' ? 'ingresa tu dirección de email' : 'enter your email address', 'sentence', language)}
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-just-gray">
                  {smartCapitalize(language === 'es' 
                    ? 'ingresa el email asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.' 
                    : 'enter the email address associated with your account and we\'ll send you a link to reset your password.', 'sentence', language)}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-just-white mr-2"></div>
                    {smartCapitalize(language === 'es' ? 'enviando enlace...' : 'sending reset link...', 'sentence', language)}
                  </div>
                ) : (
                  smartCapitalize(language === 'es' ? 'enviar enlace de restablecimiento' : 'send reset link', 'title', language)
                )}
              </button>
            </form>
          ) : (
            // Success Message
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full animate-fade-in">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-just-forest">
                  {smartCapitalize(language === 'es' ? '¡email enviado exitosamente!' : 'email sent successfully!', 'title', language)}
                </h3>
                <p className="text-just-gray">
                  {smartCapitalize(language === 'es' 
                    ? `hemos enviado un enlace de restablecimiento a ${email}` 
                    : `we've sent a password reset link to ${email}`, 'sentence', language)}
                </p>
                <p className="text-sm text-just-gray">
                  {smartCapitalize(language === 'es' 
                    ? 'por favor revisa tu email y sigue las instrucciones para restablecer tu contraseña. el enlace expirará en 24 horas.' 
                    : 'please check your email and follow the instructions to reset your password. the link will expire in 24 hours.', 'sentence', language)}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleTryAgain}
                  className="w-full bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300"
                >
                  {smartCapitalize(language === 'es' ? 'enviar otro email' : 'send another email', 'title', language)}
                </button>
                
                <p className="text-sm text-just-gray">
                  {smartCapitalize(language === 'es' 
                    ? '¿no recibiste el email? revisa tu carpeta de spam o intenta de nuevo.' 
                    : 'didn\'t receive the email? check your spam folder or try again.', 'sentence', language)}
                </p>
              </div>
            </div>
          )}

          {/* Back to Login */}
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