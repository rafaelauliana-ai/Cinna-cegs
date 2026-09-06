import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "success" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-sky-500 text-white shadow-softer hover:bg-sky-600 active:bg-sky-700 disabled:bg-sky-200",
  secondary:
    "bg-surface-muted text-sky-800 hover:bg-sky-200 active:bg-sky-300 disabled:opacity-50",
  ghost: "bg-transparent text-sky-700 hover:bg-sky-100 disabled:opacity-50",
  success:
    "bg-success-500 text-white hover:brightness-95 active:brightness-90 disabled:opacity-50",
  danger:
    "bg-danger-500 text-white hover:brightness-95 active:brightness-90 disabled:opacity-50",
  outline:
    "bg-white text-sky-700 border-2 border-sky-200 hover:border-sky-400 hover:bg-sky-50 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3.5 py-1.5 gap-1.5",
  md: "text-sm px-5 py-2.5 gap-2",
  lg: "text-base px-6 py-3 gap-2",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-pill font-heading font-semibold tracking-wide transition-colors disabled:cursor-not-allowed",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
  return (
    <button ref={ref} className={buttonClasses(variant, size, className)} {...props} />
  );
});
