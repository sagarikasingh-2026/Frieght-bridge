import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, FileText, Inbox, MessageSquare, Trophy } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { Card } from '../components/ui/Card'
import { StatusPill } from '../components/ui/StatusPill'
import { rfqStatusToPill } from '../lib/rfqStatus'
import { responseSummary } from '../store/selectors'
import { formatDate } from '../lib/format'

export function Dashboard() {
  const { state } = useStore()
  const navigate = useNavigate()

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
            const s = responseSummary(r)
            return acc + s.responded / Math.max(s.invited, 1)
          }, 0) / state.rfqs.length
        ).toFixed(1)
      : '0'

  const funnel = [
    { label: 'Requests pending', count: pendingReq, icon: Inbox, to: '/requests' },
    { label: 'RFQs out (awaiting)', count: awaiting, icon: FileText, to: '/rfqs' },
    { label: 'Under negotiation', count: negotiating, icon: MessageSquare, to: '/rfqs' },
    { label: 'Awarded', count: awarded, icon: Trophy, to: '/rfqs' },
  ]

  const kpis = [
    { label: 'Open RFQs', value: state.rfqs.filter((r) => r.status !== 'awarded').length },
    { label: 'Awaiting responses', value: awaiting },
    { label: 'Avg responses / RFQ', value: avgResp },
    { label: 'Awarded', value: awarded },
  ]

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <div className="text-[11px] uppercase tracking-[0.04em] text-[var(--ink-faint)]">
              {k.label}
            </div>
            <div className="text-3xl font-display font-semibold tnum mt-1">{k.value}</div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-sm font-semibold mb-4">Sourcing pipeline</h3>
        <div className="grid sm:grid-cols-4 gap-3">
          {funnel.map((s, i) => {
            const Icon = s.icon
            return (
              <Link
                key={s.label}
                to={s.to}
                className="relative p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all group"
              >
                <Icon size={16} className="text-[var(--ink-faint)] group-hover:text-[var(--accent)]" />
                <div className="text-2xl font-semibold text-[var(--accent)] tnum mt-2">{s.count}</div>
                <div className="text-xs text-[var(--ink-soft)] mt-1">{s.label}</div>
                {i < funnel.length - 1 && (
                  <ArrowRight
                    size={14}
                    className="hidden sm:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] z-10 bg-[var(--surface)]"
                  />
                )}
              </Link>
            )
          })}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold mb-3">Active RFQs</h3>
        <ul className="divide-y divide-[var(--border)]">
          {state.rfqs.map((r) => {
            const s = responseSummary(r)
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/rfqs/${r.id}`)}
                  className="w-full flex items-center justify-between gap-3 py-3 text-left hover:bg-[var(--bg)] rounded-lg px-2 -mx-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[var(--ink-soft)]">{r.id}</span>
                      <StatusPill status={rfqStatusToPill(r.status)} />
                    </div>
                    <div className="text-sm font-medium mt-0.5 truncate">{r.title}</div>
                  </div>
                  <div className="text-xs text-[var(--ink-faint)] shrink-0 text-right">
                    {s.responded}/{s.invited} responded
                    <div>{formatDate(r.createdAt)}</div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
