/**
 * API для управления отдельным алертом
 *
 * PUT /api/alerts/[id] — обновить алерт
 * DELETE /api/alerts/[id] — удалить алерт
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function verifyAlertOwnership(alertId: string, userId: string) {
  const alert = await prisma.priceAlert.findUnique({
    where: { id: alertId },
    select: { userId: true },
  });
  return alert?.userId === userId;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const isOwner = await verifyAlertOwnership(id, userId);
    if (!isOwner) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { thresholdPercent, direction, isActive } = body;

    const alert = await prisma.priceAlert.update({
      where: { id },
      data: {
        ...(thresholdPercent != null && { thresholdPercent: parseFloat(thresholdPercent) }),
        ...(direction != null && { direction }),
        ...(isActive != null && { isActive }),
      },
    });

    return NextResponse.json({ success: true, data: alert });
  } catch (error) {
    console.error('[API] Update alert error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const isOwner = await verifyAlertOwnership(id, userId);
    if (!isOwner) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await prisma.priceAlert.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('[API] Delete alert error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
