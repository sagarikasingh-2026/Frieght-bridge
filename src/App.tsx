import { StoreProvider } from './store/StoreContext'
import { ToastProvider } from './components/ui/Toast'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'
import { Pill } from './components/ui/Pill'
import { StatusPill } from './components/ui/StatusPill'
import { ConfidenceDot } from './components/ui/ConfidenceDot'
import { FieldGrid } from './components/ui/FieldGrid'
import { Tabs } from './components/ui/Tabs'
import { useState } from 'react'
import type { Confidence } from './data/types'

/** Step 1 showcase — replaced by full app in step 3 */
function DesignSystemPreview() {
  const [tab, setTab] = useState('overview')
  const confidences: Confidence[] = ['high', 'low', 'missing']

  return (
    <div className="min-h-full p-8 max-w-[1200px] mx-auto">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.04em] text-[var(--ink-faint)] mb-2">
          Godrej · Prototype
        </p>
        <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">
          Freight Sourcing
        </h1>
        <p className="text-[var(--ink-soft)] mt-2 max-w-xl">
          Design system foundation — tokens, typography, and UI primitives per BUILD_SPEC §3.
        </p>
      </header>

      <div className="grid gap-6">
        <Card>
          <h2 className="text-sm font-semibold mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Primary action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button size="sm">Small</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold mb-4">Status pills</h2>
          <div className="flex flex-wrap gap-2">
            <StatusPill status="draft" />
            <StatusPill status="pending_review" />
            <StatusPill status="approved" />
            <StatusPill status="awaiting_responses" />
            <StatusPill status="under_negotiation" />
            <StatusPill status="awarded" />
            <StatusPill status="no_response" />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold mb-4">Pills & confidence</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Pill tone="accent" dot>
              L1
            </Pill>
            <Pill tone="amber">45 days vs 30</Pill>
            {confidences.map((c) => (
              <span key={c} className="inline-flex items-center gap-2 text-sm">
                <ConfidenceDot confidence={c} />
                <span className="text-[var(--ink-soft)]">{c}</span>
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <FieldGrid
            fields={[
              { label: 'Origin', value: 'Malanpur' },
              { label: 'Destination', value: 'Hooghly' },
              { label: 'RFQ ID', value: 'RFQ-2026-0042', mono: true },
              { label: 'Landed cost', value: <span className="tnum font-medium">₹1,24,500</span> },
            ]}
          />
        </Card>

        <Card padding={false}>
          <Tabs
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'comparison', label: 'Comparison' },
              { id: 'inbox', label: 'Inbox' },
            ]}
            activeId={tab}
            onChange={setTab}
            className="px-6 pt-4"
          >
            <div className="px-6 pb-6 text-sm text-[var(--ink-soft)]">
              Active tab: <span className="text-[var(--ink)] font-medium">{tab}</span>
            </div>
          </Tabs>
        </Card>
      </div>

      <footer className="fixed bottom-4 left-4 text-xs text-[var(--ink-faint)] flex items-center gap-2">
        <span className="text-[var(--accent)]">●</span> Prototype — seeded demo data
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <DesignSystemPreview />
      </ToastProvider>
    </StoreProvider>
  )
}
