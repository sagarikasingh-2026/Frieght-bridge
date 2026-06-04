import type { AppState, CategoryFieldDef, SourcingRequest, Vendor } from './types'

export const CATEGORY_FIELDS: Record<'freight' | 'chemicals', CategoryFieldDef[]> = {
  freight: [
    { key: 'material', label: 'Material Name' },
    { key: 'weightLoad', label: 'Weight / Load' },
    { key: 'mode', label: 'Mode of Transportation', options: ['Road', 'Train', 'Sea', 'Air'] },
    {
      key: 'loadType',
      label: 'Load Type',
      options: ['Full Truck Load (FTL)', 'Partial Truck Load (PTL)'],
    },
    {
      key: 'vehicleType',
      label: 'Vehicle Type',
      options: [
        '9 MT 32 FT Single Axle Closed',
        '19 MT 32 FT Multi Axle',
        '7 MT 19 FT Open',
      ],
    },
    { key: 'origin', label: 'Origin Location', master: true, options: ['Malanpur', 'Mumbai', 'Chennai'] },
    {
      key: 'destination',
      label: 'Destination Location',
      master: true,
      options: ['Hooghly', 'Bengaluru', 'Delhi'],
    },
    {
      key: 'frequency',
      label: 'Frequency',
      options: ['One-time movement', 'Weekly', 'Monthly', 'Quarterly'],
    },
  ],
  chemicals: [
    { key: 'material', label: 'Material Name' },
    { key: 'location', label: 'Location' },
    { key: 'quantityUom', label: 'Quantity and UoM' },
    { key: 'deliveryType', label: 'Delivery Type', options: ['Delivered', 'Ex-Works', 'FOR'] },
    { key: 'deliveryMode', label: 'Delivery Mode', options: ['Tanker', 'Drum', 'IBC', 'Bag'] },
    { key: 'validityUpto', label: 'Validity Upto', type: 'date' },
  ],
}

export const LOCATION_MASTER: Record<string, string> = {
  Malanpur: 'Plot 14, Malanpur Industrial Area, Bhind, Madhya Pradesh 477117',
  Mumbai: 'Godrej One, Pirojshanagar, Vikhroli, Mumbai, Maharashtra 400079',
  Chennai: 'SIPCOT Industrial Park, Oragadam, Chennai, Tamil Nadu 602105',
  Hooghly: 'Godrej Depot, GT Road, Bhadreswar, Hooghly, West Bengal 712124',
  Bengaluru: 'Peenya Industrial Area, Bengaluru, Karnataka 560058',
  Delhi: 'Kundli Industrial Area, Sonipat, Haryana 131028',
}

const vendors: Vendor[] = [
  {
    id: 'VEN-FR-001',
    name: 'Sterling Roadlines Pvt Ltd',
    code: 'SRL-MP-WB',
    email: 'quotes@sterlingroadlines.in',
    category: 'freight',
    subCategory: 'Road - FTL',
    region: 'Malanpur–Hooghly',
  },
  {
    id: 'VEN-FR-002',
    name: 'Eastern Cargo Movers',
    code: 'ECM-FTL-01',
    email: 'bids@easterncargo.co.in',
    category: 'freight',
    subCategory: 'Road - FTL',
    region: 'Malanpur–Hooghly',
  },
  {
    id: 'VEN-FR-003',
    name: 'Bharat Freight Carriers',
    code: 'BFC-NCR-E',
    email: 'rfq@bharatfreight.com',
    category: 'freight',
    subCategory: 'Road - FTL',
    region: 'Malanpur–Hooghly',
  },
  {
    id: 'VEN-FR-004',
    name: 'Apex Logistics Solutions',
    code: 'APS-LOG-22',
    email: 'commercial@apexlogistics.in',
    category: 'freight',
    subCategory: 'Road - FTL',
    region: 'Malanpur–Hooghly',
  },
  {
    id: 'VEN-FR-005',
    name: 'Konkan Transport Co',
    code: 'KTC-WB-07',
    email: 'ops@konkantransport.com',
    category: 'freight',
    subCategory: 'Road - FTL',
    region: 'Malanpur–Hooghly',
  },
  {
    id: 'VEN-FR-006',
    name: 'NorthStar Haulage LLP',
    code: 'NSH-MP-14',
    email: 'tenders@northstarhaulage.in',
    category: 'freight',
    subCategory: 'Road - FTL',
    region: 'Malanpur–Hooghly',
  },
  {
    id: 'VEN-CH-001',
    name: 'ChemDist India Pvt Ltd',
    code: 'CDI-CH-01',
    email: 'sales@chemdistindia.com',
    category: 'chemicals',
    subCategory: 'Solvents',
    region: 'West',
  },
  {
    id: 'VEN-CH-002',
    name: 'Prakash Chemical Agencies',
    code: 'PCA-GJ-09',
    email: 'quotes@prakashchemical.com',
    category: 'chemicals',
    subCategory: 'Intermediates',
    region: 'National',
  },
  {
    id: 'VEN-CH-003',
    name: 'GreenSol Distributors',
    code: 'GSD-MH-03',
    email: 'procurement@greensol.in',
    category: 'chemicals',
    subCategory: 'Specialty',
    region: 'West',
  },
]

