import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl3 bg-white border border-line shadow-soft p-6 transition-shadow hover:shadow-softLg",
        className
      )}
      {...props}
    />
  );
}
