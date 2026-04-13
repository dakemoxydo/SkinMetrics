'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Header from '@/components/layout/Header';
import { CategoryDistribution } from '@/components/analytics/CategoryDistribution';
import { TopPerformers } from '@/components/analytics/TopPerformers';
import { PortfolioStats } from '@/components/analytics/PortfolioStats';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Аналитика</h1>
          <p className="text-slate-400 mt-1">Детальная статистика и анализ вашего портфеля</p>
        </div>

        {/* График */}
        <div className="mb-8">
          <PortfolioChart />
        </div>

        {/* Статистика и распределение */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <PortfolioStats />
          <CategoryDistribution />
        </div>

        {/* Топ performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TopPerformers />
        </div>
      </main>
    </div>
  );
}
