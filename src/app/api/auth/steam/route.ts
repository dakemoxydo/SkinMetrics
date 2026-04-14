import { NextResponse } from 'next/server';
import { getSteamAuthUrl } from '@/lib/steamAuth';

export async function GET() {
  return NextResponse.redirect(getSteamAuthUrl());
}
