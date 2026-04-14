import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatNumber,
  formatPercent,
  calculateItemProfit,
  calculateItemROI,
  calculateTotalValue,
  calculateTotalInvested,
  calculatePortfolioStats,
  convertCurrency,
  getChangeColor,
  getChangeBg,
  pluralize,
} from '@/lib/utils';
import type { PortfolioItem } from '@/lib/types';

describe('utils.ts', () => {
  describe('cn', () => {
    it('объединяет классы', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('merge конфликтующие tailwind классы', () => {
      const result = cn('px-4 py-2', 'px-6');
      expect(result).toBe('py-2 px-6');
    });

    it('игнорирует falsy значения', () => {
      const result = cn('class1', false, null, undefined, 'class2');
      expect(result).toBe('class1 class2');
    });
  });

  describe('formatCurrency', () => {
    it('форматирует RUB', () => {
      const result = formatCurrency(1234.56, 'RUB');
      expect(result).toContain('₽');
    });

    it('форматирует USD', () => {
      const result = formatCurrency(100, 'USD');
      expect(result).toContain('$');
    });

    it('форматирует EUR', () => {
      const result = formatCurrency(100, 'EUR');
      expect(result).toContain('€');
    });
  });

  describe('formatNumber', () => {
    it('форматирует числа', () => {
      expect(formatNumber(1234567)).toContain('1');
      expect(formatNumber(1234567)).toContain('234');
      expect(formatNumber(1234567)).toContain('567');
    });
  });

  describe('formatPercent', () => {
    it('форматирует положительный процент', () => {
      expect(formatPercent(12.34)).toBe('+12.34%');
    });

    it('форматирует отрицательный процент', () => {
      expect(formatPercent(-5.67)).toBe('-5.67%');
    });

    it('форматирует ноль', () => {
      expect(formatPercent(0)).toBe('+0.00%');
    });
  });

  describe('calculateItemProfit', () => {
    it('рассчитывает прибыль', () => {
      expect(calculateItemProfit(1500, 1000, 2)).toBe(1000);
    });

    it('рассчитывает убыток', () => {
      expect(calculateItemProfit(800, 1000, 3)).toBe(-600);
    });

    it('ноль при равных ценах', () => {
      expect(calculateItemProfit(1000, 1000, 5)).toBe(0);
    });
  });

  describe('calculateItemROI', () => {
    it('рассчитывает положительный ROI', () => {
      expect(calculateItemROI(1500, 1000)).toBe(50);
    });

    it('рассчитывает отрицательный ROI', () => {
      expect(calculateItemROI(500, 1000)).toBe(-50);
    });

    it('ноль при нулевой цене покупки', () => {
      expect(calculateItemROI(1000, 0)).toBe(0);
    });
  });

  describe('calculateTotalValue', () => {
    it('рассчитывает общую стоимость', () => {
      const items: PortfolioItem[] = [
        { id: '1', name: 'Item 1', category: 'skin', image: '', holdings: 2, avgBuyPrice: 1000, currentPrice: 1500, purchaseDate: new Date(), priceChange24h: 0, priceChange7d: 0, priceChange30d: 0, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Item 2', category: 'knife', image: '', holdings: 1, avgBuyPrice: 5000, currentPrice: 6000, purchaseDate: new Date(), priceChange24h: 0, priceChange7d: 0, priceChange30d: 0, createdAt: new Date(), updatedAt: new Date() },
      ];
      expect(calculateTotalValue(items)).toBe(9000); // 1500*2 + 6000*1
    });

    it('ноль для пустого массива', () => {
      expect(calculateTotalValue([])).toBe(0);
    });
  });

  describe('calculateTotalInvested', () => {
    it('рассчитывает общую инвестированную сумму', () => {
      const items: PortfolioItem[] = [
        { id: '1', name: 'Item 1', category: 'skin', image: '', holdings: 2, avgBuyPrice: 1000, currentPrice: 1500, purchaseDate: new Date(), priceChange24h: 0, priceChange7d: 0, priceChange30d: 0, createdAt: new Date(), updatedAt: new Date() },
      ];
      expect(calculateTotalInvested(items)).toBe(2000);
    });
  });

  describe('calculatePortfolioStats', () => {
    it('рассчитывает статистику', () => {
      const items: PortfolioItem[] = [
        { id: '1', name: 'Item 1', category: 'skin', image: '', holdings: 1, avgBuyPrice: 1000, currentPrice: 1200, purchaseDate: new Date(), priceChange24h: 0, priceChange7d: 0, priceChange30d: 0, createdAt: new Date(), updatedAt: new Date() },
      ];
      const stats = calculatePortfolioStats(items);
      expect(stats.totalValue).toBe(1200);
      expect(stats.totalInvested).toBe(1000);
      expect(stats.totalProfit).toBe(200);
      expect(stats.totalROI).toBe(20);
      expect(stats.itemsCount).toBe(1);
    });

    it('пустой портфель', () => {
      const stats = calculatePortfolioStats([]);
      expect(stats.totalValue).toBe(0);
      expect(stats.totalInvested).toBe(0);
      expect(stats.totalProfit).toBe(0);
      expect(stats.totalROI).toBe(0);
      expect(stats.itemsCount).toBe(0);
    });
  });

  describe('convertCurrency', () => {
    it('конвертирует RUB в USD', () => {
      const result = convertCurrency(100, 'RUB', 'USD');
      expect(result).toBeGreaterThan(0);
    });

    it('конвертирует USD в RUB', () => {
      const result = convertCurrency(10, 'USD', 'RUB');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('getChangeColor', () => {
    it('возвращает зеленый для положительного', () => {
      expect(getChangeColor(10)).toBe('text-emerald-400');
    });

    it('возвращает красный для отрицательного', () => {
      expect(getChangeColor(-10)).toBe('text-red-400');
    });

    it('возвращает зеленый для нуля', () => {
      expect(getChangeColor(0)).toBe('text-emerald-400');
    });
  });

  describe('getChangeBg', () => {
    it('возвращает зеленый фон для положительного', () => {
      expect(getChangeBg(10)).toBe('bg-emerald-400/10');
    });

    it('возвращает красный фон для отрицательного', () => {
      expect(getChangeBg(-10)).toBe('bg-red-400/10');
    });
  });

  describe('pluralize', () => {
    it('1 предмет', () => {
      expect(pluralize(1, 'предмет', 'предмета', 'предметов')).toBe('предмет');
    });

    it('2 предмета', () => {
      expect(pluralize(2, 'предмет', 'предмета', 'предметов')).toBe('предмета');
    });

    it('5 предметов', () => {
      expect(pluralize(5, 'предмет', 'предмета', 'предметов')).toBe('предметов');
    });

    it('11 предметов', () => {
      expect(pluralize(11, 'предмет', 'предмета', 'предметов')).toBe('предметов');
    });

    it('21 предмет', () => {
      expect(pluralize(21, 'предмет', 'предмета', 'предметов')).toBe('предмет');
    });
  });
});
