import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  PortfolioItem,
  PortfolioStats,
  ChartDataPoint,
  Currency,
  CURRENCY_SYMBOLS,
  EXCHANGE_RATES,
} from './types';

/** Объединение классов Tailwind */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Форматирование валюты */
export function formatCurrency(amount: number, currency: Currency = 'RUB'): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const convertedAmount = amount / EXCHANGE_RATES[currency];
  
  if (currency === 'RUB') {
    return `${convertedAmount.toLocaleString('ru-RU', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })} ${symbol}`;
  }
  
  return `${symbol}${convertedAmount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

/** Форматирование числа */
export function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU');
}

/** Форматирование процента */
export function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

/** Форматирование даты */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Форматирование даты для графика */
export function formatChartDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  });
}

/** Расчет прибыли/убытка предмета */
export function calculateItemProfit(currentPrice: number, avgBuyPrice: number, holdings: number): number {
  return (currentPrice - avgBuyPrice) * holdings;
}

/** Расчет ROI предмета */
export function calculateItemROI(currentPrice: number, avgBuyPrice: number): number {
  if (avgBuyPrice === 0) return 0;
  return ((currentPrice - avgBuyPrice) / avgBuyPrice) * 100;
}

/** Расчет общей стоимости портфеля */
export function calculateTotalValue(items: PortfolioItem[]): number {
  return items.reduce((sum, item) => sum + item.currentPrice * item.holdings, 0);
}

/** Расчет общей инвестированной суммы */
export function calculateTotalInvested(items: PortfolioItem[]): number {
  return items.reduce((sum, item) => sum + item.avgBuyPrice * item.holdings, 0);
}

/** Расчет статистики портфеля */
export function calculatePortfolioStats(items: PortfolioItem[]): PortfolioStats {
  const totalValue = calculateTotalValue(items);
  const totalInvested = calculateTotalInvested(items);
  const totalProfit = totalValue - totalInvested;
  const totalROI = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  // Находим лучший и худший предмет
  let bestItem: PortfolioStats['bestItem'];
  let worstItem: PortfolioStats['worstItem'];

  if (items.length > 0) {
    const itemsWithProfit = items.map(item => ({
      ...item,
      profit: calculateItemProfit(item.currentPrice, item.avgBuyPrice, item.holdings),
      roi: calculateItemROI(item.currentPrice, item.avgBuyPrice),
    }));

    bestItem = itemsWithProfit.reduce((best, current) => 
      current.roi > best.roi ? current : best
    );

    worstItem = itemsWithProfit.reduce((worst, current) => 
      current.roi < worst.roi ? current : worst
    );
  }

  return {
    totalValue,
    totalInvested,
    totalProfit,
    totalROI,
    itemsCount: items.length,
    bestItem,
    worstItem,
  };
}

/** Конвертация валюты */
export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  const amountInRub = amount * EXCHANGE_RATES[from];
  return amountInRub / EXCHANGE_RATES[to];
}

/** Генерация точек данных для графика */
export function generateChartData(
  items: PortfolioItem[],
  period: string,
  totalInvested: number
): ChartDataPoint[] {
  const now = new Date();
  const points: ChartDataPoint[] = [];
  let days: number;
  let pointInterval: number;

  // Определяем количество дней и интервал точек
  switch (period) {
    case '24H':
      days = 1;
      pointInterval = 1; // каждый час
      break;
    case '7D':
      days = 7;
      pointInterval = 6; // каждые 6 часов
      break;
    case '30D':
      days = 30;
      pointInterval = 24; // каждый день
      break;
    case '90D':
      days = 90;
      pointInterval = 24 * 3; // каждые 3 дня
      break;
    case '6M':
      days = 180;
      pointInterval = 24 * 7; // каждую неделю
      break;
    case '1Y':
      days = 365;
      pointInterval = 24 * 14; // каждые 2 недели
      break;
    default: // ALL
      days = 365;
      pointInterval = 24 * 30; // каждый месяц
  }

  const totalCurrentValue = items.reduce((sum, item) => sum + item.currentPrice * item.holdings, 0);
  
  // Генерируем точки с simulated историей
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const numPoints = Math.max(Math.floor((days * 24) / pointInterval), 7);
  
  for (let i = 0; i <= numPoints; i++) {
    const date = new Date(startDate.getTime() + (i * (days * 24 * 60 * 60 * 1000)) / numPoints);
    
    // Симулируем рост с небольшими колебаниями
    const progress = i / numPoints;
    const volatility = (Math.random() - 0.5) * 0.05; // ±2.5% волатильность
    const value = totalInvested + (totalCurrentValue - totalInvested) * (progress + volatility);
    
    points.push({
      date: date.toISOString(),
      currentValue: Math.max(value, totalInvested * 0.8), // Не ниже 80% от инвестированного
      investedValue: totalInvested,
    });
  }

  // Последняя точка — актуальная стоимость
  points[points.length - 1].currentValue = totalCurrentValue;

  return points;
}

/** Получение цвета по изменению цены */
export function getChangeColor(value: number): string {
  return value >= 0 ? 'text-emerald-400' : 'text-red-400';
}

/** Получение фона по изменению цены */
export function getChangeBg(value: number): string {
  return value >= 0 ? 'bg-emerald-400/10' : 'bg-red-400/10';
}

/** Склонение существительных */
export function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

/** Debounce функция */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
