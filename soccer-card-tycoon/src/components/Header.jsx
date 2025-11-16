import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const { profile } = useAuth()

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-background-dark/80 backdrop-blur-sm border-b-2 border-black">
      <div className="flex size-12 shrink-0 items-center">
        <div className="bg-center bg-no-repeat aspect-square bg-cover size-10 border-2 border-black rounded-lg shadow-pixel-hard-sm" style={{ backgroundImage: 'url("https://cdn.pixabay.com/photo/2013/07/12/14/47/football-148685_640.png")' }}></div>
      </div>
      <div className="flex items-center justify-center rounded-lg bg-card-dark px-3 py-1.5 gap-2 border-2 border-black shadow-pixel-hard-sm">
        <span className="material-symbols-outlined text-accent-gold text-2xl" style={{ textShadow: '2px 2px 0px rgba(0,0,0,1)' }}>stars</span>
        <p className="text-white text-base font-display leading-none tracking-tighter shrink-0 pt-1">{profile?.coins || 0}</p>
      </div>
    </div>
  )
}
