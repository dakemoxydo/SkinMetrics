'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Languages,
  DollarSign,
  Eye,
  Share2,
  Trash2,
  Copy,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/Toast';
import * as api from '@/lib/api';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { language: appLanguage, setLanguage: setAppLanguage } = useLanguage();
  const { data: session } = useSession();
  const toast = useToast();

  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const [currency, setCurrency] = useState<'RUB' | 'USD' | 'EUR'>('RUB');
  const [portfolioPublic, setPortfolioPublic] = useState(false);
  const [shares, setShares] = useState<api.PortfolioShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingShare, setCreatingShare] = useState(false);

  const isRussian = language === 'ru';
  const currentLanguageLabel = isRussian
    ? language === 'ru'
      ? 'Русский'
      : 'Английский'
    : appLanguage === 'ru'
      ? 'Russian'
      : 'English';
  const text = useMemo(
    () =>
      isRussian
        ? {
            loading: 'Загрузка...',
            title: 'Настройки',
            appearance: 'Внешний вид',
            theme: 'Тема',
            currentTheme: theme === 'dark' ? 'Тёмная' : 'Светлая',
            toggleTheme: 'Переключить',
            regional: 'Региональные настройки',
            language: 'Язык',
            currentLanguage: currentLanguageLabel,
            currency: 'Валюта',
            privacy: 'Приватность и доступ',
            publicPortfolio: 'Публичный портфель',
            publicDescription: portfolioPublic
              ? 'Ваш портфель виден всем по ссылке.'
              : 'Ваш портфель скрыт от других пользователей.',
            shareTitle: 'Публичные ссылки',
            shareDescription: 'Создавайте отдельные ссылки для просмотра портфеля.',
            createLink: 'Создать ссылку',
            creating: 'Создание...',
            noLinks: 'Пока нет ссылок.',
            untitled: 'Без названия',
            created: 'Создано',
            copy: 'Скопировать ссылку',
            delete: 'Удалить ссылку',
            prefsLoadError: 'Не удалось загрузить настройки',
            prefsSaveError: 'Не удалось сохранить настройки',
            shareCreateError: 'Не удалось создать ссылку',
            shareDeleteError: 'Не удалось удалить ссылку',
            copySuccess: 'Ссылка скопирована',
            copyError: 'Не удалось скопировать ссылку',
            shareCreated: 'Ссылка создана',
            shareDeleted: 'Ссылка удалена',
          }
        : {
            loading: 'Loading...',
            title: 'Settings',
            appearance: 'Appearance',
            theme: 'Theme',
            currentTheme: theme === 'dark' ? 'Dark' : 'Light',
            toggleTheme: 'Toggle',
            regional: 'Regional',
            language: 'Language',
            currentLanguage: currentLanguageLabel,
            currency: 'Currency',
            privacy: 'Privacy & Sharing',
            publicPortfolio: 'Public portfolio',
            publicDescription: portfolioPublic
              ? 'Your portfolio is visible to anyone with a link.'
              : 'Your portfolio is private.',
            shareTitle: 'Portfolio share links',
            shareDescription: 'Create separate links for viewing your portfolio.',
            createLink: 'Create link',
            creating: 'Creating...',
            noLinks: 'No share links yet.',
            untitled: 'Untitled',
            created: 'Created',
            copy: 'Copy link',
            delete: 'Delete link',
            prefsLoadError: 'Failed to load preferences',
            prefsSaveError: 'Failed to save preferences',
            shareCreateError: 'Failed to create share link',
            shareDeleteError: 'Failed to delete share link',
            copySuccess: 'Link copied',
            copyError: 'Could not copy link',
            shareCreated: 'Share link created',
            shareDeleted: 'Share link deleted',
          },
    [currentLanguageLabel, isRussian, theme, portfolioPublic]
  );

  const baseUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.origin;
  }, []);

  const loadPrefs = useCallback(async () => {
    if (!session) return;

    setLoading(true);
    try {
      const prefsRes = await fetch('/api/users/me/preferences');
      if (!prefsRes.ok) throw new Error(text.prefsLoadError);

      const prefsJson = await prefsRes.json();
      const prefs = prefsJson.data;

      let nextShares: api.PortfolioShare[] = [];
      try {
        nextShares = await api.fetchMyShares();
      } catch (error) {
        console.error('Failed to load share links', error);
        toast.error(text.prefsLoadError);
      }

      if (prefs.language) setLanguage(prefs.language);
      if (prefs.currency) setCurrency(prefs.currency);
      if (prefs.portfolioPublic != null) setPortfolioPublic(prefs.portfolioPublic);
      setShares(nextShares);
    } catch (error) {
      console.error('Failed to load preferences', error);
      toast.error(text.prefsLoadError);
    } finally {
      setLoading(false);
    }
  }, [session, text.prefsLoadError, toast]);

  useEffect(() => {
    void loadPrefs();
  }, [loadPrefs]);

  useEffect(() => {
    setLanguage(appLanguage);
  }, [appLanguage]);

  const savePreference = useCallback(
    async (key: string, value: unknown) => {
      const response = await fetch('/api/users/me/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        throw new Error(text.prefsSaveError);
      }
    },
    [text.prefsSaveError]
  );

  const handleLanguageChange = async (nextLanguage: 'ru' | 'en') => {
    const previous = language;
    setLanguage(nextLanguage);
    setAppLanguage(nextLanguage);
    try {
      await savePreference('language', nextLanguage);
    } catch (error) {
      setLanguage(previous);
      setAppLanguage(previous);
      toast.error(error instanceof Error ? error.message : text.prefsSaveError);
    }
  };

  const handleCurrencyChange = async (nextCurrency: 'RUB' | 'USD' | 'EUR') => {
    const previous = currency;
    setCurrency(nextCurrency);
    try {
      await savePreference('currency', nextCurrency);
    } catch (error) {
      setCurrency(previous);
      toast.error(error instanceof Error ? error.message : text.prefsSaveError);
    }
  };

  const handlePortfolioVisibilityChange = async (visible: boolean) => {
    const previous = portfolioPublic;
    setPortfolioPublic(visible);
    try {
      await savePreference('portfolioPublic', visible);
    } catch (error) {
      setPortfolioPublic(previous);
      toast.error(error instanceof Error ? error.message : text.prefsSaveError);
    }
  };

  const handleCreateShare = async () => {
    setCreatingShare(true);
    try {
      const created = await api.createShare({
        title: `${session?.user?.name || 'User'} Portfolio`,
      });
      setShares((current) => [created, ...current]);
      toast.success(text.shareCreated);
    } catch {
      toast.error(text.shareCreateError);
    } finally {
      setCreatingShare(false);
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    const previous = shares;
    setShares((current) => current.filter((share) => share.shareId !== shareId));
    try {
      await api.deleteShare(shareId);
      toast.success(text.shareDeleted);
    } catch {
      setShares(previous);
      toast.error(text.shareDeleteError);
    }
  };

  const handleCopyShare = async (shareId: string) => {
    const link = `${baseUrl}/p/${shareId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success(text.copySuccess);
    } catch {
      toast.error(text.copyError);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400">{text.loading}</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-slate-400" />
        <h1 className="text-2xl font-bold text-slate-100">{text.title}</h1>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">{text.appearance}</h2>
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-indigo-400" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-400" />
              )}
              <div>
                <p className="font-medium text-slate-100">{text.theme}</p>
                <p className="text-sm text-slate-400">{text.currentTheme}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="rounded-lg bg-slate-700 px-4 py-2 text-slate-100 transition-colors hover:bg-slate-600"
            >
              {text.toggleTheme}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">{text.regional}</h2>
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-blue-400" />
              <div>
                <p className="font-medium text-slate-100">{text.language}</p>
                <p className="text-sm text-slate-400">{text.currentLanguage}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => void handleLanguageChange('ru')}
                className={`rounded px-3 py-1.5 text-sm transition-colors ${
                  language === 'ru'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                RU
              </button>
              <button
                onClick={() => void handleLanguageChange('en')}
                className={`rounded px-3 py-1.5 text-sm transition-colors ${
                  language === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <p className="font-medium text-slate-100">{text.currency}</p>
                <p className="text-sm text-slate-400">{currency}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['RUB', 'USD', 'EUR'] as const).map((itemCurrency) => (
                <button
                  key={itemCurrency}
                  onClick={() => void handleCurrencyChange(itemCurrency)}
                  className={`rounded px-3 py-1.5 text-sm transition-colors ${
                    currency === itemCurrency
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {itemCurrency}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">{text.privacy}</h2>

        <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-purple-400" />
              <div>
                <p className="font-medium text-slate-100">{text.publicPortfolio}</p>
                <p className="text-sm text-slate-400">{text.publicDescription}</p>
              </div>
            </div>
            <button
              onClick={() => void handlePortfolioVisibilityChange(!portfolioPublic)}
              className={`relative h-6 w-12 rounded-full transition-colors ${
                portfolioPublic ? 'bg-green-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  portfolioPublic ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {portfolioPublic && (
          <div className="space-y-3 rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Share2 className="h-5 w-5 text-indigo-400" />
                <div>
                  <p className="font-medium text-slate-100">{text.shareTitle}</p>
                  <p className="text-sm text-slate-400">{text.shareDescription}</p>
                </div>
              </div>
              <button
                onClick={() => void handleCreateShare()}
                disabled={creatingShare}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:bg-slate-700 hover:bg-indigo-500"
              >
                {creatingShare ? text.creating : text.createLink}
              </button>
            </div>

            {shares.length === 0 ? (
              <p className="text-sm text-slate-400">{text.noLinks}</p>
            ) : (
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.shareId}
                    className="flex items-center justify-between gap-3 rounded border border-slate-700/50 bg-slate-900/50 p-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-200">{`${baseUrl}/p/${share.shareId}`}</p>
                      <p className="text-xs text-slate-400">
                        {share.title || text.untitled} • {text.created}{' '}
                        {new Date(share.createdAt).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => void handleCopyShare(share.shareId)}
                        className="rounded p-2 text-slate-300 hover:bg-slate-700"
                        title={text.copy}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => void handleDeleteShare(share.shareId)}
                        className="rounded p-2 text-red-400 hover:bg-slate-700"
                        title={text.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
