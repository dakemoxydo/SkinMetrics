import { NextRequest, NextResponse } from 'next/server';
import { fetchSteamProfile, verifySteamCallback } from '@/lib/steamAuth';

export async function GET(request: NextRequest) {
  const steamId = await verifySteamCallback(request.nextUrl.searchParams);

  if (!steamId) {
    return NextResponse.redirect(new URL('/auth/signin?error=steam_verification', request.url));
  }

  const profile = await fetchSteamProfile(steamId);
  const redirectUrl = new URL('/auth/signin', request.url);

  redirectUrl.searchParams.set('steamId', profile.steamId);
  redirectUrl.searchParams.set('name', profile.name);

  if (profile.image) {
    redirectUrl.searchParams.set('image', profile.image);
  }

  return NextResponse.redirect(redirectUrl);
}
