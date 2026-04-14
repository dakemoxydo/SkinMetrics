export interface PortfolioTotalsInput {
  currentPrice: number;
  avgBuyPrice: number;
  holdings: number;
}

export function calculatePortfolioTotals(items: PortfolioTotalsInput[]) {
  const totalValue = items.reduce((sum, item) => sum + item.currentPrice * item.holdings, 0);
  const totalInvested = items.reduce((sum, item) => sum + item.avgBuyPrice * item.holdings, 0);
  const profit = totalValue - totalInvested;
  const profitPercent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

  return {
    totalValue,
    totalInvested,
    profit,
    profitPercent,
    itemsCount: items.length,
  };
}

export function recalculateAvgBuyPriceAfterBuy(params: {
  currentHoldings: number;
  currentAvgBuyPrice: number;
  buyQuantity: number;
  buyTotalPrice: number;
}) {
  const nextHoldings = params.currentHoldings + params.buyQuantity;
  const currentTotalCost = params.currentAvgBuyPrice * params.currentHoldings;
  const nextTotalCost = currentTotalCost + params.buyTotalPrice;
  const nextAvgBuyPrice = nextHoldings > 0 ? nextTotalCost / nextHoldings : 0;

  return {
    nextHoldings,
    nextAvgBuyPrice,
  };
}

export function recalculateAfterSell(params: {
  currentHoldings: number;
  sellQuantity: number;
  currentAvgBuyPrice: number;
}) {
  if (params.sellQuantity > params.currentHoldings) {
    throw new Error('INSUFFICIENT_HOLDINGS');
  }

  const nextHoldings = params.currentHoldings - params.sellQuantity;
  return {
    nextHoldings,
    nextAvgBuyPrice: nextHoldings === 0 ? 0 : params.currentAvgBuyPrice,
  };
}
