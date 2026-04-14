import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isItemCategory } from '@/lib/portfolioItems';

interface RouteContext {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: RouteContext) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const item = await prisma.portfolioItem.findFirst({
      where: { id, userId },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('[PORTFOLIO_ITEM_GET]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const body = await request.json();

    const existing = await prisma.portfolioItem.findFirst({
      where: { id, userId },
      include: {
        transactions: {
          orderBy: { transactionDate: 'asc' },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    if (body.category !== undefined && !isItemCategory(body.category)) {
      return NextResponse.json({ success: false, error: 'Invalid category' }, { status: 400 });
    }

    const nextHoldings =
      body.holdings !== undefined ? Number(body.holdings) : existing.holdings;
    const nextAvgBuyPrice =
      body.avgBuyPrice !== undefined ? Number(body.avgBuyPrice) : existing.avgBuyPrice;
    const nextPurchaseDate = body.purchaseDate
      ? new Date(body.purchaseDate)
      : existing.purchaseDate;

    if (
      !Number.isFinite(nextHoldings) ||
      nextHoldings <= 0 ||
      !Number.isFinite(nextAvgBuyPrice) ||
      nextAvgBuyPrice < 0 ||
      Number.isNaN(nextPurchaseDate.getTime())
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid portfolio item values' },
        { status: 400 }
      );
    }

    const touchesLedgerFields =
      body.holdings !== undefined ||
      body.avgBuyPrice !== undefined ||
      body.purchaseDate !== undefined;

    if (touchesLedgerFields && existing.transactions.length !== 1) {
      return NextResponse.json(
        {
          success: false,
          error:
            'This item already has transaction history. Edit transactions instead of changing holdings or purchase data directly.',
        },
        { status: 409 }
      );
    }

    const item = await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.portfolioItem.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { name: String(body.name).trim() }),
          ...(body.category !== undefined && { category: body.category }),
          ...(body.image !== undefined && { image: body.image }),
          ...(body.icon !== undefined && { icon: body.icon }),
          ...(body.marketHashName !== undefined && { marketHashName: body.marketHashName }),
          ...(body.holdings !== undefined && { holdings: nextHoldings }),
          ...(body.avgBuyPrice !== undefined && { avgBuyPrice: nextAvgBuyPrice }),
          ...(body.currentPrice !== undefined && { currentPrice: Number(body.currentPrice) }),
          ...(body.priceChange24h !== undefined && { priceChange24h: Number(body.priceChange24h) }),
          ...(body.priceChange7d !== undefined && { priceChange7d: Number(body.priceChange7d) }),
          ...(body.priceChange30d !== undefined && { priceChange30d: Number(body.priceChange30d) }),
          ...(body.purchaseDate !== undefined && { purchaseDate: nextPurchaseDate }),
        },
      });

      if (touchesLedgerFields && existing.transactions[0]) {
        await tx.transaction.update({
          where: { id: existing.transactions[0].id },
          data: {
            quantity: nextHoldings,
            price: nextAvgBuyPrice,
            totalPrice: nextHoldings * nextAvgBuyPrice,
            transactionDate: nextPurchaseDate,
          },
        });
      }

      return updatedItem;
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('[PORTFOLIO_ITEM_PUT]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const existing = await prisma.portfolioItem.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    await prisma.portfolioItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('[PORTFOLIO_ITEM_DELETE]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
