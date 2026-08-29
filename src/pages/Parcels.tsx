import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { parcels } from '../lib/data'
import { predict } from '../lib/riskEngine'
import { RiskBadge } from '../components/Badge'
import { ProgressBar, colorForScore } from '../components/ProgressBar'
import type { RiskLevel } from '../types'

export function Parcels() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<RiskLevel | 'All'>('All')
  const [stageFilter, setStageFilter] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'score' | 'delay' | 'id'>('score')

  const rows = useMemo(
    () => parcels.map((p) => ({ parcel: p, result: predict(p) })),
    [],
  )

  const stages = useMemo(
    () => Array.from(new Set(parcels.map((p) => p.stage))),
    [],
  )

  const filtered = useMemo(() => {
    let out = rows.filter(({ parcel, result }) => {
      const q = query.toLowerCase()
      const matchesQuery =
        !q ||
        parcel.id.toLowerCase().includes(q) ||
        parcel.projectName.toLowerCase().includes(q) ||
        parcel.district.toLowerCase().includes(q) ||
        parcel.state.toLowerCase().includes(q)
      const matchesLevel = levelFilter === 'All' || result.level === levelFilter
      const matchesStage = stageFilter === 'All' || parcel.stage === stageFilter
      return matchesQuery && matchesLevel && matchesStage
    })

    out = [...out].sort((a, b) => {
      if (sortBy === 'score') return b.result.score - a.result.score
      if (sortBy === 'delay') return b.result.predictedDelayDays - a.result.predictedDelayDays
      return a.parcel.id.localeCompare(b.parcel.id)
    })
    return out
  }, [rows, query, levelFilter, stageFilter, sortBy])

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <Search size={17} color="#94a3b8" />
          <input
            placeholder="Search by ID, project, district or state…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="select" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as RiskLevel | 'All')}>
          <option value="All">All risk levels</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select className="select" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
          <option value="All">All stages</option>
          {stages.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'score' | 'delay' | 'id')}>
          <option value="score">Sort: Risk score</option>
          <option value="delay">Sort: Predicted delay</option>
          <option value="id">Sort: Parcel ID</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Parcel ID</th>
                <th>Project</th>
                <th>Location</th>
                <th>Land Type</th>
                <th>Stage</th>
                <th>Risk Score</th>
                <th>Delay</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ parcel, result }) => (
                <tr key={parcel.id} onClick={() => navigate(`/parcels/${parcel.id}`)}>
                  <td style={{ fontWeight: 600 }}>{parcel.id}</td>
                  <td>{parcel.projectName}</td>
                  <td>{parcel.district}, {parcel.state}</td>
                  <td><span className="tag">{parcel.landType}</span></td>
                  <td>{parcel.stage}</td>
                  <td style={{ width: 170 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <ProgressBar value={result.score} color={colorForScore(result.score)} />
                      </div>
                      <b>{result.score}</b>
                    </div>
                  </td>
                  <td>{result.predictedDelayDays}d</td>
                  <td><RiskBadge level={result.level} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>
                    No parcels match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
