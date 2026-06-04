import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORY_FIELDS, LOCATION_MASTER } from '../data/seed'
import type { Category } from '../data/types'
import { useStore } from '../store/StoreContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Tabs } from '../components/ui/Tabs'

const EXCEL_SEED = {
  material: 'Appliances — palletized',
  weightLoad: '12 MT',
  mode: 'Road',
  loadType: 'Full Truck Load (FTL)',
  vehicleType: '19 MT 32 FT Multi Axle',
  origin: 'Mumbai',
  destination: 'Delhi',
  frequency: 'Monthly',
}

export function RequestNew() {
  const navigate = useNavigate()
  const { state, dispatch } = useStore()
  const [category, setCategory] = useState<Category>('freight')
  const [tab, setTab] = useState('form')
  const [fields, setFields] = useState<Record<string, string>>({})

  if (state.role !== 'procurement') {
    return (
      <p className="text-[var(--ink-soft)]">
        Switch to Procurement role to create requests.
      </p>
    )
  }

  const defs = CATEGORY_FIELDS[category]

  const submit = () => {
    const id = `REQ-${String(state.requests.length + 1).padStart(4, '0')}`
    dispatch({
      type: 'ADD_REQUEST',
      request: {
        id,
        category,
        status: 'pending_review',
        createdBy: 'Priya Menon',
        createdAt: new Date().toISOString(),
        fields,
      },
    })
    dispatch({ type: 'SET_CATEGORY_CONTEXT', category })
    navigate(`/requests/${id}`)
  }

  const simExcel = () => {
    setFields(EXCEL_SEED)
    setTab('form')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <label className="text-sm font-medium">Category</label>
        <div className="flex gap-2 mt-2">
          {(['freight', 'chemicals'] as Category[]).map((c) => (
            <Button
              key={c}
              variant={category === c ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setCategory(c)
                setFields({})
              }}
            >
              {c}
            </Button>
          ))}
        </div>
      </Card>

      <Card padding={false}>
        <Tabs
          tabs={[
            { id: 'form', label: 'Form' },
            { id: 'excel', label: 'Upload Excel' },
          ]}
          activeId={tab}
          onChange={setTab}
          className="px-6 pt-4"
        >
          {tab === 'excel' ? (
            <div className="px-6 pb-6">
              <div
                className="border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center text-[var(--ink-soft)]"
                onClick={simExcel}
                onKeyDown={(e) => e.key === 'Enter' && simExcel()}
                role="button"
                tabIndex={0}
              >
                Drop Excel file here (simulated)
                <p className="text-xs mt-2 text-[var(--ink-faint)]">
                  Click to parse seeded template into form
                </p>
              </div>
            </div>
          ) : (
            <div className="px-6 pb-6 space-y-4">
              {defs.map((def) => (
                <div key={def.key}>
                  <label className="text-sm font-medium text-[var(--ink-soft)]">
                    {def.label}
                  </label>
                  {def.options ? (
                    <select
                      className="w-full mt-1 border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
                      value={fields[def.key] ?? ''}
                      onChange={(e) =>
                        setFields((f) => ({ ...f, [def.key]: e.target.value }))
                      }
                    >
                      <option value="">Select…</option>
                      {def.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={def.type === 'date' ? 'date' : 'text'}
                      className="w-full mt-1 border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
                      value={fields[def.key] ?? ''}
                      onChange={(e) =>
                        setFields((f) => ({ ...f, [def.key]: e.target.value }))
                      }
                    />
                  )}
                  {def.master && fields[def.key] && LOCATION_MASTER[fields[def.key]] && (
                    <p className="text-xs text-[var(--ink-faint)] mt-1">
                      {LOCATION_MASTER[fields[def.key]]}
                    </p>
                  )}
                </div>
              ))}
              <Button onClick={submit}>Submit for review</Button>
            </div>
          )}
        </Tabs>
      </Card>
    </div>
  )
}
