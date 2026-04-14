'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

/**
 * Компонент пагинации
 * 
 * @example
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   totalItems={95}
 *   pageSize={10}
 *   onPageChange={(page) => setPage(page)}
 * />
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Генерируем номера страниц для отображения
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Показываем все страницы
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Всегда показываем первую страницу
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Показываем страницы вокруг текущей
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Всегда показываем последнюю страницу
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Информация */}
      <div className="text-sm text-slate-400">
        Показано {startItem}–{endItem} из {totalItems}
      </div>

      {/* Навигация */}
      <div className="flex items-center gap-1">
        {/* Первая страница */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Предыдущая */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Номера страниц */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-slate-500">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={cn(
                  'min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors',
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                )}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Следующая */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Последняя страница */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      {/* Размер страницы */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">На странице:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            className="px-2 py-1 bg-slate-700 border border-slate-600 rounded-lg
              text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

/**
 * Хук для управления пагинацией
 */
export function usePagination(totalItems: number, initialPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedItems = <ItemType,>(items: ItemType[]): ItemType[] => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  };

  const resetPage = () => setCurrentPage(1);

  return {
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage,
    setPageSize: (newSize: number) => {
      setPageSize(newSize);
      resetPage();
    },
    paginatedItems,
    resetPage,
  };
}
