import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileSpreadsheet, FileText } from 'lucide-react'
import type { ExtractedField, QuoteVersion, Rfq } from '../../data/types'
import { useStore } from '../../store/StoreContext'
import { extractionFieldSummary, getVendor } from '../../store/selectors'
import { getSeededExtraction, simulateExtraction } from '../../lib/extraction'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ConfidenceDot } from '../../components/ui/ConfidenceDot'
import { useToast } from '../../components/ui/Toast'
import { formatDateTime } from '../../lib/format'

interface InboxTabProps {
  rfq: Rfq
  readOnly: boolean
  focusEmailId: string | null
}

const FIELD_LABELS: { key: keyof QuoteVersion; label: string }[] = [
  { key: 'basePrice', label: 'Base / Rate' },
  { key: 'taxes', label: 'Taxes' },
  { key: 'freight', label: 'Freight' },
  { key: 'leadTime', label: 'Lead time' },
  { key: 'paymentTerms', label: 'Payment terms' },
  { key: 'validity', label: 'Validity' },
]

export function InboxTab({ rfq, readOnly, focusEmailId }: InboxTabProps) {
  const { state, dispatch } = useStore()
  const { showToast } = useToast()
  const [selectedId, setSelectedId] = useState(rfq.emails[0]?.id ?? '')
  const [extracting, setExtracting] = useState(false)
  const [draft, setDraft] = useState<QuoteVersion | null>(null)

  useEffect(() => {
    if (focusEmailId) setSelectedId(focusEmailId)
  }, [focusEmailId])

  const email = rfq.emails.find((e) => e.id === selectedId)
  const vendor = email ? getVendor(state.vendors, email.vendorId) : undefined

  const runExtraction = async () => {
    if (!email) return
    setExtracting(true)
    const result = await simulateExtraction(rfq, email.id)
    setExtracting(false)
    if (result) setDraft(result)
  }

  useEffect(() => {
    if (!email) return
    const seeded = getSeededExtraction(rfq, email)
    if (email.extractionApplied && seeded) setDraft(seeded)
    else if (!email.extractionApplied) setDraft(null)
    else setDraft(seeded)
  }, [email, rfq])

  const updateDraftField = (field: string, value: string) => {
    if (!draft) return
    const f = draft[field as keyof QuoteVersion] as ExtractedField
    if (f && typeof f === 'object' && 'value' in f) {
      setDraft({
        ...draft,
        [field]: { ...f, value, confidence: value ? 'high' : f.confidence, edited: true },
      })
    }
  }

  const applyToComparison = () => {
    if (!draft || !email) return
    dispatch({ type: 'APPLY_EXTRACTION', rfqId: rfq.id, emailId: email.id, quote: draft })
    showToast('Quote applied to comparison matrix')
  }

  if (rfq.emails.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold mb-2">No vendor emails yet</h3>
        <p className="text-sm text-[var(--ink-soft)]">
          This RFQ has been sent and is awaiting responses. Vendor replies are captured here
          automatically; the simulated extraction bot then structures each quote into the
          comparison matrix.
        </p>
      </Card>
    )
  }

  return (
    <div className="grid lg:grid-cols-5 gap-4 min-h-[480px]">
      <Card padding={false} className="lg:col-span-2 overflow-hidden">
        <div className="p-3 border-b border-[var(--border)] text-xs font-medium uppercase tracking-[0.04em] text-[var(--ink-faint)]">
          Captured emails
        </div>
        <ul className="divide-y divide-[var(--border)] max-h-[520px] overflow-y-auto">
          {rfq.emails.map((em) => {
            const v = getVendor(state.vendors, em.vendorId)
            return (
              <li key={em.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(em.id)}
                  className={[
                    'w-full text-left p-4 hover:bg-[var(--bg)] transition-colors',
                    selectedId === em.id ? 'bg-[var(--accent-soft)]' : '',
                  ].join(' ')}
                >
                  <div className="text-sm font-medium">{v?.name}</div>
                  <div className="text-xs text-[var(--ink-soft)] truncate mt-0.5">{em.subject}</div>
                  <div className="text-xs text-[var(--ink-faint)] mt-1">{formatDateTime(em.receivedAt)}</div>
                  {em.attachments.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {em.attachments.map((a) => (
                        <span
                          key={a.name}
                          className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)]"
                        >
                          {a.type === 'pdf' ? <FileText size={10} /> : <FileSpreadsheet size={10} />}
                          {a.name}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </Card>

      {email && (
        <>
          <Card className="lg:col-span-2">
            <h3 className="text-sm font-semibold mb-2">Raw email</h3>
            <p className="text-xs text-[var(--ink-faint)] mb-3">
              From: {vendor?.email} · {formatDateTime(email.receivedAt)}
            </p>
            <pre className="text-sm whitespace-pre-wrap font-sans text-[var(--ink-soft)] leading-relaxed">
              {email.body}
            </pre>
            {email.attachments.map((a) => (
              <div
                key={a.name}
                className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] text-sm"
              >
                {a.type === 'pdf' ? <FileText size={16} /> : <FileSpreadsheet size={16} />}
                {a.name}
              </div>
            ))}
          </Card>

          <Card className="lg:col-span-1 relative overflow-hidden">
            <h3 className="text-sm font-semibold mb-3">Extracted quote</h3>
            {extracting && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent-soft)] to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
            )}
            {!draft && !extracting && (
              <Button onClick={runExtraction} disabled={readOnly}>
                Run extraction
              </Button>
            )}
            {draft && (
              <div className="space-y-3 relative">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={[
                      'text-[11px] uppercase tracking-[0.04em] px-2 py-0.5 rounded-full',
                      draft.extractionStatus === 'success'
                        ? 'bg-[var(--green-soft)] text-[var(--green)]'
                        : draft.extractionStatus === 'partial'
                          ? 'bg-[var(--amber-soft)] text-[var(--amber)]'
                          : 'bg-[var(--red-soft)] text-[var(--red)]',
                    ].join(' ')}
                  >
                    {draft.extractionStatus.replace('_', ' ')}
                  </span>
                </div>
                {(() => {
                  const s = extractionFieldSummary(draft)
                  return (
                    <p className="text-[11px] text-[var(--ink-soft)]">
                      {s.high} of {s.high + s.review + s.missing} fields high-confidence
                      {s.review > 0 && ` · ${s.review} needs review`}
                      {s.missing > 0 && ` · ${s.missing} missing`}
                    </p>
                  )
                })()}
                {FIELD_LABELS.map(({ key, label }, i) => {
                  const field = draft[key] as ExtractedField
                  if (!field || typeof field !== 'object' || !('value' in field)) return null
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] uppercase text-[var(--ink-faint)]">{label}</label>
                        {field.edited && (
                          <span className="text-[9px] uppercase tracking-[0.04em] text-[var(--ink-faint)] border border-[var(--border)] rounded px-1">
                            edited
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <ConfidenceDot confidence={field.confidence} />
                        <input
                          className="flex-1 border border-[var(--border)] rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                          value={field.value}
                          disabled={readOnly}
                          onChange={(e) => updateDraftField(key, e.target.value)}
                        />
                      </div>
                      {field.sourceText && (
                        <p className="text-[10px] text-[var(--ink-faint)] mt-1 italic">
                          from: “{field.sourceText}”
                        </p>
                      )}
                    </motion.div>
                  )
                })}
                {!readOnly && (
                  <Button className="w-full mt-4" onClick={applyToComparison}>
                    Apply to comparison
                  </Button>
                )}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
