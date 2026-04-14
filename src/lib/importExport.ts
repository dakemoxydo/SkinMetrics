import { PortfolioItem } from '@/lib/types';
import { getGlobalDispatch } from '@/store/portfolioStore';
import { createPortfolioItem } from '@/lib/api';
import { isItemCategory } from '@/lib/portfolioItems';

type ImportedItemInput = {
  name: string;
  category: PortfolioItem['category'];
  image?: string;
  icon?: string;
  currentPrice?: number;
  holdings: number;
  avgBuyPrice: number;
  purchaseDate?: string;
};

function mapImportedItem(item: Record<string, unknown>): ImportedItemInput | null {
  if (
    typeof item.name !== 'string' ||
    !isItemCategory(item.category) ||
    typeof item.holdings !== 'number' ||
    typeof item.avgBuyPrice !== 'number'
  ) {
    return null;
  }

  return {
    name: item.name,
    category: item.category,
    image: typeof item.image === 'string' ? item.image : '',
    icon: typeof item.icon === 'string' ? item.icon : '📦',
    currentPrice: typeof item.currentPrice === 'number' ? item.currentPrice : item.avgBuyPrice,
    holdings: item.holdings,
    avgBuyPrice: item.avgBuyPrice,
    purchaseDate: item.purchaseDate ? new Date(String(item.purchaseDate)).toISOString() : new Date().toISOString(),
  };
}

async function parseJsonFile(file: File): Promise<Array<Record<string, unknown>>> {
  const content = await file.text();
  const data = JSON.parse(content) as Array<Record<string, unknown>>;

  if (!Array.isArray(data)) {
    throw new Error('Invalid import format');
  }

  return data;
}

export function exportToCSV(items: PortfolioItem[]): void {
  const headers = [
    'Название',
    'Категория',
    'Количество',
    'Текущая цена',
    'Средняя цена покупки',
    'Стоимость',
    'Прибыль',
    'ROI %',
    '24ч %',
    '7д %',
    '30д %',
    'Дата покупки',
  ];

  const rows = items.map((item) => {
    const value = item.currentPrice * item.holdings;
    const profit = (item.currentPrice - item.avgBuyPrice) * item.holdings;
    const roi = item.avgBuyPrice > 0 ? ((item.currentPrice - item.avgBuyPrice) / item.avgBuyPrice) * 100 : 0;

    return [
      item.name,
      item.category,
      item.holdings.toString(),
      item.currentPrice.toFixed(2),
      item.avgBuyPrice.toFixed(2),
      value.toFixed(2),
      profit.toFixed(2),
      roi.toFixed(2),
      item.priceChange24h.toFixed(2),
      item.priceChange7d.toFixed(2),
      item.priceChange30d.toFixed(2),
      new Date(item.purchaseDate).toLocaleDateString('ru-RU'),
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `skinmetrics-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(items: PortfolioItem[]): string {
  const data = items.map((item) => ({
    ...item,
    purchaseDate: item.purchaseDate.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return JSON.stringify(data, null, 2);
}

export async function importFromJSON(
  file: File,
  options?: { persistToServer?: boolean }
): Promise<number> {
  const data = await parseJsonFile(file);
  const importedItems = data
    .map((item) => mapImportedItem(item))
    .filter((item): item is ImportedItemInput => item !== null);

  if (importedItems.length === 0) {
    throw new Error('No valid items found in import file');
  }

  if (options?.persistToServer) {
    await Promise.all(
      importedItems.map((item) =>
        createPortfolioItem({
          ...item,
          marketHashName: item.name,
        })
      )
    );
    return importedItems.length;
  }

  const dispatch = getGlobalDispatch();
  if (!dispatch) {
    throw new Error('Portfolio store is not initialized');
  }

  importedItems.forEach((item) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: item.name,
        category: item.category,
        image: item.image || '',
        icon: item.icon,
        currentPrice: item.currentPrice ?? item.avgBuyPrice,
        holdings: item.holdings,
        avgBuyPrice: item.avgBuyPrice,
        purchaseDate: new Date(item.purchaseDate ?? new Date().toISOString()),
        priceChange24h: 0,
        priceChange7d: 0,
        priceChange30d: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  });

  return importedItems.length;
}

export function importFromJSONString(jsonString: string): void {
  const data = JSON.parse(jsonString) as Array<Record<string, unknown>>;
  const dispatch = getGlobalDispatch();
  if (!dispatch) return;

  data.forEach((item) => {
    const mappedItem = mapImportedItem(item);
    if (!mappedItem) return;

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: mappedItem.name,
        category: mappedItem.category,
        image: mappedItem.image || '',
        icon: mappedItem.icon,
        currentPrice: mappedItem.currentPrice ?? mappedItem.avgBuyPrice,
        holdings: mappedItem.holdings,
        avgBuyPrice: mappedItem.avgBuyPrice,
        purchaseDate: new Date(mappedItem.purchaseDate ?? new Date().toISOString()),
        priceChange24h: 0,
        priceChange7d: 0,
        priceChange30d: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  });
}
