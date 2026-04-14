/**
 * Сервис получения цен из Steam Market.
 *
 * Безопасность:
 * - клиент никогда не обращается к Steam напрямую;
 * - все запросы идут через сервер с rate limiting;
 * - ответы кэшируются в БД;
 * - cookies и игровые сессии не используются.
 */

import { prisma } from '@/lib/prisma';

const STEAM_MARKET_BASE = 'https://steamcommunity.com';
const STEAM_PRICE_OVERVIEW = `${STEAM_MARKET_BASE}/market/priceoverview/`;

const RATE_LIMIT_MS = 5000;
const CACHE_TTL_HOURS = 24;

let lastRequestTime = 0;

interface SteamPriceData {
  success: boolean;
  lowest_price?: string;
  volume?: string;
  median_price?: string;
}

interface CachedPrice {
  price: number;
  currency: string;
  volume: number;
  lastUpdated: Date;
  expiresAt: Date;
}

async function rateLimitDelay(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    const delay = RATE_LIMIT_MS - timeSinceLastRequest;
    console.log(`[Steam Prices] Rate limiting: waiting ${delay}ms`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  lastRequestTime = Date.now();
}

async function getCachedPrice(marketHashName: string): Promise<CachedPrice | null> {
  const cached = await prisma.priceCache.findUnique({
    where: { marketHashName },
  });

  if (!cached) return null;

  if (cached.expiresAt < new Date()) {
    await prisma.priceCache.delete({
      where: { marketHashName },
    }).catch(() => {});

    return null;
  }

  return {
    price: cached.price,
    currency: cached.currency,
    volume: cached.volume,
    lastUpdated: cached.lastUpdated,
    expiresAt: cached.expiresAt,
  };
}

async function setCachedPrice(
  marketHashName: string,
  price: number,
  currency: string,
  volume: number
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_HOURS * 60 * 60 * 1000);

  await prisma.priceCache.upsert({
    where: { marketHashName },
    update: {
      price,
      currency,
      volume,
      lastUpdated: now,
      expiresAt,
    },
    create: {
      marketHashName,
      price,
      currency,
      volume,
      lastUpdated: now,
      expiresAt,
    },
  });
}

function parseSteamPriceString(priceString: string): number {
  if (!priceString) return 0;

  const cleaned = priceString
    .replace(/\s/g, '')
    .replace(/[₽$€¥£]/g, '')
    .replace(',', '.');

  const parsed = parseFloat(cleaned);

  if (Number.isNaN(parsed)) {
    console.warn(`[Steam Prices] Failed to parse price: "${priceString}"`);
    return 0;
  }

  return parsed;
}

async function fetchPriceFromSteam(marketHashName: string): Promise<SteamPriceData | null> {
  try {
    await rateLimitDelay();

    const url = `${STEAM_PRICE_OVERVIEW}?appid=730&currency=5&market_hash_name=${encodeURIComponent(marketHashName)}`;

    console.log(`[Steam Prices] Fetching price for: ${marketHashName}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SkinMetrics/1.0 (Portfolio Tracker)',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`[Steam Prices] HTTP ${response.status} for ${marketHashName}`);
      return null;
    }

    const data = (await response.json()) as SteamPriceData;

    if (!data.success) {
      console.warn(`[Steam Prices] Steam API returned success=false for ${marketHashName}`);
      return null;
    }

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Steam Prices] Error fetching price for ${marketHashName}:`, errorMessage);
    return null;
  }
}

export async function getItemPrice(marketHashName: string): Promise<CachedPrice | null> {
  const cached = await getCachedPrice(marketHashName);
  if (cached) {
    console.log(`[Steam Prices] Cache hit for: ${marketHashName}`);
    return cached;
  }

  console.log(`[Steam Prices] Cache miss for: ${marketHashName}, fetching from Steam...`);

  const steamData = await fetchPriceFromSteam(marketHashName);

  if (!steamData || !steamData.lowest_price) {
    console.warn(`[Steam Prices] No price data available for: ${marketHashName}`);
    return null;
  }

  const price = parseSteamPriceString(steamData.lowest_price);
  const volume = steamData.volume ? parseInt(steamData.volume.replace(/,/g, ''), 10) : 0;

  await setCachedPrice(marketHashName, price, 'RUB', volume);

  return {
    price,
    currency: 'RUB',
    volume,
    lastUpdated: new Date(),
    expiresAt: new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000),
  };
}

