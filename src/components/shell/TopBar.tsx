import { ChevronDown, RotateCcw } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import type { Category, Role } from '../../data/types'
import { Button } from '../ui/Button'

interface TopBarProps {
  title: string
  breadcrumb?: string
}

const roleLabels: Record<Role, string> = {
  sourcing_manager: 'Sourcing Manager',
  procurement: 'Procurement',
}

export function TopBar({ title, breadcrumb }: TopBarProps) {
  const { state, dispatch, resetDemo } = useStore()

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
        <div className="relative group">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm text-[var(--ink-soft)] hover:border-[var(--accent)]"
          >
            Viewing as: {roleLabels[state.role]}
            <ChevronDown size={14} />
          </button>
          <div className="absolute right-0 top-full mt-1 w-48 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] hidden group-hover:block z-50">
            {(Object.keys(roleLabels) as Role[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => dispatch({ type: 'SET_ROLE', role })}
                className={[
                  'w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg)]',
                  state.role === role ? 'text-[var(--accent)] font-medium' : 'text-[var(--ink)]',
                ].join(' ')}
              >
                {roleLabels[role]}
              </button>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={resetDemo}>
          <RotateCcw size={14} />
          Reset demo
        </Button>
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

export function CategoryChip({ category }: { category: Category }) {
  return (
    <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-[0.04em] bg-[var(--accent-soft)] text-[var(--accent)]">
      {category === 'freight' ? 'Freight' : 'Chemicals'}
    </span>
  )
}
