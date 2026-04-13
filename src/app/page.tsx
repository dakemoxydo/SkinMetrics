'use client';

export const dynamic = 'force-dynamic';

import Header from '@/components/layout/Header';
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { BestWorstItems } from '@/components/dashboard/BestWorstItems';
import { ItemsTable } from '@/components/items/ItemsTable';
import { AddItemModal } from '@/components/items/AddItemModal';
import { useState } from 'react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Дашборд</h1>
            <p className="text-slate-400 mt-1">Обзор вашего инвестиционного портфеля</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Добавить предмет
          </Button>
        </div>

        {/* Основная статистика */}
        <div className="mb-8">
          <PortfolioOverview />
        </div>

        {/* Лучший и худший предметы */}
        <div className="mb-8">
          <BestWorstItems />
        </div>

        {/* График */}
        <div className="mb-8">
          <PortfolioChart />
        </div>

        {/* Таблица предметов */}
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
