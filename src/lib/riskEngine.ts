import type { Parcel, PredictionResult, RiskFactor, RiskLevel } from '../types'

/**
 * Predictive risk-scoring engine for land acquisition delays.
 *
 * This is a transparent, weighted heuristic model. Each signal is normalized
 * to a 0-1 pressure value, multiplied by an interpretable weight, and summed
 * into a 0-100 risk score. Every factor exposes its own contribution so the UI
 * can explain *why* a parcel is flagged (explainable predictions).
 *
 * In a production system this same interface would be backed by a trained
 * gradient-boosted / logistic model; the heuristic keeps the demo fully
 * offline and deterministic while behaving realistically.
 */

interface WeightedSignal {
  name: string
  weight: number // relative importance
  pressure: number // 0-1 normalized risk pressure
  detail: string
}

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))

function buildSignals(p: Parcel): WeightedSignal[] {
  // Expected days per stage before it is considered "stalled"
  const stageThreshold: Record<Parcel['stage'], number> = {
    Notification: 60,
    Survey: 90,
    Valuation: 75,
    Compensation: 120,
    Possession: 60,
  }
  const threshold = stageThreshold[p.stage]

  return [
    {
      name: 'Stage duration overrun',
      weight: 0.22,
      pressure: clamp((p.daysInCurrentStage / threshold) * 100, 0, 100) / 100,
      detail: `${p.daysInCurrentStage} days in "${p.stage}" (expected ≤ ${threshold})`,
    },
    {
      name: 'Pending litigations',
      weight: 0.18,
      pressure: Math.min(p.pendingLitigations / 5, 1),
      detail: `${p.pendingLitigations} active legal case(s)`,
    },
    {
      name: 'Owner consent shortfall',
      weight: 0.16,
      pressure: (100 - p.ownerConsentPct) / 100,
      detail: `${p.ownerConsentPct}% of owners have consented`,
    },
    {
      name: 'Compensation disputes',
      weight: 0.13,
      pressure: Math.min(p.compensationDisputes / 8, 1),
      detail: `${p.compensationDisputes} unresolved compensation dispute(s)`,
    },
    {
      name: 'Documentation gaps',
      weight: 0.1,
      pressure: (100 - p.documentationCompletePct) / 100,
      detail: `${p.documentationCompletePct}% documentation complete`,
    },
    {
      name: 'Public objections',
      weight: 0.08,
      pressure: Math.min(p.publicObjections / 30, 1),
      detail: `${p.publicObjections} formal public objection(s) filed`,
    },
    {
      name: 'Budget not approved',
      weight: 0.07,
      pressure: p.budgetApproved ? 0 : 1,
      detail: p.budgetApproved ? 'Budget approved' : 'Compensation budget pending approval',
    },
    {
      name: 'Displaced families load',
      weight: 0.04,
      pressure: Math.min(p.affectedFamilies / 400, 1),
      detail: `${p.affectedFamilies} families to be rehabilitated`,
    },
    {
      name: 'Monsoon / seasonal risk',
      weight: 0.02,
      pressure: p.monsoonSeason ? 1 : 0.15,
      detail: p.monsoonSeason ? 'Falls within monsoon window' : 'Outside monsoon window',
    },
  ]
}

export function levelFromScore(score: number): RiskLevel {
  if (score >= 75) return 'Critical'
  if (score >= 55) return 'High'
  if (score >= 30) return 'Medium'
  return 'Low'
}

export function predict(p: Parcel): PredictionResult {
  const signals = buildSignals(p)
  const totalWeight = signals.reduce((s, x) => s + x.weight, 0)

  const score = clamp(
    signals.reduce((s, x) => s + x.pressure * x.weight, 0) * (100 / totalWeight),
  )

  const level = levelFromScore(score)

  // Predicted delay scales with score; land-type multiplier adds realism
  const landTypeMultiplier: Record<Parcel['landType'], number> = {
    Forest: 1.4,
    Agricultural: 1.15,
    Residential: 1.1,
    Commercial: 1.0,
    Barren: 0.7,
  }
  const predictedDelayDays = Math.round(
    (score / 100) * 220 * landTypeMultiplier[p.landType],
  )

  const onTimeProbability = clamp(Math.round(100 - score * 0.92))

  const factors: RiskFactor[] = signals
    .map((s) => ({
      name: s.name,
      weight: s.weight,
      contribution: Math.round((s.pressure * s.weight) * (100 / totalWeight)),
      detail: s.detail,
    }))
    .sort((a, b) => b.contribution - a.contribution)

  const recommendations = buildRecommendations(p, factors)

  return { score: Math.round(score), level, predictedDelayDays, onTimeProbability, factors, recommendations }
}

function buildRecommendations(p: Parcel, factors: RiskFactor[]): string[] {
  const recs: string[] = []
  const top = factors.filter((f) => f.contribution >= 8)

  for (const f of top) {
    switch (f.name) {
      case 'Stage duration overrun':
        recs.push(`Escalate the "${p.stage}" stage — assign a dedicated officer and set a 2-week review checkpoint.`)
        break
      case 'Pending litigations':
        recs.push('Fast-track legal resolution via a Lok Adalat / dedicated land tribunal to clear pending cases.')
        break
      case 'Owner consent shortfall':
        recs.push('Run targeted consent drives and grievance camps for the remaining land owners.')
        break
      case 'Compensation disputes':
        recs.push('Convene a compensation arbitration committee and revisit the valuation methodology.')
        break
      case 'Documentation gaps':
        recs.push('Deploy a digitization task force to complete title verification and survey records.')
        break
      case 'Public objections':
        recs.push('Hold public hearings and publish a transparent rehabilitation & resettlement plan.')
        break
      case 'Budget not approved':
        recs.push('Prioritise budget sanction — flag to the finance department to unblock compensation payouts.')
        break
    }
  }
  if (recs.length === 0) recs.push('On track. Maintain routine monitoring and periodic status reviews.')
  return recs
}
