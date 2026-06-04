# GODREJ FREIGHT SOURCING — PROTOTYPE BUILD SPEC (CURSOR MASTER DOC)

> This is the single source of truth for building the prototype. Read it fully before writing any code.
> Build the COMPLETE app from this spec. Only ask the human when something is genuinely blocking and not answerable from this doc.

---

## 0. WHAT THIS IS (one paragraph)

An **email-to-decision sourcing platform** for Godrej. A procurement person raises a freight (or chemical) sourcing request; a sourcing manager reviews it, turns it into an RFQ, sends it to pre-mapped vendors by email, vendor replies are captured and "extracted" by a bot into structured quotes, the manager compares quotes on a hero comparison screen, negotiates across rounds, and **awards** — which is the final state. Everything after award (PO, GRN, invoice, payment, delivery) is OUT OF SCOPE and shown only as a one-line handoff.

The demo must let a sourcing manager understand the whole product in a few minutes. Optimize for **believability and clarity**, not enterprise completeness.

---

## 1. HARD SCOPE RULES (do not violate)

IN SCOPE: Request creation → review → RFQ creation → vendor selection → email dispatch (simulated) → response capture (seeded) → AI extraction (SIMULATED, no real API) → quote comparison → negotiation → award.

OUT OF SCOPE — never build, never link to as a real screen: Purchase Orders, GRN, invoicing, payments, delivery tracking, inventory, QA, vendor discovery/marketplace/onboarding/qualification, ERP/SAP integration, real email integration, real auth.

