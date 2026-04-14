import {
  calculatePortfolioTotals,
  recalculateAfterSell,
  recalculateAvgBuyPriceAfterBuy,
} from '@/lib/portfolioMath';
import { comparePortfolioSnapshots } from '@/lib/compare';

describe('portfolioMath', () => {
  it('calculates portfolio totals', () => {
    const totals = calculatePortfolioTotals([
      { currentPrice: 100, avgBuyPrice: 50, holdings: 2 },
      { currentPrice: 80, avgBuyPrice: 100, holdings: 1 },
    ]);

    expect(totals.totalValue).toBe(280);
    expect(totals.totalInvested).toBe(200);
    expect(totals.profit).toBe(80);
    expect(totals.itemsCount).toBe(2);
    expect(totals.profitPercent).toBeCloseTo(40);
  });

  it('recalculates avg buy price after buy transaction', () => {
    const next = recalculateAvgBuyPriceAfterBuy({
      currentHoldings: 2,
      currentAvgBuyPrice: 100,
      buyQuantity: 1,
      buyTotalPrice: 200,
    });

    expect(next.nextHoldings).toBe(3);
    expect(next.nextAvgBuyPrice).toBeCloseTo(133.3333, 4);
  });

  it('recalculates holdings after sell transaction', () => {
    const next = recalculateAfterSell({
      currentHoldings: 5,
      sellQuantity: 2,
      currentAvgBuyPrice: 120,
    });

    expect(next.nextHoldings).toBe(3);
    expect(next.nextAvgBuyPrice).toBe(120);
  });

  it('throws on sell quantity greater than holdings', () => {
    expect(() =>
      recalculateAfterSell({
        currentHoldings: 2,
        sellQuantity: 3,
        currentAvgBuyPrice: 100,
      })
    ).toThrow('INSUFFICIENT_HOLDINGS');
  });

  it('compares two portfolio snapshots', () => {
    const result = comparePortfolioSnapshots(
      {
        user: { id: 'u1', name: 'A', image: null },
        items: [{ currentPrice: 100, avgBuyPrice: 50, holdings: 2 }],
      },
      {
        user: { id: 'u2', name: 'B', image: null },
        items: [{ currentPrice: 90, avgBuyPrice: 90, holdings: 1 }],
      }
    );

    expect(result.leftTotals.totalValue).toBe(200);
    expect(result.rightTotals.totalValue).toBe(90);
    expect(result.comparison.valueDelta).toBe(110);
    expect(result.comparison.itemsDelta).toBe(0);
  });
});
