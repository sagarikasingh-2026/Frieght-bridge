import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: boolean
}

export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div
      className={[
        'bg-[var(--surface)] border border-[var(--border)] rounded-xl',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
        padding ? 'p-6' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
