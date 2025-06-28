import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { smartCapitalize } from '../utils/textCapitalization';
import { supabase } from '../utils/supabaseClient';
import Swal from 'sweetalert2';

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        setIsProcessing(true);
        
        // Get the hash fragment from the URL
        const hash = location.hash;
        
        if (!hash) {
          setError(language === 'es' 
            ? 'No se encontró un token de confirmación en la URL.' 
            : 'No confirmation token found in the URL.');
          setIsProcessing(false);
          return;
        }
        
        // The hash contains the access_token and other parameters
        // Supabase will automatically handle this when the page loads
        const { error } = await supabase.auth.getUser();
        
        if (error) {
          setError(error.message);
          setIsProcessing(false);
          return;
        }
        
        // If we get here, the email was confirmed successfully
        setIsSuccess(true);
        setIsProcessing(false);
        
        // Show success message
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: smartCapitalize(language === 'es' ? '¡email confirmado!' : 'email confirmed!', 'title', language),
            text: smartCapitalize(language === 'es' ? 'tu email ha sido confirmado exitosamente. ahora puedes iniciar sesión.' : 'your email has been successfully confirmed. you can now sign in.', 'sentence', language),
            confirmButtonText: smartCapitalize(language === 'es' ? 'iniciar sesión' : 'sign in', 'title', language),
            confirmButtonColor: '#854D27'
          }).then(() => {
            navigate('/login');
          });
        }, 1000);
        
      } catch (err) {
        console.error('Error confirming email:', err);
        setError(language === 'es' 
          ? 'Ocurrió un error al confirmar tu email. Por favor intenta de nuevo.' 
          : 'An error occurred while confirming your email. Please try again.');
        setIsProcessing(false);
      }
    };

    handleEmailConfirmation();
  }, [location, navigate, language]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-just-beige to-just-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-just-forest dark:bg-just-moss rounded-2xl mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-just-white" />
          </div>
          <h1 className="text-3xl font-bold text-just-forest mb-2">
            {smartCapitalize(language === 'es' ? 'confirmación de email' : 'email confirmation', 'title', language)}
          </h1>
          <p className="text-just-hunter text-lg">
            {isProcessing 
              ? smartCapitalize(language === 'es' ? 'procesando tu confirmación...' : 'processing your confirmation...', 'sentence', language)
              : isSuccess 
                ? smartCapitalize(language === 'es' ? '¡tu email ha sido confirmado!' : 'your email has been confirmed!', 'sentence', language)
                : smartCapitalize(language === 'es' ? 'hubo un problema con la confirmación' : 'there was a problem with the confirmation', 'sentence', language)
            }
          </p>
        </div>

        {/* Content */}
        <div className="bg-just-white rounded-2xl shadow-lg p-8 animate-slide-up">
          {isProcessing ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-just-moss mb-4"></div>
              <p className="text-just-gray">
                {smartCapitalize(language === 'es' ? 'verificando tu email...' : 'verifying your email...', 'sentence', language)}
              </p>
            </div>
          ) : isSuccess ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full animate-fade-in">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-just-forest">
                  {smartCapitalize(language === 'es' ? '¡email confirmado exitosamente!' : 'email confirmed successfully!', 'title', language)}
                </h3>
                <p className="text-just-gray">
                  {smartCapitalize(language === 'es' ? 'tu cuenta ha sido activada y ahora puedes iniciar sesión.' : 'your account has been activated and you can now sign in.', 'sentence', language)}
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300"
              >
                {smartCapitalize(language === 'es' ? 'ir a iniciar sesión' : 'go to sign in', 'title', language)}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-just-forest">
                  {smartCapitalize(language === 'es' ? 'error de confirmación' : 'confirmation error', 'title', language)}
                </h3>
                <p className="text-red-600">
                  {error || (language === 'es' ? 'Ocurrió un error desconocido.' : 'An unknown error occurred.')}
                </p>
                <p className="text-just-gray mt-2">
                  {smartCapitalize(language === 'es' ? 'por favor intenta de nuevo o contacta a soporte si el problema persiste.' : 'please try again or contact support if the problem persists.', 'sentence', language)}
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300"
              >
                {smartCapitalize(language === 'es' ? 'volver a iniciar sesión' : 'back to sign in', 'title', language)}
              </button>
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