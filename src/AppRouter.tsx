import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardPage from './components/DashboardPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import MyDocumentsPage from './components/MyDocumentsPage';
import UploadDocumentPage from './components/UploadDocumentPage';
import SimplifiedGuidesPage from './components/SimplifiedGuidesPage';
import SettingsPage from './components/SettingsPage';
import { AppProvider, useAppContext } from './contexts/AppContext';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import SummaryPage from './components/SummaryPage';
import GuidePage from './components/GuidePage';
import AuthRedirectPage from './components/AuthRedirectPage';
import ConfirmEmailPage from './components/ConfirmEmailPage';
import { useParams, useNavigate } from 'react-router-dom';
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
    />
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAppContext();
  const location = useLocation();
  
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
  
  if (!isAuthenticated) {
    // Save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

function RoutedPages() {
  const { isAuthenticated, isLoading } = useAppContext();
  const location = useLocation();
  
  // If loading, show a loading screen
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
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
      } />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<AuthRedirectPage />} />
      <Route path="/confirm-email" element={<ConfirmEmailPage />} />
      
      {/* Protected routes with Layout */}
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/documents" element={<MyDocumentsPage />} />
        <Route path="/upload" element={<UploadDocumentPage />} />
        <Route path="/guides" element={<SimplifiedGuidesPage />} />
        <Route path="/guides/:docId" element={<GuidePageWrapper />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/summary/:docId" element={<SummaryPageWrapper />} />
        <Route path="/history" element={<LegalHistoryPage />} />
      </Route>
      
      {/* Fallback route - redirect to login if not authenticated */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
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