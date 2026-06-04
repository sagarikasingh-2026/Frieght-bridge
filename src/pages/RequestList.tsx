import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { Card } from '../components/ui/Card'
import { StatusPill } from '../components/ui/StatusPill'
import { Button } from '../components/ui/Button'
import { formatDate } from '../lib/format'
import type { StatusVariant } from '../components/ui/StatusPill'

const reqStatus: Record<string, StatusVariant> = {
  draft: 'draft',
  pending_review: 'pending_review',
  approved: 'approved',
  sent_back: 'sent_back',
}

export function RequestList() {
  const { state } = useStore()
  const isProcurement = state.role === 'procurement'

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-[var(--ink-soft)]">
          {isProcurement ? 'Your sourcing requests' : 'Incoming requests for review'}
        </p>
        {isProcurement && (
          <Link to="/requests/new">
            <Button size="sm">
              <Plus size={14} />
              New request
            </Button>
          </Link>
        )}
      </div>
      {state.requests.map((req) => (
        <Link key={req.id} to={`/requests/${req.id}`}>
          <Card className="hover:border-[var(--accent)] transition-colors mb-3 block">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="font-mono text-xs text-[var(--ink-soft)]">{req.id}</span>
              <StatusPill status={reqStatus[req.status]} />
              <span className="text-[11px] uppercase tracking-[0.04em] px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                {req.category}
              </span>
            </div>
            <p className="font-medium">
              {req.category === 'freight'
                ? `${req.fields.origin} → ${req.fields.destination}`
                : req.fields.material}
            </p>
            <p className="text-xs text-[var(--ink-faint)] mt-1">
              {req.createdBy} · {formatDate(req.createdAt)}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  )
}
