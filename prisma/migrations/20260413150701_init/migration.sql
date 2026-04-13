-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "icon" TEXT,
    "holdings" INTEGER NOT NULL DEFAULT 1,
    "avgBuyPrice" REAL NOT NULL,
    "purchaseDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPrice" REAL NOT NULL,
    "priceChange24h" REAL NOT NULL DEFAULT 0,
    "priceChange7d" REAL NOT NULL DEFAULT 0,
    "priceChange30d" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PortfolioItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "portfolioItemId" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalValue" REAL NOT NULL,
    "totalInvested" REAL NOT NULL,
    CONSTRAINT "PriceHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PriceHistory_portfolioItemId_fkey" FOREIGN KEY ("portfolioItemId") REFERENCES "PortfolioItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "PortfolioItem_userId_idx" ON "PortfolioItem"("userId");

-- CreateIndex
CREATE INDEX "PriceHistory_userId_date_idx" ON "PriceHistory"("userId", "date");

-- CreateIndex
CREATE INDEX "PriceHistory_portfolioItemId_date_idx" ON "PriceHistory"("portfolioItemId", "date");
