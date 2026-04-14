/**
 * API для управления предпочтениями пользователя
 *
 * GET /api/users/me/preferences — получить предпочтения
 * PUT /api/users/me/preferences — обновить предпочтения
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        theme: true,
        language: true,
        currency: true,
        portfolioPublic: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('[API] Get preferences error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { theme, language, currency, portfolioPublic } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(theme && { theme }),
        ...(language && { language }),
        ...(currency && { currency }),
        ...(portfolioPublic != null && { portfolioPublic }),
      },
      select: {
        theme: true,
        language: true,
        currency: true,
        portfolioPublic: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('[API] Update preferences error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
