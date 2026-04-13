import { PortfolioItem, ItemCategory } from './types';

/** Моковые данные предметов для SkinMetrics */
export const mockItems: PortfolioItem[] = [
  {
    id: '1',
    name: 'Stiletto Knife | Crimson Kimono',
    category: 'knife',
    image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UXp-aE0Vre1CRWRKs0cBBRdGQMJFvM5uQJkRl1JYm1H4GwGfE1B6a1m4z3rFpT09Gt9OqJw92487b323dR0XZQ0nFq7ZaMj0J5bM5H4GwGfE1B6a1m4z3rFpT09Gt9OqJw92487b323dR0XZQ0nFq7ZaMj0J5bM5H4GwGfE1B6a1m4z3rFpT09Gt9OqJw92487b323dR0XZQ0nFq7ZaMj0J5bM5/360fx360f',
    icon: '🔪',
    currentPrice: 22990,
    holdings: 1,
    avgBuyPrice: 18480,
    priceChange24h: 2.34,
    priceChange7d: 5.67,
    priceChange30d: 12.45,
    purchaseDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Gallery Case',
    category: 'case',
    image: '',
    icon: '📦',
    currentPrice: 126.18,
    holdings: 50,
    avgBuyPrice: 81.24,
    priceChange24h: 1.85,
    priceChange7d: 8.92,
    priceChange30d: 55.28,
    purchaseDate: new Date('2024-02-20'),
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Prisma 2 Case',
    category: 'case',
    image: '',
    icon: '📦',
    currentPrice: 189.65,
    holdings: 57,
    avgBuyPrice: 117.56,
    priceChange24h: 0.95,
    priceChange7d: 4.21,
    priceChange30d: 61.32,
    purchaseDate: new Date('2024-03-10'),
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Prisma Case',
    category: 'case',
    image: '',
    icon: '📦',
    currentPrice: 192.75,
    holdings: 31,
    avgBuyPrice: 120.49,
    priceChange24h: 1.23,
    priceChange7d: 3.78,
    priceChange30d: 59.97,
    purchaseDate: new Date('2024-03-10'),
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Sticker | Flex',
    category: 'sticker',
    image: '',
    icon: '🏷️',
    currentPrice: 134.69,
    holdings: 30,
    avgBuyPrice: 68.89,
    priceChange24h: 3.45,
    priceChange7d: 12.34,
    priceChange30d: 95.52,
    purchaseDate: new Date('2024-01-25'),
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date(),
  },
  {
    id: '6',
    name: 'Dreams & Nightmares Case',
    category: 'case',
    image: '',
    icon: '📦',
    currentPrice: 181.14,
    holdings: 1,
    avgBuyPrice: 1,
    priceChange24h: 0.15,
    priceChange7d: 2.34,
    priceChange30d: 15.67,
    purchaseDate: new Date('2022-06-15'),
    createdAt: new Date('2022-06-15'),
    updatedAt: new Date(),
  },
  {
    id: '7',
    name: 'Charm | Die-cast',
    category: 'charm',
    image: '',
    icon: '✨',
    currentPrice: 582.11,
    holdings: 1,
    avgBuyPrice: 419,
    priceChange24h: -0.85,
    priceChange7d: 5.67,
    priceChange30d: 38.93,
    purchaseDate: new Date('2024-04-01'),
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date(),
  },
  {
    id: '8',
    name: 'AK-47 | Olive Plaid',
    category: 'skin',
    image: '',
    icon: '🎨',
    currentPrice: 90.57,
    holdings: 3,
    avgBuyPrice: 60,
    priceChange24h: 1.12,
    priceChange7d: 7.89,
    priceChange30d: 50.95,
    purchaseDate: new Date('2024-05-20'),
    createdAt: new Date('2024-05-20'),
    updatedAt: new Date(),
  },
];

/** Список доступных предметов для поиска */
export const availableItems: Array<{
  name: string;
  category: ItemCategory;
  currentPrice: number;
  icon: string;
  image: string;
}> = [
  { name: 'Stiletto Knife | Crimson Kimono', category: 'knife', currentPrice: 22990, icon: '🔪', image: '' },
  { name: 'Karambit | Doppler', category: 'knife', currentPrice: 85000, icon: '🔪', image: '' },
  { name: 'M9 Bayonet | Marble Fade', category: 'knife', currentPrice: 120000, icon: '🔪', image: '' },
  { name: 'Butterfly Knife | Fade', category: 'knife', currentPrice: 150000, icon: '🔪', image: '' },
  { name: 'Gallery Case', category: 'case', currentPrice: 126.18, icon: '📦', image: '' },
  { name: 'Prisma 2 Case', category: 'case', currentPrice: 189.65, icon: '📦', image: '' },
  { name: 'Prisma Case', category: 'case', currentPrice: 192.75, icon: '📦', image: '' },
  { name: 'Dreams & Nightmares Case', category: 'case', currentPrice: 181.14, icon: '📦', image: '' },
  { name: 'Fracture Case', category: 'case', currentPrice: 45.50, icon: '📦', image: '' },
  { name: 'Snakebite Case', category: 'case', currentPrice: 62.30, icon: '📦', image: '' },
  { name: 'Sticker | Flex', category: 'sticker', currentPrice: 134.69, icon: '🏷️', image: '' },
  { name: 'Sticker | NaVi (Holo) | Paris 2023', category: 'sticker', currentPrice: 4500, icon: '🏷️', image: '' },
  { name: 'Charm | Die-cast', category: 'charm', currentPrice: 582.11, icon: '✨', image: '' },
  { name: 'AK-47 | Olive Plaid', category: 'skin', currentPrice: 90.57, icon: '🎨', image: '' },
  { name: 'AWP | Dragon Lore', category: 'skin', currentPrice: 500000, icon: '🎨', image: '' },
  { name: 'AK-47 | Fire Serpent', category: 'skin', currentPrice: 35000, icon: '🎨', image: '' },
  { name: 'M4A4 | Howl', category: 'skin', currentPrice: 250000, icon: '🎨', image: '' },
  { name: 'Sport Gloves | Pandora\'s Box', category: 'gloves', currentPrice: 180000, icon: '🧤', image: '' },
  { name: 'Moto Gloves | Spearmint', category: 'gloves', currentPrice: 45000, icon: '🧤', image: '' },
];

/** Генерация mock истории цен */
export function generateMockPriceHistory(
  days: number,
  startValue: number,
  endValue: number
): Array<{ date: string; value: number }> {
  const data: Array<{ date: string; value: number }> = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const progress = 1 - i / days;
    const volatility = (Math.random() - 0.5) * 0.03;
    const value = startValue + (endValue - startValue) * (progress + volatility);
    
    data.push({
      date: date.toISOString(),
      value: Math.max(value, startValue * 0.8),
    });
  }
  
  return data;
}
