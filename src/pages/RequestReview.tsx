import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CATEGORY_FIELDS } from '../data/seed'
import { useStore } from '../store/StoreContext'
import { Card } from '../components/ui/Card'
import { FieldGrid } from '../components/ui/FieldGrid'
import { Button } from '../components/ui/Button'
import { StatusPill } from '../components/ui/StatusPill'

export function RequestReview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useStore()
  const [note, setNote] = useState('')
  const [showRfqModal, setShowRfqModal] = useState(false)
  const [deadline, setDeadline] = useState('2026-06-20')

  const req = state.requests.find((r) => r.id === id)
  const isSm = state.role === 'sourcing_manager'

  if (!req) {
    return <p>Request not found</p>
  }

  const fields = CATEGORY_FIELDS[req.category].map((d) => ({
    label: d.label,
    value: req.fields[d.key] ?? '—',
  }))

  const approve = () => {
    dispatch({
      type: 'UPDATE_REQUEST',
      request: { ...req, status: 'approved' },
    })
  }

  const sendBack = () => {
    dispatch({
      type: 'UPDATE_REQUEST',
      request: { ...req, status: 'sent_back', reviewNote: note },
    })
    setNote('')
  }

  const createRfq = () => {
    const rfqId = `RFQ-2026-${String(50 + state.rfqs.length).padStart(4, '0')}`
    const title =
      req.category === 'freight'
        ? `${req.fields.origin} → ${req.fields.destination} · ${req.fields.frequency}`
        : `${req.fields.material} · ${req.fields.location}`
    dispatch({
      type: 'ADD_RFQ',
      rfq: {
        id: rfqId,
        category: req.category,
        status: 'draft',
        fromRequestId: req.id,
        title,
        fields: req.fields,
        terms: { paymentTerms: '30 days from invoice', validityRequired: '15 days' },
        deadline: new Date(deadline).toISOString(),
        createdAt: new Date().toISOString(),
        vendors: [],
        negotiations: [],
        emails: [],
      },
    })
    setShowRfqModal(false)
    navigate(`/rfqs/${rfqId}`)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex gap-2 items-center">
        <StatusPill
          status={
            req.status === 'approved'
              ? 'approved'
              : req.status === 'pending_review'
                ? 'pending_review'
                : 'sent_back'
          }
        />
        <span className="text-sm text-[var(--ink-soft)]">{req.createdBy}</span>
      </div>
      <Card>
        <FieldGrid fields={fields} columns={2} />
      </Card>
      {req.reviewNote && (
        <p className="text-sm text-[var(--amber)] bg-[var(--amber-soft)] p-3 rounded-lg">
          {req.reviewNote}
        </p>
      )}
      {isSm && req.status === 'pending_review' && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={approve}>Approve</Button>
          <Button variant="secondary" onClick={sendBack}>
            Send back
          </Button>
          <input
            className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
            placeholder="Note if sending back"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      )}
      {isSm && req.status === 'approved' && !state.rfqs.some((r) => r.fromRequestId === req.id) && (
        <Button onClick={() => setShowRfqModal(true)}>Create RFQ</Button>
      )}
      {state.rfqs.some((r) => r.fromRequestId === req.id) && (
        <Link to={`/rfqs/${state.rfqs.find((r) => r.fromRequestId === req.id)?.id}`} className="text-[var(--accent)] text-sm">
          Open RFQ →
        </Link>
      )}
      {showRfqModal && (
        <Card className="fixed inset-0 m-auto max-w-md h-fit z-50 shadow-lg top-24">
          <h3 className="font-semibold mb-4">Create RFQ</h3>
          <p className="text-sm text-[var(--ink-soft)] mb-4">
            Spec fields pre-filled from request. Set deadline and review template.
          </p>
          <label className="text-sm">Response deadline</label>
          <input
            type="date"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 mt-1 mb-4"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <div className="text-xs bg-[var(--bg)] p-3 rounded-lg border border-[var(--border)] mb-4 font-mono">
            Subject: RFQ {req.fields.origin}-{req.fields.destination} — Godrej
          </div>
          <div className="flex gap-2">
            <Button onClick={createRfq}>Create &amp; select vendors</Button>
            <Button variant="ghost" onClick={() => setShowRfqModal(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
