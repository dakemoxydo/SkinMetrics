import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const items = await prisma.portfolioItem.findMany({
      where: { userId, holdings: { gt: 0 } },
    });

    const totalValue = items.reduce((sum, item) => sum + item.currentPrice * item.holdings, 0);
    const totalInvested = items.reduce((sum, item) => sum + item.avgBuyPrice * item.holdings, 0);
    const totalProfit = totalValue - totalInvested;
    const totalROI = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    let bestItem = null;
    let worstItem = null;

    if (items.length > 0) {
      const itemsWithProfit = items.map((item) => ({
        ...item,
        profit: (item.currentPrice - item.avgBuyPrice) * item.holdings,
        roi:
          item.avgBuyPrice > 0
            ? ((item.currentPrice - item.avgBuyPrice) / item.avgBuyPrice) * 100
            : 0,
      }));

      bestItem = itemsWithProfit.reduce((best, current) =>
        current.roi > best.roi ? current : best
      );
      worstItem = itemsWithProfit.reduce((worst, current) =>
        current.roi < worst.roi ? current : worst
      );
    }

    const categoryStats = items.reduce<Record<string, { count: number; value: number }>>(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = { count: 0, value: 0 };
        }
        acc[item.category].count += item.holdings;
        acc[item.category].value += item.currentPrice * item.holdings;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      success: true,
      data: {
        totalValue,
        totalInvested,
        totalProfit,
        totalROI,
        itemsCount: items.length,
        bestItem,
        worstItem,
        categories: categoryStats,
      },
    });
  } catch (error) {
    console.error('[PORTFOLIO_STATS_GET]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
