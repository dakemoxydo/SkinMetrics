'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { usePortfolioStore } from '@/store/portfolioStore';
import { CATEGORY_NAMES, CATEGORY_ICONS } from '@/lib/types';
import { ItemCategory } from '@/lib/types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function CategoryDistribution() {
  const { items } = usePortfolioStore();

  // Группировка по категориям
  const categoryData = items.reduce<Record<string, { name: string; value: number; icon: string }>>(
    (acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = {
          name: CATEGORY_NAMES[category as ItemCategory],
          value: 0,
          icon: CATEGORY_ICONS[category as ItemCategory],
        };
      }
      acc[category].value += item.currentPrice * item.holdings;
      return acc;
    },
    {}
  );

  const data = Object.values(categoryData).sort((a, b) => b.value - a.value);

  return (
    <Card glass>
      <CardHeader>
        <CardTitle>Распределение по категориям</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: unknown) => {
                  if (typeof value === 'number') {
                    return new Intl.NumberFormat('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(value);
                  }
                  return String(value);
                }}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Легенда */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((category, index) => (
            <div key={category.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-slate-300">
                {category.icon} {category.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
