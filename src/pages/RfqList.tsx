import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { Card } from '../components/ui/Card'
import { StatusPill } from '../components/ui/StatusPill'
import { rfqStatusToPill } from '../lib/rfqStatus'
import { findL1, getVendor, responseSummary } from '../store/selectors'
import { formatDate, inr } from '../lib/format'

export function RfqList() {
  const { state } = useStore()
  const rfqs = [...state.rfqs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--ink-soft)]">
        {state.role === 'sourcing_manager'
          ? 'Manage RFQs from dispatch through award.'
          : 'View RFQ status (read-only).'}
      </p>
      <div className="space-y-3">
        {rfqs.map((rfq, i) => {
          const summary = responseSummary(rfq)
          const l1 = findL1(rfq, true)
          return (
            <motion.div
              key={rfq.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={`/rfqs/${rfq.id}`}>
                <Card className="hover:border-[var(--accent)] hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs text-[var(--ink-soft)]">{rfq.id}</span>
                        <StatusPill status={rfqStatusToPill(rfq.status)} />
                        <span className="text-[11px] uppercase tracking-[0.04em] px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                          {rfq.category}
                        </span>
                      </div>
                      <h2 className="text-base font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]">
                        {rfq.title}
                      </h2>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--ink-faint)] mt-2">
                        <span>{summary.responded}/{summary.invited} responded</span>
                        {l1 && (
                          <span>
                            L1 {getVendor(state.vendors, l1.vendorId)?.name} ·{' '}
                            <span className="tnum text-[var(--accent)] font-medium">
                              {inr(l1.landedCost)}
                            </span>
                          </span>
                        )}
                        {rfq.award && (
                          <span className="text-[var(--green)]">
                            Awarded · {getVendor(state.vendors, rfq.award.awardedVendorId)?.name}
                          </span>
                        )}
                        <span>Deadline {formatDate(rfq.deadline)}</span>
                      </div>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-[var(--ink-faint)] group-hover:text-[var(--accent)] shrink-0 mt-1"
                    />
                  </div>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
