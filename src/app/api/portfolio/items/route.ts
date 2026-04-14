import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getItemPrice } from '@/lib/steamPrices';
import { isItemCategory } from '@/lib/portfolioItems';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includeClosed = searchParams.get('includeClosed') === 'true';

    const where: {
      userId: string;
      category?: string;
      holdings?: { gt: number };
    } = { userId };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (!includeClosed) {
      where.holdings = { gt: 0 };
    }

    const items = await prisma.portfolioItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('[PORTFOLIO_ITEMS_GET]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const category = body.category;
    const image = typeof body.image === 'string' ? body.image : '';
    const icon = typeof body.icon === 'string' ? body.icon : null;
    const marketHashName =
      typeof body.marketHashName === 'string' && body.marketHashName.trim()
        ? body.marketHashName.trim()
        : name;
    const holdings = Number(body.holdings ?? 1);
    const avgBuyPrice = Number(body.avgBuyPrice);
    const providedCurrentPrice =
      body.currentPrice == null ? undefined : Number(body.currentPrice);
    const purchaseDate = body.purchaseDate ? new Date(body.purchaseDate) : new Date();

    if (
      !name ||
      !isItemCategory(category) ||
      !Number.isFinite(holdings) ||
      holdings <= 0 ||
      !Number.isFinite(avgBuyPrice) ||
      avgBuyPrice < 0 ||
      Number.isNaN(purchaseDate.getTime())
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid portfolio item payload' },
        { status: 400 }
      );
    }

    let currentPrice =
      providedCurrentPrice != null && Number.isFinite(providedCurrentPrice)
        ? providedCurrentPrice
        : avgBuyPrice;

    try {
      const steamPrice = await getItemPrice(marketHashName);
      if (steamPrice) {
        currentPrice = steamPrice.price;
      }
    } catch {
      console.warn(`[Portfolio] Failed to get Steam Market price for ${name}, using fallback price`);
    }

    const item = await prisma.$transaction(async (tx) => {
      const createdItem = await tx.portfolioItem.create({
        data: {
          userId,
          name,
          category,
          image,
          icon,
          marketHashName,
          holdings,
          avgBuyPrice,
          currentPrice,
          purchaseDate,
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          portfolioItemId: createdItem.id,
          type: 'buy',
          quantity: holdings,
          price: avgBuyPrice,
          totalPrice: avgBuyPrice * holdings,
          transactionDate: purchaseDate,
        },
      });

      return createdItem;
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('[PORTFOLIO_ITEMS_POST]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
