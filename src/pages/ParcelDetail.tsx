import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Lightbulb, TrendingUp } from 'lucide-react'
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
} from 'recharts'
import { getParcel } from '../lib/data'
import { predict } from '../lib/riskEngine'
import { RiskBadge } from '../components/Badge'
import { ProgressBar, colorForScore } from '../components/ProgressBar'

export function ParcelDetail() {
  const { id } = useParams()
  const parcel = id ? getParcel(id) : undefined

  if (!parcel) {
    return (
      <div className="card card-pad">
        <p>Parcel not found.</p>
        <Link className="back-link" to="/parcels"><ArrowLeft size={15} /> Back to parcels</Link>
      </div>
    )
  }

  const result = predict(parcel)
  const color = colorForScore(result.score)

  const meta: { label: string; value: string }[] = [
    { label: 'Location', value: `${parcel.district}, ${parcel.state}` },
    { label: 'Land Type', value: parcel.landType },
    { label: 'Area', value: `${parcel.areaHectares} ha` },
    { label: 'Affected Families', value: String(parcel.affectedFamilies) },
    { label: 'Current Stage', value: parcel.stage },
    { label: 'Days in Stage', value: `${parcel.daysInCurrentStage} days` },
    { label: 'Owner Consent', value: `${parcel.ownerConsentPct}%` },
    { label: 'Documentation', value: `${parcel.documentationCompletePct}%` },
    { label: 'Target Handover', value: new Date(parcel.targetHandoverDate).toLocaleDateString() },
  ]

  return (
    <>
      <Link className="back-link" to="/parcels"><ArrowLeft size={15} /> Back to parcels</Link>

      <div className="detail-head">
        <div>
          <h2>{parcel.projectName}</h2>
          <p>{parcel.id} · {parcel.district}, {parcel.state}</p>
        </div>
        <RiskBadge level={result.level} />
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <div className="card-title">Risk Signals & Contributions</div>
          <div className="card-desc">
            How each factor contributes to the {result.score}/100 delay-risk score
          </div>
          {result.factors.map((f) => (
            <div className="factor-row" key={f.name}>
              <div className="factor-name" title={f.detail}>{f.name}</div>
              <div className="factor-bar">
                <ProgressBar value={f.contribution * 3.5} color={colorForScore(result.score)} />
                <div className="hint" style={{ marginTop: 5 }}>{f.detail}</div>
              </div>
              <div className="factor-val">+{f.contribution}</div>
            </div>
          ))}
        </div>

        <div className="card card-pad">
          <div className="card-title">Delay Risk Score</div>
          <div className="card-desc">Composite prediction</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              innerRadius="72%"
              outerRadius="100%"
              data={[{ name: 'score', value: result.score, fill: color }]}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background dataKey="value" cornerRadius={12} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ textAlign: 'center', marginTop: -140, marginBottom: 96 }}>
            <div style={{ fontSize: 44, fontWeight: 900, color }}>{result.score}</div>
            <div className="hint">out of 100</div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
              <div className="hint"><TrendingUp size={13} style={{ verticalAlign: -2 }} /> Predicted delay</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{result.predictedDelayDays}d</div>
            </div>
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
              <div className="hint">On-time probability</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2, color: '#16a34a' }}>
                {result.onTimeProbability}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 18 }}>
        <div className="card-title">Case Details</div>
        <div className="card-desc">Recorded acquisition data</div>
        <div className="meta-grid">
          {meta.map((m) => (
            <div className="meta-item" key={m.label}>
              <div className="meta-label">{m.label}</div>
              <div className="meta-value">{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad">
        <div className="card-title">Recommended Interventions</div>
        <div className="card-desc">Prioritised actions to reduce delay risk</div>
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
