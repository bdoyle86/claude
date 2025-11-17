import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Header() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-background-dark/80 backdrop-blur-sm border-b-2 border-black">
      {/* Profile Avatar - Clickable */}
      <div className="relative">
        <div
          className="flex size-12 shrink-0 items-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setShowMenu(!showMenu)}
        >
          <div className="bg-center bg-no-repeat aspect-square bg-cover size-10 border-2 border-black rounded-lg shadow-pixel-hard-sm" style={{ backgroundImage: 'url("https://cdn.pixabay.com/photo/2013/07/12/14/47/football-148685_640.png")' }}></div>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute top-14 left-0 w-48 bg-background-dark border-2 border-black rounded-lg shadow-pixel-hard overflow-hidden z-50">
            <div className="bg-electric-blue p-3 border-b-2 border-black">
              <p className="text-black font-display text-sm truncate">{profile?.username || 'Player'}</p>
              <p className="text-black/70 font-pixel text-[10px]">Level 1</p>
            </div>
            <button
              onClick={() => {
                navigate('/profile')
                setShowMenu(false)
              }}
              className="w-full px-4 py-3 text-left text-white hover:bg-electric-blue/20 transition-colors border-b border-gray-700 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">person</span>
              <span className="font-body text-sm">Profile</span>
            </button>
            <button
              onClick={() => {
                navigate('/transactions')
                setShowMenu(false)
              }}
              className="w-full px-4 py-3 text-left text-white hover:bg-electric-blue/20 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">receipt_long</span>
              <span className="font-body text-sm">Transactions</span>
            </button>
          </div>
        )}
      </div>

      {/* Coins Display */}
      <div className="flex items-center justify-center rounded-lg bg-card-dark px-3 py-1.5 gap-2 border-2 border-black shadow-pixel-hard-sm">
        <span className="material-symbols-outlined text-accent-gold text-2xl" style={{ textShadow: '2px 2px 0px rgba(0,0,0,1)' }}>stars</span>
        <p className="text-white text-base font-display leading-none tracking-tighter shrink-0 pt-1">{profile?.coins || 0}</p>
      </div>

      {/* Click outside to close */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}
