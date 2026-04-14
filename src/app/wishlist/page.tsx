'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Heart, Plus, Trash2, Edit2, X } from 'lucide-react';
import * as api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const categoryOptions = [
  { value: 'skin', label: 'Skin' },
  { value: 'knife', label: 'Knife' },
  { value: 'gloves', label: 'Gloves' },
  { value: 'weapon', label: 'Weapon' },
  { value: 'case', label: 'Case' },
  { value: 'sticker', label: 'Sticker' },
  { value: 'charm', label: 'Charm' },
  { value: 'other', label: 'Other' },
];

export default function WishlistPage() {
  const [wishlist, setWishlist] = React.useState<api.WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<api.WishlistItem | null>(null);
  const toast = useToast();

  const loadWishlist = useCallback(async () => {
    try {
      const data = await api.fetchWishlist();
      setWishlist(data);
    } catch {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist]);

  const handleRemove = async (id: string) => {
    try {
      await api.removeFromWishlist(id);
      setWishlist((current) => current.filter((item) => item.id !== id));
      toast.success('Item removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const openEditModal = (item: api.WishlistItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Wishlist</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Your wishlist is empty. Add items you want to buy!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-100 text-sm">{item.name}</h3>
                  {item.notes && <p className="text-xs text-slate-400 mt-1">{item.notes}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1 text-slate-400 hover:text-pink-400 transition-colors"
                    aria-label={`Edit ${item.name}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Current Price:</span>
                  <span className="text-slate-100 font-medium">
                    {item.currentPrice > 0 ? `${item.currentPrice.toLocaleString()} ₽` : 'N/A'}
                  </span>
                </div>

                {typeof item.targetPrice === 'number' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Target Price:</span>
                    <span className="text-green-400 font-medium">
                      {item.targetPrice.toLocaleString()} ₽
                    </span>
                  </div>
                )}

                {typeof item.targetPrice === 'number' && item.currentPrice > 0 && (
                  <div className="pt-2 border-t border-slate-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Difference:</span>
                      <span
                        className={
                          item.currentPrice <= item.targetPrice
                            ? 'text-green-400 font-medium'
                            : 'text-red-400 font-medium'
                        }
                      >
                        {(
                          ((item.currentPrice - item.targetPrice) / item.targetPrice) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    {item.currentPrice <= item.targetPrice && (
                      <p className="text-xs text-green-400 mt-1">Good time to buy!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <WishlistModal
          item={editingItem}
          onClose={closeModal}
          onSuccess={() => {
            setLoading(true);
            void loadWishlist();
            closeModal();
          }}
        />
      )}
    </div>
  );
}

function WishlistModal({
  item,
  onClose,
  onSuccess,
}: {
  item: api.WishlistItem | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(item?.name ?? '');
  const [marketHashName, setMarketHashName] = useState(item?.marketHashName ?? '');
  const [category, setCategory] = useState(item?.category ?? 'skin');
  const [targetPrice, setTargetPrice] = useState<number | undefined>(item?.targetPrice);
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const isEditing = Boolean(item);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (item) {
        await api.updateWishlistItem(item.id, {
          name: name || marketHashName,
          marketHashName,
          category,
          targetPrice,
          notes,
        });
        toast.success('Wishlist item updated');
      } else {
        await api.addToWishlist({
          name: name || marketHashName,
          marketHashName,
          category,
          targetPrice,
          notes,
        });
        toast.success('Item added to wishlist');
      }

      onSuccess();
    } catch {
      toast.error(isEditing ? 'Failed to update item' : 'Failed to add to wishlist');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100">
            {isEditing ? 'Edit Wishlist Item' : 'Add to Wishlist'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
              onChange={(event) => setMarketHashName(event.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="AK-47 | Redline (Field-Tested)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Target Price (₽)
            </label>
            <input
              type="number"
              value={targetPrice || ''}
              onChange={(event) =>
                setTargetPrice(event.target.value ? parseFloat(event.target.value) : undefined)
              }
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
              rows={2}
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-600 text-white rounded-lg transition-colors"
            >
              {submitting
                ? isEditing
                  ? 'Saving...'
                  : 'Adding...'
                : isEditing
                  ? 'Save'
                  : 'Add to Wishlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
