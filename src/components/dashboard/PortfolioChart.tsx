'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { usePortfolioStore } from '@/store/portfolioStore';
import { generateChartData, formatChartDate } from '@/lib/utils';
import { ChartPeriod } from '@/lib/types';
import { calculateTotalValue, calculateTotalInvested } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const periods: { key: ChartPeriod; label: string }[] = [
  { key: '24H', label: '24H' },
  { key: '7D', label: '7D' },
  { key: '30D', label: '30D' },
  { key: '90D', label: '90D' },
  { key: '6M', label: '6M' },
  { key: '1Y', label: '1Y' },
  { key: 'ALL', label: 'ALL' },
];

export function PortfolioChart() {
  const { items, chartPeriod, setChartPeriod } = usePortfolioStore();

  const totalInvested = calculateTotalInvested(items);
  const chartData = generateChartData(items, chartPeriod, totalInvested);

  return (
    <Card glass>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>История портфеля</CardTitle>
        <div className="flex gap-1">
          {periods.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setChartPeriod(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                chartPeriod === key
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCurrentValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartDate}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: unknown, name: unknown) => {
                  const numValue = typeof value === 'number' ? value : 0;
                  const formatted = new Intl.NumberFormat('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(numValue);
                  const label = name === 'currentValue' ? 'Текущая стоимость' : 'Инвестировано';
                  return [formatted, label];
                }}
                labelFormatter={(label) => formatChartDate(label)}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                }}
              />
              <Legend
                formatter={(value: string) =>
                  value === 'currentValue' ? 'Текущая стоимость' : 'Инвестировано'
                }
              />
              <Area
                type="monotone"
                dataKey="currentValue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorCurrentValue)"
                name="currentValue"
              />
              <Area
                type="monotone"
                dataKey="investedValue"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorInvested)"
                name="investedValue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
