'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Компонент анимации перехода между страницами
 * Использует CSS transitions для плавного появления контента
 */
export function PageTransition({ children }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Запускаем анимацию после монтирования
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2'
      }`}
    >
      {children}
    </div>
  );
}

/**
 * Компонент для анимации появления списка элементов с задержкой
 */
export function StaggerList({
  children,
  staggerDelay = 50,
}: {
  children: React.ReactNode[];
  staggerDelay?: number;
}) {
  const [visibleItems, setVisibleItems] = useState(0);
  const childrenArray = useMemo(
    () => (Array.isArray(children) ? children : [children]),
    [children]
  );

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    childrenArray.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleItems(index + 1);
      }, index * staggerDelay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [childrenArray, staggerDelay]);

  return (
    <>
      {childrenArray.slice(0, visibleItems).map((child, index) => (
        <div
          key={index}
          className="transition-all duration-300 ease-out animate-in"
          style={{
            animationDelay: `${index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </>
  );
}
