'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');
  const [mounted, setMounted] = useState(false);

  // Charger le thème sauvegardé au démarrage
  useEffect(() => {
    const savedTheme = localStorage.getItem('baya_shop_theme');
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Vérifier la préférence système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setThemeState(defaultTheme);
      applyTheme(defaultTheme);
    }
    setMounted(true);
  }, []);

  const applyTheme = (themeToApply) => {
    const html = document.documentElement;
    if (themeToApply === 'light') {
      html.setAttribute('data-theme', 'light');
      document.body.style.backgroundColor = '#FFFFFF';
      document.body.style.color = '#0F172A';
    } else {
      html.setAttribute('data-theme', 'dark');
      document.body.style.backgroundColor = '#020617';
      document.body.style.color = '#F8FAFC';
    }
  };

  const setTheme = (newTheme) => {
    if (['light', 'dark'].includes(newTheme)) {
      setThemeState(newTheme);
      localStorage.setItem('baya_shop_theme', newTheme);
      applyTheme(newTheme);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      // Seulement si l'utilisateur n'a pas défini de préférence
      const savedTheme = localStorage.getItem('baya_shop_theme');
      if (!savedTheme) {
        setTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        mounted,
        isDark: theme === 'dark',
        isLight: theme === 'light',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé au sein de ThemeProvider');
  }
  return context;
}

