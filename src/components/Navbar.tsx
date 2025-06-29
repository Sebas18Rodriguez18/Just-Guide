import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, User, Moon, Sun, Globe, ChevronDown, 
  TrendingUp, Upload, FileText, BookOpen, Settings, LogOut
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { getTranslations } from '../utils/i18n';
import { smartCapitalize } from '../utils/textCapitalization';

const languageNames: Record<string, string> = {
  es: 'Español',
  en: 'English'
};

// This component is no longer used - Layout.tsx handles all navigation now
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, language, theme, setLanguage, setTheme, setUser, setIsAuthenticated } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const t = getTranslations(language);

  const sidebarItems = [
    { id: 'dashboard', path: '/dashboard', label: t.dashboard, icon: TrendingUp },
    { id: 'upload', path: '/upload', label: t.uploadDocument, icon: Upload },
    { id: 'documents', path: '/documents', label: t.myDocuments, icon: FileText },
    { id: 'guides', path: '/guides', label: t.simplifiedGuides, icon: BookOpen },
    { id: 'settings', path: '/settings', label: t.settings, icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  // This component is deprecated - return null to prevent rendering
  return null;
}