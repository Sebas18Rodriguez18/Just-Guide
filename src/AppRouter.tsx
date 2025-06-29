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
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from './contexts/AppContext';
import LegalHistoryPage from './components/LegalHistoryPage';

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
  const { isAuthenticated } = useAppContext();
  
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
      
      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><MyDocumentsPage /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><UploadDocumentPage /></ProtectedRoute>} />
      <Route path="/guides" element={<ProtectedRoute><SimplifiedGuidesPage /></ProtectedRoute>} />
      <Route path="/guides/:docId" element={<ProtectedRoute><GuidePageWrapper /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/summary/:docId" element={<ProtectedRoute><SummaryPageWrapper /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><LegalHistoryPage /></ProtectedRoute>} />
      
      {/* Fallback route */}
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