import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { Rfq } from '../../data/types'
import { useStore } from '../../store/StoreContext'
import { findL1, getVendor, latestQuote, enrichQuote } from '../../store/selectors'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { inr, formatDateTime } from '../../lib/format'

interface AwardTabProps {
  rfq: Rfq
  readOnly: boolean
}

export function AwardTab({ rfq, readOnly }: AwardTabProps) {
  const { state, dispatch } = useStore()
  const l1 = findL1(rfq, true)
  const [selectedVendor, setSelectedVendor] = useState(l1?.vendorId ?? '')
  const [justification, setJustification] = useState('')

  const isL1 = selectedVendor === l1?.vendorId
  const minJustLen = isL1 ? 10 : 40
  const canConfirm =
    !readOnly &&
    rfq.status !== 'awarded' &&
    selectedVendor &&
    justification.trim().length >= minJustLen

  const confirm = () => {
    const vor = rfq.vendors.find((v) => v.vendorId === selectedVendor)
    const q = vor ? latestQuote(vor) : undefined
    const enriched = q ? enrichQuote(q, rfq.category) : null
    dispatch({
      type: 'SET_AWARD',
      rfqId: rfq.id,
      award: {
        awardedVendorId: selectedVendor,
        awardedAt: new Date().toISOString(),
        awardedBy: 'Sagarika Singh',
        justification: justification.trim(),
        finalPrice: inr(enriched?.landedCost ?? 0),
        wasL1: isL1,
      },
    })
  }

  if (rfq.award) {
    const vendor = getVendor(state.vendors, rfq.award.awardedVendorId)
    const sourceReq = state.requests.find((r) => r.id === rfq.fromRequestId)
    return (
      <div className="space-y-6 max-w-2xl">
        <Card className="border-[var(--green)]/40">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} className="text-[var(--green)]" />
            <h3 className="text-sm font-semibold text-[var(--green)]">Award confirmed</h3>
          </div>
          <p className="text-lg font-medium">{vendor?.name}</p>
          <p className="font-mono text-xs text-[var(--ink-soft)]">{vendor?.code}</p>
          <p className="tnum text-[var(--accent)] font-semibold mt-2 text-xl">{rfq.award.finalPrice}</p>
          <p className="text-sm text-[var(--ink-soft)] mt-4 leading-relaxed">{rfq.award.justification}</p>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold mb-4">Audit trail</h3>
          <ul className="text-sm space-y-3">
            {[
              { label: 'RFQ created', detail: formatDateTime(rfq.createdAt) },
              {
                label: 'Vendors invited',
                detail: `${rfq.vendors.length} from mapped pool`,
              },
              {
                label: 'Responses received',
                detail: `${rfq.vendors.filter((v) => v.responseStatus !== 'no_response').length} vendors`,
              },
              {
                label: 'Negotiation',
                detail: `${new Set(rfq.negotiations.map((n) => n.round)).size} round(s)`,
              },
              {
                label: 'Awarded',
                detail: `${rfq.award.wasL1 ? 'L1 vendor' : 'Above L1 — justification on file'} · by ${rfq.award.awardedBy} · ${formatDateTime(rfq.award.awardedAt)}`,
              },
            ].map((row) => (
              <li key={row.label} className="flex gap-3">
                <span className="h-2 w-2 rounded-full bg-[var(--green)] mt-1.5 shrink-0" />
                <span>
                  <span className="font-medium">{row.label}</span>
                  <span className="text-[var(--ink-soft)]"> — {row.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {sourceReq && (
          <div className="rounded-lg bg-[var(--green-soft)] px-4 py-3 text-sm text-[var(--green)]">
            Request {sourceReq.id} raised by {sourceReq.createdBy} is now fulfilled.
          </div>
        )}

        <p className="text-sm text-[var(--ink-faint)]">
          Award completed · Sent to procurement execution →
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-xl">
      <Card>
        <h3 className="text-sm font-semibold mb-4">Select winning vendor</h3>
        <div className="space-y-2">
          {rfq.vendors
            .filter((v) => v.quotes.length)
            .map((v) => {
              const vendor = getVendor(state.vendors, v.vendorId)
              const q = latestQuote(v)
              const enriched = q ? enrichQuote(q, rfq.category) : null
              const rowL1 = l1?.vendorId === v.vendorId
              return (
                <label
                  key={v.vendorId}
                  className={[
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer',
                    selectedVendor === v.vendorId
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border)]',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="award"
                    checked={selectedVendor === v.vendorId}
                    onChange={() => setSelectedVendor(v.vendorId)}
                    disabled={readOnly}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{vendor?.name}</div>
                    <div className="tnum text-sm text-[var(--ink-soft)]">
                      {inr(enriched?.landedCost ?? 0)}
                      {rowL1 && <span className="ml-2 text-[var(--accent)]">L1</span>}
                    </div>
                  </div>
                </label>
              )
            })}
        </div>
      </Card>
      {!isL1 && selectedVendor && (
        <p className="text-sm text-[var(--amber)] bg-[var(--amber-soft)] px-4 py-3 rounded-lg">
          Awarding above L1 — justification required (min. 40 characters)
        </p>
      )}
      <Card>
        <label className="text-sm font-medium">Justification</label>
        <textarea
          className="w-full mt-2 border border-[var(--border)] rounded-lg px-3 py-2 text-sm min-h-[100px]"
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          disabled={readOnly}
          placeholder="Document rationale for award decision…"
        />
      </Card>
      {!readOnly && (
        <Button disabled={!canConfirm} onClick={confirm}>
          Confirm Award
        </Button>
      )}
    </div>
  )
}
