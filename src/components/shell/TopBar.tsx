import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import type { Role } from '../../data/types'

interface TopBarProps {
  title: string
  breadcrumb?: string
}

const roleLabels: Record<Role, string> = {
  sourcing_manager: 'Sourcing Manager',
  procurement: 'Procurement',
}

export function TopBar({ title, breadcrumb }: TopBarProps) {
  const { state, dispatch } = useStore()
  const [roleOpen, setRoleOpen] = useState(false)

  return (
    <header className="h-14 shrink-0 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between px-6 gap-4">
      <div className="min-w-0">
        {breadcrumb && (
          <div className="text-xs text-[var(--ink-faint)] truncate">{breadcrumb}</div>
        )}
        <h1 className="font-display text-lg font-semibold text-[var(--ink)] truncate">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-[0.04em] bg-[var(--accent-soft)] text-[var(--accent)]">
          {state.categoryContext === 'freight' ? 'Freight' : 'Chemicals'}
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setRoleOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm text-[var(--ink-soft)] hover:border-[var(--accent)]"
          >
            Viewing as: {roleLabels[state.role]}
            <ChevronDown size={14} />
          </button>
          {roleOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 cursor-default"
                aria-label="Close menu"
                onClick={() => setRoleOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-52 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] z-50">
                <p className="px-3 py-2 text-[10px] uppercase tracking-[0.04em] text-[var(--ink-faint)]">
                  Demo role (not real login)
                </p>
                {(Object.keys(roleLabels) as Role[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      dispatch({ type: 'SET_ROLE', role })
                      setRoleOpen(false)
                    }}
                    className={[
                      'w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg)]',
                      state.role === role ? 'text-[var(--accent)] font-medium' : 'text-[var(--ink)]',
                    ].join(' ')}
                  >
                    {roleLabels[role]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div
          className="h-8 w-8 rounded-full bg-[var(--accent)] text-white text-xs font-medium flex items-center justify-center"
          title={state.role === 'sourcing_manager' ? 'Sourcing Manager' : 'Procurement'}
        >
          {state.role === 'sourcing_manager' ? 'SM' : 'PR'}
        </div>
      </div>
    </header>
  )
}
