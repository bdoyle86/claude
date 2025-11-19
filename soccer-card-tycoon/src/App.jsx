import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AchievementProvider } from './contexts/AchievementContext'
import { TradeProvider } from './contexts/TradeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import AchievementNotification from './components/AchievementNotification'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import PackStore from './pages/PackStore'
import PackOpening from './pages/PackOpening'
import Collection from './pages/Collection'
import Market from './pages/Market'
import TeamManager from './pages/TeamManager'
import Battle from './pages/Battle'
import Leaderboard from './pages/Leaderboard'
import TransactionHistory from './pages/TransactionHistory'
import Profile from './pages/Profile'
import TradeOffers from './pages/TradeOffers'
import CreateTrade from './pages/CreateTrade'
import CardEvolution from './pages/CardEvolution'
import Tournament from './pages/Tournament'

function App() {
  return (
    <AuthProvider>
      <AchievementProvider>
        <TradeProvider>
          <Router>
            <AchievementNotification />
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

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trades"
            element={
              <ProtectedRoute>
                <TradeOffers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-trade"
            element={
              <ProtectedRoute>
                <CreateTrade />
              </ProtectedRoute>
            }
          />

          <Route
            path="/evolution"
            element={
              <ProtectedRoute>
                <CardEvolution />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tournaments"
            element={
              <ProtectedRoute>
                <Tournament />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
        </TradeProvider>
    </AchievementProvider>
  </AuthProvider>
  )
}

export default App
