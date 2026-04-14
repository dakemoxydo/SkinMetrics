'use client';

import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { usePortfolioStore } from '@/store/portfolioStore';

interface PriceSyncStatusProps {
  className?: string;
}

export default function PriceSyncStatus({ className = '' }: PriceSyncStatusProps) {
  const { syncPrices } = usePortfolioStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncResult, setSyncResult] = useState<{
    synced: number;
    failed: number;
    alertsTriggered: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setError(null);
    setSyncResult(null);

    try {
      const result = await syncPrices();

      setSyncResult({
        synced: 1,
        failed: 0,
        alertsTriggered: result?.alertsTriggered || 0,
      });
      setLastSync(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMessage);
      console.error('Price sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return 'Never';

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium
          bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800
          rounded-lg transition-colors duration-150
          disabled:cursor-not-allowed"
        title="Sync prices from Steam Market"
        type="button"
      >
        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing...' : 'Sync Prices'}
      </button>

      {syncResult && !isSyncing && (
        <div className="flex items-center gap-2 text-sm">
          {syncResult.synced > 0 && (
            <div className="flex items-center gap-1 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Portfolio updated</span>
            </div>
          )}

          {syncResult.failed > 0 && (
            <div className="flex items-center gap-1 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{syncResult.failed} failed</span>
            </div>
          )}

          {syncResult.alertsTriggered > 0 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <AlertCircle className="w-4 h-4" />
              <span>{syncResult.alertsTriggered} alerts</span>
            </div>
          )}
        </div>
      )}

      {lastSync && !isSyncing && (
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          <span>Last sync: {formatTimeAgo(lastSync)}</span>
        </div>
      )}

      {error && !isSyncing && (
        <div className="text-xs text-red-400" title={error}>
          <AlertCircle className="w-3 h-3 inline mr-1" />
          Sync failed
        </div>
      )}
    </div>
  );
}
