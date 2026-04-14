export type AppLanguage = 'ru' | 'en';

export const APP_LANGUAGE_STORAGE_KEY = 'app-language';

export const MESSAGES = {
  en: {
    navDashboard: 'Dashboard',
    navPortfolio: 'Portfolio',
    navAnalytics: 'Analytics',
    navWishlist: 'Wishlist',
    navTransactions: 'Transactions',
    navAlerts: 'Alerts',
    navSettings: 'Settings',
    navCompare: 'Compare',
    refresh: 'Refresh',
    export: 'Export',
    import: 'Import',
    login: 'Sign In',
    updateFailed: 'Could not update prices',
    pricesUpdated: 'Prices updated from Steam Market',
    demoPricesUpdated: 'Demo prices updated',
    lightThemeEnabled: 'Light theme enabled',
    darkThemeEnabled: 'Dark theme enabled',
    exportSuccess: 'Data exported to CSV',
    importSuccess: 'Portfolio imported from JSON',
    importError: 'Import failed',
  },
  ru: {
    navDashboard: 'Дашборд',
    navPortfolio: 'Портфель',
    navAnalytics: 'Аналитика',
    navWishlist: 'Вишлист',
    navTransactions: 'Транзакции',
    navAlerts: 'Алерты',
    navSettings: 'Настройки',
    navCompare: 'Сравнение',
    refresh: 'Обновить',
    export: 'Экспорт',
    import: 'Импорт',
    login: 'Войти',
    updateFailed: 'Не удалось обновить цены',
    pricesUpdated: 'Цены обновлены из Steam Market',
    demoPricesUpdated: 'Демо-цены обновлены',
    lightThemeEnabled: 'Светлая тема включена',
    darkThemeEnabled: 'Тёмная тема включена',
    exportSuccess: 'Данные экспортированы в CSV',
    importSuccess: 'Портфель импортирован из JSON',
    importError: 'Ошибка импорта',
  },
} as const;

export type MessageKey = keyof typeof MESSAGES.en;

export function normalizeLanguage(value: string | null | undefined): AppLanguage {
  if (!value) return 'ru';
  return value.toLowerCase().startsWith('en') ? 'en' : 'ru';
}
