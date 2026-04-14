/**
 * API для управления алертами цен
 *
 * GET /api/alerts — получить все алерты пользователя
 * POST /api/alerts — создать алерт
 * PUT /api/alerts/[id] — обновить алерт
 * DELETE /api/alerts/[id] — удалить алерт
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') === 'true';

    const alerts = await prisma.priceAlert.findMany({
      where: {
        userId,
        ...(activeOnly ? { isActive: true, triggeredAt: null } : {}),
      },
      include: {
        portfolioItem: {
          select: {
            id: true,
            name: true,
            currentPrice: true,
            avgBuyPrice: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: alerts });
  } catch (error) {
    console.error('[API] Get alerts error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { portfolioItemId, itemName, marketHashName, thresholdPercent, direction } = body;

    if (!marketHashName || !thresholdPercent || !direction) {
      return NextResponse.json(
        { success: false, error: 'marketHashName, thresholdPercent, and direction are required' },
        { status: 400 }
      );
    }

    const alert = await prisma.priceAlert.create({
      data: {
        userId,
        portfolioItemId: portfolioItemId || null,
        itemName: itemName || marketHashName,
        marketHashName,
        thresholdPercent: parseFloat(thresholdPercent),
        direction, // 'up' или 'down'
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: alert });
  } catch (error) {
    console.error('[API] Create alert error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
