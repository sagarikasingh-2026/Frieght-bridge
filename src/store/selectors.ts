import type {
  AppState,
  Deviation,
  ExtractedField,
  QuoteVersion,
  Rfq,
  Vendor,
  VendorOnRfq,
} from '../data/types'

export function getVendor(vendors: Vendor[], id: string): Vendor | undefined {
  return vendors.find((v) => v.id === id)
}

export function latestQuote(vor: VendorOnRfq): QuoteVersion | undefined {
  if (!vor.quotes.length) return undefined
  return [...vor.quotes].sort((a, b) => b.versionNo - a.versionNo)[0]
}

export function quoteAtVersion(vor: VendorOnRfq, versionNo: number): QuoteVersion | undefined {
  return vor.quotes.find((q) => q.versionNo === versionNo)
}

export function parseMoney(fieldValue: string): number {
  const cleaned = fieldValue.replace(/[^0-9.]/g, '')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

export function computeLandedCost(quote: QuoteVersion, category: 'freight' | 'chemicals'): number {
  const base = parseMoney(quote.basePrice.value)
  const taxes = parseMoney(quote.taxes.value)
  const freightVal = quote.freight.value
  const freight =
    freightVal === '—' || freightVal === '-' || !freightVal.trim()
      ? 0
      : parseMoney(freightVal)
  if (category === 'freight' && (freightVal === '—' || freightVal === '-')) {
    return base + taxes
  }
  return base + taxes + freight
}

export function enrichQuote(quote: QuoteVersion, category: 'freight' | 'chemicals'): QuoteVersion {
  return { ...quote, landedCost: computeLandedCost(quote, category) }
}

export function getRfq(state: AppState, id: string): Rfq | undefined {
  return state.rfqs.find((r) => r.id === id)
}

export interface L1Result {
  vendorId: string
  landedCost: number
  quote: QuoteVersion
}

export function findL1(rfq: Rfq, useNegotiated: boolean): L1Result | null {
  let best: L1Result | null = null
  for (const vor of rfq.vendors) {
    if (vor.responseStatus === 'no_response') continue
    const quote = useNegotiated
      ? latestQuote(vor)
      : quoteAtVersion(vor, 1) ?? latestQuote(vor)
    if (!quote || quote.extractionStatus === 'manual_review') continue
    const enriched = enrichQuote(quote, rfq.category)
    const lc = enriched.landedCost ?? 0
    if (lc <= 0) continue
    if (!best || lc < best.landedCost) {
      best = { vendorId: vor.vendorId, landedCost: lc, quote: enriched }
    }
  }
  return best
}

export function vendorName(vendors: Vendor[], vendorId: string): string {
  return getVendor(vendors, vendorId)?.name ?? vendorId
}

/** Classify a deviation note by severity using simple keyword heuristics. */
export function classifyDeviation(text: string): Deviation {
  const t = text.toLowerCase()
  const major = t.includes('payment') || t.includes('credit') || t.includes('price')
  return { text, severity: major ? 'major' : 'minor' }
}

export function quoteDeviations(quote: QuoteVersion): Deviation[] {
  return quote.deviations.map(classifyDeviation)
}

/** Annualization multiplier from the RFQ frequency field. */
export function annualMultiplier(frequency?: string): number {
  switch (frequency) {
    case 'Weekly':
      return 52
    case 'Monthly':
      return 12
    case 'Quarterly':
      return 4
    default:
      return 1
  }
}

export interface ResponseSummary {
  invited: number
  responded: number
  awaiting: number
  noResponse: number
  late: number
  needsReview: number
}

export function responseSummary(rfq: Rfq): ResponseSummary {
  const invited = rfq.vendors.length
  let responded = 0
  let noResponse = 0
  let late = 0
  let needsReview = 0
  for (const v of rfq.vendors) {
    if (v.responseStatus === 'no_response') noResponse++
    else responded++
    if (v.responseStatus === 'late') late++
    if (v.responseStatus === 'incomplete') needsReview++
    const q = latestQuote(v)
    if (q && (q.extractionStatus === 'manual_review' || q.extractionStatus === 'partial')) {
      needsReview++
    }
  }
  return {
    invited,
    responded,
    awaiting: invited - responded - noResponse,
    noResponse,
    late,
    needsReview,
  }
}

/** Savings achieved through negotiation: original v1 L1 vs negotiated L1. */
export function negotiatedSavings(rfq: Rfq): number {
  const original = findL1(rfq, false)
  const negotiated = findL1(rfq, true)
  if (!original || !negotiated) return 0
  const diff = original.landedCost - negotiated.landedCost
  return diff > 0 ? diff : 0
}

export interface AttentionItem {
  kind: 'no_response' | 'needs_review' | 'deadline' | 'negotiation'
  label: string
  vendorId?: string
}

export function attentionItems(rfq: Rfq, vendors: Vendor[]): AttentionItem[] {
  const items: AttentionItem[] = []
  for (const v of rfq.vendors) {
    const name = getVendor(vendors, v.vendorId)?.name ?? v.vendorId
    if (v.responseStatus === 'no_response' && rfq.status !== 'awarded') {
      items.push({ kind: 'no_response', label: `${name} hasn't responded`, vendorId: v.vendorId })
    }
    const q = latestQuote(v)
    if (q?.extractionStatus === 'manual_review') {
      items.push({ kind: 'needs_review', label: `${name}'s quote failed extraction — open in Inbox`, vendorId: v.vendorId })
    } else if (q?.extractionStatus === 'partial') {
      items.push({ kind: 'needs_review', label: `${name}'s quote is missing fields`, vendorId: v.vendorId })
    }
  }
  const days = Math.ceil((new Date(rfq.deadline).getTime() - Date.now()) / 86400000)
  if (days >= 0 && days < 2 && rfq.status !== 'awarded') {
    items.push({ kind: 'deadline', label: `Response deadline in ${days} day${days === 1 ? '' : 's'}` })
  }
  return items
}

/** Per-email extraction field summary for the Inbox banner. */
export function extractionFieldSummary(quote: QuoteVersion): {
  high: number
  review: number
  missing: number
} {
  const fields: ExtractedField[] = [
    quote.basePrice,
    quote.taxes,
    quote.freight,
    quote.leadTime,
    quote.paymentTerms,
    quote.validity,
  ]
  let high = 0
  let review = 0
  let missing = 0
  for (const f of fields) {
    if (f.confidence === 'high') high++
    else if (f.confidence === 'low') review++
    else missing++
  }
  return { high, review, missing }
}
