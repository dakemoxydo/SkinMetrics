'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import {
  PortfolioItem,
  ItemCategory,
  ChartPeriod,
  Currency,
  TableFilters,
} from '@/lib/types';
import { mockItems } from '@/lib/mockData';

// Симуляция изменения цен
function simulatePriceChange(currentPrice: number): { 
  priceChange24h: number; 
  priceChange7d: number; 
  priceChange30d: number;
  newPrice: number;
} {
  const change24h = (Math.random() - 0.48) * 6;
  const change7d = (Math.random() - 0.45) * 12;
  const change30d = (Math.random() - 0.4) * 20;
  const newPrice = currentPrice * (1 + change24h / 100);
  
  return {
    priceChange24h: parseFloat(change24h.toFixed(2)),
    priceChange7d: parseFloat(change7d.toFixed(2)),
    priceChange30d: parseFloat(change30d.toFixed(2)),
    newPrice: parseFloat(newPrice.toFixed(2)),
  };
}

// Состояние
interface PortfolioState {
  items: PortfolioItem[];
  isLoading: boolean;
  filters: TableFilters;
  chartPeriod: ChartPeriod;
  currency: Currency;
  selectedItems: string[];
}

// Actions
type Action =
  | { type: 'SET_ITEMS'; payload: PortfolioItem[] }
  | { type: 'ADD_ITEM'; payload: PortfolioItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<PortfolioItem> } }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTERS'; payload: Partial<TableFilters> }
  | { type: 'SET_CHART_PERIOD'; payload: ChartPeriod }
  | { type: 'SET_CURRENCY'; payload: Currency }
  | { type: 'TOGGLE_SELECT_ITEM'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'REFRESH_PRICES' };

const initialState: PortfolioState = {
  items: mockItems,
  isLoading: false,
  filters: {
    search: '',
    category: 'all',
    sort: { key: 'name', direction: 'asc' },
  },
  chartPeriod: '30D',
  currency: 'RUB',
  selectedItems: [],
};

function portfolioReducer(state: PortfolioState, action: Action): PortfolioState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM': {
      const { id, updates } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
        ),
      };
    }
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        selectedItems: state.selectedItems.filter((itemId) => itemId !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case 'SET_CHART_PERIOD':
      return { ...state, chartPeriod: action.payload };
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case 'TOGGLE_SELECT_ITEM':
      return {
        ...state,
        selectedItems: state.selectedItems.includes(action.payload)
          ? state.selectedItems.filter((itemId) => itemId !== action.payload)
          : [...state.selectedItems, action.payload],
      };
    case 'CLEAR_SELECTION':
      return { ...state, selectedItems: [] };
    case 'REFRESH_PRICES':
      return {
        ...state,
        items: state.items.map((item) => {
          const priceChanges = simulatePriceChange(item.currentPrice);
          return {
            ...item,
            currentPrice: priceChanges.newPrice,
            priceChange24h: priceChanges.priceChange24h,
            priceChange7d: priceChanges.priceChange7d,
            priceChange30d: priceChanges.priceChange30d,
            updatedAt: new Date(),
          };
        }),
      };
    default:
      return state;
  }
}

// Context
interface PortfolioContextType extends PortfolioState {
  dispatch: React.Dispatch<Action>;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

// Provider
export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);

  return (
    <PortfolioContext.Provider value={{ ...state, dispatch }}>
      {children}
    </PortfolioContext.Provider>
  );
}

// Hook
export function usePortfolioStore() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolioStore must be used within a PortfolioProvider');
  }

  const { items, isLoading, filters, chartPeriod, currency, selectedItems, dispatch } = context;

  // Фильтрация и сортировка
  const getFilteredItems = useCallback(() => {
    let filtered = [...items];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    const { key, direction } = filters.sort;
    const multiplier = direction === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      let valueA: number | string;
      let valueB: number | string;

      switch (key) {
        case 'name':
          return a.name.localeCompare(b.name) * multiplier;
        case 'currentPrice':
        case 'avgBuyPrice':
        case 'priceChange24h':
        case 'priceChange7d':
        case 'priceChange30d':
        case 'holdings':
          valueA = a[key as keyof PortfolioItem] as number;
          valueB = b[key as keyof PortfolioItem] as number;
          break;
        case 'value':
          valueA = a.currentPrice * a.holdings;
          valueB = b.currentPrice * b.holdings;
          break;
        case 'profit':
          valueA = (a.currentPrice - a.avgBuyPrice) * a.holdings;
          valueB = (b.currentPrice - b.avgBuyPrice) * b.holdings;
          break;
        case 'roi':
          valueA = ((a.currentPrice - a.avgBuyPrice) / a.avgBuyPrice) * 100;
          valueB = ((b.currentPrice - b.avgBuyPrice) / b.avgBuyPrice) * 100;
          break;
        default:
          return 0;
      }

      return ((valueA as number) - (valueB as number)) * multiplier;
    });

    return filtered;
  }, [items, filters]);

  return {
    items,
    isLoading,
    filters,
    chartPeriod,
    currency,
    selectedItems,
    getFilteredItems,
    setItems: (items: PortfolioItem[]) => dispatch({ type: 'SET_ITEMS', payload: items }),
    addItem: (item: Omit<PortfolioItem, 'id' | 'createdAt' | 'updatedAt' | 'priceChange24h' | 'priceChange7d' | 'priceChange30d'>) => {
      const priceChanges = simulatePriceChange(item.currentPrice);
      const newItem: PortfolioItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        priceChange24h: priceChanges.priceChange24h,
        priceChange7d: priceChanges.priceChange7d,
        priceChange30d: priceChanges.priceChange30d,
      };
      dispatch({ type: 'ADD_ITEM', payload: newItem });
    },
    updateItem: (id: string, updates: Partial<PortfolioItem>) =>
      dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } }),
    deleteItem: (id: string) => dispatch({ type: 'DELETE_ITEM', payload: id }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setFilters: (filters: Partial<TableFilters>) => dispatch({ type: 'SET_FILTERS', payload: filters }),
    setChartPeriod: (period: ChartPeriod) => dispatch({ type: 'SET_CHART_PERIOD', payload: period }),
    setCurrency: (currency: Currency) => dispatch({ type: 'SET_CURRENCY', payload: currency }),
    toggleSelectItem: (id: string) => dispatch({ type: 'TOGGLE_SELECT_ITEM', payload: id }),
    clearSelection: () => dispatch({ type: 'CLEAR_SELECTION' }),
    refreshPrices: () => dispatch({ type: 'REFRESH_PRICES' }),
  };
}

// Для использования вне компонентов (например в импорте)
let globalDispatch: React.Dispatch<Action> | null = null;

export function setGlobalDispatch(dispatch: React.Dispatch<Action>) {
  globalDispatch = dispatch;
}

export function getGlobalDispatch() {
  return globalDispatch;
}
