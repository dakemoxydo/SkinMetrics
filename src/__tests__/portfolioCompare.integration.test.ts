import { comparePortfolioSnapshots } from '@/lib/compare';

describe('portfolio compare integration', () => {
  it('returns deltas between two snapshots', () => {
    const result = comparePortfolioSnapshots(
      {
        user: { id: 'left', name: 'Left', image: null },
        items: [
          { currentPrice: 120, avgBuyPrice: 100, holdings: 2 },
          { currentPrice: 80, avgBuyPrice: 90, holdings: 1 },
        ],
      },
      {
        user: { id: 'right', name: 'Right', image: null },
        items: [{ currentPrice: 100, avgBuyPrice: 100, holdings: 1 }],
      }
    );

    expect(result.leftTotals.totalValue).toBe(320);
    expect(result.rightTotals.totalValue).toBe(100);
    expect(result.comparison.valueDelta).toBe(220);
    expect(result.comparison.profitDelta).toBe(30);
  });
});
