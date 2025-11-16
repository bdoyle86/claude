import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      <div className="grid grid-cols-4 border-t-4 border-hot-pink bg-background-dark/90 px-2 pb-3 pt-2 backdrop-blur-sm">
        <Link to="/" className={`flex flex-1 flex-col items-center justify-end gap-1 ${isActive('/') ? 'text-primary' : 'text-gray-400'}`}>
          <span className="material-symbols-outlined text-3xl">home</span>
          <p className="font-display text-[10px] uppercase leading-none tracking-wider">Home</p>
        </Link>

        <Link to="/packs" className={`flex flex-1 flex-col items-center justify-end gap-1 ${isActive('/packs') ? 'text-primary' : 'text-gray-400'}`}>
          <span className="material-symbols-outlined text-3xl">view_in_ar</span>
          <p className="font-display text-[10px] uppercase leading-none tracking-wider">Packs</p>
        </Link>

        <Link to="/collection" className={`flex flex-1 flex-col items-center justify-end gap-1 ${isActive('/collection') ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`flex h-8 items-center justify-center ${isActive('/collection') ? 'rounded-full bg-primary/20 px-6' : ''}`}>
            <span className={`material-symbols-outlined text-2xl ${isActive('/collection') ? '!font-bold' : ''}`} style={isActive('/collection') ? { fontVariationSettings: "'FILL' 1, 'wght' 700" } : {}}>collections</span>
          </div>
          <p className="font-display text-[10px] uppercase leading-none tracking-wider">Collection</p>
        </Link>

        <Link to="/market" className={`flex flex-1 flex-col items-center justify-end gap-1 ${isActive('/market') ? 'text-primary' : 'text-gray-400'}`}>
          <span className="material-symbols-outlined text-3xl">storefront</span>
          <p className="font-display text-[10px] uppercase leading-none tracking-wider">Market</p>
        </Link>
      </div>
    </div>
  )
}
