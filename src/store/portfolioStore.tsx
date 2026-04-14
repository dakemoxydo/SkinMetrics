'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { useSession } from 'next-auth/react';
import {
  PortfolioItem,
  ItemCategory,
  ChartPeriod,
  Currency,
  TableFilters,
} from '@/lib/types';
import { mockItems } from '@/lib/mockData';
import * as api from '@/lib/api';

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

function apiItemToPortfolioItem(item: PortfolioItem | Record<string, unknown>): PortfolioItem {
  const obj = item as Record<string, unknown>;

  if (obj.createdAt instanceof Date) {
    return item as PortfolioItem;
  }

  return {
    id: obj.id as string,
    name: obj.name as string,
    category: obj.category as ItemCategory,
    image: (obj.image as string) || '',
    icon: (obj.icon as string) || undefined,
    currentPrice: (obj.currentPrice as number) || 0,
    holdings: (obj.holdings as number) || 1,
    avgBuyPrice: (obj.avgBuyPrice as number) || 0,
    priceChange24h: (obj.priceChange24h as number) || 0,
    priceChange7d: (obj.priceChange7d as number) || 0,
    priceChange30d: (obj.priceChange30d as number) || 0,
    purchaseDate: obj.purchaseDate ? new Date(obj.purchaseDate as string) : new Date(),
    createdAt: obj.createdAt ? new Date(obj.createdAt as string) : new Date(),
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt as string) : new Date(),
  };
}

interface PortfolioState {
  items: PortfolioItem[];
  isLoading: boolean;
  isSynced: boolean;
  filters: TableFilters;
  chartPeriod: ChartPeriod;
  currency: Currency;
  selectedItems: string[];
}

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
  items: [],
  isLoading: false,
  isSynced: false,
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
      return { ...state, items: action.payload, isSynced: true };
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
      return { ...state, filters: { ...state.filters, ...action.payload } };
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

interface PortfolioContextType extends PortfolioState {
  dispatch: React.Dispatch<Action>;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    let cancelled = false;

    async function loadItems() {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        if (isAuthenticated) {
          const items = await api.fetchPortfolioItems();
          if (!cancelled) {
            dispatch({
              type: 'SET_ITEMS',
              payload: items.map(apiItemToPortfolioItem),
            });
          }
        } else if (!cancelled) {
          dispatch({
            type: 'SET_ITEMS',
            payload: mockItems,
          });
        }
      } catch (err) {
        console.error('Failed to load portfolio items:', err);
      } finally {
        if (!cancelled) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    }

