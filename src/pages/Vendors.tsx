import { useStore } from '../store/StoreContext'
import { Card } from '../components/ui/Card'

export function Vendors() {
  const { state } = useStore()
  const grouped = state.vendors.reduce(
    (acc, v) => {
      const key = `${v.category}::${v.subCategory ?? 'General'}`
      if (!acc[key]) acc[key] = []
      acc[key].push(v)
      return acc
    },
    {} as Record<string, typeof state.vendors>,
  )

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--ink-soft)] max-w-2xl">
        This is the <strong>company vendor directory</strong> (read-only). You do not send RFQs from
        here. Actions — select vendors, send RFQ, reminders — live on each RFQ’s{' '}
        <strong>Vendors</strong> tab after a Sourcing Manager creates the RFQ from an approved
        request.
      </p>
      {Object.entries(grouped).map(([key, list]) => {
        const [cat, sub] = key.split('::')
        return (
          <Card key={key} padding={false}>
            <div className="px-6 py-3 border-b border-[var(--border)] text-sm font-semibold capitalize">
              {cat} · {sub}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.04em] text-[var(--ink-faint)] border-b border-[var(--border)]">
                  <th className="p-4">Name</th>
                  <th className="p-4">Code</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Region</th>
                </tr>
              </thead>
              <tbody>
                {list.map((v) => (
                  <tr key={v.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="p-4">{v.name}</td>
                    <td className="p-4 font-mono text-xs">{v.code}</td>
                    <td className="p-4 text-[var(--ink-soft)]">{v.email}</td>
                    <td className="p-4 text-[var(--ink-soft)]">{v.region ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      })}
    </div>
  )
}
