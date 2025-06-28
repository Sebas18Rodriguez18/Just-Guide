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
import ConfirmEmailPage from './components/ConfirmEmailPage';
import PasswordResetSuccessPage from './components/PasswordResetSuccessPage';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from './contexts/AppContext';

function GuidePageWrapper() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { user, language } = useAppContext();
  if (!docId || !user) return null;
  return (
    <GuidePage
      docId={docId}
      userId={user.id}
      userName={user.user_metadata?.full_name || user.email || ''}
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
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/confirm-email" element={<ConfirmEmailPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/documents" element={<MyDocumentsPage />} />
      <Route path="/upload" element={<UploadDocumentPage />} />
      <Route path="/guides" element={<SimplifiedGuidesPage />} />
      <Route path="/guides/:docId" element={<GuidePageWrapper />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/password-reset-success" element={<PasswordResetSuccessPage />} />
      <Route path="/summary/:docId" element={<SummaryPageWrapper />} />
      <Route path="*" element={<Navigate to="/" replace />} />
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