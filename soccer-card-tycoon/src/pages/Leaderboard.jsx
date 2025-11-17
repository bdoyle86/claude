import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import BottomNav from '../components/BottomNav'

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('battles')
  const [battleStats, setBattleStats] = useState([])
  const [collectionStats, setCollectionStats] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchLeaderboards()
  }, [])

  const fetchLeaderboards = async () => {
    setLoading(true)
    try {
      // Fetch battle leaderboard
      const { data: battles, error: battleError } = await supabase
        .from('battles')
        .select(`
          player1_id,
          player2_id,
          winner_id,
          rewards
        `)

      if (battleError) throw battleError

      // Calculate battle stats manually
      const statsMap = new Map()

      battles?.forEach(battle => {
        // Process player 1
        if (!statsMap.has(battle.player1_id)) {
          statsMap.set(battle.player1_id, {
            user_id: battle.player1_id,
            total_battles: 0,
            wins: 0,
            losses: 0,
            total_rewards: 0
          })
        }
        const p1Stats = statsMap.get(battle.player1_id)
        p1Stats.total_battles++
        if (battle.winner_id === battle.player1_id) {
          p1Stats.wins++
          p1Stats.total_rewards += battle.rewards || 0
        } else if (battle.winner_id) {
          p1Stats.losses++
        }

        // Process player 2
        if (!statsMap.has(battle.player2_id)) {
          statsMap.set(battle.player2_id, {
            user_id: battle.player2_id,
            total_battles: 0,
            wins: 0,
            losses: 0,
            total_rewards: 0
          })
        }
        const p2Stats = statsMap.get(battle.player2_id)
        p2Stats.total_battles++
        if (battle.winner_id === battle.player2_id) {
          p2Stats.wins++
        } else if (battle.winner_id) {
          p2Stats.losses++
        }
      })

      // Convert map to array and fetch usernames
      const statsArray = Array.from(statsMap.values())
      const userIds = statsArray.map(s => s.user_id)

      if (userIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds)

        if (!profileError) {
          statsArray.forEach(stat => {
            const profile = profiles?.find(p => p.id === stat.user_id)
            stat.username = profile?.username || 'Unknown'
            stat.win_rate = stat.total_battles > 0
              ? ((stat.wins / stat.total_battles) * 100).toFixed(1)
              : 0
          })
        }
      }

      // Sort by wins
      statsArray.sort((a, b) => b.wins - a.wins)
      setBattleStats(statsArray.slice(0, 10))

      // Fetch collection leaderboard
      const { data: collections, error: collectionError } = await supabase
        .from('user_cards')
        .select(`
          user_id,
          quantity,
          cards (
            overall_rating,
            rarity
          )
        `)

      if (collectionError) throw collectionError

      // Calculate collection stats
      const collectionMap = new Map()

      collections?.forEach(uc => {
        if (!collectionMap.has(uc.user_id)) {
          collectionMap.set(uc.user_id, {
            user_id: uc.user_id,
            total_cards: 0,
            total_value: 0,
            epic_count: 0,
            rare_count: 0
          })
        }
        const stats = collectionMap.get(uc.user_id)
        stats.total_cards += uc.quantity || 1
        stats.total_value += (uc.cards?.overall_rating || 75) * (uc.quantity || 1)
        if (uc.cards?.rarity === 'Epic') stats.epic_count += (uc.quantity || 1)
        if (uc.cards?.rarity === 'Rare') stats.rare_count += (uc.quantity || 1)
      })

      // Convert and fetch usernames
      const collArray = Array.from(collectionMap.values())
      const collUserIds = collArray.map(s => s.user_id)

      if (collUserIds.length > 0) {
        const { data: collProfiles, error: collProfileError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', collUserIds)

        if (!collProfileError) {
          collArray.forEach(stat => {
            const profile = collProfiles?.find(p => p.id === stat.user_id)
            stat.username = profile?.username || 'Unknown'
          })
        }
      }

      // Sort by total value
      collArray.sort((a, b) => b.total_value - a.total_value)
      setCollectionStats(collArray.slice(0, 10))

    } catch (error) {
      console.error('Error fetching leaderboards:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankColor = (index) => {
    if (index === 0) return 'bg-accent-gold text-black'
    if (index === 1) return 'bg-gray-400 text-black'
    if (index === 2) return 'bg-amber-700 text-white'
    return 'bg-gray-700 text-white'
  }

  const getRankIcon = (index) => {
    if (index === 0) return '👑'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
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
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 pb-2 bg-background-dark/90 backdrop-blur-sm border-b-4 border-vibrant-green">
        <div className="flex size-12 shrink-0 items-center justify-start cursor-pointer" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined text-vibrant-green text-4xl">arrow_back_ios_new</span>
        </div>
        <h2 className="flex-1 text-center text-3xl font-display leading-tight tracking-[-0.015em] text-vibrant-green text-outline-black">LEADERBOARD</h2>
        <div className="w-12"></div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[60px] z-10 flex gap-2 p-4 bg-background-dark/80 backdrop-blur-sm border-b-2 border-gray-700">
        <button
          onClick={() => setActiveTab('battles')}
          className={`flex-1 h-10 rounded-lg font-display uppercase text-sm border-2 border-black transition-all ${
            activeTab === 'battles'
              ? 'bg-hot-pink text-black shadow-pixel-hard-sm'
              : 'bg-gray-700 text-white'
          }`}
        >
          🏆 Battles
        </button>
        <button
          onClick={() => setActiveTab('collection')}
          className={`flex-1 h-10 rounded-lg font-display uppercase text-sm border-2 border-black transition-all ${
            activeTab === 'collection'
              ? 'bg-electric-blue text-black shadow-pixel-hard-sm'
              : 'bg-gray-700 text-white'
          }`}
        >
          💎 Collection
        </button>
      </div>

      <main className="flex-1 pb-24 p-4">
        {activeTab === 'battles' && (
          <div className="space-y-3">
            {battleStats.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-7xl text-gray-600 mb-4">emoji_events</span>
                <p className="text-white font-display text-xl">No battles yet!</p>
                <p className="text-gray-400 font-body text-sm mt-2">Be the first to compete!</p>
              </div>
            ) : (
              battleStats.map((stat, index) => (
                <div
                  key={stat.user_id}
                  className={`relative flex items-center gap-4 p-4 rounded-lg border-2 border-black ${
                    stat.user_id === user?.id ? 'bg-electric-blue/30 border-electric-blue' : 'bg-black/30'
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-display text-lg border-2 border-black ${getRankColor(index)}`}>
                    {getRankIcon(index)}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1">
                    <p className="text-white font-display text-lg">
                      {stat.username}
                      {stat.user_id === user?.id && (
                        <span className="ml-2 text-electric-blue text-xs">(You)</span>
                      )}
                    </p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-vibrant-green font-pixel text-xs">{stat.wins}W</span>
                      <span className="text-red-500 font-pixel text-xs">{stat.losses}L</span>
                      <span className="text-gray-400 font-pixel text-xs">{stat.win_rate}%</span>
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-accent-gold text-sm">paid</span>
                      <span className="text-accent-gold font-display text-sm">{stat.total_rewards}</span>
                    </div>
                    <p className="text-gray-400 font-pixel text-[10px]">{stat.total_battles} battles</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'collection' && (
          <div className="space-y-3">
            {collectionStats.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-7xl text-gray-600 mb-4">collections_bookmark</span>
                <p className="text-white font-display text-xl">No collections yet!</p>
                <p className="text-gray-400 font-body text-sm mt-2">Start collecting cards!</p>
              </div>
            ) : (
              collectionStats.map((stat, index) => (
                <div
                  key={stat.user_id}
                  className={`relative flex items-center gap-4 p-4 rounded-lg border-2 border-black ${
                    stat.user_id === user?.id ? 'bg-electric-blue/30 border-electric-blue' : 'bg-black/30'
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-display text-lg border-2 border-black ${getRankColor(index)}`}>
                    {getRankIcon(index)}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1">
                    <p className="text-white font-display text-lg">
                      {stat.username}
                      {stat.user_id === user?.id && (
                        <span className="ml-2 text-electric-blue text-xs">(You)</span>
                      )}
                    </p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-accent-purple font-pixel text-xs">{stat.epic_count} Epic</span>
                      <span className="text-accent-blue font-pixel text-xs">{stat.rare_count} Rare</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <p className="text-vibrant-green font-display text-lg">{stat.total_value}</p>
                    <p className="text-gray-400 font-pixel text-[10px]">{stat.total_cards} cards</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
