import { cn } from "@/lib/utils";

interface LoaderDotsProps {
  className?: string;
}

export function LoaderDots({ className }: LoaderDotsProps) {
  return (
    <div className={cn("flex space-x-1 items-center justify-center", className)}>
      <span className="sr-only">加载中...</span>
      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
    </div>
  );
}
