import type { ReactNode } from 'react'

type PillTone = 'neutral' | 'accent' | 'amber' | 'green' | 'red'

interface PillProps {
  children: ReactNode
  tone?: PillTone
  dot?: boolean
  className?: string
}

const toneStyles: Record<PillTone, { bg: string; text: string; dot: string }> = {
  neutral: {
    bg: 'bg-[var(--bg)]',
    text: 'text-[var(--ink-soft)]',
    dot: 'bg-[var(--ink-faint)]',
  },
  accent: {
    bg: 'bg-[var(--accent-soft)]',
    text: 'text-[var(--accent)]',
    dot: 'bg-[var(--accent)]',
  },
  amber: {
    bg: 'bg-[var(--amber-soft)]',
    text: 'text-[var(--amber)]',
    dot: 'bg-[var(--amber)]',
  },
  green: {
    bg: 'bg-[var(--green-soft)]',
    text: 'text-[var(--green)]',
    dot: 'bg-[var(--green)]',
  },
  red: {
    bg: 'bg-[var(--red-soft)]',
    text: 'text-[var(--red)]',
    dot: 'bg-[var(--red)]',
  },
}

export function Pill({ children, tone = 'neutral', dot = false, className = '' }: PillProps) {
  const s = toneStyles[tone]
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-[11px] font-medium uppercase tracking-[0.04em]',
        s.bg,
        s.text,
        className,
      ].join(' ')}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.dot}`} />}
      {children}
    </span>
  )
}
