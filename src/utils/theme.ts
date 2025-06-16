export type Theme = 'light' | 'dark';

export const getThemeFromStorage = (): Theme => {
  const stored = localStorage.getItem('justguide-theme');
  return (stored === 'dark' || stored === 'light') ? stored : 'light';
};

export const setThemeInStorage = (theme: Theme): void => {
  localStorage.setItem('justguide-theme', theme);
  
  // Apply theme to document
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const initializeTheme = (): void => {
  const theme = getThemeFromStorage();
  setThemeInStorage(theme);
};