import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { ExtractedField, Rfq } from '../../data/types'
import { useStore } from '../../store/StoreContext'
import {
  enrichQuote,
  findL1,
  getVendor,
  latestQuote,
  quoteAtVersion,
} from '../../store/selectors'
import { inr, formatDate } from '../../lib/format'
import { StatusPill } from '../../components/ui/StatusPill'
import { ConfidenceDot } from '../../components/ui/ConfidenceDot'
import { Pill } from '../../components/ui/Pill'
import { Button } from '../../components/ui/Button'
import { rfqStatusToPill } from '../../lib/rfqStatus'

interface ComparisonTabProps {
  rfq: Rfq
  readOnly: boolean
  onAward: () => void
  onNegotiate: () => void
  onOpenInbox: (emailId?: string) => void
}

type EditableField = 'basePrice' | 'taxes' | 'freight' | 'leadTime' | 'paymentTerms' | 'validity'

function CellValue({
  field,
  extractionFailed,
  onOpenInbox,
  emailId,
}: {
  field: ExtractedField
  extractionFailed?: boolean
  onOpenInbox?: () => void
}) {
  if (extractionFailed) {
    return (
      <button
        type="button"
        onClick={onOpenInbox}
        className="text-xs text-[var(--red)] hover:underline text-left"
      >
        Extraction failed — open in Inbox
      </button>
    )
  }
  if (!field.value?.trim()) {
    return (
      <span className="text-[11px] uppercase tracking-[0.04em] text-[var(--amber)] bg-[var(--amber-soft)] px-2 py-0.5 rounded-full">
        Needs review
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <ConfidenceDot confidence={field.confidence} />
      <span>{field.value}</span>
    </span>
  )
}

export function ComparisonTab({
  rfq,
  readOnly,
  onAward,
  onNegotiate,
  onOpenInbox,
}: ComparisonTabProps) {
  const { state, dispatch } = useStore()
  const [showNegotiated, setShowNegotiated] = useState(true)
  const [editing, setEditing] = useState<{
    vendorId: string
    versionNo: number
    field: EditableField
  } | null>(null)

  const l1 = findL1(rfq, showNegotiated)

  const responsePill = (status: string) => {
    if (status === 'no_response') return 'no_response' as const
    if (status === 'late') return 'late' as const
    if (status === 'incomplete') return 'incomplete' as const
    return 'responded' as const
  }

  return (
    <div className="pb-28">
      <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-[var(--bg)]/95 border-b border-[var(--border)] mb-6 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-mono font-medium">{rfq.id}</span>
          <span className="text-[var(--ink-faint)]">·</span>
          <span className="font-medium flex items-center gap-1">
            {rfq.fields.origin}
            <ArrowRight size={14} className="text-[var(--accent)]" />
            {rfq.fields.destination}
          </span>
          <span className="text-[var(--ink-faint)] hidden sm:inline">·</span>
          <span className="text-xs text-[var(--ink-soft)] hidden sm:inline">
            {rfq.fields.vehicleType?.split(' ').slice(-2).join(' ') ?? rfq.fields.vehicleType}
          </span>
          <span className="text-xs text-[var(--ink-soft)]">{rfq.fields.frequency}</span>
          <span className="text-xs text-[var(--ink-soft)]">Due {formatDate(rfq.deadline)}</span>
          <StatusPill status={rfqStatusToPill(rfq.status)} />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-[var(--ink-soft)] cursor-pointer">
          <input
            type="checkbox"
            checked={showNegotiated}
            onChange={(e) => setShowNegotiated(e.target.checked)}
            className="accent-[var(--accent)]"
          />
          Show negotiated prices
        </label>
      </div>

      <div className="overflow-x-auto border border-[var(--border)] rounded-xl bg-[var(--surface)]">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[11px] uppercase tracking-[0.04em] text-[var(--ink-faint)]">
              <th className="p-4 font-medium">Vendor</th>
              <th className="p-4 font-medium">Base / Rate</th>
              <th className="p-4 font-medium">Taxes</th>
              <th className="p-4 font-medium">Freight</th>
              <th className="p-4 font-medium">Landed cost</th>
              <th className="p-4 font-medium">Lead time</th>
              <th className="p-4 font-medium">Payment</th>
              <th className="p-4 font-medium">Validity</th>
              <th className="p-4 font-medium">Deviations</th>
            </tr>
          </thead>
          <tbody>
            {rfq.vendors.map((vor, rowIdx) => {
              const vendor = getVendor(state.vendors, vor.vendorId)
              const v1 = quoteAtVersion(vor, 1)
              const quoteRaw = showNegotiated
                ? latestQuote(vor)
                : v1 ?? latestQuote(vor)
              const quote = quoteRaw ? enrichQuote(quoteRaw, rfq.category) : undefined
              const isL1 = l1 && vor.vendorId === l1.vendorId && quote && (quote.landedCost ?? 0) > 0
              const failed = quote?.extractionStatus === 'manual_review'
              const v1Cost = v1 ? enrichQuote(v1, rfq.category).landedCost : undefined

              const renderEditableCell = (fieldKey: EditableField) => {
                if (!quote) return null
                const field = quote[fieldKey] as ExtractedField
                const isEditing =
                  editing?.vendorId === vor.vendorId &&
                  editing.versionNo === quote.versionNo &&
                  editing.field === fieldKey
                return (
                  <td key={fieldKey} className="p-4 align-top">
                    {isEditing && !readOnly ? (
                      <input
                        autoFocus
                        className="w-full border border-[var(--accent)] rounded-lg px-2 py-1 text-sm"
                        defaultValue={field.value}
                        onBlur={(e) => {
                          dispatch({
                            type: 'UPDATE_EXTRACTED_FIELD',
                            rfqId: rfq.id,
                            vendorId: vor.vendorId,
                            versionNo: quote.versionNo,
                            field: fieldKey,
                            value: e.target.value,
                          })
                          setEditing(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        disabled={readOnly || failed}
                        onClick={() =>
                          !readOnly &&
                          !failed &&
                          setEditing({
                            vendorId: vor.vendorId,
                            versionNo: quote.versionNo,
                            field: fieldKey,
                          })
                        }
                        className={[
                          'text-left w-full',
                          !readOnly && !failed ? 'hover:bg-[var(--bg)] rounded px-1 -mx-1' : '',
                        ].join(' ')}
                      >
                        <CellValue
                          field={field}
                          extractionFailed={failed && fieldKey === 'basePrice'}
                          onOpenInbox={() => onOpenInbox(quote.rawEmailId)}
                        />
                      </button>
                    )}
                  </td>
                )
              }

              return (
                <motion.tr
                  key={vor.vendorId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIdx * 0.04 }}
                  className={[
                    'border-b border-[var(--border)] last:border-0',
                    isL1 ? 'bg-[var(--accent-soft)]/60' : '',
                  ].join(' ')}
                >
                  <td className="p-4 align-top">
                    <div className="font-medium text-[var(--ink)]">{vendor?.name}</div>
                    <div className="font-mono text-xs text-[var(--ink-soft)] mt-0.5">{vendor?.code}</div>
                    <div className="mt-2">
                      <StatusPill status={responsePill(vor.responseStatus)} />
                    </div>
                    {isL1 && (
                      <Pill tone="accent" className="mt-2">
                        L1
                      </Pill>
                    )}
                  </td>
                  {vor.responseStatus === 'no_response' ? (
                    <td colSpan={8} className="p-4 text-[var(--ink-faint)]">
                      No response yet
                    </td>
                  ) : !quote ? (
                    <td colSpan={8} className="p-4 text-[var(--ink-faint)]">—</td>
                  ) : (
                    <>
                      {(['basePrice', 'taxes', 'freight'] as EditableField[]).map((fieldKey) =>
                        renderEditableCell(fieldKey),
                      )}
                      <td className="p-4 align-top font-semibold tnum">
                        {(quote.landedCost ?? 0) > 0 ? (
                          <div>
                            {inr(quote.landedCost ?? 0)}
                            {showNegotiated &&
                              quote.versionNo > 1 &&
                              v1Cost != null &&
                              v1Cost !== quote.landedCost && (
                                <div className="text-[10px] font-normal text-[var(--ink-soft)] mt-1">
                                  v{quote.versionNo} ↓ from {inr(v1Cost)}
                                </div>
                              )}
                          </div>
                        ) : (
                          <CellValue
                            field={{ value: '', confidence: 'missing' }}
                            extractionFailed={failed}
                            onOpenInbox={() => onOpenInbox(quote.rawEmailId)}
                          />
                        )}
                      </td>
                      {(['leadTime', 'paymentTerms', 'validity'] as EditableField[]).map((fieldKey) =>
                        renderEditableCell(fieldKey),
                      )}
                      <td className="p-4 align-top">
                        {quote.deviations.length ? (
                          <div className="flex flex-col gap-1">
                            {quote.deviations.map((d, i) => (
                              <Pill key={i} tone="amber">
                                {d}
                              </Pill>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[var(--ink-faint)]">—</span>
                        )}
                      </td>
                    </>
                  )}
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="fixed bottom-0 left-60 right-0 z-20 border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <div className="text-sm">
          {l1 ? (
            <>
              <span className="text-[var(--ink-soft)]">Current L1: </span>
              <span className="font-medium">{getVendor(state.vendors, l1.vendorId)?.name}</span>
              <span className="tnum font-semibold text-[var(--accent)] ml-2">
                {inr(l1.landedCost)}
              </span>
            </>
          ) : (
            <span className="text-[var(--ink-soft)]">L1 not determined yet</span>
          )}
          <div className="text-xs text-[var(--ink-faint)] mt-0.5">Supports line-item award</div>
        </div>
        {!readOnly && rfq.status !== 'awarded' && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onNegotiate}>
              Send counter-offer
            </Button>
            <Button onClick={onAward}>Award RFQ</Button>
          </div>
        )}
      </div>
    </div>
  )
}
