import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Tıklanabilir kartlarda üzerine gelince parlama ve hafif yükselme. */
  interactive?: boolean;
};

export function Card({ interactive = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card bg-surface ring-1 ring-accent/20",
        interactive &&
          "transition-[transform,box-shadow] duration-200 ease-out-soft " +
            "hover:-translate-y-1 hover:shadow-glow focus-within:shadow-glow",
        className,
      )}
      {...props}
    />
  );
}