const requests: SourcingRequest[] = [
  {
    id: 'REQ-0001',
    category: 'freight',
    status: 'approved',
    createdBy: 'Priya Menon',
    createdAt: '2026-05-28T09:15:00.000Z',
    fields: {
      material: 'Consumer goods — cartons',
      weightLoad: '18 MT per trip',
      mode: 'Road',
      loadType: 'Full Truck Load (FTL)',
      vehicleType: '9 MT 32 FT Single Axle Closed',
      origin: 'Malanpur',
      destination: 'Hooghly',
      frequency: 'Weekly',
    },
  },
  {
    id: 'REQ-0002',
    category: 'freight',
    status: 'pending_review',
    createdBy: 'Arjun Desai',
    createdAt: '2026-06-02T11:40:00.000Z',
    fields: {
      material: 'Appliances — palletized',
      weightLoad: '12 MT',
      mode: 'Road',
      loadType: 'Full Truck Load (FTL)',
      vehicleType: '19 MT 32 FT Multi Axle',
      origin: 'Mumbai',
      destination: 'Delhi',
      frequency: 'Monthly',
    },
  },
  {
    id: 'REQ-0003',
    category: 'chemicals',
    status: 'pending_review',
    createdBy: 'Priya Menon',
    createdAt: '2026-06-03T08:20:00.000Z',
    fields: {
      material: 'Acetic Acid — industrial grade',
      location: 'Vikhroli, Mumbai',
      quantityUom: '40 KL',
      deliveryType: 'Delivered',
      deliveryMode: 'Tanker',
      validityUpto: '2026-07-15',
    },
  },
]

const heroEmails = [
  {
    id: 'EM-SRL-001',
    vendorId: 'VEN-FR-001',
    receivedAt: '2026-06-01T14:22:00.000Z',
    subject: 'RE: RFQ-2026-0042 Freight Quote Malanpur-Hooghly',
    body: `Hi team,

Thanks for the RFQ. For your weekly Malanpur → Hooghly lane on 32ft closed, we're at ₹1,08,000 all-in per trip plus GST 12%.

Transit: 5–6 days door-to-door.
Payment: 30 days from invoice (as requested).
Quote valid till 15-Jun-2026.

Regards,
Sterling Roadlines`,
    attachments: [] as { name: string; type: 'pdf' | 'xlsx' }[],
    extractedToVersion: 1,
    extractionApplied: true,
  },
  {
    id: 'EM-ECM-001',
    vendorId: 'VEN-FR-002',
    receivedAt: '2026-06-01T16:05:00.000Z',
    subject: 'RE: RFQ-2026-0042 — Eastern Cargo quote',
    body: `Dear Godrej team,

Please find our offer below:

| Item | Value |
| Base rate | ₹1,02,500/trip |
| GST | 12% |
| Lead time | 4 days |
| Validity | 10 days |

Note: we need 45 days credit vs your 30 — hope acceptable.

Thanks,
Eastern Cargo`,
    attachments: [],
    extractedToVersion: 1,
    extractionApplied: true,
  },
  {
    id: 'EM-BFC-001',
    vendorId: 'VEN-FR-003',
    receivedAt: '2026-06-02T09:18:00.000Z',
    subject: 'Fwd: Malanpur Hooghly weekly FTL',
    body: `Sir,

Bharat Freight can do 1,06,800 + taxes. 5 day lead. Valid 7 days only — tight fleet.

Payment terms we can match 30 days.

— Bharat Freight`,
    attachments: [],
    extractedToVersion: 1,
    extractionApplied: true,
  },
  {
    id: 'EM-APS-001',
    vendorId: 'VEN-FR-004',
    receivedAt: '2026-06-02T11:44:00.000Z',
    subject: 'RFQ-2026-0042 response (Apex)',
    body: `Hello,

Apex can support this lane at competitive rates — please see attached Excel breakdown.

Base ₹99,200 + 12% GST. Lead 6 days.

Best,
Apex Logistics`,
    attachments: [{ name: 'Apex_RFQ0042_quote.xlsx', type: 'xlsx' as const }],
    extractedToVersion: 1,
    extractionApplied: true,
  },
  {
    id: 'EM-KTC-001',
    vendorId: 'VEN-FR-005',
    receivedAt: '2026-06-02T18:30:00.000Z',
    subject: 'RE: RFQ-2026-0042 (late) — scanned quote',
    body: `Sorry for the delay. Please see attached PDF — our ops team will confirm lead time separately.

— Konkan Transport`,
    attachments: [{ name: 'Konkan_RFQ42_scan.pdf', type: 'pdf' as const }],
    extractedToVersion: undefined,
    extractionApplied: false,
  },
]

