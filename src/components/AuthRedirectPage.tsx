import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { smartCapitalize } from '../utils/textCapitalization';
import { supabase } from '../utils/supabaseClient';
import Swal from 'sweetalert2';

export default function AuthRedirectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setUser, setIsAuthenticated } = useAppContext();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        // Parse URL parameters
        const searchParams = new URLSearchParams(location.search);
        const errorCode = searchParams.get('error_code');
        const errorDescription = searchParams.get('error_description');
        const type = searchParams.get('type') || '';
        
        // Handle errors
        if (errorCode || errorDescription) {
          setStatus('error');
          setMessage(errorDescription ? decodeURIComponent(errorDescription) : 
            language === 'es' ? 'Ha ocurrido un error durante la autenticación.' : 'An error occurred during authentication.');
          return;
        }

        // Handle email confirmation
        if (type === 'email_confirmation') {
          // Get hash parameters (access_token, etc.)
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error || !user) {
            throw new Error(error?.message || 'Failed to get user information');
          }
          
          setStatus('success');
          setMessage(language === 'es' 
            ? '¡Tu correo electrónico ha sido confirmado exitosamente!' 
            : 'Your email has been successfully confirmed!');
          
          // Show success message and redirect to dashboard
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: smartCapitalize(language === 'es' ? '¡email confirmado!' : 'email confirmed!', 'title', language),
              text: smartCapitalize(language === 'es' ? 'tu email ha sido confirmado exitosamente. ahora puedes acceder a tu cuenta.' : 'your email has been successfully confirmed. you can now access your account.', 'sentence', language),
              confirmButtonText: smartCapitalize(language === 'es' ? 'ir al panel' : 'go to dashboard', 'title', language),
              confirmButtonColor: '#854D27'
            }).then(() => {
              navigate('/dashboard');
            });
          }, 1000);
        } 
        // Handle password recovery
        else if (type === 'recovery') {
          // Just show the reset password form
          navigate('/reset-password', { state: { hash: location.hash } });
        }
        // Unknown type
        else {
          setStatus('error');
          setMessage(language === 'es' 
            ? 'Tipo de redirección desconocido.' 
            : 'Unknown redirect type.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || (language === 'es' 
          ? 'Ha ocurrido un error durante la autenticación.' 
          : 'An error occurred during authentication.'));
      }
    };

    handleAuthRedirect();
  }, [location, language, navigate, setUser, setIsAuthenticated]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-just-beige to-just-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-just-moss rounded-2xl mb-4 shadow-lg">
            {status === 'loading' && (
              <div className="w-8 h-8 border-4 border-just-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {status === 'success' && <CheckCircle className="w-8 h-8 text-just-white" />}
            {status === 'error' && <AlertCircle className="w-8 h-8 text-just-white" />}
          </div>
          <h1 className="text-3xl font-bold text-just-forest mb-2">
            {status === 'loading' && smartCapitalize(language === 'es' ? 'procesando...' : 'processing...', 'title', language)}
            {status === 'success' && smartCapitalize(language === 'es' ? '¡éxito!' : 'success!', 'title', language)}
            {status === 'error' && smartCapitalize(language === 'es' ? 'error' : 'error', 'title', language)}
          </h1>
          <p className="text-just-hunter text-lg">
            {status === 'loading' 
              ? smartCapitalize(language === 'es' ? 'por favor espera mientras procesamos tu solicitud...' : 'please wait while we process your request...', 'sentence', language)
              : message
            }
          </p>
        </div>

        <div className="bg-just-white rounded-2xl shadow-lg p-8 animate-slide-up text-center">
          {status === 'loading' && (
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-just-moss border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-just-gray">
                {smartCapitalize(language === 'es' 
                  ? 'serás redirigido automáticamente en unos segundos...' 
                  : 'you will be automatically redirected in a few seconds...', 'sentence', language)}
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600">
                {message}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300"
              >
                {smartCapitalize(language === 'es' ? 'volver a iniciar sesión' : 'back to login', 'title', language)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}