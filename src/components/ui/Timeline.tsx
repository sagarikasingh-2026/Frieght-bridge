export interface TimelineStep {
  label: string
  detail?: string
  state: 'done' | 'current' | 'upcoming'
}

interface TimelineProps {
  steps: TimelineStep[]
}

export function Timeline({ steps }: TimelineProps) {
  return (
    <ol className="space-y-4">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={[
                'h-2.5 w-2.5 rounded-full shrink-0 mt-1.5',
                step.state === 'done'
                  ? 'bg-[var(--green)]'
                  : step.state === 'current'
                    ? 'bg-[var(--accent)] ring-4 ring-[var(--accent-soft)]'
                    : 'bg-[var(--border)]',
              ].join(' ')}
            />
            {i < steps.length - 1 && (
              <span className="w-px flex-1 min-h-[24px] bg-[var(--border)] my-1" />
            )}
          </div>
          <div className="pb-2">
            <div
              className={[
                'text-sm font-medium',
                step.state === 'upcoming' ? 'text-[var(--ink-faint)]' : 'text-[var(--ink)]',
              ].join(' ')}
            >
              {step.label}
            </div>
            {step.detail && (
              <div className="text-xs text-[var(--ink-soft)] mt-0.5">{step.detail}</div>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
