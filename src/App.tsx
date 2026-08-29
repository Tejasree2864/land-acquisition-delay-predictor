import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Parcels } from './pages/Parcels'
import { ParcelDetail } from './pages/ParcelDetail'
import { Predict } from './pages/Predict'
import { Login } from './pages/Login'
import { ProtectedRoute } from './auth/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/parcels" element={<Parcels />} />
                <Route path="/parcels/:id" element={<ParcelDetail />} />
                <Route path="/predict" element={<Predict />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