export const initialState: AppState = {
  role: 'sourcing_manager',
  categoryContext: 'freight',
  vendors,
  requests,
  rfqs: [
    {
      id: 'RFQ-2026-0042',
      category: 'freight',
      status: 'under_negotiation',
      fromRequestId: 'REQ-0001',
      title: 'Malanpur → Hooghly · Weekly · 32ft Closed',
      fields: {
        material: 'Consumer goods — cartons',
        weightLoad: '18 MT per trip',
        mode: 'Road',
        loadType: 'Full Truck Load (FTL)',
        vehicleType: '9 MT 32 FT Single Axle Closed',
        origin: 'Malanpur',
        destination: 'Hooghly',
        frequency: 'Weekly',
      },
      terms: { paymentTerms: '30 days from invoice', validityRequired: '15 days' },
      deadline: '2026-06-10T18:00:00.000Z',
      createdAt: '2026-05-29T10:00:00.000Z',
      emails: heroEmails,
      negotiations: [
        {
          id: 'NEG-001',
          vendorId: 'VEN-FR-002',
          round: 1,
          type: 'counter_sent',
          at: '2026-06-03T10:00:00.000Z',
          message:
            'Requesting revision to match 30-day payment and target ₹1,00,000 landed inclusive of taxes.',
          priceAtEvent: '₹1,14,800',
        },
        {
          id: 'NEG-002',
          vendorId: 'VEN-FR-002',
          round: 1,
          type: 'vendor_revised',
          at: '2026-06-03T15:30:00.000Z',
          message:
            'Revised to ₹98,500 base + 12% GST, 30-day payment accepted. Valid 12 days.',
          priceAtEvent: '₹1,10,320',
        },
      ],
      vendors: [
        {
          vendorId: 'VEN-FR-001',
          responseStatus: 'responded',
          quotes: [
            {
              versionNo: 1,
              receivedAt: '2026-06-01T14:22:00.000Z',
              source: 'email_body',
              extractionStatus: 'success',
              basePrice: { value: '₹1,08,000', confidence: 'high' },
              taxes: { value: '₹12,960', confidence: 'high' },
              freight: { value: '—', confidence: 'high' },
              leadTime: { value: '5–6 days', confidence: 'high' },
              paymentTerms: { value: '30 days', confidence: 'high' },
              validity: { value: '15 days', confidence: 'high' },
              deviations: [],
              rawEmailId: 'EM-SRL-001',
            },
          ],
        },
        {
          vendorId: 'VEN-FR-002',
          responseStatus: 'responded',
          quotes: [
            {
              versionNo: 1,
              receivedAt: '2026-06-01T16:05:00.000Z',
              source: 'email_body',
              extractionStatus: 'success',
              basePrice: { value: '₹1,02,500', confidence: 'high' },
              taxes: { value: '₹12,300', confidence: 'high' },
              freight: { value: '—', confidence: 'high' },
              leadTime: { value: '4 days', confidence: 'high' },
              paymentTerms: { value: '45 days', confidence: 'high' },
              validity: { value: '10 days', confidence: 'high' },
              deviations: ['Payment terms 45 days vs requested 30'],
              rawEmailId: 'EM-ECM-001',
            },
            {
              versionNo: 2,
              receivedAt: '2026-06-03T15:30:00.000Z',
              source: 'email_body',
              extractionStatus: 'success',
              basePrice: { value: '₹98,500', confidence: 'high' },
              taxes: { value: '₹11,820', confidence: 'high' },
              freight: { value: '—', confidence: 'high' },
              leadTime: { value: '4 days', confidence: 'high' },
              paymentTerms: { value: '30 days', confidence: 'high' },
              validity: { value: '12 days', confidence: 'high' },
              deviations: [],
              rawEmailId: 'EM-ECM-001',
              isCounterResponse: true,
            },
          ],
        },
        {
          vendorId: 'VEN-FR-003',
          responseStatus: 'responded',
          quotes: [
            {
              versionNo: 1,
              receivedAt: '2026-06-02T09:18:00.000Z',
              source: 'email_body',
              extractionStatus: 'partial',
              basePrice: { value: '₹1,06,800', confidence: 'high' },
              taxes: { value: '₹12,816', confidence: 'high' },
              freight: { value: '—', confidence: 'high' },
              leadTime: { value: '5 days', confidence: 'high' },
              paymentTerms: { value: '', confidence: 'missing' },
              validity: { value: '7 days', confidence: 'low' },
              deviations: ['Validity 7 days vs requested 15'],
              rawEmailId: 'EM-BFC-001',
            },
          ],
        },
        {
          vendorId: 'VEN-FR-004',
          responseStatus: 'responded',
          quotes: [
            {
              versionNo: 1,
              receivedAt: '2026-06-02T11:44:00.000Z',
              source: 'excel',
              extractionStatus: 'success',
              basePrice: { value: '₹99,200', confidence: 'high' },
              taxes: { value: '₹11,904', confidence: 'high' },
              freight: { value: '—', confidence: 'high' },
              leadTime: { value: '6 days', confidence: 'high' },
              paymentTerms: { value: '30 days', confidence: 'high' },
              validity: { value: '14 days', confidence: 'high' },
              deviations: [],
              rawEmailId: 'EM-APS-001',
            },
          ],
        },
        {
          vendorId: 'VEN-FR-005',
          responseStatus: 'late',
          quotes: [
            {
              versionNo: 1,
              receivedAt: '2026-06-02T18:30:00.000Z',
              source: 'pdf',
              extractionStatus: 'manual_review',
              basePrice: { value: '', confidence: 'missing' },
              taxes: { value: '', confidence: 'missing' },
              freight: { value: '—', confidence: 'missing' },
              leadTime: { value: '', confidence: 'missing' },
              paymentTerms: { value: '', confidence: 'missing' },
              validity: { value: '', confidence: 'missing' },
              deviations: [],
              rawEmailId: 'EM-KTC-001',
            },
          ],
        },
        {
          vendorId: 'VEN-FR-006',
          responseStatus: 'no_response',
          quotes: [],
        },
      ],
    },
    {
      id: 'RFQ-2026-0051',
      category: 'chemicals',
      status: 'awaiting_responses',
      fromRequestId: 'REQ-0003',
      title: 'Acetic Acid 40 KL · Tanker · Vikhroli',
      fields: {
        material: 'Acetic Acid — industrial grade',
        location: 'Vikhroli, Mumbai',
        quantityUom: '40 KL',
        deliveryType: 'Delivered',
        deliveryMode: 'Tanker',
        validityUpto: '2026-07-15',
      },
      terms: { paymentTerms: '45 days', validityRequired: '30 days' },
      deadline: '2026-06-15T18:00:00.000Z',
      createdAt: '2026-06-04T09:00:00.000Z',
      emails: [],
      negotiations: [],
      vendors: [
        { vendorId: 'VEN-CH-001', responseStatus: 'no_response', quotes: [] },
        { vendorId: 'VEN-CH-002', responseStatus: 'no_response', quotes: [] },
        { vendorId: 'VEN-CH-003', responseStatus: 'no_response', quotes: [] },
      ],
    },
  ],
}

export const STORAGE_KEY = 'godrej-freight-bridge-state'
