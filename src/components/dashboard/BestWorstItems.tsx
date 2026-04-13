'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePortfolioStore } from '@/store/portfolioStore';
import { calculatePortfolioStats, formatCurrency, formatPercent, getChangeColor } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMemo } from 'react';

export function BestWorstItems() {
  const { items, currency } = usePortfolioStore();
  
  const stats = useMemo(() => calculatePortfolioStats(items), [items]);

  if (!stats.bestItem || !stats.worstItem) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Лучший предмет */}
      <Card hover glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Лучший предмет
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stats.bestItem.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-100 truncate">{stats.bestItem.name}</p>
                <p className="text-sm text-slate-400">{stats.bestItem.holdings} шт.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-400">Прибыль</p>
                <p className={`font-mono font-semibold ${getChangeColor(stats.bestItem.profit)}`}>
                  {formatCurrency(stats.bestItem.profit, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">ROI</p>
                <Badge variant="success">{formatPercent(stats.bestItem.roi)}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Худший предмет */}
      <Card hover glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            Худший предмет
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stats.worstItem.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-100 truncate">{stats.worstItem.name}</p>
                <p className="text-sm text-slate-400">{stats.worstItem.holdings} шт.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-400">Прибыль</p>
                <p className={`font-mono font-semibold ${getChangeColor(stats.worstItem.profit)}`}>
                  {formatCurrency(stats.worstItem.profit, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">ROI</p>
                <Badge variant={stats.worstItem.roi >= 0 ? 'success' : 'danger'}>
                  {formatPercent(stats.worstItem.roi)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
