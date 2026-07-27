import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "rounded-full font-semibold transition-transform duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          variant === "primary" &&
            "text-white bg-gradient-to-r from-aurora-blue to-aurora-indigo shadow-glow hover:scale-[1.02]",
          variant === "secondary" && "bg-mist text-graphite border border-line hover:bg-line",
          variant === "ghost" && "text-graphite hover:bg-mist",
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-3 text-base",
          size === "lg" && "px-8 py-4 text-lg",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
