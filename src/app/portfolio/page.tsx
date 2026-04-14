'use client';

import Header from '@/components/layout/Header';
import { ItemsTable } from '@/components/items/ItemsTable';
import { AddItemModal } from '@/components/items/AddItemModal';
import { usePortfolioStore } from '@/store/portfolioStore';
import { calculatePortfolioStats, formatCurrency, formatPercent } from '@/lib/utils';
import { Package, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function PortfolioPage() {
  const { items, currency } = usePortfolioStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const stats = useMemo(() => calculatePortfolioStats(items), [items]);
  const editingItem = useMemo(
    () => items.find((item) => item.id === editingItemId) ?? null,
    [editingItemId, items]
  );

  const openAddModal = () => {
    setEditingItemId(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (id: string) => {
    setEditingItemId(id);
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingItemId(null);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Портфель</h1>
            <p className="mt-1 text-slate-400">Управление вашими предметами в SkinMetrics</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <div className="rounded-lg bg-blue-400/10 p-3">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Предметов</p>
              <p className="text-xl font-bold text-slate-100">{stats.itemsCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <div className="rounded-lg bg-emerald-400/10 p-3">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Прибыль</p>
              <p className="text-xl font-bold text-emerald-400">
                {formatCurrency(stats.totalProfit, currency)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
            <div
              className={`rounded-lg p-3 ${
                stats.totalROI >= 0 ? 'bg-emerald-400/10' : 'bg-red-400/10'
              }`}
            >
              <TrendingUp
                className={`h-5 w-5 ${
                  stats.totalROI >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-slate-400">ROI</p>
              <p
                className={`text-xl font-bold ${
                  stats.totalROI >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {formatPercent(stats.totalROI)}
              </p>
            </div>
          </div>
        </div>

        <ItemsTable onAddItem={openAddModal} onEditItem={openEditModal} />
      </main>

      <AddItemModal
        key={`${editingItem?.id ?? 'new'}-${isAddModalOpen ? 'open' : 'closed'}`}
        isOpen={isAddModalOpen}
        onClose={closeModal}
        editItem={editingItem}
      />
    </div>
  );
}
