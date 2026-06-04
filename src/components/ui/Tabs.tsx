import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export interface TabItem {
  id: string
  label: string
  disabled?: boolean
}

interface TabsProps {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
  children?: ReactNode
}

export function Tabs({ tabs, activeId, onChange, className = '', children }: TabsProps) {
  return (
    <div className={className}>
      <div
        className="flex gap-1 border-b border-[var(--border)] overflow-x-auto"
        role="tablist"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeId
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={[
                'relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                active ? 'text-[var(--accent)]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]',
              ].join(' ')}
            >
              {tab.label}
              {active && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]"
                  transition={{ duration: 0.12 }}
                />
              )}
            </button>
          )
        })}
      </div>
      {children && (
        <motion.div
          key={activeId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.12 }}
          className="pt-6"
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}
