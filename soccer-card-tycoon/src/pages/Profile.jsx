import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useAchievements } from '../contexts/AchievementContext'
import BottomNav from '../components/BottomNav'

export default function Profile() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user, profile, signOut } = useAuth()
  const { achievements, userAchievements } = useAchievements()
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

        {/* Achievements */}
        <div className="bg-black/50 rounded-xl border-2 border-vibrant-green p-6">
          <h3 className="text-xl font-display text-vibrant-green mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">emoji_events</span>
            ACHIEVEMENTS
          </h3>
          <p className="text-gray-400 font-body text-sm mb-4">
            {userAchievements.length} / {achievements.length} Unlocked
          </p>

          {/* Unlocked Achievements Grid */}
          {userAchievements.length > 0 && (
            <div className="mb-6">
              <h4 className="text-accent-gold font-pixel text-xs mb-3 uppercase">Unlocked Badges</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {userAchievements.map((ua) => {
                  const achievement = achievements.find(a => a.id === ua.achievement_id)
                  if (!achievement) return null

                  const getRarityColor = (rarity) => {
                    switch (rarity) {
                      case 'legendary': return 'border-accent-gold bg-accent-gold/20'
                      case 'epic': return 'border-accent-purple bg-accent-purple/20'
                      case 'rare': return 'border-accent-blue bg-accent-blue/20'
                      default: return 'border-common-gray bg-common-gray/20'
                    }
                  }

                  return (
                    <div
                      key={ua.id}
                      className={`aspect-square rounded-lg border-2 ${getRarityColor(achievement.rarity)} p-2 flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform cursor-pointer group relative`}
                      title={achievement.title}
                    >
                      <span className="material-symbols-outlined text-2xl text-white">
                        {achievement.icon}
                      </span>
                      <span className="text-white font-pixel text-[8px] text-center leading-tight">
                        {achievement.title.split(' ').slice(0, 2).join(' ')}
                      </span>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-black border-2 border-white rounded-lg p-2 whitespace-nowrap">
                          <p className="text-white font-pixel text-[10px]">{achievement.title}</p>
                          <p className="text-gray-400 font-body text-[8px]">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent Locked Achievements */}
          <div>
            <h4 className="text-gray-400 font-pixel text-xs mb-3 uppercase">Available to Unlock</h4>
            <div className="space-y-3">
              {achievements
                .filter(a => !userAchievements.find(ua => ua.achievement_id === a.id))
                .slice(0, 5)
                .map(achievement => {
                  const getProgress = () => {
                    if (achievement.category === 'battle') {
                      if (achievement.name === 'first_victory') return stats?.wins || 0
                      if (achievement.name === 'battle_warrior') return stats?.wins || 0
                      if (achievement.name === 'battle_legend') return stats?.wins || 0
                      if (achievement.name === 'battle_god') return stats?.wins || 0
                    }
                    if (achievement.category === 'collection') {
                      return stats?.totalCards || 0
                    }
                    if (achievement.category === 'rarity') {
                      if (achievement.name.includes('rare')) return stats?.rareCount || 0
                      if (achievement.name.includes('epic')) return stats?.epicCount || 0
                    }
                    return 0
                  }

                  const progress = getProgress()
                  const percentage = Math.min((progress / achievement.requirement_value) * 100, 100)

                  const getRarityColor = (rarity) => {
                    switch (rarity) {
                      case 'legendary': return 'border-accent-gold'
                      case 'epic': return 'border-accent-purple'
                      case 'rare': return 'border-accent-blue'
                      default: return 'border-common-gray'
                    }
                  }

                  return (
                    <div key={achievement.id} className="bg-black/30 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg border-2 ${getRarityColor(achievement.rarity)} bg-black/50 flex items-center justify-center flex-shrink-0`}>
                          <span className="material-symbols-outlined text-xl text-gray-500">{achievement.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-pixel text-xs truncate">{achievement.title}</p>
                          <p className="text-gray-500 font-body text-[10px] truncate">{achievement.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-accent-gold font-display text-sm">+{achievement.reward_coins}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden border border-gray-700">
                          <div
                            className={`h-full bg-gradient-to-r ${
                              achievement.rarity === 'legendary'
                                ? 'from-accent-gold to-yellow-600'
                                : achievement.rarity === 'epic'
                                ? 'from-accent-purple to-purple-600'
                                : achievement.rarity === 'rare'
                                ? 'from-accent-blue to-blue-600'
                                : 'from-common-gray to-gray-600'
                            } transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-gray-400 font-pixel text-[10px] flex-shrink-0">
                          {progress}/{achievement.requirement_value}
                        </span>
                      </div>
                    </div>
                  )
                })}
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
