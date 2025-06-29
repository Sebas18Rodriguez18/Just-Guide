import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './components/DashboardPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import MyDocumentsPage from './components/MyDocumentsPage';
import UploadDocumentPage from './components/UploadDocumentPage';
import SimplifiedGuidesPage from './components/SimplifiedGuidesPage';
import SettingsPage from './components/SettingsPage';
import { AppProvider } from './contexts/AppContext';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import SummaryPage from './components/SummaryPage';
import GuidePage from './components/GuidePage';
import AuthRedirectPage from './components/AuthRedirectPage';
import ConfirmEmailPage from './components/ConfirmEmailPage';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from './contexts/AppContext';
import LegalHistoryPage from './components/LegalHistoryPage';
import Layout from './components/Layout';

function GuidePageWrapper() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { user, language } = useAppContext();
  if (!docId || !user) return null;
  return (
    <GuidePage
      docId={docId}
      userId={user.id}
      userName={user.name || ''}
      language={language}
      onNavigateBack={() => navigate(`/summary/${docId}`)}
      onNavigateToDashboard={() => navigate('/dashboard')}
    />
  );
}

function SummaryPageWrapper() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { user, language } = useAppContext();
  if (!docId || !user) return null;
  return (
    <SummaryPage
      docId={docId}
      userId={user.id}
      language={language}
      onNavigateBack={() => navigate('/dashboard')}
      onNavigateToGuide={() => navigate('/guides')}
    />
  );
}

function RoutedPages() {
  const { isAuthenticated, isLoading } = useAppContext();
  
  // Si está cargando, mostrar una pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-just-beige dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-just-moss rounded-full mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-just-sand dark:bg-gray-700 rounded mx-auto"></div>
        </div>
      </div>
    );
  }
  
  // Protected route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Auth callback routes */}
      <Route path="/auth/callback" element={<AuthRedirectPage />} />
      <Route path="/auth/confirm-email" element={<ConfirmEmailPage />} />
      
      {/* Protected routes with Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><MyDocumentsPage /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadDocumentPage /></ProtectedRoute>} />
        <Route path="/guides" element={<ProtectedRoute><SimplifiedGuidesPage /></ProtectedRoute>} />
        <Route path="/guides/:docId" element={<ProtectedRoute><GuidePageWrapper /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/summary/:docId" element={<ProtectedRoute><SummaryPageWrapper /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><LegalHistoryPage /></ProtectedRoute>} />
      </Route>
      
      {/* Fallback route - redirige a login si no está autenticado */}
      <Route path="*" element={isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function AppRouter() {
  return (
    <AppProvider>
      <BrowserRouter>
        <RoutedPages />
      </BrowserRouter>
    </AppProvider>
  );
}