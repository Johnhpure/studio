import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DualPaneLayoutProps {
  leftPane: ReactNode;
  rightPane: ReactNode;
  className?: string;
  leftPaneClassName?: string;
  rightPaneClassName?: string;
}

export function DualPaneLayout({
  leftPane,
  rightPane,
  className,
  leftPaneClassName,
  rightPaneClassName,
}: DualPaneLayoutProps) {
  return (
    <div className={cn("flex flex-col md:flex-row gap-6 h-full", className)}>
      <div className={cn("flex-1 flex flex-col", leftPaneClassName)}>
        {leftPane}
      </div>
      <div className={cn("flex-1 flex flex-col", rightPaneClassName)}>
        {rightPane}
      </div>
    </div>
  );
}
