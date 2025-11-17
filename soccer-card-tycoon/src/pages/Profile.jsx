import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import BottomNav from '../components/BottomNav'

export default function Profile() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserStats()
  }, [user])

  const fetchUserStats = async () => {
    if (!user) return

    try {
      // Fetch collection stats
      const { data: userCards, error: cardsError } = await supabase
        .from('user_cards')
        .select(`
          quantity,
          cards (
            rarity,
            overall_rating
          )
        `)
        .eq('user_id', user.id)

      if (cardsError) throw cardsError

      // Calculate collection stats
      let totalCards = 0
      let epicCount = 0
      let rareCount = 0
      let commonCount = 0
      let totalValue = 0

      userCards?.forEach(uc => {
        const qty = uc.quantity || 1
        totalCards += qty
        totalValue += (uc.cards?.overall_rating || 75) * qty

        if (uc.cards?.rarity === 'Epic') epicCount += qty
        else if (uc.cards?.rarity === 'Rare') rareCount += qty
        else commonCount += qty
      })

      // Fetch battle stats
      const { data: battles, error: battleError } = await supabase
        .from('battles')
        .select('*')
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)

      if (battleError) throw battleError

      let wins = 0
      let losses = 0
      let totalRewards = 0

      battles?.forEach(battle => {
        if (battle.winner_id === user.id) {
          wins++
          totalRewards += battle.rewards || 0
        } else if (battle.winner_id && battle.winner_id !== user.id) {
          losses++
        }
      })

      setStats({
        totalCards,
        epicCount,
        rareCount,
        commonCount,
        totalValue,
        uniqueCards: userCards?.length || 0,
        totalBattles: battles?.length || 0,
        wins,
        losses,
        winRate: battles?.length > 0 ? ((wins / battles.length) * 100).toFixed(1) : 0,
        totalRewards
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-center">
          <div className="animate-pulse text-4xl text-primary font-pixel">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-90s-combo">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 pb-2 bg-background-dark/90 backdrop-blur-sm border-b-4 border-electric-blue">
        <div className="flex size-12 shrink-0 items-center justify-start cursor-pointer" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined text-electric-blue text-4xl">arrow_back_ios_new</span>
        </div>
        <h2 className="flex-1 text-center text-3xl font-display leading-tight tracking-[-0.015em] text-electric-blue text-outline-black">PROFILE</h2>
        <div className="w-12"></div>
      </div>

      <main className="flex-1 pb-24 p-4 space-y-6">
        {/* User Info Card */}
        <div className="bg-black/50 rounded-xl border-2 border-electric-blue p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-electric-blue rounded-full border-4 border-black flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-black">person</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-display text-white">{profile?.username || 'Player'}</h3>
              <p className="text-gray-400 font-body text-sm">Level 1 Collector</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="material-symbols-outlined text-accent-gold text-xl">paid</span>
                <span className="text-accent-gold font-display text-xl">{profile?.coins || 0}</span>
                <span className="text-gray-400 font-pixel text-xs">coins</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-accent-purple/20 rounded-lg p-3 border-2 border-accent-purple text-center">
              <p className="text-accent-purple font-display text-2xl">{stats?.epicCount || 0}</p>
              <p className="text-white font-pixel text-[10px]">EPIC</p>
            </div>
            <div className="bg-accent-blue/20 rounded-lg p-3 border-2 border-accent-blue text-center">
              <p className="text-accent-blue font-display text-2xl">{stats?.rareCount || 0}</p>
              <p className="text-white font-pixel text-[10px]">RARE</p>
            </div>
            <div className="bg-common-gray/20 rounded-lg p-3 border-2 border-common-gray text-center">
              <p className="text-common-gray font-display text-2xl">{stats?.commonCount || 0}</p>
              <p className="text-white font-pixel text-[10px]">COMMON</p>
            </div>
          </div>
        </div>

        {/* Collection Stats */}
        <div className="bg-black/50 rounded-xl border-2 border-accent-gold p-6">
          <h3 className="text-xl font-display text-accent-gold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">collections_bookmark</span>
            COLLECTION STATS
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white font-body">Total Cards</span>
              <span className="text-vibrant-green font-display text-lg">{stats?.totalCards || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-body">Unique Cards</span>
              <span className="text-electric-blue font-display text-lg">{stats?.uniqueCards || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-body">Collection Value</span>
              <span className="text-accent-gold font-display text-lg">{stats?.totalValue || 0}</span>
            </div>
          </div>
        </div>

        {/* Battle Stats */}
        <div className="bg-black/50 rounded-xl border-2 border-hot-pink p-6">
          <h3 className="text-xl font-display text-hot-pink mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">military_tech</span>
            BATTLE STATS
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white font-body">Total Battles</span>
              <span className="text-white font-display text-lg">{stats?.totalBattles || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-body">Wins</span>
              <span className="text-vibrant-green font-display text-lg">{stats?.wins || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-body">Losses</span>
              <span className="text-red-500 font-display text-lg">{stats?.losses || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-body">Win Rate</span>
              <span className="text-accent-gold font-display text-lg">{stats?.winRate || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-body">Coins Earned</span>
              <span className="text-accent-gold font-display text-lg">{stats?.totalRewards || 0}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar Example */}
        <div className="bg-black/50 rounded-xl border-2 border-vibrant-green p-6">
          <h3 className="text-xl font-display text-vibrant-green mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">emoji_events</span>
            ACHIEVEMENTS
          </h3>
          <p className="text-gray-400 font-body text-sm mb-4">Complete challenges to unlock rewards!</p>

          <div className="space-y-4">
            {/* First Win */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white font-pixel text-xs">First Victory</span>
                <span className="text-vibrant-green font-pixel text-xs">{stats?.wins >= 1 ? '✓' : `${stats?.wins}/1`}</span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-vibrant-green">
                <div
                  className="h-full bg-vibrant-green transition-all"
                  style={{ width: `${Math.min((stats?.wins || 0) / 1 * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Win Streak */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white font-pixel text-xs">Battle Master (10 Wins)</span>
                <span className="text-vibrant-green font-pixel text-xs">{stats?.wins >= 10 ? '✓' : `${stats?.wins}/10`}</span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-vibrant-green">
                <div
                  className="h-full bg-vibrant-green transition-all"
                  style={{ width: `${Math.min((stats?.wins || 0) / 10 * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Collection */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white font-pixel text-xs">Collector (50 Cards)</span>
                <span className="text-electric-blue font-pixel text-xs">{stats?.totalCards >= 50 ? '✓' : `${stats?.totalCards}/50`}</span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-electric-blue">
                <div
                  className="h-full bg-electric-blue transition-all"
                  style={{ width: `${Math.min((stats?.totalCards || 0) / 50 * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full h-14 rounded-lg bg-red-500 text-white font-display text-lg uppercase border-2 border-black shadow-pixel-hard active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">logout</span>
          LOGOUT
        </button>
      </main>

      <BottomNav />
    </div>
  )
}