export async function getItemsPrices(marketHashNames: string[]): Promise<(CachedPrice | null)[]> {
  const results: (CachedPrice | null)[] = [];

  for (const name of marketHashNames) {
    const price = await getItemPrice(name);
    results.push(price);
  }

  return results;
}

export async function refreshItemPrice(marketHashName: string): Promise<CachedPrice | null> {
  await prisma.priceCache.delete({
    where: { marketHashName },
  }).catch(() => {});

  return getItemPrice(marketHashName);
}

export async function syncUserPortfolioPrices(userId: string): Promise<{
  synced: number;
  failed: number;
  errors: string[];
}> {
  const portfolioItems = await prisma.portfolioItem.findMany({
    where: { userId },
    select: {
      id: true,
      marketHashName: true,
      name: true,
      currentPrice: true,
    },
  });

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const item of portfolioItems) {
    try {
      const marketHashName = item.marketHashName || item.name;
      const priceData = await refreshItemPrice(marketHashName);

      if (!priceData) {
        failed++;
        errors.push(`No price data for: ${item.name}`);
        continue;
      }

      await prisma.portfolioItem.update({
        where: { id: item.id },
        data: { currentPrice: priceData.price },
      });

      const portfolioItem = await prisma.portfolioItem.findUnique({
        where: { id: item.id },
        select: { holdings: true, avgBuyPrice: true },
      });

      await prisma.priceHistory.create({
        data: {
          userId,
          portfolioItemId: item.id,
          totalValue: priceData.price * (portfolioItem?.holdings || 1),
          totalInvested: (portfolioItem?.avgBuyPrice || 0) * (portfolioItem?.holdings || 1),
        },
      });

      synced++;
    } catch (error) {
      failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Failed to update ${item.name}: ${errorMessage}`);
    }
  }

  return { synced, failed, errors };
}

export async function syncWishlistPrices(userId: string): Promise<{
  synced: number;
  failed: number;
}> {
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId },
    select: {
      id: true,
      marketHashName: true,
      name: true,
    },
  });

  let synced = 0;
  let failed = 0;

  for (const item of wishlistItems) {
    try {
      const priceData = await getItemPrice(item.marketHashName);

      if (!priceData) {
        failed++;
        continue;
      }

      await prisma.wishlistItem.update({
        where: { id: item.id },
        data: { currentPrice: priceData.price },
      });

      synced++;
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}

export async function checkPriceAlerts(userId: string): Promise<number> {
  const alerts = await prisma.priceAlert.findMany({
    where: {
      userId,
      isActive: true,
      triggeredAt: null,
    },
    include: {
      portfolioItem: true,
    },
  });

  let triggeredCount = 0;

  for (const alert of alerts) {
    try {
      const priceData = await getItemPrice(alert.marketHashName);

      if (!priceData) continue;

      const basePrice = alert.portfolioItem?.avgBuyPrice || alert.portfolioItem?.currentPrice || 0;
      if (basePrice === 0) continue;

      const priceChangePercent = ((priceData.price - basePrice) / basePrice) * 100;

      let shouldTrigger = false;

      if (alert.direction === 'up' && priceChangePercent >= alert.thresholdPercent) {
        shouldTrigger = true;
      } else if (alert.direction === 'down' && priceChangePercent <= -alert.thresholdPercent) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: { triggeredAt: new Date() },
        });

        triggeredCount++;
        console.log(`[Price Alert] Triggered for ${alert.itemName}: ${priceChangePercent.toFixed(2)}%`);
      }
    } catch (error) {
      console.error(`[Price Alert] Error checking alert for ${alert.itemName}:`, error);
    }
  }

  return triggeredCount;
}

export async function cleanExpiredCache(): Promise<number> {
  const now = new Date();

  const result = await prisma.priceCache.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });

  if (result.count > 0) {
    console.log(`[Steam Prices] Cleaned ${result.count} expired cache entries`);
  }

  return result.count;
}

export async function getCacheStats(): Promise<{
  total: number;
  expired: number;
  valid: number;
}> {
  const now = new Date();

  const [total, expired] = await Promise.all([
    prisma.priceCache.count(),
    prisma.priceCache.count({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    }),
  ]);

  return {
    total,
    expired,
    valid: total - expired,
  };
}
