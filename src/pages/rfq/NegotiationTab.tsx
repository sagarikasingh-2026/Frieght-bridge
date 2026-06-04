import { useState } from 'react'
import type { Rfq } from '../../data/types'
import { useStore } from '../../store/StoreContext'
import { getVendor, latestQuote, enrichQuote } from '../../store/selectors'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { inr } from '../../lib/format'
import { formatDateTime } from '../../lib/format'

interface NegotiationTabProps {
  rfq: Rfq
  readOnly: boolean
}

export function NegotiationTab({ rfq, readOnly }: NegotiationTabProps) {
  const { state, dispatch } = useStore()
  const [vendorId, setVendorId] = useState(rfq.vendors[0]?.vendorId ?? '')
  const [price, setPrice] = useState('')
  const [note, setNote] = useState('')

  const vendorsWithQuotes = rfq.vendors.filter((v) => v.quotes.length > 0)
  const vor = rfq.vendors.find((v) => v.vendorId === vendorId)
  const latest = vor ? latestQuote(vor) : undefined
  const position = latest ? enrichQuote(latest, rfq.category) : null

  const sendCounter = () => {
    if (!vendorId || readOnly) return
    const round = Math.max(0, ...rfq.negotiations.filter((n) => n.vendorId === vendorId).map((n) => n.round)) + 1
    dispatch({
      type: 'ADD_NEGOTIATION',
      rfqId: rfq.id,
      event: {
        id: `NEG-${Date.now()}`,
        vendorId,
        round,
        type: 'counter_sent',
        at: new Date().toISOString(),
        message: note || `Target price ${price}`,
        priceAtEvent: price,
      },
    })
    setNote('')
    setPrice('')

    if (vendorId === 'VEN-FR-002') {
      setTimeout(() => {
        dispatch({
          type: 'ADD_VENDOR_QUOTE',
          rfqId: rfq.id,
          vendorId: 'VEN-FR-002',
          quote: {
            versionNo: 2,
            receivedAt: new Date().toISOString(),
            source: 'email_body',
            extractionStatus: 'success',
            basePrice: { value: '₹97,000', confidence: 'high' },
            taxes: { value: '₹11,640', confidence: 'high' },
            freight: { value: '—', confidence: 'high' },
            leadTime: { value: '4 days', confidence: 'high' },
            paymentTerms: { value: '30 days', confidence: 'high' },
            validity: { value: '12 days', confidence: 'high' },
            deviations: [],
            rawEmailId: 'EM-ECM-001',
            isCounterResponse: true,
          },
        })
        dispatch({
          type: 'ADD_NEGOTIATION',
          rfqId: rfq.id,
          event: {
            id: `NEG-${Date.now()}-r`,
            vendorId: 'VEN-FR-002',
            round,
            type: 'vendor_revised',
            at: new Date().toISOString(),
            message: 'Revised per your counter — best effort rate attached.',
            priceAtEvent: '₹1,08,640',
          },
        })
      }, 2000)
    }
  }

  return (
    <div className="space-y-6">
      {vendorsWithQuotes.map((v) => {
        const vendor = getVendor(state.vendors, v.vendorId)
        const q = latestQuote(v)
        const enriched = q ? enrichQuote(q, rfq.category) : null
        const thread = rfq.negotiations
          .filter((n) => n.vendorId === v.vendorId)
          .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())

        if (!thread.length && v.vendorId !== 'VEN-FR-002') return null

        return (
          <Card key={v.vendorId}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{vendor?.name}</h3>
                {enriched && (
                  <p className="text-sm text-[var(--ink-soft)] mt-1">
                    Latest position:{' '}
                    <span className="tnum font-medium text-[var(--ink)]">
                      {inr(enriched.landedCost ?? 0)}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {thread.map((ev) => (
                <div
                  key={ev.id}
                  className={[
                    'max-w-[85%] rounded-xl px-4 py-3 text-sm',
                    ev.type === 'counter_sent'
                      ? 'ml-auto bg-[var(--accent-soft)] text-[var(--ink)]'
                      : 'bg-[var(--bg)] border border-[var(--border)]',
                  ].join(' ')}
                >
                  <div className="text-[10px] uppercase tracking-[0.04em] text-[var(--ink-faint)] mb-1">
                    Round {ev.round} · {ev.type === 'counter_sent' ? 'You' : vendor?.name} ·{' '}
                    {formatDateTime(ev.at)}
                  </div>
                  <p>{ev.message}</p>
                  {ev.priceAtEvent && (
                    <p className="tnum font-medium mt-2 text-[var(--accent)]">{ev.priceAtEvent}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )
      })}

      {!readOnly && rfq.status !== 'awarded' && (
        <Card>
          <h3 className="text-sm font-semibold mb-3">Send counter-offer</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <select
              className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            >
              {vendorsWithQuotes.map((v) => (
                <option key={v.vendorId} value={v.vendorId}>
                  {getVendor(state.vendors, v.vendorId)?.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Target price (e.g. ₹1,00,000)"
              className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <textarea
            placeholder="Note to vendor"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm min-h-[80px] mb-3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {position && (
            <p className="text-xs text-[var(--ink-soft)] mb-3">
              Current: {inr(position.landedCost ?? 0)}
            </p>
          )}
          <Button onClick={sendCounter}>Send counter</Button>
        </Card>
      )}
    </div>
  )
}
