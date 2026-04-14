'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils';
import {
  CATEGORY_NAMES,
  CATEGORY_ICONS,
  ItemCategory,
  SortDirection,
} from '@/lib/types';
import { calculateItemProfit, calculateItemROI } from '@/lib/utils';
import {
  Search,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Trash2,
  Edit,
} from 'lucide-react';
import { Pagination, usePagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/Skeleton';

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

function getSortIcon(activeKey: string, direction: SortDirection, columnKey: string) {
  if (activeKey !== columnKey) {
    return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5" />;
  }

  return direction === 'asc' ? (
    <ArrowUp className="ml-1 inline h-3.5 w-3.5" />
  ) : (
    <ArrowDown className="ml-1 inline h-3.5 w-3.5" />
  );
}

export function ItemsTable({ onAddItem, onEditItem }: ItemsTableProps) {
  const { getFilteredItems, filters, setFilters, deleteItem, refreshPrices, currency, isLoading } =
    usePortfolioStore();
  const toast = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredItems = getFilteredItems();
  const {
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage,
    setPageSize,
    paginatedItems,
    resetPage,
  } = usePagination(filteredItems.length, 10);

  useEffect(() => {
    resetPage();
  }, [filters.search, filters.category, filters.sort.key, filters.sort.direction, resetPage]);

  const paginatedItemsList = paginatedItems(filteredItems);

  const handleSort = (key: string) => {
    const currentDirection = filters.sort.key === key ? filters.sort.direction : 'asc';
    const newDirection: SortDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    setFilters({ sort: { key, direction: newDirection } });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Удалить "${name}" из портфеля?`)) {
      return;
    }

    try {
      await deleteItem(id);
      toast.success(`"${name}" удален из портфеля`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось удалить предмет';
      toast.error(message);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPrices();
      toast.info('Цены обновлены');
    } catch {
      toast.error('Не удалось обновить цены');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card glass>
      <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <CardTitle>Предметы в портфеле</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Обновить цены
          </Button>
          <Button size="sm" onClick={onAddItem} icon={<Plus className="h-4 w-4" />}>
            Добавить предмет
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Поиск по названию..."
              value={filters.search}
              onChange={(event) => setFilters({ search: event.target.value })}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select
            options={categoryOptions}
            value={filters.category}
            onChange={(event) => setFilters({ category: event.target.value as ItemCategory })}
            className="sm:w-48"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th
                  className="cursor-pointer px-2 py-3 text-left font-medium text-slate-400 hover:text-slate-200"
                  onClick={() => handleSort('name')}
                >
                  Предмет {getSortIcon(filters.sort.key, filters.sort.direction, 'name')}
                </th>
                <th
                  className="cursor-pointer px-2 py-3 text-right font-medium text-slate-400 hover:text-slate-200"
                  onClick={() => handleSort('currentPrice')}
                >
                  Цена {getSortIcon(filters.sort.key, filters.sort.direction, 'currentPrice')}
                </th>
                <th
                  className="cursor-pointer px-2 py-3 text-center font-medium text-slate-400 hover:text-slate-200"
                  onClick={() => handleSort('holdings')}
                >
                  Кол-во {getSortIcon(filters.sort.key, filters.sort.direction, 'holdings')}
                </th>
                <th
                  className="cursor-pointer px-2 py-3 text-right font-medium text-slate-400 hover:text-slate-200"
                  onClick={() => handleSort('value')}
                >
                  Стоимость {getSortIcon(filters.sort.key, filters.sort.direction, 'value')}
                </th>
                <th
                  className="hidden cursor-pointer px-2 py-3 text-right font-medium text-slate-400 hover:text-slate-200 lg:table-cell"
                  onClick={() => handleSort('roi')}
                >
                  ROI {getSortIcon(filters.sort.key, filters.sort.direction, 'roi')}
                </th>
                <th
                  className="hidden cursor-pointer px-2 py-3 text-right font-medium text-slate-400 hover:text-slate-200 xl:table-cell"
                  onClick={() => handleSort('profit')}
                >
                  P/L {getSortIcon(filters.sort.key, filters.sort.direction, 'profit')}
                </th>
                <th className="px-2 py-3 text-center font-medium text-slate-400">Действия</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItemsList.map((item) => {
                const value = item.currentPrice * item.holdings;
                const profit = calculateItemProfit(item.currentPrice, item.avgBuyPrice, item.holdings);
                const roi = calculateItemROI(item.currentPrice, item.avgBuyPrice);

                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-700/30 transition-colors hover:bg-slate-700/20"
                  >
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="min-w-0">
                          <p className="max-w-[200px] truncate font-medium text-slate-100">
                            {item.name}
                          </p>
                          <Badge variant="info" size="sm" className="mt-1">
                            {CATEGORY_ICONS[item.category]} {CATEGORY_NAMES[item.category]}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <p className="font-mono text-slate-100">
                        {formatCurrency(item.currentPrice, currency)}
                      </p>
                      <p className={`text-xs font-mono ${getChangeColor(item.priceChange24h)}`}>
                        {formatPercent(item.priceChange24h)}
                      </p>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <span className="font-mono text-slate-100">{item.holdings}</span>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <p className="font-mono font-medium text-slate-100">
                        {formatCurrency(value, currency)}
                      </p>
                    </td>
                    <td className="hidden px-2 py-3 text-right lg:table-cell">
                      <Badge variant={roi >= 0 ? 'success' : 'danger'}>{formatPercent(roi)}</Badge>
                    </td>
                    <td className="hidden px-2 py-3 text-right xl:table-cell">
                      <p className={`font-mono font-medium ${getChangeColor(profit)}`}>
                        {formatCurrency(profit, currency)}
                      </p>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onEditItem(item.id)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleDelete(item.id, item.name)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {isLoading || isRefreshing ? (
            <div className="py-8">
              <TableSkeleton rows={Math.min(pageSize, 5)} />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-lg">Предметы не найдены</p>
              <p className="mt-1 text-sm">Добавьте первый предмет в портфель</p>
            </div>
          ) : (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredItems.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
