import type { ItemCategory, PortfolioItem } from '@/lib/types';

export const VALID_ITEM_CATEGORIES: ItemCategory[] = [
  'knife',
  'case',
  'skin',
  'sticker',
  'charm',
  'gloves',
  'weapon',
  'other',
];

export function isItemCategory(value: unknown): value is ItemCategory {
  return typeof value === 'string' && VALID_ITEM_CATEGORIES.includes(value as ItemCategory);
}

export function getPositionValue(item: Pick<PortfolioItem, 'currentPrice' | 'holdings'>): number {
  return item.currentPrice * item.holdings;
}

export function compareByPositionValueDesc<T extends Pick<PortfolioItem, 'currentPrice' | 'holdings'>>(
  left: T,
  right: T
): number {
  return getPositionValue(right) - getPositionValue(left);
}
