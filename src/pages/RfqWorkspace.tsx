import { createContext, useContext, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { getRfq } from '../store/selectors'
import { Tabs } from '../components/ui/Tabs'
import { StatusPill } from '../components/ui/StatusPill'
import { rfqStatusToPill } from '../lib/rfqStatus'
import { OverviewTab } from './rfq/OverviewTab'
import { VendorsTab } from './rfq/VendorsTab'
import { ComparisonTab } from './rfq/ComparisonTab'
import { NegotiationTab } from './rfq/NegotiationTab'
import { InboxTab } from './rfq/InboxTab'
import { AwardTab } from './rfq/AwardTab'

type WorkspaceTab = 'overview' | 'vendors' | 'comparison' | 'negotiation' | 'inbox' | 'award'

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

export function RfqWorkspace() {
  const { id } = useParams<{ id: string }>()
  const { state } = useStore()
  const [tab, setTab] = useState<WorkspaceTab>('comparison')
  const [focusEmailId, setFocusEmailId] = useState<string | null>(null)

  const rfq = id ? getRfq(state, id) : undefined
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
    comparison: <ComparisonTab rfq={rfq} readOnly={readOnly} onAward={() => setTab('award')} onNegotiate={() => setTab('negotiation')} onOpenInbox={openInbox} />,
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
        <StatusPill status={rfqStatusToPill(rfq.status)} />
        {readOnly && state.role === 'procurement' && (
          <span className="text-xs text-[var(--ink-faint)]">(read-only)</span>
        )}
      </div>
      <Tabs
        tabs={TAB_ITEMS}
        activeId={tab}
        onChange={(id) => setTab(id as WorkspaceTab)}
      >
        {tabContent[tab]}
      </Tabs>
    </WorkspaceContext.Provider>
  )
}