DATA LAYER: **Seeded local state only.** No Supabase, no backend, no network calls. All data lives in a TypeScript seed file + React context/reducer state. A "Reset demo" button restores the seed. (Optional nicety: persist to localStorage so a refresh keeps state, with Reset clearing it. This mirrors the reference prototypes' "mock data persists in your browser" behavior.)

AI EXTRACTION: **Fully simulated.** No model is called. Each seeded vendor email has a pre-authored "extracted" result attached. The UI shows a fake ~1.5s "Extracting…" state, then reveals structured fields with confidence indicators. Include deliberately imperfect cases (one PARTIAL, one MANUAL-REVIEW-REQUIRED) to prove the honest-AI principle. Every extracted field is editable.

PRIMARY CATEGORY: **Freight.** Chemicals exists only to demonstrate category-awareness (one chemical RFQ in seed data, category-driven forms/columns). Whenever unsure, default to freight.

ONE RFQ = ONE REQUIREMENT for the prototype. Do not model complex multi-line-item sourcing. Award is at vendor level; just show a label "Supports line-item award" — do not fully build line-item splitting.

---

## 2. TECH STACK

- **Vite + React + TypeScript** (NOT Next.js — simpler, faster to deploy on Vercel as a static SPA, no server needed since there's no backend).
- **React Router** for routing.
- **Tailwind CSS** for styling.
- **lucide-react** for icons.
- **Framer Motion** (`motion`) for the extraction animation + tab/page transitions + staggered list reveals.
- State: a single **React Context + useReducer** store seeded from `src/data/seed.ts`, optionally synced to localStorage.
- No other heavy deps. No component library — build the few primitives we need by hand for full design control.

Node 18+. Package manager: npm.

---

## 3. DESIGN SYSTEM (follow exactly — this is what makes it not look like AI slop)

**Aesthetic direction:** calm, precise, B2B-operational "command desk." Think Linear/Vercel restraint with a logistics seriousness. Light theme. Lots of whitespace. One functional accent. Status communicated through pills. This deliberately echoes the reference prototypes' house style (left sidebar + top bar + cards + status pills + "prototype seeded data" footer) but with a tighter, more intentional palette and type.

### Typography
- Display / headings: **"Fraunces"** (a characterful serif) for page titles and the workspace name only — gives it an editorial, considered feel, distinct from generic SaaS. Import from Google Fonts.
- Body / UI / data: **"IBM Plex Sans"** for all UI text, labels, table data. Tabular numerals for money columns (`font-feature-settings: "tnum"`).
- Mono (for RFQ numbers, vendor codes, email addresses): **"IBM Plex Mono"**.
- Do NOT use Inter, Roboto, Arial, or system-ui.

### Color tokens (CSS variables in index.css)
```
--bg:          #FAFAF8   /* warm near-white app background */
--surface:     #FFFFFF   /* cards */
--border:      #E8E6E1   /* hairline borders, warm grey */
--ink:         #1A1A17   /* primary text, near-black warm */
--ink-soft:    #6B6862   /* secondary text / labels */
--ink-faint:   #A8A39B   /* tertiary / placeholders */
--accent:      #1F5C4D   /* deep teal-green = primary actions, links, L1 (Godrej-ish, serious) */
--accent-soft: #E7F0ED   /* accent background tint */
--amber:       #B8731F   /* deviations / attention / partial extraction */
--amber-soft:  #FAF0E2
--red:         #A23B36   /* failed extraction / no response / errors */
--red-soft:    #F8EAE9
--green:       #2F7D5B   /* success / responded / high-confidence */
--green-soft:  #E8F2EC
```
Use ONLY these. The accent is the single dominant color; everything else is warm greys. No purple, no blue-on-white gradients.

### Shape & spacing
- Border radius: cards `12px`, pills `999px`, buttons `8px`, inputs `8px`.
- Borders: `1px solid var(--border)`. Shadows: very subtle only (`0 1px 2px rgba(0,0,0,0.04)`), cards mostly rely on borders not shadows.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48. Generous padding inside cards (24px).
- Page max-width: content area ~1200px, comfortable line lengths.

### Status pill component (reused everywhere)
A rounded pill: tiny uppercase label, 11px, letter-spacing 0.04em, with a colored dot. Variants map to tokens:
- Draft → ink-faint
- Pending Review → amber
- Approved → green
- RFQ Sent / Awaiting Responses → accent
- Partially Responded → amber
- Under Negotiation → accent
- Awarded → green (filled)
- No Response / Failed → red

### Confidence dot
Small 8px dot before extracted values: green = high, amber = partial/low, red = missing/failed. Tooltip on hover ("High confidence" / "Needs review" / "Could not extract").

### Footer marker (every page)
A fixed, muted footer line bottom-left: `● Prototype — seeded demo data` and the Reset demo control lives in the top bar. (Reuse from references.)

### Motion
- Page load: staggered fade+rise of cards (Framer Motion, 40ms stagger, 8px rise).
- Extraction theatre: a shimmer/scanning animation over the email for ~1.5s, then fields pop in one by one with their confidence dots.
- Tab switch inside workspace: quick crossfade (120ms).
- Keep it tasteful; this is an operational tool, not a toy.

---

## 4. INFORMATION ARCHITECTURE

### App shell (persistent)
- **Left sidebar** (narrow, ~240px): workspace identity at top (small Godrej mark + "Freight Sourcing"), then nav:
  - Dashboard (pipeline)
  - RFQs  ← default landing
  - Requests (incoming, awaiting review)
  - Vendors (read-only master)
  - Sidebar footer: "● Prototype — seeded demo data"
- **Top bar**: left = breadcrumb / page title; right = **Category context chip**, **"Viewing as: [Role] ▾"** switcher (Sourcing Manager / Procurement), **Reset demo** button, user avatar (initials "SM").
- **Content area**: cards on `--bg`.

### Role switcher behavior (important for demo)
- **Procurement** role: can create Requests, see their own requests' status. Cannot approve/award. RFQ workspace is read-only for them.
- **Sourcing Manager** role: full workflow — review requests, create RFQs, select vendors, dispatch, compare, negotiate, award.
- Switching role just changes which actions are enabled + which nav items are emphasized. No real auth. Default role = Sourcing Manager.

### Routes
```
/                         → redirect to /rfqs
/dashboard                → Pipeline dashboard
/rfqs                     → RFQ list
/rfqs/:id                 → RFQ Workspace (tabbed) ← HERO CONTAINER
/requests                 → Requests list (incoming)
/requests/new             → Request creation form (or Excel upload sim)
/requests/:id             → Request review (Sourcing Manager approves/edits/sends back)
/vendors                  → Vendor master (read-only)
```

### RFQ Workspace tabs (single context, never leave)
1. **Overview** — field grid + status + timeline + key dates
2. **Vendors** — selected vendors + per-vendor response status
3. **Comparison** — THE HERO SCREEN (quote matrix)
4. **Negotiation** — conversational round tracker
5. **Inbox** — raw vendor emails + attachments (proves email-native capture + shows extraction)
6. **Award** — final decision + justification + audit trail + handoff line

Tabs (not separate routes) so the manager stays in one workspace — this is the brief's most important UX principle.

---

## 5. DATA MODEL (seed.ts shapes)

Keep it exactly this small. TypeScript types:

```ts
type Role = 'sourcing_manager' | 'procurement';
type Category = 'freight' | 'chemicals';

type RequestStatus = 'draft' | 'pending_review' | 'approved' | 'sent_back';
type RfqStatus =
  | 'draft' | 'sent' | 'awaiting_responses' | 'partially_responded'
  | 'under_negotiation' | 'awarded';
type ResponseStatus = 'no_response' | 'responded' | 'late' | 'incomplete';
type ExtractionStatus = 'success' | 'partial' | 'manual_review';
type Confidence = 'high' | 'low' | 'missing';

interface SourcingRequest {
  id: string;              // REQ-0001
  category: Category;
  status: RequestStatus;
  createdBy: string;       // person name
  createdAt: string;       // ISO
  // category-specific fields stored in a flexible record:
  fields: Record<string, string>;
  reviewNote?: string;     // when sent back
}

interface Vendor {
  id: string;              // VEN-FR-001
  name: string;
  code: string;
  email: string;
  category: Category;
  subCategory?: string;    // e.g. "Road - FTL"
  region?: string;
}

interface ExtractedField {
  value: string;
  confidence: Confidence;
}

interface QuoteVersion {
  versionNo: number;       // 1, 2, 3...
  receivedAt: string;
  source: 'email_body' | 'pdf' | 'excel';
  extractionStatus: ExtractionStatus;
  // structured extracted quote (all editable in UI):
  basePrice: ExtractedField;     // for freight: the freight rate
  taxes: ExtractedField;
  freight: ExtractedField;       // for chemicals: separate freight; for freight may be N/A
  leadTime: ExtractedField;
  paymentTerms: ExtractedField;
  validity: ExtractedField;
  deviations: string[];          // human-readable deviation notes vs requested terms
  rawEmailId: string;            // links to the seeded email
  isCounterResponse?: boolean;   // true if this version is a reply to our counter
  landedCost?: number;           // computed, not extracted
}

interface VendorOnRfq {
  vendorId: string;
  responseStatus: ResponseStatus;
  quotes: QuoteVersion[];        // version history, latest = highest versionNo
}

interface NegotiationEvent {
  id: string;
  vendorId: string;
  round: number;
  type: 'counter_sent' | 'vendor_revised';
  at: string;
  message: string;               // what the SM said / what vendor replied
  priceAtEvent?: string;
}

interface Award {
  awardedVendorId: string;
  awardedAt: string;
  awardedBy: string;
  justification: string;         // required, esp. if not L1
  finalPrice: string;
  wasL1: boolean;
}

interface Rfq {
  id: string;                    // RFQ-2026-0042
  category: Category;
  status: RfqStatus;
  fromRequestId: string;
  title: string;                 // e.g. "Malanpur → Hooghly · Weekly · 32ft Closed"
  fields: Record<string,string>; // the sourcing spec (origin, dest, vehicle, etc.)
  terms: { paymentTerms: string; validityRequired: string; };
  deadline: string;              // ISO
  createdAt: string;
  vendors: VendorOnRfq[];
  negotiations: NegotiationEvent[];
  award?: Award;
  emails: VendorEmail[];         // captured inbox for this RFQ
}

interface VendorEmail {
  id: string;
  vendorId: string;
  receivedAt: string;
  subject: string;
  body: string;                  // realistic, messy, vendor-style prose
  attachments: { name: string; type: 'pdf'|'xlsx' }[];
  extractedToVersion?: number;   // which quote version this produced
}
```

### Category field definitions (drive forms + columns dynamically)
```ts
const CATEGORY_FIELDS = {
  freight: [
    { key: 'material', label: 'Material Name' },
    { key: 'weightLoad', label: 'Weight / Load' },
    { key: 'mode', label: 'Mode of Transportation', options: ['Road','Train','Sea','Air'] },
    { key: 'loadType', label: 'Load Type', options: ['Full Truck Load (FTL)','Partial Truck Load (PTL)'] },
    { key: 'vehicleType', label: 'Vehicle Type', options: ['9 MT 32 FT Single Axle Closed','19 MT 32 FT Multi Axle','7 MT 19 FT Open'] },
    { key: 'origin', label: 'Origin Location', master: true, options: ['Malanpur','Mumbai','Chennai'] },
    { key: 'destination', label: 'Destination Location', master: true, options: ['Hooghly','Bengaluru','Delhi'] },
    { key: 'frequency', label: 'Frequency', options: ['One-time movement','Weekly','Monthly','Quarterly'] },
  ],
  chemicals: [
    { key: 'material', label: 'Material Name' },
    { key: 'location', label: 'Location' },
    { key: 'quantityUom', label: 'Quantity and UoM' },
    { key: 'deliveryType', label: 'Delivery Type', options: ['Delivered','Ex-Works','FOR'] },
    { key: 'deliveryMode', label: 'Delivery Mode', options: ['Tanker','Drum','IBC','Bag'] },
    { key: 'validityUpto', label: 'Validity Upto', type: 'date' },
  ],
};
```
For `master: true` fields (origin/destination): user picks a location NAME from a dropdown; the full address is auto-resolved from a `LOCATION_MASTER` map and shown as read-only helper text under the field. This demonstrates master-data resolution.

```ts
const LOCATION_MASTER = {
  Malanpur: 'Plot 14, Malanpur Industrial Area, Bhind, Madhya Pradesh 477117',
  Hooghly:  'Godrej Depot, GT Road, Bhadreswar, Hooghly, West Bengal 712124',
  // ...etc
};
```

---

## 6. SEED DATA REQUIREMENTS (make the demo feel real)

Create realistic, specific seed data. Vendor names must sound like real Indian freight operators (e.g. "Sterling Roadlines Pvt Ltd", "Eastern Cargo Movers", "Bharat Freight Carriers", "Apex Logistics Solutions", "Konkan Transport Co"). Chemicals vendors sound like chem distributors.

Seed at least:
- **6 freight vendors** mapped to Road/FTL + Malanpur–Hooghly lane, **3 chemicals vendors**.
- **3 Requests**: one freight `approved` (→ became the hero RFQ), one freight `pending_review` (to demo the review/approve flow live), one chemicals `pending_review`.
- **2 RFQs**:
  - **HERO RFQ** `RFQ-2026-0042`, freight, Malanpur→Hooghly, 32ft Closed, Weekly, status `under_negotiation`, sent to 6 vendors. Response mix:
    - 4 vendors **responded** with quotes (varied landed costs so an L1 emerges).
    - 1 vendor **no_response** (demo the chase/reminder edge case).
    - 1 vendor **late** + **incomplete** (responded but missing fields → amber).
    - Of the 4 responders: 2 are `success` extraction, 1 is `partial` (missing payment terms → amber + needs review), 1 is `manual_review` (sent a PDF the bot "couldn't parse" → red, raw attachment shown, user fills manually).
    - At least 2 vendors should have **deviations** (e.g. "Payment terms 45 days vs requested 30", "Validity 7 days vs requested 15").
    - At least 1 vendor should have a **negotiation history**: original quote v1, SM counter, vendor revised v2 (lower) → show rounds.
    - The L1 after negotiation should NOT be the cheapest on raw price for at least one comparison, so the "award non-L1 with justification" story is possible. (Make it subtle and realistic.)
  - **SECOND RFQ** chemicals, status `awaiting_responses`, just to show category-awareness (different fields, different columns). Lighter data is fine.
- Realistic **vendor emails**: messy, human prose. One pastes numbers in a sentence; one attaches an Excel; one attaches a PDF (the manual-review one); one writes a clean table-ish reply. Subjects like "RE: RFQ-2026-0042 Freight Quote Malanpur-Hooghly".
- **Landed cost** = basePrice + taxes + freight (compute in a selector; for freight where freight is the price itself, set freight field to "—" and landed = basePrice + taxes).

---

## 7. SCREEN SPECS (in priority order from the brief)

### 7.1 HERO — Comparison tab (`/rfqs/:id` → Comparison)
The make-or-break screen. Layout top to bottom:
1. **RFQ context strip** (sticky): `RFQ-2026-0042` mono · title `Malanpur → Hooghly` with a small arrow glyph · chips: Vehicle, Frequency, Deadline, status pill. Always visible so context never lost.
2. **Comparison matrix**: vendors as ROWS, attributes as COLUMNS. Columns: Vendor (name + code mono + response pill) | Base/Rate | Taxes | Freight | **Landed Cost** (bold, tabular) | Lead Time | Payment Terms | Validity | Deviations | (action). 
   - Each numeric cell shows a **confidence dot** + value; click any cell to edit inline (editing updates state).
   - The lowest landed cost row gets an **L1 badge** (accent pill "L1") and a subtle accent-tinted row background.
   - **Deviations** column shows amber pills, one per deviation; empty = a faint "—".
   - **Incomplete / missing** values render as amber "Needs review" tag, not blank.
   - The **manual_review** vendor's quote cells are mostly empty with a red "Extraction failed — open in Inbox" inline link; clicking jumps to Inbox tab for that email.
   - Rows animate in staggered on load.
3. **Decision bar** (bottom, sticky): shows current L1 vendor + landed cost; primary button **"Award RFQ"** (opens Award flow). Secondary: **"Send counter-offer"** (opens negotiation composer). Note text: "Supports line-item award" (label only).
4. A small toggle: **"Show negotiated prices"** — when on, the matrix shows latest negotiated version instead of original v1, with a tiny "v2 ↓ from ₹X" indicator. This visibly demonstrates versioning on the hero screen.

### 7.2 RFQ Workspace container + Overview tab
- Tabbed header (the 6 tabs). Active tab underlined in accent.
- **Overview**: label-above-value field grid (reuse reference pattern) for the sourcing spec; a **timeline** component on the right (Created → Sent → 4/6 responded → Negotiation R1 → …) using status dots; key dates (deadline, days remaining — turn amber if <2 days). Terms card. A "Vendors invited: 6 · Responded: 4 · Awaiting: 1 · No response: 1" summary strip with the reminder CTA on the no-response one.

### 7.3 Negotiation tab
- Per-vendor **conversational thread**: alternating bubbles — left = vendor quote/revision, right = SM counter — each stamped with round number, time, price. Reads like a chat but is structured. 
- A **composer** at the bottom to "send counter" (pick vendor, enter target price + note) → appends a `counter_sent` event and (for demo) optionally auto-generates a seeded `vendor_revised` reply after a short delay to show the loop closing.
- Clear "Latest position" summary per vendor at top of each thread. History obvious without reading raw emails (the brief's requirement).

### 7.4 RFQ Creation flow
- Triggered from an approved Request ("Create RFQ" button on `/requests/:id` when approved, SM role).
- A focused form / modal: auto-fills spec fields from the request (read-only-ish, editable), sets terms (payment terms, required validity), deadline (date), template preview (a category-specific RFQ email template with merge fields filled), attachments (mock file chips).
- On "Create & Select Vendors" → creates RFQ in `draft`, goes to Vendors tab.

### 7.5 Vendor Selection (Vendors tab when draft)
- Vendors filtered by the RFQ's category + sub-category + lane/region from the master. Multi-select list with checkboxes (name, code, email, region, sub-category). No free-text search/add (discovery out of scope) — just select from the mapped pool.
- "Send RFQ to N vendors" button → simulates dispatch: sets RFQ to `sent`/`awaiting_responses`, creates `VendorOnRfq` entries (all `no_response`), shows a toast "RFQ emails sent from freight.sourcing@godrejcp.com to N vendors". (For the hero RFQ this is already past; this flow is demoed on a fresh RFQ.)

### 7.6 Inbox tab
- List of captured `VendorEmail`s for this RFQ (from = vendor, subject, time, attachment chips). Click an email → split view: raw messy email body + attachments on left; **extracted quote panel** on right with the extraction theatre (if not yet "extracted", a "Run extraction" button triggers the ~1.5s shimmer then reveals fields with confidence dots). Shows the success/partial/manual states. "Apply to comparison" confirms the extracted version into the quote matrix. Editable fields throughout.
- This tab is what proves the email-to-structured-data core. Make the raw emails genuinely messy and the extraction reveal satisfying.

### 7.7 Award tab / flow
- Shows the recommended L1 + all vendors' final landed costs. SM selects winning vendor. **Justification textarea is required**; if the selected vendor is NOT L1, show an amber note "Awarding above L1 — justification required" and require a longer note.
- "Confirm Award" → sets RFQ `awarded`, records `Award`, locks editing, shows an **audit trail** (who/when/why, original vs final price, negotiation rounds count) and a single muted handoff line: **"Award completed · Sent to procurement execution →"** (NOT a link to anything real).

### 7.8 Requests list + creation + review
- **List**: cards/rows with category chip, key spec summary, status pill, creator, date. Procurement sees create button; SM sees review queue.
- **Creation** (`/requests/new`): category selector first (freight/chemicals) → renders the category-specific form from `CATEGORY_FIELDS`. Master-resolved origin/destination show auto address. Also a tab "Upload Excel" that simulates an Excel upload (fake file drop → pre-fills the form from a seeded parse) to honor the "form OR Excel upload" requirement. Submit → `pending_review`.
- **Review** (`/requests/:id`, SM): shows submitted fields; actions **Approve** / **Edit** / **Send back** (with note). Approve → `approved` + reveals "Create RFQ".

### 7.9 Dashboard (light)
- A **pipeline** view, not a stats wall: columns or a funnel showing counts by stage (Requests pending, RFQs awaiting responses, Under negotiation, Awarded). A few KPI stat cards (reuse reference style) BUT keep it minimal: "Open RFQs", "Awaiting responses", "Avg responses per RFQ", "Awarded this month". A recent-activity list. This is secondary — do not over-invest.

### 7.10 Vendors (read-only master)
- Simple table grouped by category → sub-category, with code/email/region. Read-only (a faint note: "Vendor master is managed externally"). Demonstrates the pre-mapped pool without building onboarding.

---

## 8. EDGE CASES TO SURFACE VISUALLY (from the brief)
- No response → red pill + "Send reminder" CTA (clicking shows toast "Reminder sent", flips to a "Reminded" sub-state).
- Late response → amber "Late" tag on the vendor.
- Incomplete quote → amber "Needs review", missing cells flagged.
- Extraction failed → red, raw attachment shown, manual entry path.
- Revised quote → version indicator + negotiation thread.
- Deviation from terms → amber deviation pills on comparison.
Do NOT build any procurement-execution edge cases.

---

## 9. FILE STRUCTURE (Cursor: create exactly this)
```
src/
  main.tsx
  App.tsx                      // router + providers
  index.css                    // tokens, fonts, base
  data/
    seed.ts                    // all seed data + CATEGORY_FIELDS + LOCATION_MASTER
    types.ts                   // the interfaces above
  store/
    StoreContext.tsx           // context + reducer + localStorage sync + reset
    selectors.ts               // landedCost, l1Vendor, latestQuote, etc.
  components/
    shell/AppShell.tsx         // sidebar + topbar + outlet
    shell/Sidebar.tsx
    shell/TopBar.tsx           // role switcher, reset demo, category chip
    ui/StatusPill.tsx
    ui/ConfidenceDot.tsx
    ui/FieldGrid.tsx           // label-above-value
    ui/Pill.tsx  ui/Button.tsx  ui/Card.tsx  ui/Toast.tsx  ui/Tabs.tsx
    ui/Timeline.tsx
  pages/
    Dashboard.tsx
    RfqList.tsx
    RfqWorkspace.tsx           // tab host
    rfq/OverviewTab.tsx
    rfq/VendorsTab.tsx         // selection (draft) + status (sent)
    rfq/ComparisonTab.tsx      // HERO
    rfq/NegotiationTab.tsx
    rfq/InboxTab.tsx           // + extraction theatre
    rfq/AwardTab.tsx
    RequestList.tsx
    RequestNew.tsx             // form + excel-upload sim
    RequestReview.tsx
    Vendors.tsx
  lib/
    format.ts                  // inr(), date helpers, tnum money
    extraction.ts              // simulateExtraction(emailId) -> returns seeded result w/ delay
```

---

## 10. BUILD ORDER (Cursor: do in this sequence, commit after each)
1. Scaffold Vite+React+TS+Tailwind, fonts, tokens, base UI primitives (Button, Card, Pill, StatusPill, ConfidenceDot, FieldGrid, Tabs, Toast).
2. types.ts + seed.ts (full realistic seed per §6) + StoreContext + selectors.
3. AppShell (Sidebar + TopBar with role switcher + Reset demo + footer marker) + routing.
4. RfqList + RfqWorkspace shell with 6 tabs.
5. **ComparisonTab (HERO)** — full per §7.1. Get this great before anything else cosmetic.
6. OverviewTab + Timeline.
7. InboxTab + extraction theatre (lib/extraction.ts).
8. NegotiationTab + composer + auto-reply sim.
9. AwardTab + audit + handoff line.
10. Requests (list/new/review) + RFQ creation flow + VendorsTab selection + dispatch sim.
11. Dashboard (light) + Vendors master.
12. Polish: motion, empty/edge states, responsive down to ~1100px, "Viewing as" gating, localStorage persist + reset, final palette/spacing pass.

---

## 11. DEPLOY (human will run these; keep app static-deployable)
- `npm create vite@latest` (react-ts), install deps, build must produce a static `dist/`.
- Vercel: framework preset "Vite", build `npm run build`, output `dist`. No env vars (no backend).
- Git: standard repo; Cursor should keep commits small and labeled per build-order step.

---

## 12. ACCEPTANCE CHECK (the demo must do all of this in <15 min)
1. Switch role to Procurement → create a freight request (origin Malanpur auto-resolves address) → submit.
2. Switch to Sourcing Manager → review that request → approve → Create RFQ → select vendors → "send" (toast from freight.sourcing@godrejcp.com).
3. Open the HERO RFQ-2026-0042 → Inbox: open a messy email → run extraction → watch theatre → see success vs partial vs failed → edit a field.
4. Comparison: see matrix, L1 badge, deviation pills, needs-review tags, toggle negotiated prices.
5. Negotiation: see rounds, send a counter, see the revised quote appear.
6. Award: pick a non-L1 vendor → required justification → confirm → audit trail + "sent to procurement execution" handoff.
7. Reset demo restores everything.
Everything must work offline with zero network calls.
