import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Parcels } from './pages/Parcels'
import { ParcelDetail } from './pages/ParcelDetail'
import { Predict } from './pages/Predict'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/parcels" element={<Parcels />} />
        <Route path="/parcels/:id" element={<ParcelDetail />} />
        <Route path="/predict" element={<Predict />} />
      </Routes>
    </Layout>
  )
}
