import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useAchievements } from '../contexts/AchievementContext'
import BottomNav from '../components/BottomNav'

export default function Battle() {
  const [myTeam, setMyTeam] = useState(null)
  const [opponent, setOpponent] = useState(null)
  const [battling, setBattling] = useState(false)
  const [battleResult, setBattleResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [findingOpponent, setFindingOpponent] = useState(false)
  const [battleLog, setBattleLog] = useState([])
  const { user, profile, refreshProfile } = useAuth()
  const { checkBattleAchievements } = useAchievements()
  const navigate = useNavigate()

  useEffect(() => {
    fetchMyTeam()
  }, [user])

  const fetchMyTeam = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (!data) {
        // No team found, redirect to team manager
        navigate('/team-manager')
        return
      }

      // Fetch the actual cards
      const cardIds = [
        data.card_1_id,
        data.card_2_id,
        data.card_3_id,
        data.card_4_id,
        data.card_5_id
      ].filter(id => id !== null)

      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('id', cardIds)

      if (cardsError) throw cardsError

      setMyTeam({
        ...data,
        cards: cards
      })
    } catch (error) {
      console.error('Error fetching team:', error)
    } finally {
      setLoading(false)
    }
  }

  const findRandomOpponent = async () => {
    setFindingOpponent(true)

    try {
      // Find a random team (not the current user's)
      const { data: teams, error } = await supabase
        .from('teams')
        .select('*, profiles!inner(username)')
        .neq('user_id', user.id)
        .limit(10)

      if (error) throw error

      if (!teams || teams.length === 0) {
        // No opponents found, create an AI opponent
        setOpponent(await createAIOpponent())
        setFindingOpponent(false)
        return
      }

      // Pick a random opponent
      const randomTeam = teams[Math.floor(Math.random() * teams.length)]

      // Fetch opponent's cards
      const cardIds = [
        randomTeam.card_1_id,
        randomTeam.card_2_id,
        randomTeam.card_3_id,
        randomTeam.card_4_id,
        randomTeam.card_5_id
      ].filter(id => id !== null)

      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('id', cardIds)

      if (cardsError) throw cardsError

      setOpponent({
        ...randomTeam,
        cards: cards,
        username: randomTeam.profiles?.username || 'Unknown Player'
      })
    } catch (error) {
      console.error('Error finding opponent:', error)
      setOpponent(await createAIOpponent())
    } finally {
      setFindingOpponent(false)
    }
  }

  const createAIOpponent = async () => {
    // Create a random AI team
    const { data: allCards, error } = await supabase
      .from('cards')
      .select('*')

    if (error) throw error

    const randomCards = []
    for (let i = 0; i < 5; i++) {
      const randomCard = allCards[Math.floor(Math.random() * allCards.length)]
      randomCards.push(randomCard)
    }

    return {
      name: 'AI Opponent',
      username: 'CPU',
      cards: randomCards,
      isAI: true
    }
  }

  const simulateBattle = async () => {
    if (!myTeam || !opponent) return

    setBattling(true)
    setBattleLog([])

    const log = []
    let myScore = 0
    let opponentScore = 0

    // Simulate 5 rounds (card vs card)
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const myCard = myTeam.cards[i]
      const oppCard = opponent.cards[i]

      // Calculate card power (average of all stats)
      const myPower = calculateCardPower(myCard)
      const oppPower = calculateCardPower(oppCard)

      // Add some randomness (±10%)
      const myFinalPower = myPower * (0.9 + Math.random() * 0.2)
      const oppFinalPower = oppPower * (0.9 + Math.random() * 0.2)

      let roundWinner
      if (myFinalPower > oppFinalPower) {
        myScore++
        roundWinner = 'player'
      } else if (oppFinalPower > myFinalPower) {
        opponentScore++
        roundWinner = 'opponent'
      } else {
        roundWinner = 'tie'
      }

      const roundLog = {
        round: i + 1,
        myCard: myCard.player_name,
        myPower: Math.round(myFinalPower),
        oppCard: oppCard.player_name,
        oppPower: Math.round(oppFinalPower),
        winner: roundWinner
      }

      log.push(roundLog)
      setBattleLog([...log])
    }

    // Determine overall winner
    const winner = myScore > opponentScore ? 'player' : opponentScore > myScore ? 'opponent' : 'tie'

    // Calculate rewards
    let rewards = 0
    if (winner === 'player') {
      rewards = 100 + (myScore * 20)
    }

    // Save battle to database
    if (!opponent.isAI) {
      try {
        await supabase
          .from('battles')
          .insert({
            player1_id: user.id,
            player2_id: opponent.user_id,
            player1_team_id: myTeam.id,
            player2_team_id: opponent.id,
            winner_id: winner === 'player' ? user.id : winner === 'opponent' ? opponent.user_id : null,
            player1_score: myScore,
            player2_score: opponentScore,
            rewards: rewards,
            battle_log: log
          })
      } catch (error) {
        console.error('Error saving battle:', error)
      }
    }

    // Award coins to winner
    if (winner === 'player' && rewards > 0) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ coins: (profile?.coins || 0) + rewards })
          .eq('id', user.id)

        if (error) throw error
        await refreshProfile()
      } catch (error) {
        console.error('Error awarding coins:', error)
      }
    }

    // Check battle achievements
    if (winner === 'player') {
      try {
        // Fetch total wins
        const { data: battles, error: battlesError } = await supabase
          .from('battles')
          .select('*')
          .eq('winner_id', user.id)

        if (!battlesError && battles) {
          await checkBattleAchievements(battles.length)
        }
      } catch (error) {
        console.error('Error checking battle achievements:', error)
      }
    }

    setBattleResult({
      winner,
      myScore,
      opponentScore,
      rewards,
      log
    })

    setBattling(false)
  }

  const calculateCardPower = (card) => {
    // Average of all stats
    const stats = [
      card.pace || 75,
      card.shooting || 75,
      card.passing || 75,
      card.dribbling || 75,
      card.defending || 75,
      card.physical || 75
    ]
    return stats.reduce((a, b) => a + b, 0) / stats.length
  }

  const getTeamOverall = (team) => {
    if (!team || !team.cards) return 0
    const total = team.cards.reduce((sum, card) => sum + (card.overall_rating || 75), 0)
    return Math.round(total / team.cards.length)
  }

  const resetBattle = () => {
    setOpponent(null)
    setBattleResult(null)
    setBattleLog([])
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
      <main className="flex-1 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 pb-2 bg-background-dark/90 backdrop-blur-sm border-b-4 border-hot-pink">
          <div className="flex size-12 shrink-0 items-center justify-start cursor-pointer" onClick={() => navigate('/')}>
            <span className="material-symbols-outlined text-hot-pink text-4xl">arrow_back_ios_new</span>
          </div>
          <h2 className="flex-1 text-center text-3xl font-display leading-tight tracking-[-0.015em] text-hot-pink text-outline-black">HEAD 2 HEAD</h2>
          <div className="flex items-center justify-end rounded-lg bg-black/50 px-3 py-1.5 border-2 border-accent-gold shadow-pixel-hard-sm">
            <p className="text-accent-gold text-lg font-display leading-none shrink-0">{profile?.coins || 0}</p>
            <span className="material-symbols-outlined text-accent-gold text-xl ml-2">paid</span>
          </div>
        </div>

        {/* Battle Arena */}
        <div className="p-4">
          {/* Team Manager Link */}
          <button
            onClick={() => navigate('/team-manager')}
            className="w-full mb-4 h-10 rounded-lg bg-electric-blue/20 border-2 border-electric-blue text-electric-blue font-pixel text-xs uppercase hover:bg-electric-blue/30 transition-all"
          >
            ⚙ Manage Team
          </button>

          {!opponent && !battleResult && (
            <div className="flex flex-col items-center gap-6 py-8">
              {/* My Team Display */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-display text-lg uppercase">{myTeam?.name || 'My Team'}</h3>
                  <div className="bg-electric-blue px-3 py-1 rounded border-2 border-black">
                    <span className="font-display text-black text-sm">{getTeamOverall(myTeam)} OVR</span>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {myTeam?.cards.map((card, i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] bg-cover bg-center rounded border-2 border-electric-blue"
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%), url("${card.image_url || 'https://via.placeholder.com/300x400'}")`
                      }}
                    >
                      <div className="p-1">
                        <div className="bg-black/70 rounded px-1 text-white text-[10px] font-display inline-block">
                          {card.overall_rating || 75}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Find Opponent Button */}
              <button
                onClick={findRandomOpponent}
                disabled={findingOpponent}
                className="w-full h-16 rounded-lg bg-hot-pink text-black font-display text-xl uppercase border-2 border-black shadow-pixel-hard active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
              >
                {findingOpponent ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin">⚔</div>
                    <span>Finding Opponent...</span>
                  </div>
                ) : (
                  '⚔ Find Opponent'
                )}
              </button>
            </div>
          )}

          {opponent && !battleResult && (
            <div className="flex flex-col gap-6">
              {/* VS Display */}
              <div className="grid grid-cols-3 gap-4 items-center">
                {/* My Team */}
                <div>
                  <h3 className="text-white font-pixel text-xs mb-2 text-center">YOU</h3>
                  <div className="bg-electric-blue/20 border-2 border-electric-blue rounded-lg p-2">
                    <div className="text-center mb-2">
                      <p className="text-white font-display text-sm">{profile?.username || 'You'}</p>
                      <p className="text-electric-blue font-pixel text-xs">{getTeamOverall(myTeam)} OVR</p>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {myTeam.cards.map((card, i) => (
                        <div
                          key={i}
                          className="aspect-[3/4] bg-cover bg-center rounded border border-electric-blue"
                          style={{
                            backgroundImage: `url("${card.image_url || 'https://via.placeholder.com/300x400'}")`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* VS */}
                <div className="text-center">
                  <div className="text-6xl font-display text-hot-pink animate-pulse">VS</div>
                </div>

                {/* Opponent */}
                <div>
                  <h3 className="text-white font-pixel text-xs mb-2 text-center">OPPONENT</h3>
                  <div className="bg-hot-pink/20 border-2 border-hot-pink rounded-lg p-2">
                    <div className="text-center mb-2">
                      <p className="text-white font-display text-sm">{opponent.username}</p>
                      <p className="text-hot-pink font-pixel text-xs">{getTeamOverall(opponent)} OVR</p>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {opponent.cards.map((card, i) => (
                        <div
                          key={i}
                          className="aspect-[3/4] bg-cover bg-center rounded border border-hot-pink"
                          style={{
                            backgroundImage: `url("${card.image_url || 'https://via.placeholder.com/300x400'}")`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Battle Log */}
              {battleLog.length > 0 && (
                <div className="bg-black/50 border-2 border-white rounded-lg p-4">
                  <h3 className="text-white font-pixel text-sm mb-3">BATTLE LOG</h3>
                  {battleLog.map((log, i) => (
                    <div key={i} className="mb-2 pb-2 border-b border-gray-700 last:border-0">
                      <div className="flex justify-between items-center">
                        <div className="flex-1 text-left">
                          <p className="text-electric-blue font-body text-xs">{log.myCard}</p>
                          <p className="text-white font-pixel text-[10px]">{log.myPower}</p>
                        </div>
                        <div className="px-3">
                          <span className="text-white font-pixel text-xs">
                            {log.winner === 'player' ? 'W' : log.winner === 'opponent' ? 'L' : 'T'}
                          </span>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-hot-pink font-body text-xs">{log.oppCard}</p>
                          <p className="text-white font-pixel text-[10px]">{log.oppPower}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Battle Button */}
              {!battling && battleLog.length === 0 && (
                <div className="flex gap-4">
                  <button
                    onClick={resetBattle}
                    className="flex-1 h-12 rounded-lg bg-black/30 text-white font-display border-2 border-black uppercase"
                  >
                    Change Opponent
                  </button>
                  <button
                    onClick={simulateBattle}
                    className="flex-1 h-12 rounded-lg bg-vibrant-green text-black font-display border-2 border-black shadow-pixel-hard active:translate-x-1 active:translate-y-1 active:shadow-none uppercase"
                  >
                    ⚔ Battle!
                  </button>
                </div>
              )}

              {battling && (
                <div className="text-center py-4">
                  <div className="animate-pulse text-2xl font-display text-white">BATTLING...</div>
                </div>
              )}
            </div>
          )}

          {/* Battle Result */}
          {battleResult && (
            <div className="flex flex-col gap-6 py-8">
              {/* Result Display */}
              <div className={`text-center p-8 rounded-lg border-4 ${
                battleResult.winner === 'player'
                  ? 'bg-vibrant-green/20 border-vibrant-green'
                  : battleResult.winner === 'opponent'
                  ? 'bg-red-500/20 border-red-500'
                  : 'bg-gray-500/20 border-gray-500'
              }`}>
                <h2 className="text-5xl font-display mb-4 text-outline-black" style={{
                  color: battleResult.winner === 'player' ? '#39FF14' : battleResult.winner === 'opponent' ? '#FF0000' : '#888'
                }}>
                  {battleResult.winner === 'player' ? 'VICTORY!' : battleResult.winner === 'opponent' ? 'DEFEAT' : 'DRAW'}
                </h2>
                <div className="text-4xl font-display text-white mb-4">
                  {battleResult.myScore} - {battleResult.opponentScore}
                </div>
                {battleResult.rewards > 0 && (
                  <div className="flex items-center justify-center gap-2 bg-accent-gold px-6 py-3 rounded-lg border-2 border-black inline-block">
                    <span className="material-symbols-outlined text-black text-2xl">paid</span>
                    <span className="text-black font-display text-2xl">+{battleResult.rewards}</span>
                  </div>
                )}
              </div>

              {/* Battle Summary */}
              <div className="bg-black/50 border-2 border-white rounded-lg p-4">
                <h3 className="text-white font-pixel text-sm mb-3">BATTLE SUMMARY</h3>
                {battleResult.log.map((log, i) => (
                  <div key={i} className="mb-2 pb-2 border-b border-gray-700 last:border-0">
                    <p className="text-gray-400 font-pixel text-[10px] mb-1">Round {log.round}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-electric-blue font-body text-xs">{log.myCard} ({log.myPower})</p>
                      </div>
                      <div className="px-3">
                        <span className={`font-pixel text-xs ${
                          log.winner === 'player' ? 'text-vibrant-green' : log.winner === 'opponent' ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          {log.winner === 'player' ? 'WIN' : log.winner === 'opponent' ? 'LOSS' : 'TIE'}
                        </span>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-hot-pink font-body text-xs">{log.oppCard} ({log.oppPower})</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={resetBattle}
                  className="flex-1 h-12 rounded-lg bg-hot-pink text-black font-display border-2 border-black shadow-pixel-hard active:translate-x-1 active:translate-y-1 active:shadow-none uppercase"
                >
                  Battle Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 h-12 rounded-lg bg-black/30 text-white font-display border-2 border-black uppercase"
                >
                  Home
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
