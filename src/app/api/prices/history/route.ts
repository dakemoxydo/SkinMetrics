/**
 * GET /api/prices/history
 * Получить историю изменений цен для предмета
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');
    const period = searchParams.get('period') || '30D';

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'itemId is required' },
        { status: 400 }
      );
    }

    // Вычисляем дату начала периода
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '24H':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7D':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30D':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90D':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6M':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1Y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'ALL':
        startDate = new Date(0);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Получаем историю цен
    const history = await prisma.priceHistory.findMany({
      where: {
        portfolioItemId: itemId,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: history.map((h: { id: string; date: Date; totalValue: number; totalInvested: number }) => ({
        id: h.id,
        date: h.date.toISOString(),
        totalValue: h.totalValue,
        totalInvested: h.totalInvested,
      })),
    });
  } catch (error) {
    console.error('[API] Get price history error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get price history',
      },
      { status: 500 }
    );
  }
}
