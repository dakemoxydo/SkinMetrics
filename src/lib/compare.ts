import { PortfolioTotalsInput, calculatePortfolioTotals } from '@/lib/portfolioMath';

export interface CompareSnapshotInput {
  user: { id: string; name: string | null; image: string | null };
  items: PortfolioTotalsInput[];
}

export function comparePortfolioSnapshots(left: CompareSnapshotInput, right: CompareSnapshotInput) {
  const leftTotals = calculatePortfolioTotals(left.items);
  const rightTotals = calculatePortfolioTotals(right.items);

  return {
    leftTotals,
    rightTotals,
    comparison: {
      valueDelta: leftTotals.totalValue - rightTotals.totalValue,
      profitDelta: leftTotals.profit - rightTotals.profit,
      roiDelta: leftTotals.profitPercent - rightTotals.profitPercent,
      itemsDelta: leftTotals.itemsCount - rightTotals.itemsCount,
    },
  };
}
