import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface AppShellProps {
  title: string
  breadcrumb?: string
}

export function AppShell({ title, breadcrumb }: AppShellProps) {
  return (
    <div className="h-full flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} breadcrumb={breadcrumb} />
        <main className="flex-1 overflow-auto bg-[var(--bg)] p-6">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
