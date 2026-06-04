import { Pill } from './Pill'

export type StatusVariant =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'sent_back'
  | 'rfq_sent'
  | 'awaiting_responses'
  | 'partially_responded'
  | 'under_negotiation'
  | 'awarded'
  | 'no_response'
  | 'failed'
  | 'responded'
  | 'late'
  | 'incomplete'
  | 'sent'

const config: Record<
  StatusVariant,
  { label: string; tone: 'neutral' | 'accent' | 'amber' | 'green' | 'red'; filled?: boolean }
> = {
  draft: { label: 'Draft', tone: 'neutral' },
  pending_review: { label: 'Pending Review', tone: 'amber' },
  approved: { label: 'Approved', tone: 'green' },
  sent_back: { label: 'Sent Back', tone: 'amber' },
  sent: { label: 'RFQ Sent', tone: 'accent' },
  rfq_sent: { label: 'RFQ Sent', tone: 'accent' },
  awaiting_responses: { label: 'Awaiting Responses', tone: 'accent' },
  partially_responded: { label: 'Partially Responded', tone: 'amber' },
  under_negotiation: { label: 'Under Negotiation', tone: 'accent' },
  awarded: { label: 'Awarded', tone: 'green', filled: true },
  no_response: { label: 'No Response', tone: 'red' },
  failed: { label: 'Failed', tone: 'red' },
  responded: { label: 'Responded', tone: 'green' },
  late: { label: 'Late', tone: 'amber' },
  incomplete: { label: 'Incomplete', tone: 'amber' },
}

interface StatusPillProps {
  status: StatusVariant
  label?: string
  className?: string
}

export function StatusPill({ status, label, className = '' }: StatusPillProps) {
  const c = config[status]
  if (c.filled) {
    return (
      <span
        className={[
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
          'text-[11px] font-medium uppercase tracking-[0.04em]',
          'bg-[var(--green)] text-white',
          className,
        ].join(' ')}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white/80 shrink-0" />
        {label ?? c.label}
      </span>
    )
  }
  return (
    <Pill tone={c.tone} dot className={className}>
      {label ?? c.label}
    </Pill>
  )
}
