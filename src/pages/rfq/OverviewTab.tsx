import type { Rfq } from '../../data/types'
import { AlertTriangle, ArrowRight, MessageSquare } from 'lucide-react'
import { CATEGORY_FIELDS } from '../../data/seed'
import { useStore } from '../../store/StoreContext'
import {
  attentionItems,
  enrichQuote,
  getVendor,
  latestQuote,
  responseSummary,
} from '../../store/selectors'
import { Card } from '../../components/ui/Card'
import { FieldGrid } from '../../components/ui/FieldGrid'
import { Timeline, type TimelineStep } from '../../components/ui/Timeline'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { daysUntil, formatDate, inr } from '../../lib/format'
import { useWorkspace } from '../RfqWorkspace'

interface OverviewTabProps {
  rfq: Rfq
  readOnly: boolean
}

export function OverviewTab({ rfq, readOnly }: OverviewTabProps) {
  const { state, dispatch } = useStore()
  const { showToast } = useToast()
  const { setTab, openInbox } = useWorkspace()

  const summary = responseSummary(rfq)
  const days = daysUntil(rfq.deadline)
  const attention = attentionItems(rfq, state.vendors)

  const fields = CATEGORY_FIELDS[rfq.category].map((def) => ({
    label: def.label,
    value: rfq.fields[def.key] ?? '—',
  }))

  const steps: TimelineStep[] = [
    { label: 'RFQ created', detail: formatDate(rfq.createdAt), state: 'done' },
    { label: 'Sent to vendors', detail: `${rfq.vendors.length} invited`, state: 'done' },
    {
      label: 'Responses',
      detail: `${summary.responded}/${rfq.vendors.length} responded`,
      state: summary.responded >= rfq.vendors.length - summary.noResponse ? 'done' : 'current',
    },
    {
      label: 'Negotiation',
      detail: rfq.negotiations.length
        ? `Round ${Math.max(...rfq.negotiations.map((n) => n.round))}`
        : 'Not started',
      state: rfq.status === 'awarded' ? 'done' : rfq.negotiations.length ? 'current' : 'upcoming',
    },
    {
      label: 'Award',
      detail: rfq.award ? getVendor(state.vendors, rfq.award.awardedVendorId)?.name : undefined,
      state: rfq.status === 'awarded' ? 'done' : 'upcoming',
    },
  ]

  // Negotiation at a glance: vendors with a counter/revision history.
  const negotiatedVendors = rfq.vendors.filter((v) =>
    rfq.negotiations.some((n) => n.vendorId === v.vendorId),
  )

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {attention.length > 0 && (
          <Card className="border-[var(--amber)]/40">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle size={15} className="text-[var(--amber)]" />
              Needs your attention
            </h3>
            <ul className="space-y-2">
              {attention.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 text-sm rounded-lg bg-[var(--bg)] px-3 py-2"
                >
                  <span className="text-[var(--ink-soft)]">{item.label}</span>
                  {item.kind === 'no_response' && !readOnly && item.vendorId && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={rfq.vendors.find((v) => v.vendorId === item.vendorId)?.reminded}
                      onClick={() => {
                        dispatch({ type: 'REMIND_VENDOR', rfqId: rfq.id, vendorId: item.vendorId! })
                        showToast(`Reminder sent to ${getVendor(state.vendors, item.vendorId!)?.email}`)
                      }}
                    >
                      {rfq.vendors.find((v) => v.vendorId === item.vendorId)?.reminded
                        ? 'Reminded'
                        : 'Send reminder'}
                    </Button>
                  )}
                  {item.kind === 'needs_review' && (
                    <Button size="sm" variant="ghost" onClick={() => openInbox()}>
                      Open Inbox
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card>
          <h3 className="text-sm font-semibold mb-4">Sourcing specification</h3>
          <FieldGrid fields={fields} columns={2} />
        </Card>

        <Card>
          <h3 className="text-sm font-semibold mb-2">Commercial terms</h3>
          <FieldGrid
            fields={[
              { label: 'Payment terms', value: rfq.terms.paymentTerms },
              { label: 'Validity required', value: rfq.terms.validityRequired },
            ]}
            columns={2}
          />
        </Card>

        {negotiatedVendors.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare size={15} className="text-[var(--accent)]" />
                Negotiation at a glance
              </h3>
              <button
                type="button"
                onClick={() => setTab('negotiation')}
                className="text-xs text-[var(--accent)] hover:underline inline-flex items-center gap-1"
              >
                Full threads <ArrowRight size={12} />
              </button>
            </div>
            <ul className="space-y-2">
              {negotiatedVendors.map((v) => {
                const vendor = getVendor(state.vendors, v.vendorId)
                const q = latestQuote(v)
                const enriched = q ? enrichQuote(q, rfq.category) : null
                const rounds = new Set(
                  rfq.negotiations.filter((n) => n.vendorId === v.vendorId).map((n) => n.round),
                ).size
                return (
                  <li
                    key={v.vendorId}
                    className="flex items-center justify-between gap-3 text-sm rounded-lg bg-[var(--bg)] px-3 py-2"
                  >
                    <span className="font-medium">{vendor?.name}</span>
                    <span className="text-[var(--ink-soft)]">
                      {rounds} round{rounds === 1 ? '' : 's'} ·{' '}
                      <span className="tnum font-medium text-[var(--ink)]">
                        {enriched ? inr(enriched.landedCost ?? 0) : '—'}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </Card>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-[var(--ink-soft)] bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <span>Vendors invited: {summary.invited}</span>
          <span>Responded: {summary.responded}</span>
          <span>Awaiting: {summary.awaiting}</span>
          <span>No response: {summary.noResponse}</span>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <h3 className="text-sm font-semibold mb-4">Timeline</h3>
          <Timeline steps={steps} />
        </Card>
        <Card>
          <h3 className="text-sm font-semibold mb-2">Key dates</h3>
          <FieldGrid
            fields={[
              { label: 'Response deadline', value: formatDate(rfq.deadline) },
              {
                label: 'Days remaining',
                value:
                  rfq.status === 'awarded' ? (
                    'Closed'
                  ) : (
                    <span className={days < 2 ? 'text-[var(--amber)] font-medium' : ''}>
                      {days} days
                    </span>
                  ),
              },
            ]}
            columns={2}
          />
        </Card>
      </div>
    </div>
  )
}
