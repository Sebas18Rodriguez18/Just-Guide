import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Language, getLanguageFromStorage, setLanguageInStorage } from '../utils/i18n';
import { Theme, getThemeFromStorage, setThemeInStorage, initializeTheme } from '../utils/theme';

interface User {
  id: string;
  name: string;
}

interface AppContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguageState] = useState<Language>(getLanguageFromStorage());
  const [theme, setThemeState] = useState<Theme>(getThemeFromStorage());

  useEffect(() => {
    initializeTheme();
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        // Handle authentication errors (like invalid refresh token)
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      
      if (data?.user) {
        setUser({ id: data.user.id, name: data.user.user_metadata?.full_name || data.user.email });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setLanguageInStorage(lang);
  };

  const setTheme = (theme: Theme) => {
    setThemeState(theme);
    setThemeInStorage(theme);
  };

  return (
    <AppContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated, language, setLanguage, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};