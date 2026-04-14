/**
 * POST /api/prices/sync
 * Синхронизация цен для портфеля пользователя
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncUserPortfolioPrices, syncWishlistPrices, checkPriceAlerts } from '@/lib/steamPrices';

export async function POST() {
  try {
    // Проверяем аутентификацию
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Получаем userId из сессии
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Синхронизируем цены портфеля
    const portfolioResult = await syncUserPortfolioPrices(user.id);
    
    // Синхронизируем цены wishlist
    const wishlistResult = await syncWishlistPrices(user.id);
    
    // Проверяем алерты
    const alertsTriggered = await checkPriceAlerts(user.id);

    return NextResponse.json({
      success: true,
      data: {
        portfolio: {
          synced: portfolioResult.synced,
          failed: portfolioResult.failed,
          errors: portfolioResult.errors,
        },
        wishlist: wishlistResult,
        alertsTriggered,
      },
      message: `Synced ${portfolioResult.synced} portfolio items, ${wishlistResult.synced} wishlist items`,
    });
  } catch (error) {
    console.error('[API] Price sync error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync prices',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/prices/sync
 * Получить статус последней синхронизации
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { getCacheStats } = await import('@/lib/steamPrices');
    const stats = await getCacheStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[API] Get cache stats error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get cache stats',
      },
      { status: 500 }
    );
  }
}
