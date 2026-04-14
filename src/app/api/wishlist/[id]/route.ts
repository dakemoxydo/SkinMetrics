import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface WishlistRouteContext {
  params: Promise<{ id: string }>;
}

async function getWishlistItem(request: Request, context: WishlistRouteContext) {
  const headers = request.headers;
  const userId = headers.get('x-user-id');

  if (!userId) {
    return {
      response: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  const { id } = await context.params;
  const existing = await prisma.wishlistItem.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return {
      response: NextResponse.json(
        { success: false, error: 'Wishlist item not found' },
        { status: 404 }
      ),
    };
  }

  return {
    id,
    userId,
    existing,
  };
}

export async function PUT(request: Request, context: WishlistRouteContext) {
  try {
    const result = await getWishlistItem(request, context);
    if ('response' in result) {
      return result.response;
    }

    const body = await request.json();
    const updated = await prisma.wishlistItem.update({
      where: { id: result.id },
      data: {
        name: body.name ?? result.existing.name,
        marketHashName: body.marketHashName ?? result.existing.marketHashName,
        image: body.image ?? result.existing.image,
        icon: body.icon ?? result.existing.icon,
        category: body.category ?? result.existing.category,
        targetPrice: body.targetPrice ?? null,
        currentPrice: body.currentPrice ?? result.existing.currentPrice,
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('[WISHLIST_PUT]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: WishlistRouteContext) {
  try {
    const result = await getWishlistItem(request, context);
    if ('response' in result) {
      return result.response;
    }

    await prisma.wishlistItem.delete({ where: { id: result.id } });

    return NextResponse.json({
      success: true,
      data: { id: result.id },
    });
  } catch (error) {
    console.error('[WISHLIST_DELETE]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
