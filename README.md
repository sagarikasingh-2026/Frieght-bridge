# Godrej Freight Bridge

Email-to-decision freight sourcing prototype for Godrej (seeded demo data, no backend).

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import in [Vercel](https://vercel.com) — project name: **godrej-freight-bridge**
3. Framework: **Vite** · Build: `npm run build` · Output: `dist`
4. No environment variables required.

Your live URL will be like `https://godrej-freight-bridge.vercel.app`.

## Demo flow

1. **Procurement** → Requests → New request (Malanpur origin shows resolved address) → Submit  
2. **Sourcing Manager** → Review → Approve → Create RFQ → Select vendors → Send  
3. Open **RFQ-2026-0042** → Inbox / Comparison / Negotiation / Award  
4. **Reset demo** in the top bar restores seed data  
