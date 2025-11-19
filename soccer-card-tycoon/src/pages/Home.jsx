import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import DailyReward from '../components/DailyReward'

export default function Home() {
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark/0 overflow-x-hidden" style={{ backgroundColor: '#0F0B1A', backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '30px 30px, 30px 30px, 60px 60px' }}>
      <main className="flex-grow pb-24">
        <Header />

        <div className="p-4 max-w-7xl mx-auto">
          {/* Daily Reward - Full Width */}
          <div className="mb-6">
            <DailyReward />
          </div>

          {/* Main Menu Grid - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Pack Store Card */}
            <Link to="/packs" className="relative flex flex-col justify-end min-h-[180px] lg:min-h-[200px] rounded-xl overflow-hidden group bg-accent-blue border-4 border-black shadow-[4px_4px_0px_#00C2FF] hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800")' }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 h-full">
                <span className="material-symbols-outlined text-6xl text-white mb-2">view_in_ar</span>
                <h2 className="font-display text-2xl md:text-3xl text-white text-outline-black" style={{ textShadow: '3px 3px 0 #00C2FF' }}>PACK STORE</h2>
                <p className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-widest">Get New Players!</p>
              </div>
            </Link>

            {/* My Collection Card */}
            <Link to="/collection" className="relative flex flex-col justify-end min-h-[180px] lg:min-h-[200px] rounded-xl overflow-hidden group bg-accent-pink border-4 border-black shadow-[4px_4px_0px_#FF35A5] hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800")' }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 h-full">
                <span className="material-symbols-outlined text-6xl text-white mb-2">collections</span>
                <h2 className="font-display text-2xl md:text-3xl text-white text-outline-black" style={{ textShadow: '3px 3px 0 #FF35A5' }}>MY COLLECTION</h2>
                <p className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-widest">View Your Squad</p>
              </div>
            </Link>

            {/* Card Market */}
            <Link to="/market" className="relative flex flex-col justify-end min-h-[180px] lg:min-h-[200px] rounded-xl overflow-hidden group bg-accent-gold border-4 border-black shadow-[4px_4px_0px_#F3BE38] hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800")' }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 h-full">
                <span className="material-symbols-outlined text-6xl text-white mb-2">storefront</span>
                <h2 className="font-display text-2xl md:text-3xl text-white text-outline-black" style={{ textShadow: '3px 3px 0 #F3BE38' }}>CARD MARKET</h2>
                <p className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-widest">Buy Specific Cards</p>
              </div>
            </Link>

            {/* Battle Arena */}
            <Link to="/battle" className="relative flex flex-col justify-end min-h-[180px] lg:min-h-[200px] rounded-xl overflow-hidden group bg-hot-pink border-4 border-black shadow-[4px_4px_0px_#FF35A5] hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800")' }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 h-full">
                <div className="text-5xl md:text-6xl mb-2">⚔️</div>
                <h2 className="font-display text-2xl md:text-3xl text-white text-outline-black" style={{ textShadow: '3px 3px 0 #FF35A5' }}>BATTLE ARENA</h2>
                <p className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-widest">PvP Combat!</p>
              </div>
            </Link>

            {/* Tournaments */}
            <Link to="/tournaments" className="relative flex flex-col justify-end min-h-[180px] lg:min-h-[200px] rounded-xl overflow-hidden group bg-accent-purple border-4 border-black shadow-[4px_4px_0px_#8B5CF6] hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800")' }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 h-full">
                <div className="text-5xl md:text-6xl mb-2">🏆</div>
                <h2 className="font-display text-2xl md:text-3xl text-white text-outline-black" style={{ textShadow: '3px 3px 0 #8B5CF6' }}>TOURNAMENTS</h2>
                <p className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-widest">Win Trophies!</p>
              </div>
            </Link>

            {/* Leaderboard */}
            <Link to="/leaderboard" className="relative flex flex-col justify-end min-h-[180px] lg:min-h-[200px] rounded-xl overflow-hidden group bg-vibrant-green border-4 border-black shadow-[4px_4px_0px_#39FF14] hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800")' }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 h-full">
                <span className="material-symbols-outlined text-6xl text-white mb-2">leaderboard</span>
                <h2 className="font-display text-2xl md:text-3xl text-white text-outline-black" style={{ textShadow: '3px 3px 0 #39FF14' }}>LEADERBOARD</h2>
                <p className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-widest">Top Players!</p>
              </div>
            </Link>
          </div>

          {/* Secondary Actions - Grid on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/team-manager" className="flex items-center justify-center gap-2 py-4 bg-electric-blue border-4 border-black shadow-pixel-hard rounded-lg hover:scale-105 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
              <span className="material-symbols-outlined text-white text-2xl">groups</span>
              <span className="font-display text-sm text-white">TEAM MANAGER</span>
            </Link>

            <Link to="/evolution" className="flex items-center justify-center gap-2 py-4 bg-accent-gold border-4 border-black shadow-pixel-hard rounded-lg hover:scale-105 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
              <span className="material-symbols-outlined text-white text-2xl">auto_awesome</span>
              <span className="font-display text-sm text-white">EVOLUTION</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 py-4 bg-red-500 border-4 border-black shadow-pixel-hard rounded-lg hover:scale-105 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <span className="material-symbols-outlined text-white text-2xl">logout</span>
              <span className="font-display text-sm text-white">LOGOUT</span>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
