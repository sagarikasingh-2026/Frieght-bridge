import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
  size?: 'sm' | 'md'
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-white hover:opacity-90 border border-transparent',
  secondary:
    'bg-[var(--surface)] text-[var(--ink)] border border-[var(--border)] hover:bg-[var(--bg)]',
  ghost:
    'bg-transparent text-[var(--ink-soft)] border border-transparent hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]',
  danger:
    'bg-[var(--red-soft)] text-[var(--red)] border border-transparent hover:opacity-90',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-opacity',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
