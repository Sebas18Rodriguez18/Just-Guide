import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { smartCapitalize, capitalizeUI } from '../utils/textCapitalization';
import { supabase } from '../utils/supabaseClient';
import Swal from 'sweetalert2';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated, language } = useAppContext();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: smartCapitalize(language === 'es' ? 'las contraseñas no coinciden' : 'passwords do not match', 'title', language),
        text: smartCapitalize(language === 'es' ? 'por favor asegúrate de que ambas contraseñas sean iguales.' : 'please make sure both passwords are the same.', 'sentence', language),
      });
      return;
    }
    if (!acceptTerms) {
      Swal.fire({
        icon: 'warning',
        title: smartCapitalize(language === 'es' ? 'términos no aceptados' : 'terms not accepted', 'title', language),
        text: smartCapitalize(language === 'es' ? 'por favor acepta los términos de servicio' : 'please accept the terms of service', 'sentence', language),
      });
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.fullName }
      }
    });
    if (error) {
      Swal.fire({
        icon: 'error',
        title: smartCapitalize(language === 'es' ? 'error' : 'error', 'title', language),
        text: error.message,
      });
      setIsLoading(false);
      return;
    }
    if (data.user) {
      const now = new Date().toISOString();
      const insertResult = await supabase.from('users').insert([
        {
          id: data.user.id,
          name: formData.fullName,
          email: formData.email,
          hashed_password: 'supabase_auth',
          language: language,
          literacy_level: 'basic',
          uploaded_documents: [],
          history: {},
          created_at: now,
          updated_at: now
        }
      ]);
      if (insertResult.error) {
        Swal.fire({
          icon: 'error',
          title: smartCapitalize(language === 'es' ? 'error' : 'error', 'title', language),
          text: insertResult.error.message,
        });
        setIsLoading(false);
        return;
      }
      setUser({ id: data.user.id, name: formData.fullName });
      setIsAuthenticated(true);
    }
    setIsLoading(false);
    Swal.fire({
      icon: 'success',
      title: smartCapitalize(language === 'es' ? '¡registro exitoso!' : 'registration successful!', 'title', language),
      text: smartCapitalize(language === 'es' ? 'tu cuenta ha sido creada correctamente.' : 'your account has been created successfully.', 'sentence', language),
      timer: 2000,
      showConfirmButton: false
    });
    navigate('/dashboard');
  };

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-just-beige to-just-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-just-forest rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-just-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-just-forest mb-2">
            {smartCapitalize(language === 'es' ? 'únete a JustGuide' : 'join JustGuide', 'title', language)}
          </h1>
          <p className="text-just-hunter text-lg">
            {smartCapitalize(language === 'es' ? 'comienza tu viaje hacia la claridad legal' : 'start your journey to legal clarity', 'sentence', language)}
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-just-white rounded-2xl shadow-lg p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Input */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-just-forest mb-2">
                {smartCapitalize(language === 'es' ? 'nombre completo' : 'full name', 'title', language)}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-just-hunter" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-just-sand rounded-xl text-just-forest placeholder-just-gray focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
                  placeholder={smartCapitalize(language === 'es' ? 'ingresa tu nombre completo' : 'enter your full name', 'sentence', language)}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-just-forest mb-2">
                {smartCapitalize(language === 'es' ? 'correo electrónico' : 'email address', 'title', language)}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-just-hunter" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-just-sand rounded-xl text-just-forest placeholder-just-gray focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
                  placeholder={smartCapitalize(language === 'es' ? 'ingresa tu correo' : 'enter your email', 'sentence', language)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-just-forest mb-2">
                {smartCapitalize(language === 'es' ? 'contraseña' : 'password', 'title', language)}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-just-hunter" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-just-sand rounded-xl text-just-forest placeholder-just-gray focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
                  placeholder={smartCapitalize(language === 'es' ? 'crea una contraseña' : 'create a password', 'sentence', language)}
                  required
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

            {/* Confirm Password Input */}
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
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-xl text-just-forest placeholder-just-gray focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 ${
                    passwordsMatch ? 'border-green-300 focus:ring-green-200' : 'border-just-sand focus:ring-just-moss'
                  }`}
                  placeholder={smartCapitalize(language === 'es' ? 'confirma tu contraseña' : 'confirm your password', 'sentence', language)}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  {passwordsMatch && (
                    <Check className="h-5 w-5 text-green-500 mr-2" />
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

            {/* Terms of Service */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 text-just-moss bg-just-white border-just-sand rounded focus:ring-just-moss focus:ring-2"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-just-gray">
                  {smartCapitalize(language === 'es' ? 'acepto los' : 'I agree to the', 'sentence', language)}{' '}
                  <a href="#" className="text-just-moss hover:text-just-brown font-medium transition-colors duration-200">
                    {smartCapitalize(language === 'es' ? 'términos de servicio' : 'terms of service', 'title', language)}
                  </a>{' '}
                  {language === 'es' ? 'y la' : 'and'}{' '}
                  <a href="#" className="text-just-moss hover:text-just-brown font-medium transition-colors duration-200">
                    {smartCapitalize(language === 'es' ? 'política de privacidad' : 'privacy policy', 'title', language)}
                  </a>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !acceptTerms}
              className="w-full bg-just-forest text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-hunter focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-just-white mr-2"></div>
                  {smartCapitalize(language === 'es' ? 'creando cuenta...' : 'creating account...', 'sentence', language)}
                </div>
              ) : (
                smartCapitalize(language === 'es' ? 'crear cuenta' : 'create account', 'title', language)
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-just-gray">
              {smartCapitalize(language === 'es' ? '¿ya tienes una cuenta?' : 'already have an account?', 'sentence', language)}{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-just-moss hover:text-just-brown font-medium transition-colors duration-200"
              >
                {smartCapitalize(language === 'es' ? 'inicia sesión aquí' : 'sign in here', 'sentence', language)}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}