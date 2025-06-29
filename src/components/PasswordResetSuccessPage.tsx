import React from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { smartCapitalize } from '../utils/textCapitalization';

export default function PasswordResetSuccessPage() {
  const navigate = useNavigate();
  const { language } = useAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-just-beige to-just-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-4 shadow-lg">
            <CheckCircle className="w-8 h-8 text-just-white" />
          </div>
          <h1 className="text-3xl font-bold text-just-forest mb-2">
            {smartCapitalize(language === 'es' ? '¡enlace confirmado!' : 'link confirmed!', 'title', language)}
          </h1>
          <p className="text-just-hunter text-lg">
            {smartCapitalize(language === 'es' ? 'tu enlace de restablecimiento es válido' : 'your reset link is valid', 'sentence', language)}
          </p>
        </div>

        {/* Content */}
        <div className="bg-just-white rounded-2xl shadow-lg p-8 animate-slide-up">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full animate-fade-in">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-just-forest">
                {smartCapitalize(language === 'es' ? 'enlace de restablecimiento válido' : 'valid reset link', 'title', language)}
              </h3>
              <p className="text-just-gray">
                {smartCapitalize(
                  language === 'es' 
                    ? 'ahora puedes crear una nueva contraseña para tu cuenta.'
                    : 'you can now create a new password for your account.',
                  'sentence',
                  language
                )}
              </p>
            </div>

            <button
              onClick={() => navigate('/reset-password')}
              className="w-full bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300"
            >
              {smartCapitalize(language === 'es' ? 'crear nueva contraseña' : 'create new password', 'title', language)}
            </button>
          </div>

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