export type ItemCategory =
  | 'knife'
  | 'case'
  | 'skin'
  | 'sticker'
  | 'charm'
  | 'gloves'
  | 'weapon'
  | 'other';

export type Currency = 'RUB' | 'USD' | 'EUR';

export type ChartPeriod = '24H' | '7D' | '30D' | '90D' | '6M' | '1Y' | 'ALL';

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

export interface ChartDataPoint {
  date: string;
  currentValue: number;
  investedValue: number;
}

export interface PortfolioStats {
  totalValue: number;
  totalInvested: number;
  totalProfit: number;
  totalROI: number;
  itemsCount: number;
  bestItem?: PortfolioItem & { profit: number; roi: number };
  worstItem?: PortfolioItem & { profit: number; roi: number };
}

export interface AddItemFormData {
  name: string;
  category: ItemCategory;
  image: string;
  icon?: string;
  holdings: number;
  avgBuyPrice: number;
  purchaseDate: Date;
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
  currency: Currency;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface TableFilters {
  search: string;
  category: ItemCategory | 'all';
  sort: SortConfig;
}

export const EXCHANGE_RATES: Record<Currency, number> = {
  RUB: 1,
  USD: 96.5,
  EUR: 105.2,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
};

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
