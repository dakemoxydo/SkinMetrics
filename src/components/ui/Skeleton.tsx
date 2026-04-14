import { cn } from '@/lib/utils';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton-загрузчик для имитации контента при загрузке
 * 
 * @example
 * <Skeleton variant="text" width={200} />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="card" />
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-slate-700/50 rounded';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    none: '',
  }[animation];

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
    card: 'h-32 rounded-lg',
  }[variant];

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(baseClasses, variantClasses, animationClasses, className)}
      style={style}
      role="status"
      aria-label="loading"
    />
  );
}

/**
 * Skeleton для карточки предмета
 */
export function ItemCardSkeleton() {
  return (
    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="40%" height={3} />
        </div>
      </div>
      <div className="flex justify-between">
        <Skeleton variant="text" width={80} />
        <Skeleton variant="text" width={100} />
      </div>
    </div>
  );
}

/**
 * Skeleton для таблицы
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" className="flex-1" />
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={100} />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton для статистики
 */
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 space-y-2">
          <Skeleton variant="text" width={80} height={3} />
          <Skeleton variant="text" width={120} height={8} />
        </div>
      ))}
    </div>
  );
}
