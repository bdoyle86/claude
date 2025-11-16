import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

const Home = () => {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark text-white overflow-x-hidden">
      <main className="flex-grow pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center p-4 justify-between bg-background-dark/80 backdrop-blur-sm">
          <div className="flex size-12 shrink-0 items-center">
            <div className="bg-primary bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-background-dark">person</span>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-full bg-black/30 px-3 py-1.5 gap-2">
            <span className="material-symbols-outlined text-accent-yellow text-2xl" style={{filter: 'drop-shadow(0 0 5px #FFD700)'}}>
              monetization_on
            </span>
            <p className="text-white text-base font-bold leading-normal tracking-[0.015em] shrink-0">
              {profile?.coins || 0}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome, {profile?.username}!</h2>
            <p className="text-white/70">Start collecting your dream soccer team</p>
          </div>

          {/* Pack Store Card */}
          <div
            onClick={() => navigate('/packs')}
            className="relative flex flex-col justify-end min-h-[240px] rounded-2xl p-5 overflow-hidden group cursor-pointer bg-gradient-to-tr from-green-400 via-blue-500 to-purple-600 shadow-lg hover:shadow-neon-green transition-shadow"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDiDLEKamyAm65HWTph9xyaLwIqhSK96EO820cLkfUbfeoeOeuuwdaAa0ygdwhxeHpV5CBUcLioFQEWd5WRpVKhn_ME-XiYQXqUlaHERbwVNPsOPy8sSf-CJpz7Gfz2CVKvea7F1jsyafty7hmDo0_rtWNjEYgRQQA4igGC6v6y3PzNQboo30BCMtL_JItdEsAJlCnQOUo8Igoal5hhY-O1FUpCv3-iXtv5fpNDDSbpU4RpIciVBE2EkkwK8qtyQKN14C6ggcuc")',
              backgroundPosition: 'top',
              backgroundSize: '120%'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              <span className="material-symbols-outlined text-primary text-4xl mb-2">style</span>
              <h2 className="text-white text-3xl font-extrabold leading-tight text-outline-black">PACK STORE</h2>
              <p className="text-white/90 text-sm font-medium leading-normal">Get New Players!</p>
            </div>
          </div>

          {/* Collection Card */}
          <div
            onClick={() => navigate('/collection')}
            className="relative flex flex-col justify-end min-h-[240px] rounded-2xl p-5 overflow-hidden group cursor-pointer shadow-lg hover:shadow-neon-pink transition-shadow"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCtu6aSo55ujBqp1oYttMHennBuP0fQ2dwUWiGOYsx_6J3T4CaFGOup7baDHg94uv81PEv-hM4ZftLuE_zzB--f7WTzdSd55hmL5VZ_MzkYolyYdSnmoHAMNlXSd6gfmajcwtJIc06QIIL8EY2ek0kwozCtOhUHNvy9Pm2PxorqhiqMsckZcaL7GGAVhpvsb16uBR8FVQNHZ7af163-4dKTAahHZLuockZjl0gUAB5UdWASTJgQeBHREOm9LpXEv5poyC-jtEow")',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              <span className="material-symbols-outlined text-accent-pink text-4xl mb-2">collections_bookmark</span>
              <h2 className="text-white text-3xl font-extrabold leading-tight text-outline-black">MY COLLECTION</h2>
              <p className="text-white/90 text-sm font-medium leading-normal">View Your Squad</p>
            </div>
          </div>

          {/* Card Store Card */}
          <div
            onClick={() => navigate('/store')}
            className="relative flex flex-col justify-end min-h-[200px] rounded-2xl p-5 overflow-hidden group cursor-pointer bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg hover:shadow-neon-green transition-shadow"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
            <div className="relative z-10 transition-transform duration-300 group-hover:scale-105">
              <span className="material-symbols-outlined text-white text-4xl mb-2">storefront</span>
              <h2 className="text-white text-2xl font-extrabold leading-tight text-outline-black">CARD STORE</h2>
              <p className="text-white/90 text-sm font-medium leading-normal">Buy Specific Cards</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-red-600/20 border border-red-500 text-red-500 px-4 py-3 hover:bg-red-600/30 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Home;
