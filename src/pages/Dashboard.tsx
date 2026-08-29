import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { AlertTriangle, Clock, ShieldCheck, Layers } from 'lucide-react'
import { parcels } from '../lib/data'
import { predict, levelFromScore } from '../lib/riskEngine'
import { RiskBadge } from '../components/Badge'
import { ProgressBar, colorForScore } from '../components/ProgressBar'
import type { RiskLevel } from '../types'

const LEVEL_COLORS: Record<RiskLevel, string> = {
  Low: '#16a34a',
  Medium: '#d97706',
  High: '#dc2626',
  Critical: '#7f1d1d',
}

export function Dashboard() {
  const navigate = useNavigate()

  const rows = useMemo(
    () => parcels.map((p) => ({ parcel: p, result: predict(p) })),
    [],
  )

  const total = rows.length
  const atRisk = rows.filter((r) => r.result.level === 'High' || r.result.level === 'Critical').length
  const avgScore = Math.round(rows.reduce((s, r) => s + r.result.score, 0) / total)
  const avgDelay = Math.round(rows.reduce((s, r) => s + r.result.predictedDelayDays, 0) / total)

  const distribution = useMemo(() => {
    const counts: Record<RiskLevel, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 }
    rows.forEach((r) => counts[r.result.level]++)
    return (Object.keys(counts) as RiskLevel[]).map((k) => ({ name: k, value: counts[k] }))
  }, [rows])

  const byStage = useMemo(() => {
    const map: Record<string, { stage: string; avg: number; n: number }> = {}
    rows.forEach((r) => {
      const s = r.parcel.stage
      if (!map[s]) map[s] = { stage: s, avg: 0, n: 0 }
      map[s].avg += r.result.score
      map[s].n++
    })
    return Object.values(map).map((m) => ({ stage: m.stage, score: Math.round(m.avg / m.n) }))
  }, [rows])

  const topRisk = [...rows].sort((a, b) => b.result.score - a.result.score).slice(0, 5)

  return (
    <>
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Layers size={20} />
          </div>
          <div className="kpi-label">Active Acquisitions</div>
          <div className="kpi-value">{total}</div>
          <div className="kpi-trend" style={{ color: '#64748b' }}>Across 9 states</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="kpi-label">High / Critical Risk</div>
          <div className="kpi-value">{atRisk}</div>
          <div className="kpi-trend" style={{ color: '#dc2626' }}>Needs intervention</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div className="kpi-label">Avg Predicted Delay</div>
          <div className="kpi-value">{avgDelay}d</div>
          <div className="kpi-trend" style={{ color: '#64748b' }}>vs. planned timeline</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="kpi-label">Avg Risk Score</div>
          <div className="kpi-value">{avgScore}</div>
          <div className="kpi-trend" style={{ color: colorForScore(avgScore) }}>
            {levelFromScore(avgScore)} portfolio risk
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <div className="card-title">Average Risk Score by Acquisition Stage</div>
          <div className="card-desc">Where in the pipeline delays are concentrating</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byStage} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {byStage.map((d, i) => (
                  <Cell key={i} fill={colorForScore(d.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-pad">
          <div className="card-title">Risk Distribution</div>
          <div className="card-desc">Portfolio spread by risk level</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={distribution}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
              >
                {distribution.map((d) => (
                  <Cell key={d.name} fill={LEVEL_COLORS[d.name as RiskLevel]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card card-pad">
        <div className="card-title">Top Priority Parcels</div>
        <div className="card-desc">Highest delay-risk cases — click a row for the full breakdown</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Parcel ID</th>
                <th>Project</th>
                <th>District</th>
                <th>Stage</th>
                <th>Risk Score</th>
                <th>Predicted Delay</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {topRisk.map(({ parcel, result }) => (
                <tr key={parcel.id} onClick={() => navigate(`/parcels/${parcel.id}`)}>
                  <td style={{ fontWeight: 600 }}>{parcel.id}</td>
                  <td>{parcel.projectName}</td>
                  <td>{parcel.district}, {parcel.state}</td>
                  <td><span className="tag">{parcel.stage}</span></td>
                  <td style={{ width: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <ProgressBar value={result.score} color={colorForScore(result.score)} />
                      </div>
                      <b>{result.score}</b>
                    </div>
                  </td>
                  <td>{result.predictedDelayDays} days</td>
                  <td><RiskBadge level={result.level} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
