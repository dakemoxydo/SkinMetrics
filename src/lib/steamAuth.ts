const STEAM_OPENID_ENDPOINT = 'https://steamcommunity.com/openid/login';
const STEAM_ID_PATTERN = /\/openid\/id\/(\d+)$/;

export interface SteamProfile {
  steamId: string;
  name: string;
  image: string | null;
}

function getBaseUrl(): string {
  return (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function getSteamAuthUrl(): string {
  const baseUrl = getBaseUrl();
  const returnTo = `${baseUrl}/api/auth/steam/callback`;

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.realm': baseUrl,
    'openid.return_to': returnTo,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  return `${STEAM_OPENID_ENDPOINT}?${params.toString()}`;
}

export async function verifySteamCallback(searchParams: URLSearchParams): Promise<string | null> {
  const claimedId = searchParams.get('openid.claimed_id');
  if (!claimedId) return null;

  const verificationParams = new URLSearchParams();

  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('openid.')) {
      verificationParams.set(key, value);
    }
  }

  verificationParams.set('openid.mode', 'check_authentication');

  const response = await fetch(STEAM_OPENID_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: verificationParams.toString(),
    cache: 'no-store',
  });

  if (!response.ok) return null;

  const body = await response.text();
  if (!body.includes('is_valid:true')) return null;

  const match = claimedId.match(STEAM_ID_PATTERN);
  return match?.[1] ?? null;
}

export async function fetchSteamProfile(steamId: string): Promise<SteamProfile> {
  const fallbackProfile: SteamProfile = {
    steamId,
    name: `Steam User ${steamId.slice(-6)}`,
    image: null,
  };

  const steamApiKey = process.env.STEAM_API_KEY;
  if (!steamApiKey) {
    return fallbackProfile;
  }

  try {
    const profileUrl = new URL('https://partner.steam-api.com/ISteamUser/GetPlayerSummaries/v2/');
    profileUrl.searchParams.set('key', steamApiKey);
    profileUrl.searchParams.set('steamids', steamId);

    const response = await fetch(profileUrl, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return fallbackProfile;
    }

    const payload = await response.json() as {
      response?: {
        players?: Array<{
          personaname?: string;
          avatarfull?: string;
        }>;
      };
    };

    const player = payload.response?.players?.[0];

    return {
      steamId,
      name: player?.personaname || fallbackProfile.name,
      image: player?.avatarfull || null,
    };
  } catch {
    return fallbackProfile;
  }
}
