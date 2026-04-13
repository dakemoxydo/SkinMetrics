'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LayoutDashboard, PieChart, List, RefreshCw, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useToast } from '@/components/ui/Toast';
import { useState } from 'react';
import { exportToCSV, importFromJSON } from '@/lib/importExport';

const navItems = [
  { href: '/', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/portfolio', label: 'Портфель', icon: List },
  { href: '/analytics', label: 'Аналитика', icon: PieChart },
];

export default function Header() {
  const pathname = usePathname();
  const { refreshPrices, items } = usePortfolioStore();
  const toast = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Симуляция загрузки
    await new Promise((resolve) => setTimeout(resolve, 1000));
    refreshPrices();
    toast.success('Цены обновлены');
    setIsRefreshing(false);
  };

  const handleExport = () => {
    exportToCSV(items);
    toast.success('Данные экспортированы в CSV');
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await importFromJSON(file);
          toast.success('Портфель импортирован из JSON');
        } catch {
          toast.error('Ошибка импорта');
        }
      }
    };
    input.click();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <span className="text-lg font-semibold text-slate-100 hidden sm:inline">
              SkinMetrics
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              loading={isRefreshing}
            >
              {isRefreshing ? null : <RefreshCw className="w-4 h-4" />}
              <span className="hidden sm:inline">Обновить</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Экспорт</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleImport}>
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Импорт</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
