'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePortfolioStore } from '@/store/portfolioStore';
import { formatCurrency, formatPercent, getChangeColor, calculateItemROI, calculateItemProfit } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

export function TopPerformers() {
  const { items, currency } = usePortfolioStore();

  const topItems = useMemo(() => {
    return items
      .map((item) => ({
        ...item,
        profit: calculateItemProfit(item.currentPrice, item.avgBuyPrice, item.holdings),
        roi: calculateItemROI(item.currentPrice, item.avgBuyPrice),
      }))
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5);
  }, [items]);

  return (
    <Card glass>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Топ-5 по доходности
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/20 hover:bg-slate-700/40 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold text-sm">
                {index + 1}
              </div>
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-100 truncate">{item.name}</p>
                <p className="text-xs text-slate-400">{item.holdings} шт.</p>
              </div>
              <div className="text-right">
                <Badge variant={item.roi >= 0 ? 'success' : 'danger'}>
                  {formatPercent(item.roi)}
                </Badge>
                <p className={`text-xs font-mono mt-1 ${getChangeColor(item.profit)}`}>
                  {formatCurrency(item.profit, currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
