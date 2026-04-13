'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Header from '@/components/layout/Header';
import { ItemsTable } from '@/components/items/ItemsTable';
import { AddItemModal } from '@/components/items/AddItemModal';
import { usePortfolioStore } from '@/store/portfolioStore';
import { calculatePortfolioStats, formatCurrency, formatPercent } from '@/lib/utils';
import { Package, TrendingUp } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function PortfolioPage() {
  const { items, currency } = usePortfolioStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const stats = useMemo(() => calculatePortfolioStats(items), [items]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Портфель</h1>
            <p className="text-slate-400 mt-1">Управление вашими предметами CS2</p>
          </div>
        </div>

        {/* Быстрая статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-400/10">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Предметов</p>
              <p className="text-xl font-bold text-slate-100">{stats.itemsCount}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-400/10">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Прибыль</p>
              <p className="text-xl font-bold text-emerald-400">
                {formatCurrency(stats.totalProfit, currency)}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stats.totalROI >= 0 ? 'bg-emerald-400/10' : 'bg-red-400/10'}`}>
              <TrendingUp className={`w-5 h-5 ${stats.totalROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
            <div>
              <p className="text-sm text-slate-400">ROI</p>
              <p className={`text-xl font-bold ${stats.totalROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatPercent(stats.totalROI)}
              </p>
            </div>
          </div>
        </div>

        {/* Таблица */}
        <ItemsTable
          onAddItem={() => setIsAddModalOpen(true)}
          onEditItem={() => setIsAddModalOpen(true)}
        />
      </main>

      {/* Модальное окно */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
