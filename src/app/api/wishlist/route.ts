import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/wishlist
 * Получить wishlist пользователя.
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

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('[WISHLIST_GET]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist
 * Добавить предмет в wishlist.
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
    const { name, marketHashName, image, icon, category, targetPrice, currentPrice, notes } = body;

    if (!name || !marketHashName || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const item = await prisma.wishlistItem.create({
      data: {
        userId,
        name,
        marketHashName,
        image: image || null,
        icon: icon || null,
        category,
        targetPrice: targetPrice || null,
        currentPrice: currentPrice || 0,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('[WISHLIST_POST]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
