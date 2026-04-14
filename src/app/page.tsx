'use client';

import Header from '@/components/layout/Header';
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { BestWorstItems } from '@/components/dashboard/BestWorstItems';
import { ItemsTable } from '@/components/items/ItemsTable';
import { AddItemModal } from '@/components/items/AddItemModal';
import { useMemo, useState } from 'react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { Plus, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type WidgetId = 'overview' | 'chart' | 'bestWorst' | 'table';

interface WidgetConfig {
  id: WidgetId;
  title: string;
  visible: boolean;
}

const defaultWidgets: WidgetConfig[] = [
  { id: 'overview', title: 'Обзор портфеля', visible: true },
  { id: 'bestWorst', title: 'Лучшие/Худшие', visible: true },
  { id: 'chart', title: 'График', visible: true },
  { id: 'table', title: 'Таблица предметов', visible: true },
];

function getInitialWidgets(): WidgetConfig[] {
  if (typeof window === 'undefined') {
    return defaultWidgets;
  }

  const saved = localStorage.getItem('dashboard-widgets');
  if (!saved) {
    return defaultWidgets;
  }

  try {
    return JSON.parse(saved) as WidgetConfig[];
  } catch {
    return defaultWidgets;
  }
}

export default function HomePage() {
  const { items } = usePortfolioStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(getInitialWidgets);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const editingItem = useMemo(
    () => items.find((item) => item.id === editingItemId) ?? null,
    [editingItemId, items]
  );

  const persistWidgets = (nextWidgets: WidgetConfig[]) => {
    setWidgets(nextWidgets);
    localStorage.setItem('dashboard-widgets', JSON.stringify(nextWidgets));
  };

  const toggleWidget = (id: WidgetId) => {
    persistWidgets(
      widgets.map((widget) =>
        widget.id === id ? { ...widget, visible: !widget.visible } : widget
      )
    );
  };

  const resetWidgets = () => {
    persistWidgets(defaultWidgets);
  };

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

  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case 'overview':
        return <PortfolioOverview />;
      case 'bestWorst':
        return <BestWorstItems />;
      case 'chart':
        return <PortfolioChart />;
      case 'table':
        return <ItemsTable onAddItem={openAddModal} onEditItem={openEditModal} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Дашборд</h1>
            <p className="text-slate-400 mt-1">Обзор вашего инвестиционного портфеля</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCustomizing((prev) => !prev)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Customize Dashboard"
            >
              <GripVertical className="w-5 h-5" />
            </button>
            <Button onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
              Добавить предмет
            </Button>
          </div>
        </div>

        {isCustomizing && (
          <div className="mb-6 p-4 bg-slate-800/70 rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-slate-100">Customize Widgets</h3>
              <button
                onClick={resetWidgets}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Reset to Default
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {widgets.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => toggleWidget(widget.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                    widget.visible
                      ? 'bg-indigo-600/20 border border-indigo-600/50'
                      : 'bg-slate-700/50 border border-slate-600/50 opacity-60'
                  }`}
                >
                  {widget.visible ? (
                    <Eye className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-sm text-slate-100">{widget.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {widgets.filter((widget) => widget.visible).map((widget) => (
            <div key={widget.id} className="relative">
              {renderWidget(widget.id)}
            </div>
          ))}
        </div>
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
