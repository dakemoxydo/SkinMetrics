'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  PieChart,
  List,
  RefreshCw,
  Download,
  Upload,
  LogOut,
  User,
  Heart,
  DollarSign,
  Bell,
  Moon,
  Sun,
  Settings,
  GitCompareArrows,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useToast } from '@/components/ui/Toast';
import { exportToCSV, importFromJSON } from '@/lib/importExport';
import PriceSyncStatus from '@/components/dashboard/PriceSyncStatus';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function Header() {
  const pathname = usePathname();
  const { refreshPrices, syncPrices, items } = usePortfolioStore();
  const toast = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { href: '/', label: t('navDashboard'), icon: LayoutDashboard },
    { href: '/portfolio', label: t('navPortfolio'), icon: List },
    { href: '/analytics', label: t('navAnalytics'), icon: PieChart },
    { href: '/wishlist', label: t('navWishlist'), icon: Heart },
    { href: '/transactions', label: t('navTransactions'), icon: DollarSign },
    { href: '/alerts', label: t('navAlerts'), icon: Bell },
    { href: '/compare', label: t('navCompare'), icon: GitCompareArrows },
    { href: '/settings', label: t('navSettings'), icon: Settings },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      if (status === 'authenticated') {
        const result = await syncPrices();
        toast.success(
          result?.alertsTriggered
            ? `${t('pricesUpdated')}. Alerts triggered: ${result.alertsTriggered}`
            : t('pricesUpdated')
        );
      } else {
        await refreshPrices();
        toast.success(t('demoPricesUpdated'));
      }
    } catch {
      toast.error(t('updateFailed'));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleTheme = () => {
    toggleTheme();
    toast.success(theme === 'dark' ? t('lightThemeEnabled') : t('darkThemeEnabled'));
  };

  const handleExport = () => {
    exportToCSV(items);
    toast.success(t('exportSuccess'));
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const importedCount = await importFromJSON(file, {
          persistToServer: status === 'authenticated',
        });
        if (status === 'authenticated') {
          await refreshPrices();
        }
        toast.success(`${t('importSuccess')} (${importedCount})`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t('importError'));
      }
    };
    input.click();
  };

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <span className="text-lg font-semibold text-slate-100 hidden sm:inline">
              SkinMetrics
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-700 px-1 py-1">
              <button
                onClick={() => setLanguage('ru')}
                className={cn(
                  'px-2 py-1 text-xs rounded',
                  language === 'ru' ? 'bg-slate-700 text-white' : 'text-slate-400'
                )}
              >
                RU
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  'px-2 py-1 text-xs rounded',
                  language === 'en' ? 'bg-slate-700 text-white' : 'text-slate-400'
                )}
              >
                EN
              </button>
            </div>

            <button
              onClick={handleToggleTheme}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated && <PriceSyncStatus />}

            <Button variant="ghost" size="sm" onClick={handleRefresh} loading={isRefreshing}>
              {isRefreshing ? null : <RefreshCw className="w-4 h-4" />}
              <span className="hidden sm:inline">{t('refresh')}</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('export')}</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={handleImport}>
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">{t('import')}</span>
            </Button>

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-slate-700/50 animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/30">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={24}
                      height={24}
                      unoptimized
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-sm text-slate-300 hidden sm:inline">
                    {session.user?.name || 'User'}
                  </span>
                </div>

                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button variant="primary" size="sm">
                  {t('login')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
