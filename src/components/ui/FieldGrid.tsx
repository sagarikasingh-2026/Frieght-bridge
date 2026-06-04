import type { ReactNode } from 'react'

export interface FieldItem {
  label: string
  value: ReactNode
  mono?: boolean
}

interface FieldGridProps {
  fields: FieldItem[]
  columns?: 2 | 3 | 4
  className?: string
}

export function FieldGrid({ fields, columns = 3, className = '' }: FieldGridProps) {
  const colClass =
    columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : columns === 4
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={['grid gap-6', colClass, className].join(' ')}>
      {fields.map((f) => (
        <div key={f.label} className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--ink-faint)] mb-1">
            {f.label}
          </div>
          <div
            className={[
              'text-sm text-[var(--ink)] break-words',
              f.mono ? 'font-mono text-[13px]' : '',
            ].join(' ')}
          >
            {f.value || '—'}
          </div>
        </div>
      ))}
    </div>
  )
}
