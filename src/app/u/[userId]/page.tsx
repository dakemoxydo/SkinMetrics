'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { useParams } from 'next/navigation';

interface PublicUserProfile {
  id: string;
  name: string | null;
  image: string | null;
  portfolioPublic: boolean;
  stats: {
    totalValue: number;
    totalInvested: number;
    profit: number;
    profitPercent: number;
    itemsCount: number;
  };
  topItems: Array<{
    id: string;
    name: string;
    image: string;
    icon?: string;
    currentPrice: number;
    priceChangePercent: number;
  }>;
}

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/profile`);
        if (!res.ok) throw new Error('Failed to load profile');
        const json = await res.json();
        setProfile(json.data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading...</div>;
  }

  if (!profile || !profile.portfolioPublic) {
    return (
      <div className="text-center py-12 text-slate-400">
        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>This profile is private</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        {profile.image ? (
          <Image
            src={profile.image}
            alt={profile.name || ''}
            width={64}
            height={64}
            unoptimized
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            {profile.name || 'Anonymous User'}
          </h1>
          <p className="text-slate-400">Public Portfolio</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-400">Total Value</p>
          <p className="text-2xl font-bold text-slate-100">
            {profile.stats.totalValue.toLocaleString()}₽
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-400">Invested</p>
          <p className="text-2xl font-bold text-slate-100">
            {profile.stats.totalInvested.toLocaleString()}₽
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-400">Profit</p>
          <p className={`text-2xl font-bold ${
            profile.stats.profit >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {profile.stats.profit >= 0 ? '+' : ''}{profile.stats.profit.toLocaleString()}₽
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-400">Items</p>
          <p className="text-2xl font-bold text-slate-100">
            {profile.stats.itemsCount}
          </p>
        </div>
      </div>

      {/* Top Items */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-4">Top Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.topItems.map(item => (
            <div
              key={item.id}
              className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
            >
              <div className="flex items-center gap-3 mb-3">
                {item.icon && <span className="text-2xl">{item.icon}</span>}
                <h3 className="font-medium text-slate-100 text-sm flex-1">{item.name}</h3>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Price:</span>
                <span className="text-slate-100 font-medium">
                  {item.currentPrice.toLocaleString()}₽
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-400">Change:</span>
                <span className={`font-medium ${
                  item.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {item.priceChangePercent >= 0 ? '+' : ''}{item.priceChangePercent.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
