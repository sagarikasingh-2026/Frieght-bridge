import { Check } from 'lucide-react'
import type { RfqStatus } from '../../data/types'

interface StageStepperProps {
  status: RfqStatus
  hasResponses: boolean
}

const STAGES = [
  { key: 'created', label: 'Created' },
  { key: 'sent', label: 'Sent' },
  { key: 'responses', label: 'Responses' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'awarded', label: 'Awarded' },
] as const

function activeIndex(status: RfqStatus, hasResponses: boolean): number {
  switch (status) {
    case 'draft':
      return 0
    case 'sent':
      return 1
    case 'awaiting_responses':
      return hasResponses ? 2 : 1
    case 'partially_responded':
      return 2
    case 'under_negotiation':
      return 3
    case 'awarded':
      return 4
    default:
      return 0
  }
}

export function StageStepper({ status, hasResponses }: StageStepperProps) {
  const current = activeIndex(status, hasResponses)

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {STAGES.map((stage, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={stage.key} className="flex items-center shrink-0">
            <div className="flex items-center gap-2">
              <span
                className={[
                  'flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-semibold shrink-0',
                  done
                    ? 'bg-[var(--green)] text-white'
                    : active
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--ink-faint)]',
                ].join(' ')}
              >
                {done ? <Check size={11} /> : i + 1}
              </span>
              <span
                className={[
                  'text-xs font-medium whitespace-nowrap',
                  active
                    ? 'text-[var(--accent)]'
                    : done
                      ? 'text-[var(--ink)]'
                      : 'text-[var(--ink-faint)]',
                ].join(' ')}
              >
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <span
                className={[
                  'mx-2 h-px w-6 sm:w-10',
                  i < current ? 'bg-[var(--green)]' : 'bg-[var(--border)]',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
