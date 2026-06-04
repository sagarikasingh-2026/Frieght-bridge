import type { Rfq } from '../../data/types'
import { CATEGORY_FIELDS } from '../../data/seed'
import { useStore } from '../../store/StoreContext'
import { getVendor } from '../../store/selectors'
import { Card } from '../../components/ui/Card'
import { FieldGrid } from '../../components/ui/FieldGrid'
import { Timeline, type TimelineStep } from '../../components/ui/Timeline'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { daysUntil, formatDate } from '../../lib/format'

interface OverviewTabProps {
  rfq: Rfq
  readOnly: boolean
}

export function OverviewTab({ rfq, readOnly }: OverviewTabProps) {
  const { state, dispatch } = useStore()
  const { showToast } = useToast()

  const responded = rfq.vendors.filter((v) => v.responseStatus === 'responded').length
  const noResp = rfq.vendors.filter((v) => v.responseStatus === 'no_response').length
  const awaiting = rfq.vendors.length - responded - noResp
  const days = daysUntil(rfq.deadline)

  const fields = CATEGORY_FIELDS[rfq.category].map((def) => ({
    label: def.label,
    value: rfq.fields[def.key] ?? '—',
  }))

  const steps: TimelineStep[] = [
    { label: 'RFQ created', detail: formatDate(rfq.createdAt), state: 'done' },
    { label: 'Sent to vendors', detail: `${rfq.vendors.length} invited`, state: 'done' },
    {
      label: 'Responses',
      detail: `${responded}/${rfq.vendors.length} responded`,
      state: responded >= rfq.vendors.length - noResp ? 'done' : 'current',
    },
    {
      label: 'Negotiation',
      detail: rfq.negotiations.length ? `Round ${Math.max(...rfq.negotiations.map((n) => n.round))}` : 'Not started',
      state: rfq.negotiations.length ? 'current' : 'upcoming',
    },
    {
      label: 'Award',
      state: rfq.status === 'awarded' ? 'done' : 'upcoming',
    },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--ink-soft)] max-w-2xl">
        <strong>How responses are tracked:</strong> vendors reply by email → messages appear in{' '}
        <strong>Inbox</strong> → simulated AI extracts quote fields → structured rows show on{' '}
        <strong>Comparison</strong>. Status pills here reflect who has quoted, is late, or has not
        replied.
      </p>
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
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
        <div className="flex flex-wrap gap-4 text-sm text-[var(--ink-soft)] bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <span>Vendors invited: {rfq.vendors.length}</span>
          <span>Responded: {responded}</span>
          <span>Awaiting: {awaiting}</span>
          <span>No response: {noResp}</span>
        </div>
        {noResp > 0 && !readOnly && (
          <div className="space-y-2">
            {rfq.vendors
              .filter((v) => v.responseStatus === 'no_response')
              .map((v) => {
                const vendor = getVendor(state.vendors, v.vendorId)
                return (
                  <div
                    key={v.vendorId}
                    className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                  >
                    <span className="text-sm">{vendor?.name}</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={v.reminded}
                      onClick={() => {
                        dispatch({ type: 'REMIND_VENDOR', rfqId: rfq.id, vendorId: v.vendorId })
                        showToast(`Reminder sent to ${vendor?.email}`)
                      }}
                    >
                      {v.reminded ? 'Reminded' : 'Send reminder'}
                    </Button>
                  </div>
                )
              })}
          </div>
        )}
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
                value: (
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
    </div>
  )
}
