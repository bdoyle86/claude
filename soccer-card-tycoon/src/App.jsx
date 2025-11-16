import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import PackStore from './pages/PackStore'
import PackOpening from './pages/PackOpening'
import Collection from './pages/Collection'
import Market from './pages/Market'
import TeamManager from './pages/TeamManager'
import Battle from './pages/Battle'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/packs"
            element={
              <ProtectedRoute>
                <PackStore />
              </ProtectedRoute>
            }
          />

          <Route
            path="/open-pack"
            element={
              <ProtectedRoute>
                <PackOpening />
              </ProtectedRoute>
            }
          />

          <Route
            path="/collection"
            element={
              <ProtectedRoute>
                <Collection />
              </ProtectedRoute>
            }
          />

          <Route
            path="/market"
            element={
              <ProtectedRoute>
                <Market />
              </ProtectedRoute>
            }
          />

          <Route
            path="/team-manager"
            element={
              <ProtectedRoute>
                <TeamManager />
              </ProtectedRoute>
            }
          />

          <Route
            path="/battle"
            element={
              <ProtectedRoute>
                <Battle />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
