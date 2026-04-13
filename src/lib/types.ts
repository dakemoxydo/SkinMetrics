// TypeScript интерфейсы для SkinMetrics

/** Категории предметов CS2 */
export type ItemCategory = 
  | 'knife'
  | 'case'
  | 'skin'
  | 'sticker'
  | 'charm'
  | 'gloves'
  | 'weapon'
  | 'other';

/** Валюты */
export type Currency = 'RUB' | 'USD' | 'EUR';

/** Период для графика */
export type ChartPeriod = '24H' | '7D' | '30D' | '90D' | '6M' | '1Y' | 'ALL';

/** Предмет в портфеле */
export interface PortfolioItem {
  id: string;
  name: string;
  category: ItemCategory;
  image: string;
  icon?: string;
  currentPrice: number;
  holdings: number;
  avgBuyPrice: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  purchaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Точка данных для графика */
export interface ChartDataPoint {
  date: string;
  currentValue: number;
  investedValue: number;
}

/** Статистика портфеля */
export interface PortfolioStats {
  totalValue: number;
  totalInvested: number;
  totalProfit: number;
  totalROI: number;
  itemsCount: number;
  bestItem?: PortfolioItem & { profit: number; roi: number };
  worstItem?: PortfolioItem & { profit: number; roi: number };
}

/** Данные для формы добавления предмета */
export interface AddItemFormData {
  name: string;
  category: ItemCategory;
  image: string;
  icon?: string;
  holdings: number;
  avgBuyPrice: number;
  purchaseDate: Date;
}

/** Данные пользователя */
export interface UserData {
  id: string;
  email: string;
  name?: string;
  currency: Currency;
}

/** Ответ API */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Сортировка таблицы */
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

/** Фильтры для таблицы */
export interface TableFilters {
  search: string;
  category: ItemCategory | 'all';
  sort: SortConfig;
}

/** Курсы валют (относительно RUB) */
export const EXCHANGE_RATES: Record<Currency, number> = {
  RUB: 1,
  USD: 96.5,
  EUR: 105.2,
};

/** Символы валют */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
};

/** Названия категорий */
export const CATEGORY_NAMES: Record<ItemCategory, string> = {
  knife: 'Нож',
  case: 'Кейс',
  skin: 'Скин',
  sticker: 'Стикер',
  charm: 'Шарм',
  gloves: 'Перчатки',
  weapon: 'Оружие',
  other: 'Другое',
};

/** Иконки категорий (emoji) */
export const CATEGORY_ICONS: Record<ItemCategory, string> = {
  knife: '🔪',
  case: '📦',
  skin: '🎨',
  sticker: '🏷️',
  charm: '✨',
  gloves: '🧤',
  weapon: '🔫',
  other: '📌',
};
