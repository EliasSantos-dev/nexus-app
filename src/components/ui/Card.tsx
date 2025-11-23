import { cn } from "@/lib/utils";

export function Card({ children, className, hover = false }: { children: React.ReactNode, className?: string, hover?: boolean }) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-white/5 bg-surface p-6 shadow-xl transition-all duration-300",
      hover && "hover:border-primary/30 hover:shadow-primary/5 hover:-translate-y-1",
      className
    )}>
      {/* Noise Overlay */}
      <div className="absolute inset-0 bg-noise z-0" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}