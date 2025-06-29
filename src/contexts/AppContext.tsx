import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Language, getLanguageFromStorage, setLanguageInStorage } from '../utils/i18n';
import { Theme, getThemeFromStorage, setThemeInStorage, initializeTheme } from '../utils/theme';

interface User {
  id: string;
  name: string;
  email?: string;
  user_metadata?: Record<string, any>;
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
  isLoading: boolean;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguageState] = useState<Language>(getLanguageFromStorage());
  const [theme, setThemeState] = useState<Theme>(getThemeFromStorage());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeTheme();
    
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Check for existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth session error:', error);
          setUser(null);
          setIsAuthenticated(false);
          return;
        }
        
        if (data?.session) {
          const userData = data.session.user;
          setUser({ 
            id: userData.id, 
            name: userData.user_metadata?.full_name || userData.email || '',
            email: userData.email,
            user_metadata: userData.user_metadata
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const userData = session.user;
        setUser({ 
          id: userData.id, 
          name: userData.user_metadata?.full_name || userData.email || '',
          email: userData.email,
          user_metadata: userData.user_metadata
        });
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
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
    <AppContext.Provider value={{ 
      user, 
      setUser, 
      isAuthenticated, 
      setIsAuthenticated, 
      language, 
      setLanguage, 
      theme, 
      setTheme,
      isLoading 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};