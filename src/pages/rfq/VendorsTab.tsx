import { useState } from 'react'
import type { Rfq } from '../../data/types'
import { useStore } from '../../store/StoreContext'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusPill } from '../../components/ui/StatusPill'
import { useToast } from '../../components/ui/Toast'
import { useWorkspace } from '../RfqWorkspace'

interface VendorsTabProps {
  rfq: Rfq
  readOnly: boolean
  onGoTab: (tab: 'overview' | 'vendors' | 'comparison' | 'negotiation' | 'inbox' | 'award') => void
}

export function VendorsTab({ rfq, readOnly, onGoTab }: VendorsTabProps) {
  const { state, dispatch } = useStore()
  const { showToast } = useToast()
  const workspace = useWorkspace()
  const isDraft = rfq.status === 'draft'
  const [selected, setSelected] = useState<string[]>(
    rfq.vendors.length ? rfq.vendors.map((v) => v.vendorId) : [],
  )

  const pool = state.vendors.filter(
    (v) =>
      v.category === rfq.category &&
      (rfq.category === 'chemicals' ||
        (v.region?.includes('Malanpur') && v.subCategory?.includes('FTL'))),
  )

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const sendRfq = () => {
    dispatch({ type: 'DISPATCH_RFQ', rfqId: rfq.id, vendorIds: selected })
    showToast(
      `RFQ emails sent from freight.sourcing@godrejcp.com to ${selected.length} vendors`,
    )
    onGoTab('overview')
  }

  if (isDraft && !readOnly) {
    return (
      <Card>
        <h3 className="text-sm font-semibold mb-2">Select vendors & send RFQ</h3>
        <p className="text-xs text-[var(--ink-soft)] mb-4">
          This is where the Sourcing Manager invites vendors from the pre-mapped pool (not the
          read-only master list under sidebar → Vendors).
        </p>
        <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden mb-4">
          {pool.map((v) => (
            <li key={v.id} className="flex items-center gap-3 p-4 bg-[var(--surface)]">
              <input
                type="checkbox"
                checked={selected.includes(v.id)}
                onChange={() => toggle(v.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{v.name}</div>
                <div className="font-mono text-xs text-[var(--ink-soft)]">
                  {v.code} · {v.email}
                </div>
                <div className="text-xs text-[var(--ink-faint)]">
                  {v.subCategory} · {v.region}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Button disabled={selected.length === 0} onClick={sendRfq}>
          Send RFQ to {selected.length} vendors
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--ink-soft)]">
        Per-vendor response status for this RFQ. Reminders and inbox live here once the RFQ is
        sent.
      </p>
      {rfq.vendors.map((vor) => {
        const v = state.vendors.find((x) => x.id === vor.vendorId)
        const pill =
          vor.responseStatus === 'no_response'
            ? 'no_response'
            : vor.responseStatus === 'late'
              ? 'late'
              : vor.responseStatus === 'incomplete'
                ? 'incomplete'
                : 'responded'
        return (
          <Card key={vor.vendorId} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-medium">{v?.name}</div>
              <div className="font-mono text-xs text-[var(--ink-soft)]">{v?.code}</div>
              <div className="text-xs text-[var(--ink-faint)] mt-1">{v?.email}</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusPill status={pill} />
              {!readOnly && vor.responseStatus === 'no_response' && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={vor.reminded}
                  onClick={() => {
                    dispatch({ type: 'REMIND_VENDOR', rfqId: rfq.id, vendorId: vor.vendorId })
                    showToast(`Reminder sent to ${v?.email}`)
                  }}
                >
                  {vor.reminded ? 'Reminded' : 'Send reminder'}
                </Button>
              )}
              {vor.quotes.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => workspace.setTab('inbox')}>
                  View in Inbox
                </Button>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
