import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import { ToastProvider } from './components/ui/Toast'
import { AppShell } from './components/shell/AppShell'
import { Dashboard } from './pages/Dashboard'
import { RfqList } from './pages/RfqList'
import { RfqWorkspace } from './pages/RfqWorkspace'
import { RequestList } from './pages/RequestList'
import { RequestNew } from './pages/RequestNew'
import { RequestReview } from './pages/RequestReview'
import { Vendors } from './pages/Vendors'

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/rfqs" replace />} />
            <Route element={<AppShell title="RFQs" />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rfqs" element={<RfqList />} />
              <Route path="/rfqs/:id" element={<RfqWorkspace />} />
              <Route path="/requests" element={<RequestList />} />
              <Route path="/requests/new" element={<RequestNew />} />
              <Route path="/requests/:id" element={<RequestReview />} />
              <Route path="/vendors" element={<Vendors />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  )
}
