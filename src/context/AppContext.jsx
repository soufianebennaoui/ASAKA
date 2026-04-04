import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import translations from '../data/i18n';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('salmon_lang') || 'fr';
  });

  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('salmon_theme') || 'dark';
  });

  const [activeOffers, setActiveOffers] = useState([]);

  // Set language and persist to localStorage
  const setLanguage = useCallback((lang) => {
    if (['fr', 'en', 'ar'].includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem('salmon_lang', lang);
    }
  }, []);

  // Set theme and persist to localStorage
  const toggleTheme = useCallback(() => {
    setThemeState((prevTheme) => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('salmon_theme', newTheme);
      return newTheme;
    });
  }, []);

  // Translation function with fallback
  const t = useCallback((key) => {
    return translations[language]?.[key] || translations['fr']?.[key] || key;
  }, [language]);

  // Computed values
  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  // Update document attributes when language changes
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;

    if (isRTL) {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [language, dir, isRTL]);

  // Update document theme class when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const value = {
    language,
    setLanguage,
    theme,
    toggleTheme,
    t,
    isRTL,
    dir,
    activeOffers,
    setActiveOffers,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return context;
};
