import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePortfolioSnapshots } from '@/lib/compare';
import { calculatePortfolioTotals } from '@/lib/portfolioMath';
import { compareByPositionValueDesc } from '@/lib/portfolioItems';

export const dynamic = 'force-dynamic';

async function getPublicPortfolioSnapshot(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, image: true, portfolioPublic: true },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  if (!user.portfolioPublic) {
    throw new Error('PRIVATE_PORTFOLIO');
  }

  const items = await prisma.portfolioItem.findMany({
    where: { userId, holdings: { gt: 0 } },
  });

  items.sort(compareByPositionValueDesc);

  const totals = calculatePortfolioTotals(items);
  return {
    user,
    items,
    totals,
  };
}

export async function GET(req: NextRequest) {
  try {
    const leftUserId = req.nextUrl.searchParams.get('leftUserId');
    const rightUserId = req.nextUrl.searchParams.get('rightUserId');

    if (!leftUserId || !rightUserId) {
      return NextResponse.json(
        { success: false, error: 'leftUserId and rightUserId are required' },
        { status: 400 }
      );
    }

    const [left, right] = await Promise.all([
      getPublicPortfolioSnapshot(leftUserId),
      getPublicPortfolioSnapshot(rightUserId),
    ]);

    const comparisonData = comparePortfolioSnapshots(
      { user: left.user, items: left.items },
      { user: right.user, items: right.items }
    );

    return NextResponse.json({
      success: true,
      data: {
        left: {
          user: left.user,
          totals: comparisonData.leftTotals,
          topItems: left.items.slice(0, 5),
        },
        right: {
          user: right.user,
          totals: comparisonData.rightTotals,
          topItems: right.items.slice(0, 5),
        },
        comparison: comparisonData.comparison,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (error instanceof Error && error.message === 'PRIVATE_PORTFOLIO') {
      return NextResponse.json(
        { success: false, error: 'One of portfolios is private' },
        { status: 403 }
      );
    }

    console.error('[API] Compare portfolios error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
