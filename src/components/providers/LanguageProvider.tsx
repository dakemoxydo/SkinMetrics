'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { APP_LANGUAGE_STORAGE_KEY, AppLanguage, MESSAGES, MessageKey, normalizeLanguage } from '@/lib/i18n';

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: MessageKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'ru',
  setLanguage: () => {},
  t: (key) => MESSAGES.ru[key],
});

function detectInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'ru';

  const stored = localStorage.getItem(APP_LANGUAGE_STORAGE_KEY);
  if (stored === 'ru' || stored === 'en') {
    return stored;
  }

  return normalizeLanguage(window.navigator.language);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(detectInitialLanguage);

  useEffect(() => {
    localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      t: (key: MessageKey) => MESSAGES[language][key],
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
