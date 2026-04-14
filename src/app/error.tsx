'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-red-500">Ошибка</h1>
      <h2 className="text-xl font-semibold text-slate-100 mt-4">
        Что-то пошло не так
      </h2>
      <p className="text-slate-400 mt-2 text-center max-w-md">
        {error.message || 'Произошла непредвиденная ошибка.'}
      </p>
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={reset}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500
            text-white font-medium rounded-lg transition-colors"
        >
          Попробовать снова
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600
            text-slate-100 font-medium rounded-lg transition-colors"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
