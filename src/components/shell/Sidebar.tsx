import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Inbox, Users, Truck } from 'lucide-react'
import { useStore } from '../../store/StoreContext'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/rfqs', label: 'RFQs', icon: FileText },
  { to: '/requests', label: 'Requests', icon: Inbox },
  { to: '/vendors', label: 'Vendors', icon: Users },
]

export function Sidebar() {
  const { state } = useStore()
  const isSm = state.role === 'sourcing_manager'

  return (
    <aside className="w-60 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col h-full">
      <div className="p-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Truck className="text-white" size={16} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.06em] text-[var(--ink-faint)]">
              Godrej
            </div>
            <div className="font-display text-sm font-semibold text-[var(--ink)] leading-tight">
              Freight Sourcing
            </div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(({ to, label, icon: Icon }) => {
          const emphasize = to === '/requests' && !isSm
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-medium'
                    : emphasize
                      ? 'text-[var(--ink)] font-medium'
                      : 'text-[var(--ink-soft)] hover:bg-[var(--bg)] hover:text-[var(--ink)]',
                ].join(' ')
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          )
        })}
      </nav>
      <div className="p-4 text-xs text-[var(--ink-faint)] flex items-center gap-2">
        <span className="text-[var(--accent)]">●</span>
        Prototype — seeded demo data
      </div>
    </aside>
  )
}
