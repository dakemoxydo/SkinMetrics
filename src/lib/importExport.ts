import { PortfolioItem } from '@/lib/types';
import { getGlobalDispatch } from '@/store/portfolioStore';

/** Экспорт портфеля в CSV */
export function exportToCSV(items: PortfolioItem[]): void {
  // Заголовки
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

  // Данные
  const rows = items.map((item) => {
    const value = item.currentPrice * item.holdings;
    const profit = (item.currentPrice - item.avgBuyPrice) * item.holdings;
    const roi = ((item.currentPrice - item.avgBuyPrice) / item.avgBuyPrice) * 100;

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

  // Формирование CSV
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // Добавляем BOM для корректного отображения кириллицы в Excel
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `cs2-portfolio-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Экспорт портфеля в JSON */
export function exportToJSON(items: PortfolioItem[]): string {
  const data = items.map((item) => ({
    ...item,
    purchaseDate: item.purchaseDate.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return JSON.stringify(data, null, 2);
}

/** Импорт портфеля из JSON */
export async function importFromJSON(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as Array<Record<string, unknown>>;

        if (!Array.isArray(data)) {
          reject(new Error('Неверный формат данных'));
          return;
        }

        const dispatch = getGlobalDispatch();
        if (!dispatch) {
          reject(new Error('Dispatch не инициализирован'));
          return;
        }

        data.forEach((item) => {
          if (item.name && item.category && item.holdings && item.avgBuyPrice) {
            dispatch({
              type: 'ADD_ITEM',
              payload: {
                id: Date.now().toString() + Math.random(),
                name: item.name as string,
                category: item.category as any,
                image: (item.image as string) || '',
                icon: (item.icon as string) || '📦',
                currentPrice: (item.currentPrice as number) || (item.avgBuyPrice as number),
                holdings: item.holdings as number,
                avgBuyPrice: item.avgBuyPrice as number,
                purchaseDate: item.purchaseDate ? new Date(item.purchaseDate as string) : new Date(),
                priceChange24h: 0,
                priceChange7d: 0,
                priceChange30d: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
          }
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
}

/** Импорт портфеля из JSON строки */
export function importFromJSONString(jsonString: string): void {
  const data = JSON.parse(jsonString) as Array<Record<string, unknown>>;
  const dispatch = getGlobalDispatch();
  if (!dispatch) return;

  data.forEach((item) => {
    if (item.name && item.category && item.holdings && item.avgBuyPrice) {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: Date.now().toString() + Math.random(),
          name: item.name as string,
          category: item.category as any,
          image: (item.image as string) || '',
          icon: (item.icon as string) || '📦',
          currentPrice: (item.currentPrice as number) || (item.avgBuyPrice as number),
          holdings: item.holdings as number,
          avgBuyPrice: item.avgBuyPrice as number,
          purchaseDate: item.purchaseDate ? new Date(item.purchaseDate as string) : new Date(),
          priceChange24h: 0,
          priceChange7d: 0,
          priceChange30d: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  });
}
