import { Outlet, useLocation, matchPath } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useStore } from '../../store/StoreContext'
import { getRfq } from '../../store/selectors'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/rfqs': 'RFQs',
  '/requests': 'Requests',
  '/requests/new': 'New request',
  '/vendors': 'Vendors',
}

export function ShellLayout() {
  const { pathname } = useLocation()
  const { state } = useStore()

  let title = titles[pathname] ?? 'Freight Sourcing'
  let breadcrumb: string | undefined

  const rfqMatch = matchPath('/rfqs/:id', pathname)
  if (rfqMatch?.params.id) {
    const rfq = getRfq(state, rfqMatch.params.id)
    title = rfq?.title ?? rfqMatch.params.id
    breadcrumb = `RFQs / ${rfqMatch.params.id}`
  }

  const reqMatch = matchPath('/requests/:id', pathname)
  if (reqMatch?.params.id && reqMatch.params.id !== 'new') {
    title = reqMatch.params.id
    breadcrumb = 'Requests / Review'
  }

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
