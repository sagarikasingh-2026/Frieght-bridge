import type { RfqStatus } from '../data/types'
import type { StatusVariant } from '../components/ui/StatusPill'

export function rfqStatusToPill(status: RfqStatus): StatusVariant {
  const map: Record<RfqStatus, StatusVariant> = {
    draft: 'draft',
    sent: 'rfq_sent',
    awaiting_responses: 'awaiting_responses',
    partially_responded: 'partially_responded',
    under_negotiation: 'under_negotiation',
    awarded: 'awarded',
  }
  return map[status]
}
