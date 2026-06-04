import { ArrowRight, Clock, TrendingDown, Users } from 'lucide-react'
import type { Rfq } from '../../data/types'
import { useStore } from '../../store/StoreContext'
import {
  findL1,
  getVendor,
  negotiatedSavings,
  responseSummary,
} from '../../store/selectors'
import { StatusPill } from '../ui/StatusPill'
import { Button } from '../ui/Button'
import { StageStepper } from './StageStepper'
import { rfqStatusToPill } from '../../lib/rfqStatus'
import { inr, daysUntil } from '../../lib/format'

export type WorkspaceTab =
  | 'overview'
  | 'vendors'
  | 'comparison'
  | 'negotiation'
  | 'inbox'
  | 'award'

interface RfqHeaderProps {
  rfq: Rfq
  readOnly: boolean
  onGoTab: (tab: WorkspaceTab) => void
}

interface NextAction {
  label: string
  tab: WorkspaceTab
  hint: string
}

function nextAction(rfq: Rfq): NextAction | null {
  switch (rfq.status) {
    case 'draft':
      return { label: 'Select vendors & send', tab: 'vendors', hint: 'RFQ is a draft — invite vendors to start.' }
    case 'sent':
    case 'awaiting_responses':
      return { label: 'Track responses', tab: 'overview', hint: 'Waiting on vendor replies. Chase no-shows from here.' }
    case 'partially_responded':
      return { label: 'Review & compare quotes', tab: 'comparison', hint: 'Quotes are arriving — compare landed costs.' }
    case 'under_negotiation':
      return { label: 'Compare or negotiate', tab: 'comparison', hint: 'Push price or move to award.' }
    case 'awarded':
      return { label: 'View award', tab: 'award', hint: 'This RFQ is closed.' }
    default:
      return null
  }
}

export function RfqHeader({ rfq, readOnly, onGoTab }: RfqHeaderProps) {
  const { state } = useStore()
  const summary = responseSummary(rfq)
  const l1 = findL1(rfq, true)
  const savings = negotiatedSavings(rfq)
  const days = daysUntil(rfq.deadline)
  const action = nextAction(rfq)
  const isFreight = rfq.category === 'freight'

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 mb-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-[var(--ink-soft)]">{rfq.id}</span>
            <StatusPill status={rfqStatusToPill(rfq.status)} />
            <span className="text-[11px] uppercase tracking-[0.04em] px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
              {rfq.category}
            </span>
          </div>
          <h2 className="font-display text-xl font-semibold text-[var(--ink)] mt-1 flex items-center gap-2">
            {isFreight ? (
              <>
                {rfq.fields.origin}
                <ArrowRight size={16} className="text-[var(--accent)]" />
                {rfq.fields.destination}
              </>
            ) : (
              rfq.fields.material
            )}
          </h2>
          <p className="text-xs text-[var(--ink-faint)] mt-1">
            {isFreight
              ? `${rfq.fields.vehicleType} · ${rfq.fields.frequency}`
              : `${rfq.fields.quantityUom} · ${rfq.fields.deliveryMode}`}
          </p>
        </div>
        {action && (
          <div className="text-right">
            <Button
              size="sm"
              variant={rfq.status === 'awarded' || readOnly ? 'secondary' : 'primary'}
              onClick={() => onGoTab(action.tab)}
            >
              {action.label}
              <ArrowRight size={14} />
            </Button>
            <p className="text-[11px] text-[var(--ink-faint)] mt-1 max-w-[200px]">{action.hint}</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <StageStepper status={rfq.status} hasResponses={summary.responded > 0} />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-1.5 text-[var(--ink-soft)]">
          <Users size={14} className="text-[var(--ink-faint)]" />
          {summary.responded}/{summary.invited} responded
        </span>
        {l1 && (
          <span className="inline-flex items-center gap-1.5 text-[var(--ink-soft)]">
            L1{' '}
            <span className="font-medium text-[var(--ink)]">
              {getVendor(state.vendors, l1.vendorId)?.name}
            </span>
            <span className="tnum font-semibold text-[var(--accent)]">{inr(l1.landedCost)}</span>
          </span>
        )}
        {savings > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[var(--green)]">
            <TrendingDown size={14} />
            {inr(savings)} saved via negotiation
          </span>
        )}
        {rfq.status !== 'awarded' && (
          <span
            className={[
              'inline-flex items-center gap-1.5',
              days < 2 ? 'text-[var(--amber)] font-medium' : 'text-[var(--ink-soft)]',
            ].join(' ')}
          >
            <Clock size={14} className={days < 2 ? '' : 'text-[var(--ink-faint)]'} />
            {days < 0 ? 'Deadline passed' : `${days} day${days === 1 ? '' : 's'} to deadline`}
          </span>
        )}
      </div>
    </div>
  )
}
