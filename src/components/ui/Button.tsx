import Link from "next/link"

type Variant = "primary" | "secondary" | "outline" | "ghost"
type Size = "sm" | "md" | "lg"

interface ButtonBaseProps {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

interface ButtonAsButton extends ButtonBaseProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> {
  href?: never
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string
}

type ButtonProps = ButtonAsButton | ButtonAsLink

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gold text-charcoal hover:bg-gold-400 focus-visible:ring-gold",
  secondary:
    "bg-charcoal text-diamond hover:bg-charcoal-400 focus-visible:ring-charcoal",
  outline:
    "border border-diamond/30 text-charcoal hover:border-gold hover:text-gold focus-visible:ring-gold",
  ghost:
    "text-charcoal/80 hover:text-gold hover:bg-charcoal/5 focus-visible:ring-gold",
}

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-10 text-sm",
}

function getClasses(variant: Variant, size: Size, extra?: string) {
  return [
    "inline-flex items-center justify-center rounded-sm font-semibold uppercase tracking-wider transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    extra,
  ]
    .filter(Boolean)
    .join(" ")
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = getClasses(variant, size, className)

  if ("href" in rest && rest.href) {
    return (
      <Link href={rest.href} className={classes}>
        {children}
      </Link>
    )
  }

  const { href: _, ...buttonProps } = rest as ButtonAsButton
  return (
    <button type="button" className={classes} {...buttonProps}>
      {children}
    </button>
  )
}
