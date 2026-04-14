/**
 * GET /api/portfolio/shares/[shareId]
 * Получить публичный портфель по shareId
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;

    const share = await prisma.portfolioShare.findUnique({
      where: { shareId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!share || !share.isPublic) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found or private' },
        { status: 404 }
      );
    }

    // Проверяем не истёк ли срок
    if (share.expiresAt && share.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Share link expired' },
        { status: 404 }
      );
    }

    // Получаем предметы
    const items = await prisma.portfolioItem.findMany({
      where: { userId: share.userId },
      orderBy: { currentPrice: 'desc' },
    });

    const totalValue = items.reduce((sum, item) => sum + item.currentPrice * item.holdings, 0);
    const totalInvested = items.reduce((sum, item) => sum + item.avgBuyPrice * item.holdings, 0);
    const profit = totalValue - totalInvested;
    const profitPercent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        title: share.title || `${share.user.name || 'User'}'s Portfolio`,
        ownerName: share.user.name,
        ownerImage: share.user.image,
        stats: {
          totalValue,
          totalInvested,
          profit,
          profitPercent,
          itemsCount: items.length,
        },
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          icon: item.icon,
          category: item.category,
          holdings: item.holdings,
          avgBuyPrice: item.avgBuyPrice,
          currentPrice: item.currentPrice,
          priceChangePercent: item.priceChange30d,
        })),
      },
    });
  } catch (error) {
    console.error('[API] Get shared portfolio error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
