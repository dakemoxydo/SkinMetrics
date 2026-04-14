import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/portfolio/history
 * Получить историю цен портфеля для графика
 */
export async function GET(request: Request) {
  try {
    const headers = request.headers;
    const userId = headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30D';
    const itemId = searchParams.get('itemId');

    // Определяем дату начала
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
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const where: Record<string, unknown> = {
      userId,
      date: { gte: startDate },
    };

    if (itemId) {
      where.portfolioItemId = itemId;
    }

    const history = await prisma.priceHistory.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: history.map((h) => ({
        date: h.date.toISOString(),
        currentValue: h.totalValue,
        investedValue: h.totalInvested,
      })),
    });
  } catch (error) {
    console.error('[PORTFOLIO_HISTORY_GET]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolio/history
 * Создать запись в истории цен (вызывается при обновлении цен)
 */
export async function POST(request: Request) {
  try {
    const headers = request.headers;
    const userId = headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { portfolioItemId, totalValue, totalInvested } = body;

    if (totalValue == null || totalInvested == null) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const history = await prisma.priceHistory.create({
      data: {
        userId,
        portfolioItemId: portfolioItemId || null,
        totalValue,
        totalInvested,
      },
    });

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('[PORTFOLIO_HISTORY_POST]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
