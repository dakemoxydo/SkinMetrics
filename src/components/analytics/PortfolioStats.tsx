'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { usePortfolioStore } from '@/store/portfolioStore';
import { formatCurrency, formatPercent, calculatePortfolioStats } from '@/lib/utils';
import { DollarSign, TrendingUp, Package } from 'lucide-react';
import { useMemo } from 'react';

export function PortfolioStats() {
  const { items, currency } = usePortfolioStore();

  const stats = useMemo(() => calculatePortfolioStats(items), [items]);

  const statItems = [
    {
      title: 'Всего инвестировано',
      value: formatCurrency(stats.totalInvested, currency),
      icon: Package,
      color: 'text-slate-400',
    },
    {
      title: 'Текущая стоимость',
      value: formatCurrency(stats.totalValue, currency),
      icon: DollarSign,
      color: 'text-blue-400',
    },
    {
      title: 'Общая прибыль',
      value: formatCurrency(stats.totalProfit, currency),
      icon: TrendingUp,
      color: stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      title: 'Предметов в портфеле',
      value: stats.itemsCount.toString(),
      icon: Package,
      color: 'text-slate-400',
    },
  ];

  return (
    <Card glass>
      <CardHeader>
        <CardTitle>Общая статистика</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statItems.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-slate-700/50`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-sm text-slate-400">{stat.title}</p>
                </div>
                <p className="font-mono font-semibold text-slate-100">{stat.value}</p>
              </div>
            );
          })}
          
          {/* ROI выделен */}
          <div className="pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-slate-200">Общий ROI</p>
              <p className={`text-2xl font-bold ${stats.totalROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatPercent(stats.totalROI)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
