'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <h1 className="text-8xl font-bold text-indigo-500">404</h1>
      <h2 className="text-2xl font-semibold text-slate-100 mt-4">
        Страница не найдена
      </h2>
      <p className="text-slate-400 mt-2 text-center max-w-md">
        Страница, которую вы ищете, не существует или была перемещена.
      </p>
      <Link
        href="/"
        className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-500
          text-white font-medium rounded-lg transition-colors"
      >
        Вернуться на главную
      </Link>
    </div>
  );
}
