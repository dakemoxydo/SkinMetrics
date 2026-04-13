import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const variants = {
    text: 'h-4',
    rect: 'h-12',
    circle: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-700/50',
        variants[variant],
        className
      )}
    />
  );
}
