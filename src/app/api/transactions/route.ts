import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  recalculateAfterSell,
  recalculateAvgBuyPriceAfterBuy,
} from '@/lib/portfolioMath';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        ...(itemId && { portfolioItemId: itemId }),
        ...(type && { type }),
      },
      include: {
        portfolioItem: {
          select: {
            id: true,
            name: true,
            image: true,
            icon: true,
          },
        },
      },
      orderBy: { transactionDate: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error('[API] Get transactions error:', error);
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
    const portfolioItemId = body.portfolioItemId || null;
    const type = body.type;
    const quantity = parseInt(String(body.quantity), 10);
    const price = parseFloat(String(body.price));
    const fee = body.fee ? parseFloat(String(body.fee)) : 0;
    const transactionDate = body.transactionDate ? new Date(body.transactionDate) : new Date();

    if (!type || Number.isNaN(quantity) || Number.isNaN(price) || quantity <= 0 || price < 0) {
      return NextResponse.json(
        { success: false, error: 'type, quantity and price are required' },
        { status: 400 }
      );
    }

    if (type !== 'buy' && type !== 'sell') {
      return NextResponse.json({ success: false, error: 'Invalid transaction type' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let linkedItem = null as null | { id: string; holdings: number; avgBuyPrice: number };

      if (portfolioItemId) {
        linkedItem = await tx.portfolioItem.findFirst({
          where: { id: portfolioItemId, userId },
          select: { id: true, holdings: true, avgBuyPrice: true },
        });

        if (!linkedItem) {
          throw new Error('PORTFOLIO_ITEM_NOT_FOUND');
        }
      }

      if (linkedItem && type === 'sell' && quantity > linkedItem.holdings) {
        throw new Error('INSUFFICIENT_HOLDINGS');
      }

      const totalPrice = quantity * price;

      const transaction = await tx.transaction.create({
        data: {
          userId,
          portfolioItemId,
          type,
          quantity,
          price,
          totalPrice,
          fee,
          notes: body.notes || null,
          transactionDate,
        },
      });

      if (linkedItem) {
        if (type === 'buy') {
          const next = recalculateAvgBuyPriceAfterBuy({
            currentHoldings: linkedItem.holdings,
            currentAvgBuyPrice: linkedItem.avgBuyPrice,
            buyQuantity: quantity,
            buyTotalPrice: totalPrice,
          });

          await tx.portfolioItem.update({
            where: { id: linkedItem.id },
            data: {
              holdings: next.nextHoldings,
              avgBuyPrice: next.nextAvgBuyPrice,
            },
          });
        } else {
          const next = recalculateAfterSell({
            currentHoldings: linkedItem.holdings,
            sellQuantity: quantity,
            currentAvgBuyPrice: linkedItem.avgBuyPrice,
          });

          if (next.nextHoldings === 0) {
            await tx.portfolioItem.update({
              where: { id: linkedItem.id },
              data: {
                holdings: 0,
                avgBuyPrice: 0,
              },
            });
          } else {
            await tx.portfolioItem.update({
              where: { id: linkedItem.id },
              data: {
                holdings: next.nextHoldings,
              },
            });
          }
        }
      }

      return transaction;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && error.message === 'PORTFOLIO_ITEM_NOT_FOUND') {
      return NextResponse.json({ success: false, error: 'Portfolio item not found' }, { status: 404 });
    }

    if (error instanceof Error && error.message === 'INSUFFICIENT_HOLDINGS') {
      return NextResponse.json(
        { success: false, error: 'Sell quantity exceeds current holdings' },
        { status: 400 }
      );
    }

    console.error('[API] Create transaction error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
