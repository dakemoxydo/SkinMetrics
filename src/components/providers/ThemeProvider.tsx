'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

function resolveInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);
  const { data: session } = useSession();

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'light') {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f1f5f9';
      root.style.color = '#0f172a';
    } else {
      root.classList.add('dark');
      root.style.backgroundColor = '#0f172a';
      root.style.color = '#f1f5f9';
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!session?.user) return;

    const saveThemeToDB = async () => {
      try {
        await fetch('/api/users/me/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme }),
        });
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    };

    void saveThemeToDB();
  }, [theme, session]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
