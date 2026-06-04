import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { Card } from '../components/ui/Card'
import { formatDate } from '../lib/format'

export function Dashboard() {
  const { state } = useStore()

  const pendingReq = state.requests.filter((r) => r.status === 'pending_review').length
  const awaiting = state.rfqs.filter((r) =>
    ['sent', 'awaiting_responses', 'partially_responded'].includes(r.status),
  ).length
  const negotiating = state.rfqs.filter((r) => r.status === 'under_negotiation').length
  const awarded = state.rfqs.filter((r) => r.status === 'awarded').length
  const avgResp =
    state.rfqs.length > 0
      ? (
          state.rfqs.reduce((acc, r) => {
            const resp = r.vendors.filter((v) => v.responseStatus === 'responded').length
            return acc + resp / Math.max(r.vendors.length, 1)
          }, 0) / state.rfqs.length
        ).toFixed(1)
      : '0'

  const stages = [
    { label: 'Requests pending', count: pendingReq, to: '/requests' },
    { label: 'Awaiting responses', count: awaiting, to: '/rfqs' },
    { label: 'Under negotiation', count: negotiating, to: '/rfqs' },
    { label: 'Awarded', count: awarded, to: '/rfqs' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open RFQs', value: state.rfqs.filter((r) => r.status !== 'awarded').length },
          { label: 'Awaiting responses', value: awaiting },
          { label: 'Avg responses / RFQ', value: avgResp },
          { label: 'Awarded this month', value: awarded },
        ].map((k) => (
          <Card key={k.label}>
            <div className="text-[11px] uppercase tracking-[0.04em] text-[var(--ink-faint)]">
              {k.label}
            </div>
            <div className="text-2xl font-semibold tnum mt-1">{k.value}</div>
          </Card>
        ))}
      </div>
      <Card>
        <h3 className="text-sm font-semibold mb-4">Pipeline</h3>
        <div className="grid sm:grid-cols-4 gap-4">
          {stages.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              className="p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] text-center"
            >
              <div className="text-2xl font-semibold text-[var(--accent)]">{s.count}</div>
              <div className="text-xs text-[var(--ink-soft)] mt-1">{s.label}</div>
            </Link>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-semibold mb-3">Recent activity</h3>
        <ul className="text-sm space-y-2 text-[var(--ink-soft)]">
          {state.rfqs.slice(0, 3).map((r) => (
            <li key={r.id}>
              <Link to={`/rfqs/${r.id}`} className="text-[var(--accent)] hover:underline">
                {r.id}
              </Link>{' '}
              — {r.title} · {formatDate(r.createdAt)}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
