export type Role = 'sourcing_manager' | 'procurement'
export type Category = 'freight' | 'chemicals'

export type RequestStatus = 'draft' | 'pending_review' | 'approved' | 'sent_back'
export type RfqStatus =
  | 'draft'
  | 'sent'
  | 'awaiting_responses'
  | 'partially_responded'
  | 'under_negotiation'
  | 'awarded'
export type ResponseStatus = 'no_response' | 'responded' | 'late' | 'incomplete'
export type ExtractionStatus = 'success' | 'partial' | 'manual_review'
export type Confidence = 'high' | 'low' | 'missing'

export interface SourcingRequest {
  id: string
  category: Category
  status: RequestStatus
  createdBy: string
  createdAt: string
  fields: Record<string, string>
  reviewNote?: string
}

export interface Vendor {
  id: string
  name: string
  code: string
  email: string
  category: Category
  subCategory?: string
  region?: string
}

export interface ExtractedField {
  value: string
  confidence: Confidence
}

export interface QuoteVersion {
  versionNo: number
  receivedAt: string
  source: 'email_body' | 'pdf' | 'excel'
  extractionStatus: ExtractionStatus
  basePrice: ExtractedField
  taxes: ExtractedField
  freight: ExtractedField
  leadTime: ExtractedField
  paymentTerms: ExtractedField
  validity: ExtractedField
  deviations: string[]
  rawEmailId: string
  isCounterResponse?: boolean
  landedCost?: number
}

export interface VendorOnRfq {
  vendorId: string
  responseStatus: ResponseStatus
  reminded?: boolean
  quotes: QuoteVersion[]
}

export interface NegotiationEvent {
  id: string
  vendorId: string
  round: number
  type: 'counter_sent' | 'vendor_revised'
  at: string
  message: string
  priceAtEvent?: string
}

export interface Award {
  awardedVendorId: string
  awardedAt: string
  awardedBy: string
  justification: string
  finalPrice: string
  wasL1: boolean
}

export interface VendorEmail {
  id: string
  vendorId: string
  receivedAt: string
  subject: string
  body: string
  attachments: { name: string; type: 'pdf' | 'xlsx' }[]
  extractedToVersion?: number
  extractionApplied?: boolean
}

export interface Rfq {
  id: string
  category: Category
  status: RfqStatus
  fromRequestId: string
  title: string
  fields: Record<string, string>
  terms: { paymentTerms: string; validityRequired: string }
  deadline: string
  createdAt: string
  vendors: VendorOnRfq[]
  negotiations: NegotiationEvent[]
  award?: Award
  emails: VendorEmail[]
}

export interface CategoryFieldDef {
  key: string
  label: string
  options?: string[]
  master?: boolean
  type?: 'date'
}

export interface AppState {
  role: Role
  categoryContext: Category
  requests: SourcingRequest[]
  rfqs: Rfq[]
  vendors: Vendor[]
}
