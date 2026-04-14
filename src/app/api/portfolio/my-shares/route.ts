import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function buildShareId() {
  return `sm_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const shares = await prisma.portfolioShare.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: shares });
  } catch (error) {
    console.error('[API] Get my shares error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title = body?.title ? String(body.title) : null;
    const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null;

    const share = await prisma.portfolioShare.create({
      data: {
        userId,
        shareId: buildShareId(),
        title,
        isPublic: true,
        expiresAt,
      },
    });

    return NextResponse.json({ success: true, data: share }, { status: 201 });
  } catch (error) {
    console.error('[API] Create share error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
