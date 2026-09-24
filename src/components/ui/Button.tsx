import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "card-shine brand-gradient-bg text-white shadow-[var(--shadow-lift)] hover:brightness-110 hover:-translate-y-1 hover:shadow-[0_18px_36px_-8px_rgba(31,86,214,0.5)]",
  secondary:
    "card-shine bg-surface-2 text-foreground border border-border-soft hover:border-brand-400 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]",
  ghost: "text-foreground hover:bg-surface-2 hover:-translate-y-0.5",
  outline:
    "card-shine bg-surface/60 backdrop-blur-sm border border-brand-400/60 text-brand-500 hover:bg-brand-50 hover:-translate-y-1 hover:border-brand-400 hover:shadow-[var(--shadow-soft)] dark:hover:bg-brand-900/20",
  danger: "card-shine bg-danger text-white hover:brightness-110 hover:-translate-y-1",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-4 py-2 gap-1.5",
  md: "text-sm px-5 py-2.5 gap-2",
  lg: "text-base px-7 py-3.5 gap-2.5",
};

const base =
  "group relative isolate inline-flex items-center justify-center overflow-hidden rounded-full font-medium transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function ButtonIcon({ icon }: { icon: ReactNode }) {
  if (!icon) return null;
  return (
    <span className="inline-flex transition-transform duration-300 ease-out group-hover:translate-x-1 group-active:translate-x-0">
      {icon}
    </span>
  );
}

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: ReactNode;
  icon?: ReactNode;
};

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps & {
  href: string;
  target?: string;
  rel?: string;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children, icon, ...rest } = props;
  const classes = cn(base, variantClasses[variant], sizeClasses[size], className);

  if ("href" in rest && rest.href) {
    const { href, target, rel } = rest as { href: string; target?: string; rel?: string };
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        <ButtonIcon icon={icon} />
        {children}
      </Link>
    );
  }

  const { type = "button", ...domProps } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={classes} {...domProps}>
      {icon}
      {children}
    </button>
  );
}
