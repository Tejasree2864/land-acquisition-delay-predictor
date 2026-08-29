import { useMemo, useState } from 'react'
import { Sparkles, Lightbulb } from 'lucide-react'
import type { Parcel } from '../types'
import { predict } from '../lib/riskEngine'
import { RiskBadge } from '../components/Badge'
import { ProgressBar, colorForScore } from '../components/ProgressBar'

const defaultForm: Parcel = {
  id: 'WHATIF',
  projectName: 'New Assessment',
  district: '—',
  state: '—',
  areaHectares: 100,
  affectedFamilies: 150,
  landType: 'Agricultural',
  stage: 'Survey',
  daysInCurrentStage: 60,
  pendingLitigations: 1,
  compensationDisputes: 1,
  ownerConsentPct: 70,
  documentationCompletePct: 75,
  budgetApproved: true,
  monsoonSeason: false,
  publicObjections: 5,
  startDate: '2024-06-01',
  targetHandoverDate: '2025-12-31',
}

export function Predict() {
  const [form, setForm] = useState<Parcel>(defaultForm)
  const result = useMemo(() => predict(form), [form])
  const color = colorForScore(result.score)

  function num<K extends keyof Parcel>(key: K, v: string) {
    setForm((f) => ({ ...f, [key]: Number(v) }))
  }

  return (
    <>
      <div className="section-title">Delay Risk Predictor</div>
      <div className="section-sub">
        Adjust the parameters of a proposed or ongoing acquisition to see its predicted delay risk in real time.
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <div className="card-title">Acquisition Parameters</div>
          <div className="card-desc">Everything updates the prediction instantly</div>

          <div className="form-grid">
            <div className="field">
              <label>Land type</label>
              <select value={form.landType} onChange={(e) => setForm((f) => ({ ...f, landType: e.target.value as Parcel['landType'] }))}>
                <option>Agricultural</option>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Forest</option>
                <option>Barren</option>
              </select>
            </div>
            <div className="field">
              <label>Current stage</label>
              <select value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as Parcel['stage'] }))}>
                <option>Notification</option>
                <option>Survey</option>
                <option>Valuation</option>
                <option>Compensation</option>
                <option>Possession</option>
              </select>
            </div>

            <div className="field">
              <label>Days in current stage: {form.daysInCurrentStage}</label>
              <input type="range" min={0} max={300} value={form.daysInCurrentStage} onChange={(e) => num('daysInCurrentStage', e.target.value)} />
            </div>
            <div className="field">
              <label>Owner consent: {form.ownerConsentPct}%</label>
              <input type="range" min={0} max={100} value={form.ownerConsentPct} onChange={(e) => num('ownerConsentPct', e.target.value)} />
            </div>

            <div className="field">
              <label>Documentation complete: {form.documentationCompletePct}%</label>
              <input type="range" min={0} max={100} value={form.documentationCompletePct} onChange={(e) => num('documentationCompletePct', e.target.value)} />
            </div>
            <div className="field">
              <label>Pending litigations: {form.pendingLitigations}</label>
              <input type="range" min={0} max={10} value={form.pendingLitigations} onChange={(e) => num('pendingLitigations', e.target.value)} />
            </div>

            <div className="field">
              <label>Compensation disputes: {form.compensationDisputes}</label>
              <input type="range" min={0} max={12} value={form.compensationDisputes} onChange={(e) => num('compensationDisputes', e.target.value)} />
            </div>
            <div className="field">
              <label>Public objections: {form.publicObjections}</label>
              <input type="range" min={0} max={50} value={form.publicObjections} onChange={(e) => num('publicObjections', e.target.value)} />
            </div>

            <div className="field">
              <label>Affected families</label>
              <input type="number" min={0} value={form.affectedFamilies} onChange={(e) => num('affectedFamilies', e.target.value)} />
            </div>
            <div className="field">
              <label>Area (hectares)</label>
              <input type="number" min={0} value={form.areaHectares} onChange={(e) => num('areaHectares', e.target.value)} />
            </div>

            <div className="field">
              <label>Budget approved</label>
              <select value={form.budgetApproved ? 'yes' : 'no'} onChange={(e) => setForm((f) => ({ ...f, budgetApproved: e.target.value === 'yes' }))}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="field">
              <label>Monsoon window</label>
              <select value={form.monsoonSeason ? 'yes' : 'no'} onChange={(e) => setForm((f) => ({ ...f, monsoonSeason: e.target.value === 'yes' }))}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <div className="card card-pad" style={{ marginBottom: 18 }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={17} color="#4f46e5" /> Prediction
            </div>
            <div className="result-gauge">
              <div className="score" style={{ color }}>{result.score}</div>
              <div className="hint" style={{ marginBottom: 10 }}>delay-risk score / 100</div>
              <RiskBadge level={result.level} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
                <div className="hint">Predicted delay</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{result.predictedDelayDays}d</div>
              </div>
              <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
                <div className="hint">On-time probability</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>{result.onTimeProbability}%</div>
              </div>
            </div>
          </div>

          <div className="card card-pad">
            <div className="card-title">Top Contributing Factors</div>
            <div className="card-desc">Biggest drivers of this score</div>
            {result.factors.slice(0, 5).map((f) => (
              <div className="factor-row" key={f.name}>
                <div className="factor-name">{f.name}</div>
                <div className="factor-bar">
                  <ProgressBar value={f.contribution * 3.5} color={color} />
                </div>
                <div className="factor-val">+{f.contribution}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="card-title">Recommended Actions</div>
        <div className="card-desc">Suggested mitigations for the current scenario</div>
        {result.recommendations.map((r, i) => (
          <div className="recommendation" key={i}>
            <Lightbulb size={18} color="#4f46e5" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{r}</span>
          </div>
        ))}
      </div>
    </>
  )
}
