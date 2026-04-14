import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculatePortfolioTotals } from '@/lib/portfolioMath';
import { compareByPositionValueDesc } from '@/lib/portfolioItems';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        portfolioPublic: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.portfolioPublic) {
      return NextResponse.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          image: user.image,
          portfolioPublic: false,
          stats: null,
          topItems: [],
        },
      });
    }

    const allItems = await prisma.portfolioItem.findMany({
      where: { userId, holdings: { gt: 0 } },
    });

    const rankedItems = [...allItems].sort(compareByPositionValueDesc);
    const topItems = rankedItems.slice(0, 6).map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      icon: item.icon,
      currentPrice: item.currentPrice,
      priceChangePercent: item.priceChange30d,
    }));

    const totals = calculatePortfolioTotals(allItems);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        image: user.image,
        portfolioPublic: true,
        stats: {
          totalValue: totals.totalValue,
          totalInvested: totals.totalInvested,
          profit: totals.profit,
          profitPercent: totals.profitPercent,
          itemsCount: totals.itemsCount,
        },
        topItems,
      },
    });
  } catch (error) {
    console.error('[API] Get public profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
