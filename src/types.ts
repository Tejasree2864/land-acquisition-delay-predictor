export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'

export type AcquisitionStage =
  | 'Notification'
  | 'Survey'
  | 'Valuation'
  | 'Compensation'
  | 'Possession'

export interface Parcel {
  id: string
  projectName: string
  district: string
  state: string
  areaHectares: number
  affectedFamilies: number
  landType: 'Agricultural' | 'Residential' | 'Commercial' | 'Forest' | 'Barren'
  stage: AcquisitionStage
  // raw signals that feed the model
  daysInCurrentStage: number
  pendingLitigations: number
  compensationDisputes: number
  ownerConsentPct: number // 0-100
  documentationCompletePct: number // 0-100
  budgetApproved: boolean
  monsoonSeason: boolean
  publicObjections: number
  startDate: string // ISO
  targetHandoverDate: string // ISO
}

export interface RiskFactor {
  name: string
  contribution: number // 0-100, how much it adds to the risk score
  weight: number
  detail: string
}

export interface PredictionResult {
  score: number // 0-100
  level: RiskLevel
  predictedDelayDays: number
  onTimeProbability: number // 0-100
  factors: RiskFactor[]
  recommendations: string[]
}
