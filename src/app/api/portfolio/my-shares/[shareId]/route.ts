import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { shareId } = await params;
    const existing = await prisma.portfolioShare.findFirst({
      where: { shareId, userId },
      select: { id: true, shareId: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Share not found' }, { status: 404 });
    }

    await prisma.portfolioShare.delete({ where: { id: existing.id } });

    return NextResponse.json({ success: true, data: { shareId: existing.shareId } });
  } catch (error) {
    console.error('[API] Delete share error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
