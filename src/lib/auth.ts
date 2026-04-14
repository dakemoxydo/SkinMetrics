import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { prisma } from '@/lib/prisma';

async function upsertDevUser(email: string, name?: string) {
  const resolvedName = name || email.split('@')[0];

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: resolvedName,
        currency: 'RUB',
        theme: 'dark',
        language: 'ru',
        portfolioPublic: false,
      },
    });
  }

  return user;
}

async function upsertSteamUser(steamId: string, name?: string, image?: string | null) {
  const email = `steam_${steamId}@users.noreply.steam`;

  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: 'steam',
        providerAccountId: steamId,
      },
    },
    include: {
      user: true,
    },
  });

  if (existingAccount?.user) {
    return prisma.user.update({
      where: { id: existingAccount.user.id },
      data: {
        name: name || existingAccount.user.name,
        image: image ?? existingAccount.user.image,
      },
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'steam',
          providerAccountId: steamId,
        },
      },
      update: {
        userId: existingUser.id,
        type: 'openid',
      },
      create: {
        userId: existingUser.id,
        type: 'openid',
        provider: 'steam',
        providerAccountId: steamId,
      },
    });

    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: name || existingUser.name,
        image: image ?? existingUser.image,
      },
    });
  }

  return prisma.user.create({
    data: {
      email,
      name: name || `Steam User ${steamId.slice(-6)}`,
      image: image ?? null,
      currency: 'RUB',
      theme: 'dark',
      language: 'ru',
      portfolioPublic: false,
      accounts: {
        create: {
          type: 'openid',
          provider: 'steam',
          providerAccountId: steamId,
        },
      },
    },
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        if (!email) return null;

        const user = await upsertDevUser(email, credentials?.name?.trim());

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    CredentialsProvider({
      id: 'steam',
      name: 'Steam',
      credentials: {
        steamId: { label: 'Steam ID', type: 'text' },
        name: { label: 'Steam Name', type: 'text' },
        image: { label: 'Avatar URL', type: 'text' },
      },
      async authorize(credentials) {
        const steamId = credentials?.steamId?.trim();
        if (!steamId) return null;

        const user = await upsertSteamUser(
          steamId,
          credentials?.name?.trim(),
          credentials?.image?.trim() || null
        );

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id: string }).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.user?.id ?? null;
}

export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}
