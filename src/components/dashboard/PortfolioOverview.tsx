'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils';
import { calculatePortfolioStats } from '@/lib/utils';
import { usePortfolioStore } from '@/store/portfolioStore';
import { TrendingUp, TrendingDown, Package, DollarSign, Percent } from 'lucide-react';
import { useMemo } from 'react';

export function PortfolioOverview() {
  const { items, currency } = usePortfolioStore();
  
  const stats = useMemo(() => calculatePortfolioStats(items), [items]);

  const statCards = [
    {
      title: 'Общая стоимость',
      value: formatCurrency(stats.totalValue, currency),
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      title: 'Инвестировано',
      value: formatCurrency(stats.totalInvested, currency),
      icon: Package,
      color: 'text-slate-400',
      bgColor: 'bg-slate-400/10',
    },
    {
      title: 'Прибыль/Убыток',
      value: formatCurrency(stats.totalProfit, currency),
      change: formatPercent(stats.totalROI),
      icon: stats.totalProfit >= 0 ? TrendingUp : TrendingDown,
      color: stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400',
      bgColor: stats.totalProfit >= 0 ? 'bg-emerald-400/10' : 'bg-red-400/10',
    },
    {
      title: 'ROI',
      value: formatPercent(stats.totalROI),
      icon: Percent,
      color: stats.totalROI >= 0 ? 'text-emerald-400' : 'text-red-400',
      bgColor: stats.totalROI >= 0 ? 'bg-emerald-400/10' : 'bg-red-400/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} hover glass>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-100 font-mono">{card.value}</p>
                  {card.change && (
                    <p className={`text-sm mt-1 ${getChangeColor(stats.totalROI)}`}>
                      {card.change}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
