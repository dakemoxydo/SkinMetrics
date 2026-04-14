import { PortfolioItem, ItemCategory } from '@/lib/types';

const API_BASE = '';

async function readApiError(res: Response, fallbackMessage: string): Promise<never> {
  try {
    const json = await res.json();
    throw new Error(json?.error || fallbackMessage);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(fallbackMessage);
  }
}

// ==================== Portfolio Items ====================

export async function fetchPortfolioItems(category?: string): Promise<PortfolioItem[]> {
  const params = category ? `?category=${category}` : '';
  const res = await fetch(`${API_BASE}/api/portfolio/items${params}`);

  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error('Failed to fetch portfolio items');
  }

  const json = await res.json();
  return json.data || [];
}

export async function createPortfolioItem(data: {
  name: string;
  category: ItemCategory;
  image?: string;
  icon?: string;
  marketHashName?: string;
  holdings: number;
  avgBuyPrice: number;
  currentPrice?: number;
  purchaseDate?: string;
}): Promise<PortfolioItem> {
  const res = await fetch(`${API_BASE}/api/portfolio/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await readApiError(res, 'Failed to create portfolio item');
  }

  const json = await res.json();
  return json.data;
}

export async function updatePortfolioItem(
  id: string,
  data: Partial<PortfolioItem>
): Promise<PortfolioItem> {
  const res = await fetch(`${API_BASE}/api/portfolio/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await readApiError(res, 'Failed to update portfolio item');
  }

  const json = await res.json();
  return json.data;
}

export async function deletePortfolioItem(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/portfolio/items/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    await readApiError(res, 'Failed to delete portfolio item');
  }
}

// ==================== Stats ====================

export interface PortfolioStatsResponse {
  totalValue: number;
  totalInvested: number;
  totalProfit: number;
  totalROI: number;
  itemsCount: number;
  bestItem: unknown;
  worstItem: unknown;
  categories: Record<string, { count: number; value: number }>;
}

export async function fetchPortfolioStats(): Promise<PortfolioStatsResponse> {
  const res = await fetch(`${API_BASE}/api/portfolio/stats`);

  if (!res.ok) {
    throw new Error('Failed to fetch portfolio stats');
  }

  const json = await res.json();
  return json.data;
}

// ==================== History ====================

export interface PriceHistoryPoint {
  date: string;
  currentValue: number;
  investedValue: number;
}

export async function fetchPortfolioHistory(
  period = '30D',
  itemId?: string
): Promise<PriceHistoryPoint[]> {
  const params = new URLSearchParams({ period });
  if (itemId) params.set('itemId', itemId);

  const res = await fetch(`${API_BASE}/api/portfolio/history?${params}`);

  if (!res.ok) {
    throw new Error('Failed to fetch portfolio history');
  }

  const json = await res.json();
  return json.data || [];
}

// ==================== Transactions ====================

export interface Transaction {
  id: string;
  portfolioItemId?: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalPrice: number;
  fee: number;
  notes?: string;
  transactionDate: string;
  createdAt: string;
  portfolioItem?: {
    id: string;
    name: string;
    image: string;
    icon?: string;
  };
}

export async function fetchTransactions(
  itemId?: string,
  type?: 'buy' | 'sell',
  limit = 50
): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (itemId) params.set('itemId', itemId);
  if (type) params.set('type', type);
  params.set('limit', limit.toString());

  const res = await fetch(`${API_BASE}/api/transactions?${params}`);

  if (!res.ok) {
    throw new Error('Failed to fetch transactions');
  }

  const json = await res.json();
  return json.data || [];
}

export async function createTransaction(data: {
  portfolioItemId?: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalPrice?: number;
  fee?: number;
  notes?: string;
  transactionDate?: string;
}): Promise<Transaction> {
  const res = await fetch(`${API_BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await readApiError(res, 'Failed to create transaction');
  }

  const json = await res.json();
  return json.data;
}

// ==================== Wishlist ====================

export interface WishlistItem {
  id: string;
  portfolioItemId?: string;
  name: string;
  marketHashName: string;
  image?: string;
  icon?: string;
  category: string;
  targetPrice?: number;
  currentPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchWishlist(): Promise<WishlistItem[]> {
  const res = await fetch(`${API_BASE}/api/wishlist`);

  if (!res.ok) {
    throw new Error('Failed to fetch wishlist');
  }

  const json = await res.json();
  return json.data || [];
}

export async function addToWishlist(data: {
  name: string;
  marketHashName: string;
  image?: string;
  icon?: string;
  category: string;
  targetPrice?: number;
  notes?: string;
}): Promise<WishlistItem> {
  const res = await fetch(`${API_BASE}/api/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await readApiError(res, 'Failed to add to wishlist');
  }

  const json = await res.json();
  return json.data;
}

