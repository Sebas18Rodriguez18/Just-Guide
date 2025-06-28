import React, { useState } from 'react';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import Swal from 'sweetalert2';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Passwords do not match.'
      });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Could not reset password.'
      });
      return;
    }
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-just-beige to-just-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-just-moss rounded-2xl mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-just-white" />
          </div>
          <h1 className="text-3xl font-bold text-just-forest mb-2">
            {success ? 'Password Reset!' : 'Set New Password'}
          </h1>
          <p className="text-just-hunter text-lg">
            {success
              ? 'Your password has been updated successfully.'
              : 'Enter your new password below.'
            }
          </p>
        </div>
        <div className="bg-just-white rounded-2xl shadow-lg p-8 animate-slide-up">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-just-forest mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-3 border border-just-sand rounded-xl text-just-forest placeholder-just-gray focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-just-forest mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-3 border border-just-sand rounded-xl text-just-forest placeholder-just-gray focus:outline-none focus:ring-2 focus:ring-just-moss focus:border-transparent transition-colors duration-300"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full animate-fade-in">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-just-forest">Password Updated!</h3>
              <p className="text-just-gray">You can now log in with your new password.</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-just-moss text-just-white py-3 px-4 rounded-xl font-medium hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300"
              >
                Go to Login
              </button>
            </div>
          )}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-just-moss hover:text-just-brown font-medium transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
