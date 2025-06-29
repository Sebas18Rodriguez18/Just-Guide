import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, Globe, Users, Award } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { getTranslations } from '../utils/i18n';
import { smartCapitalize, capitalizeUI } from '../utils/textCapitalization';
import HackathonBadge from './HackathonBadge';
import { supabase } from '../utils/supabaseClient';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setIsAuthenticated, language, isAuthenticated } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = getTranslations(language);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) {
      Swal.fire({
        icon: 'error',
        title: language === 'es' ? 'Error de inicio de sesión' : 'Login Error',
        text: error.message || (language === 'es' ? 'Credenciales incorrectas o usuario no encontrado.' : 'Incorrect credentials or user not found.'),
      });
      return;
    }
    if (data.user) {
      setUser({ id: data.user.id, name: data.user.user_metadata?.full_name || data.user.email });
      setIsAuthenticated(true);
      Swal.fire({
        icon: 'success',
        title: language === 'es' ? '¡Bienvenido!' : 'Welcome!',
        text: language === 'es' ? 'Inicio de sesión exitoso.' : 'Login successful.',
        timer: 2000,
        showConfirmButton: false
      });
      navigate('/dashboard');
    }
  };

  const impactStats = [
    { 
      icon: Users, 
      value: '15.4K+', 
      label: smartCapitalize(language === 'es' ? 'usuarios globales' : 'global users', 'title', language)
    },
    { 
      icon: Globe, 
      value: '2', 
      label: smartCapitalize(language === 'es' ? 'idiomas soportados' : 'languages supported', 'title', language)
    },
    { 
      icon: Award, 
      value: '94%', 
      label: smartCapitalize(language === 'es' ? 'tasa de éxito' : 'success rate', 'title', language)
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-just-beige to-just-white dark:from-gray-900 dark:to-gray-800 flex relative">
      {/* Hackathon Badge - Fixed position */}
      <div className="fixed bottom-4 right-4 z-50">
        <HackathonBadge />
      </div>
      {/* Left Side - Branding & Impact */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-just-forest to-just-hunter p-12 text-just-white flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-just-white rounded-2xl mr-4">
              <svg className="w-8 h-8 text-just-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">JustGuide</h1>
          </div>
          {/* Mission Statement */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">
              {capitalizeUI(
                language === 'es' 
                  ? 'simplificando documentos legales'
                  : 'simplifying legal documents',
                language
              )}
            </h2>
            <p className="text-xl text-just-white/80 leading-relaxed">
              {smartCapitalize(
                language === 'es'
                  ? 'transformamos documentos legales complejos en guías claras y accionables usando IA avanzada. Procesamiento inteligente de archivos DOCX en español e inglés.'
                  : 'we transform complex legal documents into clear, actionable guides using advanced AI. Intelligent processing of DOCX files in Spanish and English.',
                'sentence',
                language
              )}
            </p>
          </div>
          {/* Impact Stats */}
          <div className="grid grid-cols-3 gap-6">
            {impactStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-just-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold text-just-white">{stat.value}</div>
                  <div className="text-sm text-just-white/80">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Features */}
        <div className="space-y-4">
          <div className="flex items-center">
            <Sparkles className="w-5 h-5 mr-3" />
            <span>{smartCapitalize(language === 'es' ? 'IA con procesamiento DOCX inteligente' : 'AI with intelligent DOCX processing', 'sentence', language)}</span>
          </div>
          <div className="flex items-center">
            <Globe className="w-5 h-5 mr-3" />
            <span>{smartCapitalize(language === 'es' ? 'español e inglés, múltiples jurisdicciones' : 'Spanish and English, multiple jurisdictions', 'sentence', language)}</span>
          </div>
          <div className="flex items-center">
            <Award className="w-5 h-5 mr-3" />
            <span>{smartCapitalize(language === 'es' ? 'nivel de lectura B1' : 'B1 reading level', 'sentence', language)}</span>
          </div>
        </div>
      </div>
      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-just-forest dark:bg-just-moss rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-just-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-just-forest dark:text-just-white mb-2">JustGuide</h1>
            <p className="text-just-hunter dark:text-gray-300 text-lg">
              {smartCapitalize(
                language === 'es' ? 'tu compañero de confianza para la claridad legal' : 'your trusted companion for legal clarity',
                'sentence',
                language
              )}
            </p>
          </div>
          {/* Welcome Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-just-forest dark:text-just-white mb-2">
              {smartCapitalize(
                language === 'es' ? 'bienvenido de vuelta' : 'welcome back',
                'title',
                language
              )}
            </h2>
            <p className="text-just-hunter dark:text-gray-300 text-lg">
              {smartCapitalize(
                language === 'es' ? 'continúa simplificando documentos legales' : 'continue simplifying legal documents',
                'sentence',
                language
              )}
            </p>
          </div>
          {/* Login Form */}
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-just-forest dark:text-just-white mb-2">
                  {smartCapitalize(t.email, 'title', language)}
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
                    placeholder={smartCapitalize(language === 'es' ? 'ingresa tu correo' : 'enter your email', 'sentence', language)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-just-forest dark:text-just-white mb-2">
                  {smartCapitalize(t.password, 'title', language)}
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
                    placeholder={smartCapitalize(language === 'es' ? 'ingresa tu contraseña' : 'enter your password', 'sentence', language)}
                    required
                    autoComplete="current-password"
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
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-just-moss hover:text-just-brown dark:text-just-moss dark:hover:text-just-brown transition-colors duration-200 font-medium"
                >
                  {smartCapitalize(t.forgotPassword, 'sentence', language)}
                </button>
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-just-brown dark:bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-just-white mr-2"></div>
                    {smartCapitalize(language === 'es' ? 'iniciando sesión...' : 'signing in...', 'sentence', language)}
                  </div>
                ) : (
                  smartCapitalize(t.signIn, 'title', language)
                )}
              </button>
            </form>
            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-just-gray dark:text-gray-400">
                {smartCapitalize(language === 'es' ? '¿no tienes una cuenta?' : "don't have an account?", 'sentence', language)}{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-just-moss hover:text-just-brown dark:text-just-moss dark:hover:text-just-brown font-medium transition-colors duration-200"
                >
                  {smartCapitalize(t.createAccount, 'sentence', language)}
                </button>
              </p>
            </div>
          </div>
          {/* Mobile Impact Stats */}
          <div className="lg:hidden mt-8 grid grid-cols-3 gap-4">
            {impactStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center bg-just-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                  <div className="w-8 h-8 bg-just-moss/20 dark:bg-just-moss/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-4 h-4 text-just-moss" />
                  </div>
                  <div className="text-lg font-bold text-just-forest dark:text-just-white">{stat.value}</div>
                  <div className="text-xs text-just-gray dark:text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}