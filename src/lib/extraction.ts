import type { QuoteVersion, Rfq, VendorEmail } from '../data/types'
import { enrichQuote } from '../store/selectors'

const PREVIEW_RESULTS: Record<string, Partial<QuoteVersion>> = {
  'EM-NSH-001': {
    versionNo: 1,
    source: 'pdf',
    extractionStatus: 'manual_review',
    basePrice: { value: '', confidence: 'missing' },
    taxes: { value: '', confidence: 'missing' },
    freight: { value: '—', confidence: 'missing' },
    leadTime: { value: '', confidence: 'missing' },
    paymentTerms: { value: '', confidence: 'missing' },
    validity: { value: '', confidence: 'missing' },
    deviations: [],
  },
}

export function getSeededExtraction(
  rfq: Rfq,
  email: VendorEmail,
): QuoteVersion | null {
  const vor = rfq.vendors.find((v) => v.vendorId === email.vendorId)
  const existing = vor?.quotes.find((q) => q.rawEmailId === email.id)
  if (existing) return existing

  const preview = PREVIEW_RESULTS[email.id]
  if (preview) {
    return {
      versionNo: 1,
      receivedAt: email.receivedAt,
      rawEmailId: email.id,
      deviations: [],
      ...preview,
    } as QuoteVersion
  }
  return null
}

export function simulateExtraction(
  rfq: Rfq,
  emailId: string,
): Promise<QuoteVersion | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const email = rfq.emails.find((e) => e.id === emailId)
      if (!email) {
        resolve(null)
        return
      }
      const seeded = getSeededExtraction(rfq, email)
      if (seeded) {
        resolve(enrichQuote(seeded, rfq.category))
      } else {
        resolve(null)
      }
    }, 1500)
  })
}
