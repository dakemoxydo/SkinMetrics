'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [steamLoading, setSteamLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const steamId = searchParams.get('steamId');
    if (!steamId) return;

    let cancelled = false;

    async function completeSteamSignIn() {
      setSteamLoading(true);

      try {
        const result = await signIn('steam', {
          steamId,
          name: searchParams.get('name') || undefined,
          image: searchParams.get('image') || undefined,
          redirect: false,
        });

        if (cancelled) return;

        if (result?.error) {
          toast.error('Не удалось войти через Steam');
          return;
        }

        toast.success('Вход через Steam выполнен');
        router.replace('/');
        router.refresh();
      } catch {
        if (!cancelled) {
          toast.error('Не удалось завершить вход через Steam');
        }
      } finally {
        if (!cancelled) {
          setSteamLoading(false);
        }
      }
    }

    void completeSteamSignIn();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams, toast]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Введите email');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        name: name || undefined,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Ошибка входа');
        return;
      }

      toast.success('Вы вошли');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSteamLogin = () => {
    setSteamLoading(true);
    window.location.href = '/api/auth/steam';
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card glass className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">SM</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Вход в SkinMetrics</CardTitle>
          <CardDescription>
            Войдите через Steam или используйте dev-режим по email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full mb-4"
            loading={steamLoading}
            onClick={handleSteamLogin}
          >
            {steamLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            Войти через Steam
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500">или dev-вход</span>
            </div>
          </div>

          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="demo@skinmetrics.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Имя (необязательно)"
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              type="submit"
              loading={isLoading}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Войти по email
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <p className="text-xs text-center text-slate-500">
              Steam-вход работает бесплатно через OpenID. Если задан `STEAM_API_KEY`,
              приложение дополнительно подтянет имя и аватар из Steam Web API.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <SignInContent />
    </Suspense>
  );
}
