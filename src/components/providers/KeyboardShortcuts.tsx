'use client';

import { useEffect, useCallback } from 'react';

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
}

/**
 * Хук для регистрации клавиатурных сокращений
 * 
 * @example
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     { key: 'n', ctrlKey: true, action: () => openModal() },
 *     { key: 'r', action: () => refresh() },
 *   ]
 * });
 */
export function useKeyboardShortcuts({ shortcuts }: KeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Игнорируем события в полях ввода
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const matches =
          event.key === shortcut.key &&
          event.ctrlKey === (shortcut.ctrlKey || false) &&
          event.shiftKey === (shortcut.shiftKey || false) &&
          event.altKey === (shortcut.altKey || false);

        if (matches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Список стандартных сокращений для приложения
 */
export const APP_SHORTCUTS = {
  // Навигация
  GO_DASHBOARD: { key: '1', altKey: true, description: 'Перейти на дашборд' },
  GO_PORTFOLIO: { key: '2', altKey: true, description: 'Перейти в портфель' },
  GO_ANALYTICS: { key: '3', altKey: true, description: 'Перейти в аналитику' },
  GO_WISHLIST: { key: '4', altKey: true, description: 'Перейти в wishlist' },
  GO_TRANSACTIONS: { key: '5', altKey: true, description: 'Перейти в транзакции' },
  GO_ALERTS: { key: '6', altKey: true, description: 'Перейти в алерты' },
  GO_SETTINGS: { key: '7', altKey: true, description: 'Перейти в настройки' },

  // Действия
  NEW_ITEM: { key: 'n', ctrlKey: true, description: 'Новый предмет' },
  REFRESH: { key: 'r', ctrlKey: true, description: 'Обновить данные' },
  EXPORT: { key: 'e', ctrlKey: true, description: 'Экспорт' },
  SEARCH: { key: 'k', ctrlKey: true, description: 'Поиск' },
  HELP: { key: '?', description: 'Показать сокращения' },
} as const;
