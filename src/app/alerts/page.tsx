'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { Bell, Plus, Trash2, ArrowUp, ArrowDown, X } from 'lucide-react';
import * as api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function AlertsPage() {
  const [alerts, setAlerts] = React.useState<api.PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const toast = useToast();

  const loadAlerts = useCallback(async () => {
    try {
      const data = await api.fetchPriceAlerts();
      setAlerts(data);
    } catch {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  const handleDelete = async (id: string) => {
    try {
      await api.deletePriceAlert(id);
      setAlerts(alerts.filter(a => a.id !== id));
      toast.success('Alert deleted');
    } catch {
      toast.error('Failed to delete alert');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Price Alerts</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500
            text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Alert
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No alerts yet. Create one to track price changes!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50
                flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded ${
                  alert.direction === 'up' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {alert.direction === 'up' ? (
                    <ArrowUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <ArrowDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-slate-100">{alert.itemName}</h3>
                  <p className="text-sm text-slate-400">
                    Alert when price goes {alert.direction} by {alert.thresholdPercent}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {alert.triggeredAt && (
                  <span className="text-xs text-yellow-400">
                    Triggered: {new Date(alert.triggeredAt).toLocaleDateString()}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateAlertModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadAlerts();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function CreateAlertModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [itemName, setItemName] = useState('');
  const [marketHashName, setMarketHashName] = useState('');
  const [threshold, setThreshold] = useState(10);
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.createPriceAlert({
        itemName: itemName || marketHashName,
        marketHashName,
        thresholdPercent: threshold,
        direction,
      });
      toast.success('Alert created');
      onSuccess();
    } catch {
      toast.error('Failed to create alert');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100">Create Price Alert</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Item Name
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="AK-47 | Redline"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Steam Market Name
            </label>
            <input
              type="text"
              value={marketHashName}
              onChange={(e) => setMarketHashName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="AK-47 | Redline (Field-Tested)"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Direction
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'up' | 'down')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                  text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="up">Price Up ↑</option>
                <option value="down">Price Down ↓</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Threshold (%)
              </label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                min="1"
                max="100"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                  text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
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
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600
                text-white rounded-lg transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
