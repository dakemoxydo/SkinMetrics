/**
 * Фоновый воркер для периодического обновления цен
 * 
 * Использование:
 * - Vercel Cron: настроить в vercel.json
 * - Локально: curl http://localhost:3000/api/cron/update-prices
 * - Или любой cron-сервис
 * 
 * ВАЖНО: Этот endpoint защищён cron secret
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncUserPortfolioPrices, syncWishlistPrices, checkPriceAlerts, cleanExpiredCache } from '@/lib/steamPrices';
import { prisma } from '@/lib/prisma';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: NextRequest) {
  // Проверяем cron secret для защиты endpoint
  const authHeader = req.headers.get('authorization');
  
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('[Cron] Starting price update job...');
    
    const results = {
      usersProcessed: 0,
      totalSynced: 0,
      totalFailed: 0,
      totalAlertsTriggered: 0,
      cacheCleaned: 0,
      errors: [] as string[],
    };

    // Получаем всех пользователей
    const users = await prisma.user.findMany({
      select: { id: true, email: true },
    });

    results.usersProcessed = users.length;

    // Для каждого пользователя синхронизируем цены
    for (const user of users) {
      try {
        // Синхронизируем портфель
        const portfolioResult = await syncUserPortfolioPrices(user.id);
        results.totalSynced += portfolioResult.synced;
        results.totalFailed += portfolioResult.failed;
        
        if (portfolioResult.errors.length > 0) {
          results.errors.push(
            `User ${user.email}: ${portfolioResult.errors.join('; ')}`
          );
        }

        // Синхронизируем wishlist
        const wishlistResult = await syncWishlistPrices(user.id);
        results.totalSynced += wishlistResult.synced;
        results.totalFailed += wishlistResult.failed;

        // Проверяем алерты
        const alertsTriggered = await checkPriceAlerts(user.id);
        results.totalAlertsTriggered += alertsTriggered;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`User ${user.email}: ${errorMessage}`);
      }
    }

    // Очищаем истёкший кэш
    results.cacheCleaned = await cleanExpiredCache();

    console.log(`[Cron] Price update job completed:`, results);

    return NextResponse.json({
      success: true,
      data: results,
      message: `Processed ${results.usersProcessed} users, synced ${results.totalSynced} items`,
    });
  } catch (error) {
    console.error('[Cron] Price update job failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/update-prices
 * Для тестирования (только в development!)
 */
export async function GET(req: NextRequest) {
  // В production разрешаем только cron
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Use POST with cron secret' },
      { status: 405 }
    );
  }

  // В development можно вызвать вручную
  return POST(req);
}
