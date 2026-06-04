import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { initialState, STORAGE_KEY } from '../data/seed'
import type {
  AppState,
  Award,
  NegotiationEvent,
  QuoteVersion,
  Rfq,
  RfqStatus,
  Role,
  SourcingRequest,
  VendorOnRfq,
} from '../data/types'
import { enrichQuote } from './selectors'

type Action =
  | { type: 'RESET' }
  | { type: 'HYDRATE'; state: AppState }
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'SET_CATEGORY_CONTEXT'; category: AppState['categoryContext'] }
  | { type: 'ADD_REQUEST'; request: SourcingRequest }
  | { type: 'UPDATE_REQUEST'; request: SourcingRequest }
  | { type: 'ADD_RFQ'; rfq: Rfq }
  | { type: 'UPDATE_RFQ'; rfq: Rfq }
  | { type: 'UPDATE_QUOTE_FIELD'; rfqId: string; vendorId: string; versionNo: number; field: keyof QuoteVersion; value: unknown }
  | {
      type: 'UPDATE_EXTRACTED_FIELD'
      rfqId: string
      vendorId: string
      versionNo: number
      field: 'basePrice' | 'taxes' | 'freight' | 'leadTime' | 'paymentTerms' | 'validity'
      value: string
    }
  | { type: 'SET_RFQ_STATUS'; rfqId: string; status: RfqStatus }
  | { type: 'DISPATCH_RFQ'; rfqId: string; vendorIds: string[] }
  | { type: 'REMIND_VENDOR'; rfqId: string; vendorId: string }
  | { type: 'APPLY_EXTRACTION'; rfqId: string; emailId: string; quote: QuoteVersion }
  | { type: 'ADD_NEGOTIATION'; rfqId: string; event: NegotiationEvent }
  | { type: 'ADD_VENDOR_QUOTE'; rfqId: string; vendorId: string; quote: QuoteVersion }
  | { type: 'SET_AWARD'; rfqId: string; award: Award }

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AppState
  } catch {
    /* ignore */
  }
  return initialState
}

function updateRfq(state: AppState, rfqId: string, updater: (rfq: Rfq) => Rfq): AppState {
  return {
    ...state,
    rfqs: state.rfqs.map((r) => (r.id === rfqId ? updater(r) : r)),
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'RESET':
      return initialState
    case 'HYDRATE':
      return action.state
    case 'SET_ROLE':
      return { ...state, role: action.role }
    case 'SET_CATEGORY_CONTEXT':
      return { ...state, categoryContext: action.category }
    case 'ADD_REQUEST':
      return { ...state, requests: [...state.requests, action.request] }
    case 'UPDATE_REQUEST':
      return {
        ...state,
        requests: state.requests.map((r) =>
          r.id === action.request.id ? action.request : r,
        ),
      }
    case 'ADD_RFQ':
      return { ...state, rfqs: [...state.rfqs, action.rfq] }
    case 'UPDATE_RFQ':
      return {
        ...state,
        rfqs: state.rfqs.map((r) => (r.id === action.rfq.id ? action.rfq : r)),
      }
    case 'SET_RFQ_STATUS':
      return updateRfq(state, action.rfqId, (rfq) => ({ ...rfq, status: action.status }))
    case 'DISPATCH_RFQ': {
      return updateRfq(state, action.rfqId, (rfq) => ({
        ...rfq,
        status: 'awaiting_responses',
        vendors: action.vendorIds.map(
          (vendorId): VendorOnRfq => ({
            vendorId,
            responseStatus: 'no_response',
            quotes: [],
          }),
        ),
      }))
    }
    case 'REMIND_VENDOR':
      return updateRfq(state, action.rfqId, (rfq) => ({
        ...rfq,
        vendors: rfq.vendors.map((v) =>
          v.vendorId === action.vendorId ? { ...v, reminded: true } : v,
        ),
      }))
    case 'UPDATE_QUOTE_FIELD': {
      return updateRfq(state, action.rfqId, (rfq) => ({
        ...rfq,
        vendors: rfq.vendors.map((v) => {
          if (v.vendorId !== action.vendorId) return v
          return {
            ...v,
            quotes: v.quotes.map((q) => {
              if (q.versionNo !== action.versionNo) return q
              const updated = { ...q, [action.field]: action.value } as QuoteVersion
              return enrichQuote(updated, rfq.category)
            }),
          }
        }),
      }))
    }
    case 'UPDATE_EXTRACTED_FIELD': {
      return updateRfq(state, action.rfqId, (rfq) => ({
        ...rfq,
        vendors: rfq.vendors.map((v) => {
          if (v.vendorId !== action.vendorId) return v
          return {
            ...v,
            quotes: v.quotes.map((q) => {
              if (q.versionNo !== action.versionNo) return q
              const field = q[action.field]
              if (typeof field !== 'object' || !('value' in field)) return q
              const updated = {
                ...q,
                [action.field]: {
                  ...field,
                  value: action.value,
                  confidence: action.value ? 'high' : field.confidence,
                },
              }
              return enrichQuote(updated, rfq.category)
            }),
          }
        }),
      }))
    }
    case 'APPLY_EXTRACTION': {
      return updateRfq(state, action.rfqId, (rfq) => {
        const email = rfq.emails.find((em) => em.id === action.emailId)
        const quote = enrichQuote(action.quote, rfq.category)
        return {
          ...rfq,
          emails: rfq.emails.map((e) =>
            e.id === action.emailId
              ? { ...e, extractedToVersion: quote.versionNo, extractionApplied: true }
              : e,
          ),
          vendors: rfq.vendors.map((v) => {
            if (!email || v.vendorId !== email.vendorId) return v
            const existing = v.quotes.filter((q) => q.versionNo !== quote.versionNo)
            return {
              ...v,
              responseStatus:
                quote.extractionStatus === 'manual_review' ? 'incomplete' : 'responded',
              quotes: [...existing, quote],
            }
          }),
        }
      })
    }
    case 'ADD_VENDOR_QUOTE': {
      return updateRfq(state, action.rfqId, (rfq) => ({
        ...rfq,
        vendors: rfq.vendors.map((v) => {
          if (v.vendorId !== action.vendorId) return v
          const quote = enrichQuote(action.quote, rfq.category)
          return {
            ...v,
            responseStatus: 'responded',
            quotes: [...v.quotes.filter((q) => q.versionNo !== quote.versionNo), quote],
          }
        }),
      }))
    }
    case 'ADD_NEGOTIATION':
      return updateRfq(state, action.rfqId, (rfq) => ({
        ...rfq,
        status: rfq.status === 'awarded' ? 'awarded' : 'under_negotiation',
        negotiations: [...rfq.negotiations, action.event],
      }))
    case 'SET_AWARD':
      return updateRfq(state, action.rfqId, (rfq) => ({
        ...rfq,
        status: 'awarded',
        award: action.award,
      }))
    default:
      return state
  }
}

interface StoreContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  resetDemo: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    dispatch({ type: 'RESET' })
  }, [])

  const value = useMemo(() => ({ state, dispatch, resetDemo }), [state, resetDemo])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
