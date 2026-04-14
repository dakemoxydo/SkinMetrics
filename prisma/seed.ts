import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed-скрипт для разработки
 * Запуск: npx prisma db seed
 *
 * Создаёт тестового пользователя с моковыми данными портфеля
 */
async function main() {
  console.log('🌱 Seeding database...');

  // Удаляем существующие данные
  await prisma.priceCache.deleteMany();
  await prisma.priceAlert.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Создаём тестового пользователя
  const user = await prisma.user.create({
    data: {
      email: 'demo@skinmetrics.local',
      name: 'Demo User',
      image: null,
      currency: 'RUB',
      theme: 'dark',
      language: 'ru',
      portfolioPublic: false,
    },
  });

  console.log(`👤 Created user: ${user.email}`);

  // Моковые предметы портфеля
  const portfolioItems = await Promise.all([
    prisma.portfolioItem.create({
      data: {
        userId: user.id,
        name: 'Stiletto Knife | Crimson Kimono',
        category: 'knife',
        image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UXp-aE0Vre1CRWRKs0cBBRdGQMJFvM5uQJkRl1JYm1H4GwGfE1B6a1m4z3rFpT09Gt9OqJw92487b323dR0XZQ0nFq7ZaMj0J5bM5H4GwGfE1B6a1m4z3rFpT09Gt9OqJw92487b323dR0XZQ0nFq7ZaMj0J5bM5H4GwGfE1B6a1m4z3rFpT09Gt9OqJw92487b323dR0XZQ0nFq7ZaMj0J5bM5/360fx360f',
        icon: '🔪',
        marketHashName: '★ Stiletto Knife | Crimson Kimono (Factory New)',
        holdings: 1,
        avgBuyPrice: 18480,
        currentPrice: 22990,
        priceChange24h: 2.34,
        priceChange7d: 5.67,
        priceChange30d: 12.45,
        purchaseDate: new Date('2024-01-15'),
      },
    }),
    prisma.portfolioItem.create({
      data: {
        userId: user.id,
        name: 'Gallery Case',
        category: 'case',
        image: '',
        icon: '📦',
        marketHashName: 'Gallery Case',
        holdings: 50,
        avgBuyPrice: 81.24,
        currentPrice: 126.18,
        priceChange24h: 1.85,
        priceChange7d: 8.92,
        priceChange30d: 55.28,
        purchaseDate: new Date('2024-02-20'),
      },
    }),
    prisma.portfolioItem.create({
      data: {
        userId: user.id,
        name: 'Prisma 2 Case',
        category: 'case',
        image: '',
        icon: '📦',
        marketHashName: 'Prisma 2 Case',
        holdings: 57,
        avgBuyPrice: 117.56,
        currentPrice: 189.65,
        priceChange24h: 0.95,
        priceChange7d: 4.21,
        priceChange30d: 61.32,
        purchaseDate: new Date('2024-03-10'),
      },
    }),
    prisma.portfolioItem.create({
      data: {
        userId: user.id,
        name: 'Prisma Case',
        category: 'case',
        image: '',
        icon: '📦',
        marketHashName: 'Prisma Case',
        holdings: 31,
        avgBuyPrice: 120.49,
        currentPrice: 192.75,
        priceChange24h: 1.23,
        priceChange7d: 3.78,
        priceChange30d: 59.97,
        purchaseDate: new Date('2024-03-10'),
      },
    }),
    prisma.portfolioItem.create({
      data: {
        userId: user.id,
        name: 'Sticker | Flex',
        category: 'sticker',
        image: '',
        icon: '🏷️',
        marketHashName: 'Sticker | Flex',
        holdings: 30,
        avgBuyPrice: 68.89,
        currentPrice: 134.69,
        priceChange24h: 3.45,
        priceChange7d: 12.34,
        priceChange30d: 95.52,
        purchaseDate: new Date('2024-01-25'),
      },
    }),
    prisma.portfolioItem.create({
      data: {
        userId: user.id,
        name: 'Dreams & Nightmares Case',
        category: 'case',
        image: '',
        icon: '📦',
        marketHashName: 'Dreams & Nightmares Case',
        holdings: 1,
        avgBuyPrice: 1,
        currentPrice: 181.14,
        priceChange24h: 0.15,
        priceChange7d: 2.34,
        priceChange30d: 15.67,
        purchaseDate: new Date('2022-06-15'),
      },
    }),
    prisma.portfolioItem.create({
      data: {
        userId: user.id,
        name: 'Charm | Die-cast',
        category: 'charm',
        image: '',
        icon: '✨',
        marketHashName: 'Charm | Die-cast',
        holdings: 1,
        avgBuyPrice: 419,
        currentPrice: 582.11,
        priceChange24h: -0.85,
        priceChange7d: 5.67,
        priceChange30d: 38.93,
        purchaseDate: new Date('2024-04-01'),
      },
    }),
    prisma.portfolioItem.create({
      data: {
        userId: user.id,
        name: 'AK-47 | Olive Plaid',
        category: 'skin',
        image: '',
        icon: '🎨',
        marketHashName: 'AK-47 | Olive Plaid (Field-Tested)',
        holdings: 3,
        avgBuyPrice: 60,
        currentPrice: 90.57,
        priceChange24h: 1.12,
        priceChange7d: 7.89,
        priceChange30d: 50.95,
        purchaseDate: new Date('2024-05-20'),
      },
    }),
  ]);

  console.log(`📦 Created ${portfolioItems.length} portfolio items`);

  // Создаём историю транзакций для каждого предмета
  for (const item of portfolioItems) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        portfolioItemId: item.id,
        type: 'buy',
        quantity: item.holdings,
        price: item.avgBuyPrice,
        totalPrice: item.avgBuyPrice * item.holdings,
        transactionDate: item.purchaseDate,
      },
    });
  }

  console.log('💰 Created transaction history');

  // Создаём несколько точек истории цен
  const now = new Date();
  const priceHistoryPoints = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const progress = 1 - i / 30;
    const totalInvested = portfolioItems.reduce(
      (sum, item) => sum + item.avgBuyPrice * item.holdings,
      0
    );
    const totalValue = portfolioItems.reduce(
      (sum, item) => sum + item.currentPrice * item.holdings,
      0
    );
    const volatility = (Math.random() - 0.5) * 0.05;
    const value = totalInvested + (totalValue - totalInvested) * (progress + volatility);

    priceHistoryPoints.push({
      userId: user.id,
      date,
      totalValue: Math.max(value, totalInvested * 0.8),
      totalInvested,
    });
  }

  await prisma.priceHistory.createMany({
    data: priceHistoryPoints,
  });

  console.log(`📈 Created ${priceHistoryPoints.length} price history points`);

  // Создаём тестовый алерт
  await prisma.priceAlert.create({
    data: {
      userId: user.id,
      itemName: 'Karambit | Doppler',
      marketHashName: '★ Karambit | Doppler (Factory New)',
      thresholdPercent: 10,
      direction: 'down',
      isActive: true,
    },
  });

  console.log('🔔 Created price alert');

  // Создаём элементы wishlist
  await prisma.wishlistItem.createMany({
    data: [
      {
        userId: user.id,
        name: 'Karambit | Doppler',
        marketHashName: '★ Karambit | Doppler (Factory New)',
        icon: '🔪',
        category: 'knife',
        currentPrice: 85000,
        targetPrice: 75000,
        notes: 'Хочу купить при падении цены',
      },
      {
        userId: user.id,
        name: 'AWP | Dragon Lore',
        marketHashName: 'AWP | Dragon Lore (Factory New)',
        icon: '🎨',
        category: 'skin',
        currentPrice: 500000,
        targetPrice: 450000,
        notes: 'Мечта!',
      },
    ],
  });

  console.log('⭐ Created wishlist items');

  // Создаём кэш цен
  const nowDate = new Date();
  const expiresAt = new Date(nowDate.getTime() + 24 * 60 * 60 * 1000); // +24 часа

  await prisma.priceCache.createMany({
    data: [
      {
        marketHashName: '★ Stiletto Knife | Crimson Kimono (Factory New)',
        price: 22990,
        currency: 'RUB',
        volume: 12,
        lastUpdated: nowDate,
        expiresAt,
      },
      {
        marketHashName: 'Gallery Case',
        price: 126.18,
        currency: 'RUB',
        volume: 1543,
        lastUpdated: nowDate,
        expiresAt,
      },
      {
        marketHashName: 'Prisma 2 Case',
        price: 189.65,
        currency: 'RUB',
        volume: 892,
        lastUpdated: nowDate,
        expiresAt,
      },
    ],
  });

  console.log('💾 Created price cache');

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
