import type { Confidence } from '../../data/types'

const tooltips: Record<Confidence, string> = {
  high: 'High confidence',
  low: 'Needs review',
  missing: 'Could not extract',
}

const dotColors: Record<Confidence, string> = {
  high: 'bg-[var(--green)]',
  low: 'bg-[var(--amber)]',
  missing: 'bg-[var(--red)]',
}

interface ConfidenceDotProps {
  confidence: Confidence
  className?: string
}

export function ConfidenceDot({ confidence, className = '' }: ConfidenceDotProps) {
  return (
    <span
      title={tooltips[confidence]}
      className={[
        'inline-block h-2 w-2 rounded-full shrink-0',
        dotColors[confidence],
        className,
      ].join(' ')}
    />
  )
}
