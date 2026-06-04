import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { getRfq } from '../store/selectors'
import { Tabs } from '../components/ui/Tabs'
import { RfqHeader, type WorkspaceTab } from '../components/rfq/RfqHeader'
import type { Rfq } from '../data/types'
import { OverviewTab } from './rfq/OverviewTab'
import { VendorsTab } from './rfq/VendorsTab'
import { ComparisonTab } from './rfq/ComparisonTab'
import { NegotiationTab } from './rfq/NegotiationTab'
import { InboxTab } from './rfq/InboxTab'
import { AwardTab } from './rfq/AwardTab'

interface WorkspaceCtx {
  tab: WorkspaceTab
  setTab: (t: WorkspaceTab) => void
  focusEmailId: string | null
  openInbox: (emailId?: string) => void
}

const WorkspaceContext = createContext<WorkspaceCtx | null>(null)

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace inside RfqWorkspace only')
  return ctx
}

const TAB_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'award', label: 'Award' },
]

function defaultTab(rfq: Rfq): WorkspaceTab {
  switch (rfq.status) {
    case 'draft':
      return 'vendors'
    case 'sent':
    case 'awaiting_responses':
      return 'overview'
    case 'partially_responded':
    case 'under_negotiation':
      return 'comparison'
    case 'awarded':
      return 'award'
    default:
      return 'overview'
  }
}

export function RfqWorkspace() {
  const { id } = useParams<{ id: string }>()
  const { state } = useStore()
  const rfq = id ? getRfq(state, id) : undefined
  const [tab, setTab] = useState<WorkspaceTab>(() => (rfq ? defaultTab(rfq) : 'overview'))
  const [focusEmailId, setFocusEmailId] = useState<string | null>(null)

  // Reset to the status-appropriate tab when navigating to a different RFQ.
  const lastIdRef = useRef(id)
  useEffect(() => {
    if (id !== lastIdRef.current) {
      lastIdRef.current = id
      if (rfq) setTab(defaultTab(rfq))
    }
  }, [id, rfq])

  const readOnly = state.role !== 'sourcing_manager' || rfq?.status === 'awarded'

  if (!rfq) {
    return (
      <p className="text-[var(--ink-soft)]">
        RFQ not found. <Link to="/rfqs" className="text-[var(--accent)]">Back to list</Link>
      </p>
    )
  }

  const openInbox = (emailId?: string) => {
    setFocusEmailId(emailId ?? null)
    setTab('inbox')
  }

  const ctx: WorkspaceCtx = { tab, setTab, focusEmailId, openInbox }

  const tabContent: Record<WorkspaceTab, ReactNode> = {
    overview: <OverviewTab rfq={rfq} readOnly={readOnly} />,
    vendors: <VendorsTab rfq={rfq} readOnly={readOnly} onGoTab={setTab} />,
    comparison: (
      <ComparisonTab
        rfq={rfq}
        readOnly={readOnly}
        onAward={() => setTab('award')}
        onNegotiate={() => setTab('negotiation')}
        onOpenInbox={openInbox}
      />
    ),
    negotiation: <NegotiationTab rfq={rfq} readOnly={readOnly} />,
    inbox: <InboxTab rfq={rfq} readOnly={readOnly} focusEmailId={focusEmailId} />,
    award: <AwardTab rfq={rfq} readOnly={readOnly} />,
  }

  return (
    <WorkspaceContext.Provider value={ctx}>
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link to="/rfqs" className="text-[var(--ink-soft)] hover:text-[var(--accent)]">
          RFQs
        </Link>
        <span className="text-[var(--ink-faint)]">/</span>
        <span className="font-mono text-[var(--ink-soft)]">{rfq.id}</span>
      </div>

      {state.role === 'procurement' && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm">
          <Eye size={16} className="text-[var(--ink-faint)] mt-0.5 shrink-0" />
          <p className="text-[var(--ink-soft)]">
            You're viewing as <strong>Procurement</strong> — this is read-only. The{' '}
            <strong>Sourcing Manager</strong> owns RFQ actions (vendors, negotiation, award).
            Switch role in the top bar to act.
          </p>
        </div>
      )}

      <RfqHeader rfq={rfq} readOnly={readOnly} onGoTab={setTab} />

      <Tabs tabs={TAB_ITEMS} activeId={tab} onChange={(id) => setTab(id as WorkspaceTab)}>
        {tabContent[tab]}
      </Tabs>
    </WorkspaceContext.Provider>
  )
}
