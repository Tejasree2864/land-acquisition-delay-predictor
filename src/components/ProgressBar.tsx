export function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="progress">
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  )
}

export function colorForScore(score: number): string {
  if (score >= 75) return '#7f1d1d'
  if (score >= 55) return '#dc2626'
  if (score >= 30) return '#d97706'
  return '#16a34a'
}
