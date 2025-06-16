import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Language, getTranslations } from '../utils/i18n';

interface LoginPageProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  language: Language;
}

export default function LoginPage({ onLogin, onNavigateToRegister, onNavigateToForgotPassword, language }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const t = getTranslations(language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-just-beige to-just-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Welcome Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-just-forest dark:bg-just-moss rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-just-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-just-forest dark:text-just-white mb-2">
            {language === 'es' ? 'Bienvenido de vuelta a JustGuide' : 'Welcome back to JustGuide'}
          </h1>
          <p className="text-just-hunter dark:text-gray-300 text-lg">
            {language === 'es' ? 'Tu compañero de confianza para la claridad legal' : 'Your trusted companion for legal clarity'}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-just-forest dark:text-just-white mb-2">
                {t.email}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-just-hunter dark:text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-just-sand dark:border-gray-600 rounded-xl text-just-forest dark:text-just-white dark:bg-gray-700 placeholder-just-gray dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
                  placeholder={language === 'es' ? 'Ingresa tu correo' : 'Enter your email'}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-just-forest dark:text-just-white mb-2">
                {t.password}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-just-hunter dark:text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-just-sand dark:border-gray-600 rounded-xl text-just-forest dark:text-just-white dark:bg-gray-700 placeholder-just-gray dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
                  placeholder={language === 'es' ? 'Ingresa tu contraseña' : 'Enter your password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-just-hunter dark:text-gray-400 hover:text-just-forest dark:hover:text-just-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={onNavigateToForgotPassword}
                className="text-sm text-just-moss hover:text-just-brown dark:text-just-moss dark:hover:text-just-brown transition-colors duration-200 font-medium"
              >
                {t.forgotPassword}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-just-brown dark:bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-just-white mr-2"></div>
                  {language === 'es' ? 'Iniciando sesión...' : 'Signing in...'}
                </div>
              ) : (
                t.signIn
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-just-gray dark:text-gray-400">
              {language === 'es' ? '¿No tienes una cuenta?' : "Don't have an account?"}{' '}
              <button
                onClick={onNavigateToRegister}
                className="text-just-moss hover:text-just-brown dark:text-just-moss dark:hover:text-just-brown font-medium transition-colors duration-200"
              >
                {t.createAccount}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}