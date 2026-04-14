'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Lock } from 'lucide-react';
import { useParams } from 'next/navigation';

interface SharedPortfolio {
  title: string;
  ownerName: string;
  ownerImage?: string;
  stats: {
    totalValue: number;
    totalInvested: number;
    profit: number;
    profitPercent: number;
    itemsCount: number;
  };
  items: Array<{
    id: string;
    name: string;
    image: string;
    icon?: string;
    category: string;
    holdings: number;
    avgBuyPrice: number;
    currentPrice: number;
    priceChangePercent: number;
  }>;
}

export default function SharedPortfolioPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  const [portfolio, setPortfolio] = useState<SharedPortfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const res = await fetch(`/api/portfolio/shares/${shareId}`);
        if (!res.ok) throw new Error('Failed to load portfolio');
        const json = await res.json();
        setPortfolio(json.data);
      } catch (error) {
        console.error('Failed to load shared portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [shareId]);

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading...</div>;
  }

  if (!portfolio) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>This portfolio is private or no longer available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Share2 className="w-8 h-8 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              {portfolio.title || 'Shared Portfolio'}
            </h1>
            <p className="text-slate-400">
              by {portfolio.ownerName || 'Anonymous'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-400">Total Value</p>
          <p className="text-2xl font-bold text-slate-100">
            {portfolio.stats.totalValue.toLocaleString()}₽
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-400">Invested</p>
          <p className="text-2xl font-bold text-slate-100">
            {portfolio.stats.totalInvested.toLocaleString()}₽
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-400">Profit</p>
          <p className={`text-2xl font-bold ${
            portfolio.stats.profit >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {portfolio.stats.profit >= 0 ? '+' : ''}{portfolio.stats.profit.toLocaleString()}₽
            <span className="text-sm ml-1">
              ({portfolio.stats.profitPercent >= 0 ? '+' : ''}{portfolio.stats.profitPercent.toFixed(1)}%)
            </span>
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-400">Items</p>
          <p className="text-2xl font-bold text-slate-100">
            {portfolio.stats.itemsCount}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700/50 border-b border-slate-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Item</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Buy Price</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Current</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Change</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {portfolio.items.map(item => (
              <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.icon && <span className="text-xl">{item.icon}</span>}
                    <div>
                      <p className="text-sm font-medium text-slate-100">{item.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{item.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300 text-right">
                  {item.holdings}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300 text-right">
                  {item.avgBuyPrice.toLocaleString()}₽
                </td>
                <td className="px-4 py-3 text-sm text-slate-300 text-right">
                  {item.currentPrice.toLocaleString()}₽
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-sm font-medium ${
                    item.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {item.priceChangePercent >= 0 ? '+' : ''}{item.priceChangePercent.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-100 text-right">
                  {(item.currentPrice * item.holdings).toLocaleString()}₽
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
