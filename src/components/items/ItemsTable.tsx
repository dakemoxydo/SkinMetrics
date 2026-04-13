'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useToast } from '@/components/ui/Toast';
import {
  formatCurrency,
  formatPercent,
  getChangeColor,
  getChangeBg,
} from '@/lib/utils';
import { CATEGORY_NAMES, CATEGORY_ICONS } from '@/lib/types';
import { calculateItemProfit, calculateItemROI } from '@/lib/utils';
import { ItemCategory, SortDirection } from '@/lib/types';
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';

const categoryOptions = [
  { value: 'all', label: 'Все категории' },
  { value: 'knife', label: 'Ножи' },
  { value: 'case', label: 'Кейсы' },
  { value: 'skin', label: 'Скины' },
  { value: 'sticker', label: 'Стикеры' },
  { value: 'charm', label: 'Шармы' },
  { value: 'gloves', label: 'Перчатки' },
  { value: 'weapon', label: 'Оружие' },
  { value: 'other', label: 'Другое' },
];

interface ItemsTableProps {
  onAddItem: () => void;
  onEditItem: (id: string) => void;
}

export function ItemsTable({ onAddItem, onEditItem }: ItemsTableProps) {
  const { getFilteredItems, filters, setFilters, deleteItem, refreshPrices, currency } = usePortfolioStore();
  const toast = useToast();

  const handleSort = (key: string) => {
    const currentDirection = filters.sort.key === key ? filters.sort.direction : 'asc';
    const newDirection: SortDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    setFilters({ sort: { key, direction: newDirection } });
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (filters.sort.key !== columnKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 inline ml-1" />;
    }
    return filters.sort.direction === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 inline ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 inline ml-1" />
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Удалить "${name}" из портфеля?`)) {
      deleteItem(id);
      toast.success(`"${name}" удален из портфеля`);
    }
  };

  const handleRefresh = () => {
    refreshPrices();
    toast.info('Цены обновлены');
  };

  return (
    <Card glass>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>Предметы в портфеле</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} icon={<RefreshCw className="w-4 h-4" />}>
            Обновить цены
          </Button>
          <Button size="sm" onClick={onAddItem} icon={<Plus className="w-4 h-4" />}>
            Добавить предмет
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Фильтры */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Поиск по названию..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            options={categoryOptions}
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value as ItemCategory })}
            className="sm:w-48"
          />
        </div>

        {/* Таблица */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th
                  className="text-left py-3 px-2 text-slate-400 font-medium cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('name')}
                >
                  Предмет <SortIcon columnKey="name" />
                </th>
                <th
                  className="text-right py-3 px-2 text-slate-400 font-medium cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('currentPrice')}
                >
                  Цена <SortIcon columnKey="currentPrice" />
                </th>
                <th
                  className="text-center py-3 px-2 text-slate-400 font-medium cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('holdings')}
                >
                  Кол-во <SortIcon columnKey="holdings" />
                </th>
                <th
                  className="text-right py-3 px-2 text-slate-400 font-medium cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('value')}
                >
                  Стоимость <SortIcon columnKey="value" />
                </th>
                <th
                  className="text-right py-3 px-2 text-slate-400 font-medium cursor-pointer hover:text-slate-200 hidden lg:table-cell"
                  onClick={() => handleSort('roi')}
                >
                  ROI <SortIcon columnKey="roi" />
                </th>
                <th
                  className="text-right py-3 px-2 text-slate-400 font-medium cursor-pointer hover:text-slate-200 hidden xl:table-cell"
                  onClick={() => handleSort('profit')}
                >
                  P/L <SortIcon columnKey="profit" />
                </th>
                <th className="text-center py-3 px-2 text-slate-400 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredItems().map((item) => {
                const value = item.currentPrice * item.holdings;
                const profit = calculateItemProfit(item.currentPrice, item.avgBuyPrice, item.holdings);
                const roi = calculateItemROI(item.currentPrice, item.avgBuyPrice);

                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-100 truncate max-w-[200px]">{item.name}</p>
                          <Badge variant="info" size="sm" className="mt-1">
                            {CATEGORY_ICONS[item.category]} {CATEGORY_NAMES[item.category]}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2">
                      <p className="font-mono text-slate-100">{formatCurrency(item.currentPrice, currency)}</p>
                      <p className={`text-xs font-mono ${getChangeColor(item.priceChange24h)}`}>
                        {formatPercent(item.priceChange24h)}
                      </p>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="font-mono text-slate-100">{item.holdings}</span>
                    </td>
                    <td className="text-right py-3 px-2">
                      <p className="font-mono font-medium text-slate-100">{formatCurrency(value, currency)}</p>
                    </td>
                    <td className="text-right py-3 px-2 hidden lg:table-cell">
                      <Badge variant={roi >= 0 ? 'success' : 'danger'}>
                        {formatPercent(roi)}
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-2 hidden xl:table-cell">
                      <p className={`font-mono font-medium ${getChangeColor(profit)}`}>
                        {formatCurrency(profit, currency)}
                      </p>
                    </td>
                    <td className="text-center py-3 px-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditItem(item.id)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.name)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {getFilteredItems().length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg">Предметы не найдены</p>
              <p className="text-sm mt-1">Добавьте первый предмет в портфель</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
