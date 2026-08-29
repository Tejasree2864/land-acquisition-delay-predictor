import type { RiskLevel } from '../types'

const cls: Record<RiskLevel, string> = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <span className={`badge ${cls[level]}`}>{level}</span>
}