export async function updateWishlistItem(
  id: string,
  data: {
    name?: string;
    marketHashName?: string;
    image?: string;
    icon?: string;
    category?: string;
    targetPrice?: number;
    currentPrice?: number;
    notes?: string;
  }
): Promise<WishlistItem> {
  const res = await fetch(`${API_BASE}/api/wishlist/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    await readApiError(res, 'Failed to update wishlist item');
  }

  const json = await res.json();
  return json.data;
}

export async function removeFromWishlist(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/wishlist/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    await readApiError(res, 'Failed to remove from wishlist');
  }
}

// ==================== Price Alerts ====================

export interface PriceAlert {
  id: string;
  userId: string;
  portfolioItemId: string | null;
  itemName: string;
  marketHashName: string;
  thresholdPercent: number;
  direction: 'up' | 'down';
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
  portfolioItem?: {
    id: string;
    name: string;
    currentPrice: number;
    icon: string | null;
  } | null;
}

export async function fetchPriceAlerts(activeOnly = true): Promise<PriceAlert[]> {
  const res = await fetch(`${API_BASE}/api/alerts?active=${activeOnly}`);

  if (!res.ok) {
    throw new Error('Failed to fetch alerts');
  }

  const json = await res.json();
  return json.data || [];
}

export async function createPriceAlert(data: {
  portfolioItemId?: string;
  itemName?: string;
  marketHashName: string;
  thresholdPercent: number;
  direction: 'up' | 'down';
}): Promise<PriceAlert> {
  const res = await fetch(`${API_BASE}/api/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to create alert');
  }

  const json = await res.json();
  return json.data;
}

export async function updatePriceAlert(id: string, data: { isActive?: boolean; triggeredAt?: string | null }): Promise<PriceAlert> {
  const res = await fetch(`${API_BASE}/api/alerts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to update alert');
  }

  const json = await res.json();
  return json.data;
}

export async function deletePriceAlert(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/alerts/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete alert');
  }
}

// ==================== User ====================

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  currency: string;
  theme: string;
  language: string;
  portfolioPublic: boolean;
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/session`);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.user) return null;
    return json.user as UserProfile;
  } catch {
    return null;
  }
}

// ==================== Steam Market Prices ====================

export interface CachedPrice {
  price: number;
  currency: string;
  volume: number;
  lastUpdated: string;
  expiresAt: string;
}

export async function getItemPrice(marketHashName: string, forceRefresh = false): Promise<CachedPrice | null> {
  const refreshParam = forceRefresh ? '?refresh=true' : '';
  const res = await fetch(`${API_BASE}/api/prices/${encodeURIComponent(marketHashName)}${refreshParam}`);

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to get item price');
  }

  const json = await res.json();
  return json.data;
}

export async function syncPrices(): Promise<{
  portfolio: { synced: number; failed: number; errors: string[] };
  wishlist: { synced: number; failed: number };
  alertsTriggered: number;
}> {
  const res = await fetch(`${API_BASE}/api/prices/sync`, {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error('Failed to sync prices');
  }

  const json = await res.json();
  return json.data;
}

export async function getPriceCacheStats(): Promise<{
  total: number;
  expired: number;
  valid: number;
}> {
  const res = await fetch(`${API_BASE}/api/prices/sync`);

  if (!res.ok) {
    throw new Error('Failed to get cache stats');
  }

  const json = await res.json();
  return json.data;
}

export async function fetchPriceHistory(
  itemId: string,
  period = '30D'
): Promise<PriceHistoryPoint[]> {
  const params = new URLSearchParams({ itemId, period });
  const res = await fetch(`${API_BASE}/api/prices/history?${params}`);

  if (!res.ok) {
    throw new Error('Failed to fetch price history');
  }

  const json = await res.json();
  return json.data || [];
}

// ==================== Portfolio Shares ====================

export interface PortfolioShare {
  id: string;
  userId: string;
  shareId: string;
  title: string | null;
  isPublic: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export async function fetchMyShares(): Promise<PortfolioShare[]> {
  const res = await fetch(`${API_BASE}/api/portfolio/my-shares`);
  if (!res.ok) {
    throw new Error('Failed to fetch shares');
  }

  const json = await res.json();
  return json.data || [];
}

export async function createShare(data?: { title?: string; expiresAt?: string | null }): Promise<PortfolioShare> {
  const res = await fetch(`${API_BASE}/api/portfolio/my-shares`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {}),
  });

  if (!res.ok) {
    throw new Error('Failed to create share');
  }

  const json = await res.json();
  return json.data;
}

export async function deleteShare(shareId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/portfolio/my-shares/${shareId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete share');
  }
}
