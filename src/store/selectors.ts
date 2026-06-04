import type { AppState, QuoteVersion, Rfq, Vendor, VendorOnRfq } from '../data/types'

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
