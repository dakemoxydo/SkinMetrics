/**
 * GET /api/prices/[marketHashName]
 * Получить цену для конкретного предмета
 */

import { NextRequest, NextResponse } from 'next/server';
import { getItemPrice, refreshItemPrice } from '@/lib/steamPrices';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ marketHashName: string }> }
) {
  try {
    const { marketHashName: encodedName } = await params;
    const marketHashName = decodeURIComponent(encodedName);
    
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (!marketHashName) {
      return NextResponse.json(
        { success: false, error: 'marketHashName is required' },
        { status: 400 }
      );
    }

    // Получаем цену (из кэша или Steam)
    const priceData = forceRefresh
      ? await refreshItemPrice(marketHashName)
      : await getItemPrice(marketHashName);

    if (!priceData) {
      return NextResponse.json(
        { success: false, error: 'Price data not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: priceData,
    });
  } catch (error) {
    console.error('[API] Get price error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get price',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
