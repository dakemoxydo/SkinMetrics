'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';

interface CompareResponse {
  left: {
    user: { id: string; name: string | null; image: string | null };
    totals: {
      totalValue: number;
      totalInvested: number;
      profit: number;
      profitPercent: number;
      itemsCount: number;
    };
  };
  right: {
    user: { id: string; name: string | null; image: string | null };
    totals: {
      totalValue: number;
      totalInvested: number;
      profit: number;
      profitPercent: number;
      itemsCount: number;
    };
  };
  comparison: {
    valueDelta: number;
    profitDelta: number;
    roiDelta: number;
    itemsDelta: number;
  };
}

export default function ComparePage() {
  const [leftUserId, setLeftUserId] = useState('');
  const [rightUserId, setRightUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CompareResponse | null>(null);

  const handleCompare = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(
        `/api/portfolio/compare?leftUserId=${encodeURIComponent(leftUserId)}&rightUserId=${encodeURIComponent(rightUserId)}`
      );
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to compare portfolios');
      }

      setResult(json.data as CompareResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare portfolios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Compare Portfolios</h1>
          <p className="text-slate-400 mt-1">
            Compare two public profiles by user ID.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Left user ID</label>
            <input
              value={leftUserId}
              onChange={(event) => setLeftUserId(event.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
              placeholder="cuid..."
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Right user ID</label>
            <input
              value={rightUserId}
              onChange={(event) => setRightUserId(event.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
              placeholder="cuid..."
            />
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={loading || !leftUserId || !rightUserId}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white"
        >
          {loading ? 'Comparing...' : 'Compare'}
        </button>

        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-red-300">
            {error}
          </div>
        )}

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PortfolioCard title={result.left.user.name || result.left.user.id} totals={result.left.totals} />
            <PortfolioCard title={result.right.user.name || result.right.user.id} totals={result.right.totals} />
            <DeltaCard comparison={result.comparison} />
          </div>
        )}
      </main>
    </div>
  );
}

function PortfolioCard({
  title,
  totals,
}: {
  title: string;
  totals: CompareResponse['left']['totals'];
}) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 space-y-2">
      <h2 className="text-slate-100 font-semibold">{title}</h2>
      <p className="text-slate-300">Value: {Math.round(totals.totalValue).toLocaleString()} ₽</p>
      <p className="text-slate-300">Profit: {Math.round(totals.profit).toLocaleString()} ₽</p>
      <p className="text-slate-300">ROI: {totals.profitPercent.toFixed(2)}%</p>
      <p className="text-slate-300">Items: {totals.itemsCount}</p>
    </div>
  );
}

function DeltaCard({ comparison }: { comparison: CompareResponse['comparison'] }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 space-y-2">
      <h2 className="text-slate-100 font-semibold">Delta (left - right)</h2>
      <p className="text-slate-300">Value Δ: {Math.round(comparison.valueDelta).toLocaleString()} ₽</p>
      <p className="text-slate-300">Profit Δ: {Math.round(comparison.profitDelta).toLocaleString()} ₽</p>
      <p className="text-slate-300">ROI Δ: {comparison.roiDelta.toFixed(2)}%</p>
      <p className="text-slate-300">Items Δ: {comparison.itemsDelta}</p>
    </div>
  );
}
