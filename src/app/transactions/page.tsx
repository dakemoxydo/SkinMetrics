'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Plus, X } from 'lucide-react';
import * as api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

// PortfolioItem тип из store
interface PortfolioItem {
  id: string;
  name: string;
  image?: string;
  icon?: string;
  category: string;
  holdings: number;
  avgBuyPrice: number;
  currentPrice: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<api.Transaction[]>([]);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const toast = useToast();

  const loadData = useCallback(async () => {
    try {
      const [txns, portfolioItems] = await Promise.all([
        api.fetchTransactions(),
        api.fetchPortfolioItems(),
      ]);
      setTransactions(txns);
      setItems(portfolioItems);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const stats = React.useMemo(() => {
    const buys = transactions.filter(t => t.type === 'buy');
    const sells = transactions.filter(t => t.type === 'sell');
    
    return {
      totalBuys: buys.length,
      totalSells: sells.length,
      totalSpent: buys.reduce((sum, t) => sum + t.totalPrice, 0),
      totalEarned: sells.reduce((sum, t) => sum + t.totalPrice, 0),
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Transaction History</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500
            text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-400">Total Buys</p>
          <p className="text-2xl font-bold text-slate-100">{stats.totalBuys}</p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-400">Total Sells</p>
          <p className="text-2xl font-bold text-slate-100">{stats.totalSells}</p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-400">Total Spent</p>
          <p className="text-2xl font-bold text-red-400">
            {stats.totalSpent.toLocaleString()}₽
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-400">Total Earned</p>
          <p className="text-2xl font-bold text-green-400">
            {stats.totalEarned.toLocaleString()}₽
          </p>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p>No transactions yet. Add your first buy/sell!</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Item</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {new Date(tx.transactionDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      tx.type === 'buy'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {tx.type === 'buy' ? (
                        <ArrowDownCircle className="w-3 h-3" />
                      ) : (
                        <ArrowUpCircle className="w-3 h-3" />
                      )}
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-100">
                    {tx.portfolioItem?.name || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300 text-right">
                    {tx.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300 text-right">
                    {tx.price.toLocaleString()}₽
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-100 text-right">
                    {tx.totalPrice.toLocaleString()}₽
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddTransactionModal
          items={items}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            loadData();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddTransactionModal({
  items,
  onClose,
  onSuccess,
}: {
  items: PortfolioItem[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [portfolioItemId, setPortfolioItemId] = useState('');
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number | undefined>();
  const [fee, setFee] = useState(0);
  const [notes, setNotes] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) return;
    
    setSubmitting(true);

    try {
      await api.createTransaction({
        portfolioItemId: portfolioItemId || undefined,
        type,
        quantity,
        price,
        totalPrice: quantity * price,
        fee,
        notes,
        transactionDate,
      });
      toast.success('Transaction added');
      onSuccess();
    } catch {
      toast.error('Failed to add transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPrice = (quantity * (price || 0)).toLocaleString();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100">Add Transaction</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Item (optional)
            </label>
            <select
              value={portfolioItemId}
              onChange={(e) => setPortfolioItemId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- No Item --</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'buy' | 'sell')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                  text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                  text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                min="1"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                  text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Price per Item (₽)
              </label>
              <input
                type="number"
                value={price || ''}
                onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                  text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Fee (optional)
            </label>
            <input
              type="number"
              value={fee || ''}
              onChange={(e) => setFee(e.target.value ? parseFloat(e.target.value) : 0)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={2}
            />
          </div>

          <div className="p-3 bg-slate-700/50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total:</span>
              <span className="text-slate-100 font-bold">{totalPrice}₽</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg
                text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !price}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600
                text-white rounded-lg transition-colors"
            >
              {submitting ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