    void loadItems();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, status]);

  useEffect(() => {
    setGlobalDispatch(dispatch);
  }, [dispatch]);

  return (
    <PortfolioContext.Provider value={{ ...state, dispatch }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioStore() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolioStore must be used within a PortfolioProvider');
  }

  const { items, isLoading, isSynced, filters, chartPeriod, currency, selectedItems, dispatch } =
    context;
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const getFilteredItems = useCallback(() => {
    let filtered = [...items];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchLower));
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    const { key, direction } = filters.sort;
    const multiplier = direction === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      let valueA: number;
      let valueB: number;

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
          valueA = a.avgBuyPrice > 0 ? ((a.currentPrice - a.avgBuyPrice) / a.avgBuyPrice) * 100 : 0;
          valueB = b.avgBuyPrice > 0 ? ((b.currentPrice - b.avgBuyPrice) / b.avgBuyPrice) * 100 : 0;
          break;
        default:
          return 0;
      }

      return (valueA - valueB) * multiplier;
    });

    return filtered;
  }, [items, filters]);

  const addItem = useCallback(
    async (
      item: Omit<
        PortfolioItem,
        'id' | 'createdAt' | 'updatedAt' | 'priceChange24h' | 'priceChange7d' | 'priceChange30d'
      >
    ) => {
      if (!isAuthenticated) {
        const priceChanges = simulatePriceChange(item.currentPrice);
        const tempItem: PortfolioItem = {
          ...item,
          id: `temp_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          priceChange24h: priceChanges.priceChange24h,
          priceChange7d: priceChanges.priceChange7d,
          priceChange30d: priceChanges.priceChange30d,
        };

        dispatch({ type: 'ADD_ITEM', payload: tempItem });
        return tempItem;
      }

      const created = await api.createPortfolioItem({
        name: item.name,
        category: item.category,
        image: item.image,
        icon: item.icon,
        marketHashName: item.name,
        holdings: item.holdings,
        avgBuyPrice: item.avgBuyPrice,
        currentPrice: item.currentPrice,
        purchaseDate: item.purchaseDate?.toISOString(),
      });

      const mapped = apiItemToPortfolioItem(created);
      dispatch({ type: 'ADD_ITEM', payload: mapped });
      return mapped;
    },
    [isAuthenticated, dispatch]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<PortfolioItem>) => {
      const currentItem = items.find((item) => item.id === id);
      if (!currentItem) {
        throw new Error('Item not found');
      }

      dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });

      if (!isAuthenticated || id.startsWith('temp_')) {
        return { ...currentItem, ...updates };
      }

      try {
        const updated = await api.updatePortfolioItem(id, updates);
        const mapped = apiItemToPortfolioItem(updated);
        dispatch({ type: 'UPDATE_ITEM', payload: { id, updates: mapped } });
        return mapped;
      } catch (err) {
        dispatch({ type: 'UPDATE_ITEM', payload: { id, updates: currentItem } });
        throw err;
      }
    },
    [isAuthenticated, items, dispatch]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      const item = items.find((portfolioItem) => portfolioItem.id === id);
      if (!item) {
        throw new Error('Item not found');
      }

      dispatch({ type: 'DELETE_ITEM', payload: id });

      if (!isAuthenticated || id.startsWith('temp_')) {
        return;
      }

      try {
        await api.deletePortfolioItem(id);
      } catch (err) {
        dispatch({ type: 'ADD_ITEM', payload: item });
        throw err;
      }
    },
    [isAuthenticated, items, dispatch]
  );

  const refreshPrices = useCallback(async () => {
    if (isAuthenticated) {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const latestItems = await api.fetchPortfolioItems();
        dispatch({
          type: 'SET_ITEMS',
          payload: latestItems.map(apiItemToPortfolioItem),
        });
      } catch (err) {
        console.error('Failed to refresh portfolio items:', err);
        throw err;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      return;
    }

    dispatch({ type: 'REFRESH_PRICES' });
  }, [isAuthenticated, dispatch]);

  const syncPrices = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch({ type: 'REFRESH_PRICES' });
      return { alertsTriggered: 0 };
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await api.syncPrices();
      const latestItems = await api.fetchPortfolioItems();
      dispatch({
        type: 'SET_ITEMS',
        payload: latestItems.map(apiItemToPortfolioItem),
      });
      return { alertsTriggered: result.alertsTriggered };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, dispatch]);

  return {
    items,
    isLoading,
    isSynced,
    filters,
    chartPeriod,
    currency,
    selectedItems,
    getFilteredItems,
    setItems: (nextItems: PortfolioItem[]) => dispatch({ type: 'SET_ITEMS', payload: nextItems }),
    addItem,
    updateItem,
    deleteItem,
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setFilters: (nextFilters: Partial<TableFilters>) =>
      dispatch({ type: 'SET_FILTERS', payload: nextFilters }),
    setChartPeriod: (period: ChartPeriod) => dispatch({ type: 'SET_CHART_PERIOD', payload: period }),
    setCurrency: (nextCurrency: Currency) =>
      dispatch({ type: 'SET_CURRENCY', payload: nextCurrency }),
    toggleSelectItem: (id: string) => dispatch({ type: 'TOGGLE_SELECT_ITEM', payload: id }),
    clearSelection: () => dispatch({ type: 'CLEAR_SELECTION' }),
    refreshPrices,
    syncPrices,
  };
}

let globalDispatch: React.Dispatch<Action> | null = null;

export function setGlobalDispatch(dispatch: React.Dispatch<Action>) {
  globalDispatch = dispatch;
}

export function getGlobalDispatch() {
  return globalDispatch;
}
