import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useAchievements } from '../contexts/AchievementContext'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import Card from '../components/Card'

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD']
const POSITION_NAMES = {
  'GK': 'Goalkeeper',
  'DEF': 'Defender',
  'MID': 'Midfielder',
  'FWD': 'Forward'
}

// Position-based abilities
const POSITION_ABILITIES = {
  'GK': { name: 'Save', description: 'Block one round completely', icon: 'sports_soccer' },
  'DEF': { name: 'Shield', description: '50% damage reduction', icon: 'shield' },
  'MID': { name: 'Assist', description: 'Boost next card by 20%', icon: 'double_arrow' },
  'FWD': { name: 'Strike', description: 'Double damage this round', icon: 'rocket_launch' }
}

export default function Battle() {
  const [battleMode, setBattleMode] = useState(null) // null, 'casual', 'ranked', 'wager'
  const [wagerAmount, setWagerAmount] = useState(100)
  const [myTeam, setMyTeam] = useState(null)
  const [opponent, setOpponent] = useState(null)
  const [loading, setLoading] = useState(true)

  // Battle state
  const [battleState, setBattleState] = useState('mode-select') // 'mode-select', 'finding', 'ready', 'battling', 'result'
  const [currentRound, setCurrentRound] = useState(0) // 0-3 for GK, DEF, MID, FWD
  const [roundResults, setRoundResults] = useState([])
  const [myScore, setMyScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)

  // Abilities
  const [myAbilitiesUsed, setMyAbilitiesUsed] = useState({ GK: false, DEF: false, MID: false, FWD: false })
  const [opponentAbilitiesUsed, setOpponentAbilitiesUsed] = useState({ GK: false, DEF: false, MID: false, FWD: false })
  const [showAbilityChoice, setShowAbilityChoice] = useState(false)
  const [assistBonus, setAssistBonus] = useState(false)

  // Animation states
  const [animating, setAnimating] = useState(false)
  const [roundWinner, setRoundWinner] = useState(null)

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
        navigate('/team-manager')
        return
      }

      // Fetch the actual cards for each position
      const cardIds = [data.goalkeeper_id, data.defender_id, data.midfielder_id, data.forward_id].filter(Boolean)

      if (cardIds.length < 4) {
        navigate('/team-manager')
        return
      }

      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('id', cardIds)

      if (cardsError) throw cardsError

      // Also get evolution bonuses
      const { data: userCards, error: ucError } = await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', user.id)
        .in('card_id', cardIds)

      if (ucError) throw ucError

      const teamCards = {
        GK: cards.find(c => c.id === data.goalkeeper_id),
        DEF: cards.find(c => c.id === data.defender_id),
        MID: cards.find(c => c.id === data.midfielder_id),
        FWD: cards.find(c => c.id === data.forward_id)
      }

      // Add evolution bonuses
      Object.keys(teamCards).forEach(pos => {
        const uc = userCards?.find(u => u.card_id === teamCards[pos].id)
        if (uc) {
          teamCards[pos].evolution_level = uc.evolution_level || 0
          teamCards[pos].bonus_stats = uc.bonus_stats || 0
        }
      })

      setMyTeam({ ...data, cards: teamCards })
    } catch (error) {
      console.error('Error fetching team:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectBattleMode = (mode) => {
    setBattleMode(mode)
    setBattleState('finding')
    findRandomOpponent(mode)
  }

  const findRandomOpponent = async (mode) => {
    try {
      // Find random teams
      const { data: teams, error } = await supabase
        .from('teams')
        .select('*, profiles!inner(username, elo_rating)')
        .neq('user_id', user.id)
        .limit(20)

      if (error) throw error

      if (!teams || teams.length === 0) {
        alert('No opponents found! Try again later.')
        setBattleState('mode-select')
        return
      }

      // For ranked, try to match similar ELO
      let selectedTeam
      if (mode === 'ranked') {
        const myElo = profile?.elo_rating || 1000
        teams.sort((a, b) => {
          const diffA = Math.abs((a.profiles?.elo_rating || 1000) - myElo)
          const diffB = Math.abs((b.profiles?.elo_rating || 1000) - myElo)
          return diffA - diffB
        })
        selectedTeam = teams[0]
      } else {
        selectedTeam = teams[Math.floor(Math.random() * teams.length)]
      }

      // Fetch opponent's cards
      const cardIds = [
        selectedTeam.goalkeeper_id,
        selectedTeam.defender_id,
        selectedTeam.midfielder_id,
        selectedTeam.forward_id
      ].filter(Boolean)

      const { data: oppCards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('id', cardIds)

      if (cardsError) throw cardsError

      const { data: oppUserCards, error: ucError} = await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', selectedTeam.user_id)
        .in('card_id', cardIds)

      if (ucError) throw ucError

      const oppTeamCards = {
        GK: oppCards.find(c => c.id === selectedTeam.goalkeeper_id),
        DEF: oppCards.find(c => c.id === selectedTeam.defender_id),
        MID: oppCards.find(c => c.id === selectedTeam.midfielder_id),
        FWD: oppCards.find(c => c.id === selectedTeam.forward_id)
      }

      // Add evolution bonuses for opponent
      Object.keys(oppTeamCards).forEach(pos => {
        const uc = oppUserCards?.find(u => u.card_id === oppTeamCards[pos].id)
        if (uc) {
          oppTeamCards[pos].evolution_level = uc.evolution_level || 0
          oppTeamCards[pos].bonus_stats = uc.bonus_stats || 0
        }
      })

      setOpponent({
        ...selectedTeam,
        cards: oppTeamCards,
        username: selectedTeam.profiles?.username || 'Anonymous',
        elo_rating: selectedTeam.profiles?.elo_rating || 1000
      })

      setBattleState('ready')
    } catch (error) {
      console.error('Error finding opponent:', error)
      alert('Error finding opponent. Please try again.')
      setBattleState('mode-select')
    }
  }

  const startBattle = () => {
    setBattleState('battling')
    setCurrentRound(0)
    setRoundResults([])
    setMyScore(0)
    setOpponentScore(0)
    setMyAbilitiesUsed({ GK: false, DEF: false, MID: false, FWD: false })
    setOpponentAbilitiesUsed({ GK: false, DEF: false, MID: false, FWD: false })
    setAssistBonus(false)

    // Start first round
    setTimeout(() => setShowAbilityChoice(true), 500)
  }

  const calculateCardPower = (card, position, abilitiesUsed, isOpponent = false) => {
    let power = (card.overall_rating || 75) + (card.bonus_stats || 0)

    // Apply assist bonus from previous round
    if (!isOpponent && assistBonus && position !== 'GK') {
      power *= 1.2
    }

    return Math.round(power)
  }

  const useAbility = async (useIt) => {
    setShowAbilityChoice(false)

    const position = POSITIONS[currentRound]
    const myCard = myTeam.cards[position]
    const oppCard = opponent.cards[position]

    let myPower = calculateCardPower(myCard, position, myAbilitiesUsed, false)
    let oppPower = calculateCardPower(oppCard, position, opponentAbilitiesUsed, true)

    // AI decides if opponent uses ability (30% chance if available)
    const oppUsesAbility = !opponentAbilitiesUsed[position] && Math.random() < 0.3

    let myAbilityUsed = null
    let oppAbilityUsed = null
    let abilityEffects = []

    // Apply player ability
    if (useIt && !myAbilitiesUsed[position]) {
      myAbilityUsed = POSITION_ABILITIES[position].name
      setMyAbilitiesUsed({ ...myAbilitiesUsed, [position]: true })

      if (position === 'GK') {
        oppPower = 0
        abilityEffects.push(`${POSITION_NAMES[position]} used SAVE! Blocked opponent's attack!`)
      } else if (position === 'DEF') {
        oppPower = Math.round(oppPower * 0.5)
        abilityEffects.push(`${POSITION_NAMES[position]} used SHIELD! Reduced opponent power by 50%!`)
      } else if (position === 'MID') {
        setAssistBonus(true)
        abilityEffects.push(`${POSITION_NAMES[position]} used ASSIST! Next card gets +20% power!`)
      } else if (position === 'FWD') {
        myPower *= 2
        abilityEffects.push(`${POSITION_NAMES[position]} used STRIKE! Doubled your power!`)
      }
    }

    // Apply opponent ability
    if (oppUsesAbility) {
      oppAbilityUsed = POSITION_ABILITIES[position].name
      setOpponentAbilitiesUsed({ ...opponentAbilitiesUsed, [position]: true })

      if (position === 'GK') {
        myPower = 0
        abilityEffects.push(`Opponent's ${POSITION_NAMES[position]} used SAVE!`)
      } else if (position === 'DEF') {
        myPower = Math.round(myPower * 0.5)
        abilityEffects.push(`Opponent's ${POSITION_NAMES[position]} used SHIELD!`)
      } else if (position === 'FWD') {
        oppPower *= 2
        abilityEffects.push(`Opponent's ${POSITION_NAMES[position]} used STRIKE!`)
      }
    }

    // Apply rarity bonuses
    if (myCard.rarity === 'Epic' && currentRound === 3) {
      myPower *= 2
      abilityEffects.push('EPIC FINISHER activated! 2x power!')
    }
    if (myCard.rarity === 'Rare') {
      oppPower = Math.round(oppPower * 0.7)
    }
    if (myCard.rarity === 'Common' && myScore < opponentScore) {
      myPower = Math.round(myPower * 1.1)
    }

    if (oppCard.rarity === 'Epic' && currentRound === 3) {
      oppPower *= 2
    }
    if (oppCard.rarity === 'Rare') {
      myPower = Math.round(myPower * 0.7)
    }
    if (oppCard.rarity === 'Common' && opponentScore < myScore) {
      oppPower = Math.round(oppPower * 1.1)
    }

    // Determine winner
    const roundWon = myPower > oppPower ? 'player' : myPower < oppPower ? 'opponent' : 'draw'
    setRoundWinner(roundWon)

    const newMyScore = roundWon === 'player' ? myScore + 1 : myScore
    const newOppScore = roundWon === 'opponent' ? opponentScore + 1 : opponentScore

    setMyScore(newMyScore)
    setOpponentScore(newOppScore)

    const result = {
      position,
      myCard: myCard.name,
      oppCard: oppCard.name,
      myPower,
      oppPower,
      winner: roundWon,
      myAbilityUsed,
      oppAbilityUsed,
      effects: abilityEffects
    }

    setRoundResults([...roundResults, result])

    // Clear assist bonus if not MID
    if (position !== 'MID') {
      setAssistBonus(false)
    }

    // Animate result
    setAnimating(true)
    setTimeout(() => {
      setAnimating(false)
      setRoundWinner(null)

      if (currentRound < 3) {
        setCurrentRound(currentRound + 1)
        setTimeout(() => setShowAbilityChoice(true), 300)
      } else {
        finishBattle(newMyScore, newOppScore)
      }
    }, 2500)
  }

  const finishBattle = async (finalMyScore, finalOppScore) => {
    setBattleState('result')

    const winner = finalMyScore > finalOppScore ? 'player' : finalMyScore < finalOppScore ? 'opponent' : 'draw'
    const playerWon = winner === 'player'

    // Calculate rewards
    let baseReward = battleMode === 'ranked' ? 150 : 100
    const streakMultiplier = playerWon ? Math.min((profile?.win_streak || 0) + 1, 5) : 1
    const totalReward = playerWon ? baseReward * streakMultiplier : Math.floor(baseReward * 0.3)

    // Handle wager
    let wagerResult = 0
    if (battleMode === 'wager') {
      wagerResult = playerWon ? wagerAmount : -wagerAmount
    }

    try {
      // Save battle
      const { data: battle, error: battleError } = await supabase
        .from('battles')
        .insert({
          player1_id: user.id,
          player1_team_id: myTeam.id,
          player2_id: opponent.user_id,
          player2_team_id: opponent.id,
          winner_id: winner === 'player' ? user.id : winner === 'opponent' ? opponent.user_id : null,
          player1_score: finalMyScore,
          player2_score: finalOppScore,
          rewards: totalReward + wagerResult,
          battle_mode: battleMode,
          wager_amount: battleMode === 'wager' ? wagerAmount : 0,
          rounds: roundResults
        })
        .select()
        .single()

      if (battleError) throw battleError

      // Update coins
      if (playerWon || winner === 'draw') {
        const newCoins = (profile?.coins || 0) + totalReward + wagerResult
        const { error: coinsError } = await supabase
          .from('profiles')
          .update({ coins: Math.max(0, newCoins) })
          .eq('id', user.id)

        if (coinsError) throw coinsError
      }

      // Update ranked stats
      if (battleMode === 'ranked') {
        await supabase.rpc('update_ranked_stats', { battle_id_param: battle.id })
      } else if (battleMode === 'casual') {
        // Update casual stats and streak
        if (playerWon) {
          await supabase
            .from('profiles')
            .update({
              casual_wins: (profile?.casual_wins || 0) + 1,
              win_streak: (profile?.win_streak || 0) + 1
            })
            .eq('id', user.id)
        } else {
          await supabase
            .from('profiles')
            .update({
              casual_losses: (profile?.casual_losses || 0) + 1,
              win_streak: 0
            })
            .eq('id', user.id)
        }
      }

      await refreshProfile()

      // Check achievements
      if (playerWon) {
        const { data: battles } = await supabase
          .from('battles')
          .select('*')
          .eq('winner_id', user.id)

        if (battles) {
          await checkBattleAchievements(battles.length)
        }
      }
    } catch (error) {
      console.error('Error saving battle:', error)
    }
  }

  const resetBattle = () => {
    setOpponent(null)
    setBattleState('mode-select')
    setBattleMode(null)
    setCurrentRound(0)
    setRoundResults([])
    setMyScore(0)
    setOpponentScore(0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background-dark to-background-light pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-electric-blue border-t-transparent"></div>
            <p className="text-gray-400 font-body mt-4">Loading...</p>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-dark to-background-light pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Mode Selection */}
        {battleState === 'mode-select' && (
          <div>
            <div className="mb-6 text-center">
              <h1 className="text-5xl font-display text-white mb-2">BATTLE ARENA</h1>
              <p className="text-gray-400 font-body">Choose your battle mode</p>
            </div>

            {/* Win Streak Display */}
            {profile?.win_streak > 0 && (
              <div className="bg-gradient-to-r from-vibrant-green/20 to-accent-gold/20 border-2 border-vibrant-green rounded-xl p-4 mb-6 text-center">
                <p className="text-vibrant-green font-display text-2xl flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-3xl">local_fire_department</span>
                  {profile.win_streak} WIN STREAK!
                  <span className="material-symbols-outlined text-3xl">local_fire_department</span>
                </p>
                <p className="text-gray-300 font-body text-sm mt-1">
                  Reward Multiplier: {Math.min(profile.win_streak, 5)}x
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              {/* Casual Mode */}
              <div className="bg-black/50 border-2 border-electric-blue rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer"
                   onClick={() => selectBattleMode('casual')}>
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-electric-blue mb-4">sports_esports</span>
                  <h2 className="text-2xl font-display text-electric-blue mb-2">CASUAL</h2>
                  <p className="text-gray-400 font-body text-sm mb-4">Practice battles with no stakes</p>
                  <div className="space-y-2 text-left">
                    <p className="text-gray-300 font-body text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-vibrant-green">check_circle</span>
                      100 coins base reward
                    </p>
                    <p className="text-gray-300 font-body text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-vibrant-green">check_circle</span>
                      Win streak multiplier
                    </p>
                    <p className="text-gray-300 font-body text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-gray-500">cancel</span>
                      No ELO changes
                    </p>
                  </div>
                </div>
              </div>

              {/* Ranked Mode */}
              <div className="bg-black/50 border-2 border-accent-gold rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer"
                   onClick={() => selectBattleMode('ranked')}>
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-accent-gold mb-4">emoji_events</span>
                  <h2 className="text-2xl font-display text-accent-gold mb-2">RANKED</h2>
                  <p className="text-gray-400 font-body text-sm mb-4">Compete for ELO rating</p>
                  <div className="space-y-2 text-left">
                    <p className="text-gray-300 font-body text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-vibrant-green">check_circle</span>
                      150 coins base reward
                    </p>
                    <p className="text-gray-300 font-body text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-vibrant-green">check_circle</span>
                      ELO rating changes
                    </p>
                    <p className="text-gray-300 font-body text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-accent-gold">star</span>
                      Current ELO: {profile?.elo_rating || 1000}
                    </p>
                  </div>
                </div>
              </div>

              {/* Wager Mode */}
              <div className="bg-black/50 border-2 border-accent-purple rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer"
                   onClick={() => {
                     if ((profile?.coins || 0) < 100) {
                       alert('You need at least 100 coins to wager!')
                       return
                     }
                     selectBattleMode('wager')
                   }}>
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-accent-purple mb-4">casino</span>
                  <h2 className="text-2xl font-display text-accent-purple mb-2">WAGER</h2>
                  <p className="text-gray-400 font-body text-sm mb-4">Bet coins on victory</p>
                  <div className="space-y-2">
                    <input
                      type="number"
                      min="100"
                      max={Math.min(profile?.coins || 0, 1000)}
                      value={wagerAmount}
                      onChange={(e) => setWagerAmount(parseInt(e.target.value) || 100)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-10 px-3 bg-black/50 border-2 border-accent-purple rounded text-white font-display text-center"
                    />
                    <p className="text-gray-300 font-body text-xs">
                      Win: +{wagerAmount} coins<br/>
                      Lose: -{wagerAmount} coins
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Finding Opponent */}
        {battleState === 'finding' && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-electric-blue border-t-transparent mb-4"></div>
            <h2 className="text-3xl font-display text-white mb-2">Finding Opponent...</h2>
            <p className="text-gray-400 font-body">
              {battleMode === 'ranked' ? 'Matching by ELO rating' : 'Searching for players'}
            </p>
          </div>
        )}

        {/* Ready Screen */}
        {battleState === 'ready' && opponent && (
          <div>
            <h1 className="text-4xl font-display text-white mb-6 text-center">
              {battleMode === 'ranked' ? '⚔️ RANKED MATCH' : battleMode === 'wager' ? '💰 WAGER MATCH' : '⚽ CASUAL MATCH'}
            </h1>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Player Team */}
              <div className="bg-electric-blue/10 border-2 border-electric-blue rounded-xl p-6">
                <h2 className="text-2xl font-display text-electric-blue mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">person</span>
                  {profile?.username || 'You'}
                </h2>
                {battleMode === 'ranked' && (
                  <p className="text-gray-400 font-body text-sm mb-4">ELO: {profile?.elo_rating || 1000}</p>
                )}
                <div className="grid grid-cols-4 gap-2">
                  {POSITIONS.map(pos => (
                    <div key={pos} className="text-center">
                      <div className="mb-1">
                        <Card card={myTeam.cards[pos]} />
                      </div>
                      <p className="text-white font-pixel text-[10px]">{pos}</p>
                      <p className="text-accent-gold font-pixel text-[8px]">
                        {myTeam.cards[pos].overall_rating + (myTeam.cards[pos].bonus_stats || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opponent Team */}
              <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-6">
                <h2 className="text-2xl font-display text-red-500 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">person</span>
                  {opponent.username}
                </h2>
                {battleMode === 'ranked' && (
                  <p className="text-gray-400 font-body text-sm mb-4">ELO: {opponent.elo_rating}</p>
                )}
                <div className="grid grid-cols-4 gap-2">
                  {POSITIONS.map(pos => (
                    <div key={pos} className="text-center">
                      <div className="mb-1">
                        <Card card={opponent.cards[pos]} />
                      </div>
                      <p className="text-white font-pixel text-[10px]">{pos}</p>
                      <p className="text-accent-gold font-pixel text-[8px]">
                        {opponent.cards[pos].overall_rating + (opponent.cards[pos].bonus_stats || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={startBattle}
              className="w-full h-16 rounded-lg bg-vibrant-green text-black font-display text-2xl uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform"
            >
              ⚔️ START BATTLE
            </button>
          </div>
        )}

        {/* Battle Screen - Round by Round */}
        {battleState === 'battling' && (
          <div>
            {/* Score Display */}
            <div className="bg-black/50 border-2 border-white rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-electric-blue font-display text-xl">{profile?.username || 'You'}</p>
                  <p className="text-white font-display text-5xl">{myScore}</p>
                </div>
                <div className="text-center px-6">
                  <p className="text-gray-400 font-body text-sm">Round {currentRound + 1}/4</p>
                  <p className="text-white font-display text-2xl">-</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-red-500 font-display text-xl">{opponent.username}</p>
                  <p className="text-white font-display text-5xl">{opponentScore}</p>
                </div>
              </div>
            </div>

            {/* Round Display */}
            <div className="mb-6">
              <h2 className="text-3xl font-display text-white text-center mb-4">
                {POSITION_NAMES[POSITIONS[currentRound]]} Battle
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Player Card */}
                <div className="bg-electric-blue/20 border-2 border-electric-blue rounded-xl p-6">
                  <div className="w-48 mx-auto mb-4">
                    <Card card={myTeam.cards[POSITIONS[currentRound]]} />
                  </div>
                  <p className="text-white font-display text-xl text-center mb-2">
                    {myTeam.cards[POSITIONS[currentRound]].name}
                  </p>
                  <p className="text-accent-gold font-display text-2xl text-center">
                    {calculateCardPower(myTeam.cards[POSITIONS[currentRound]], POSITIONS[currentRound], myAbilitiesUsed, false)}
                  </p>
                  <div className="mt-4">
                    <p className="text-gray-400 font-pixel text-xs mb-2">ABILITY:</p>
                    <div className="bg-black/50 border border-electric-blue rounded p-2">
                      <p className="text-electric-blue font-pixel text-xs">
                        {POSITION_ABILITIES[POSITIONS[currentRound]].name}: {POSITION_ABILITIES[POSITIONS[currentRound]].description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Opponent Card */}
                <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-6">
                  <div className="w-48 mx-auto mb-4">
                    <Card card={opponent.cards[POSITIONS[currentRound]]} />
                  </div>
                  <p className="text-white font-display text-xl text-center mb-2">
                    {opponent.cards[POSITIONS[currentRound]].name}
                  </p>
                  <p className="text-accent-gold font-display text-2xl text-center">
                    {calculateCardPower(opponent.cards[POSITIONS[currentRound]], POSITIONS[currentRound], opponentAbilitiesUsed, true)}
                  </p>
                  <div className="mt-4">
                    <p className="text-gray-400 font-pixel text-xs mb-2">OPPONENT STATUS:</p>
                    <div className="bg-black/50 border border-red-500 rounded p-2">
                      <p className="text-gray-400 font-pixel text-xs text-center">???</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ability Choice */}
            {showAbilityChoice && !animating && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-background-dark border-4 border-electric-blue rounded-xl p-8 max-w-md w-full">
                  <h3 className="text-2xl font-display text-white text-center mb-4">Use Ability?</h3>
                  <div className="bg-electric-blue/20 border-2 border-electric-blue rounded-lg p-4 mb-6">
                    <p className="text-electric-blue font-display text-xl mb-2">
                      {POSITION_ABILITIES[POSITIONS[currentRound]].name}
                    </p>
                    <p className="text-gray-300 font-body text-sm">
                      {POSITION_ABILITIES[POSITIONS[currentRound]].description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => useAbility(false)}
                      className="h-14 rounded-lg bg-gray-600 text-white font-display uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform"
                    >
                      SKIP
                    </button>
                    <button
                      onClick={() => useAbility(true)}
                      disabled={myAbilitiesUsed[POSITIONS[currentRound]]}
                      className="h-14 rounded-lg bg-vibrant-green text-black font-display uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      USE IT!
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Round Result Animation */}
            {animating && roundWinner && (
              <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
                <div className="text-center animate-bounce">
                  {roundWinner === 'player' && (
                    <>
                      <span className="material-symbols-outlined text-9xl text-vibrant-green mb-4">check_circle</span>
                      <p className="text-vibrant-green font-display text-6xl">YOU WIN!</p>
                    </>
                  )}
                  {roundWinner === 'opponent' && (
                    <>
                      <span className="material-symbols-outlined text-9xl text-red-500 mb-4">cancel</span>
                      <p className="text-red-500 font-display text-6xl">OPPONENT WINS!</p>
                    </>
                  )}
                  {roundWinner === 'draw' && (
                    <>
                      <span className="material-symbols-outlined text-9xl text-accent-gold mb-4">remove</span>
                      <p className="text-accent-gold font-display text-6xl">DRAW!</p>
                    </>
                  )}
                  {roundResults[currentRound]?.effects.map((effect, i) => (
                    <p key={i} className="text-white font-body text-xl mt-4">{effect}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Battle Result */}
        {battleState === 'result' && (
          <div>
            <div className="text-center mb-8">
              {myScore > opponentScore ? (
                <>
                  <span className="material-symbols-outlined text-9xl text-vibrant-green mb-4 animate-bounce">emoji_events</span>
                  <h1 className="text-6xl font-display text-vibrant-green mb-2">VICTORY!</h1>
                </>
              ) : myScore < opponentScore ? (
                <>
                  <span className="material-symbols-outlined text-9xl text-red-500 mb-4">sentiment_dissatisfied</span>
                  <h1 className="text-6xl font-display text-red-500 mb-2">DEFEAT</h1>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-9xl text-accent-gold mb-4">handshake</span>
                  <h1 className="text-6xl font-display text-accent-gold mb-2">DRAW</h1>
                </>
              )}
              <p className="text-white font-display text-4xl">{myScore} - {opponentScore}</p>
            </div>

            {/* Rewards */}
            <div className="bg-black/50 border-2 border-vibrant-green rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-display text-vibrant-green mb-4">REWARDS</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-body">Base Reward:</span>
                  <span className="text-white font-display">+{battleMode === 'ranked' ? 150 : 100} coins</span>
                </div>
                {myScore > opponentScore && profile?.win_streak > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-body">Win Streak Bonus (x{Math.min((profile?.win_streak || 0) + 1, 5)}):</span>
                    <span className="text-vibrant-green font-display">
                      +{(battleMode === 'ranked' ? 150 : 100) * (Math.min((profile?.win_streak || 0) + 1, 5) - 1)} coins
                    </span>
                  </div>
                )}
                {battleMode === 'wager' && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-body">Wager Result:</span>
                    <span className={`font-display ${myScore > opponentScore ? 'text-vibrant-green' : 'text-red-500'}`}>
                      {myScore > opponentScore ? '+' : '-'}{wagerAmount} coins
                    </span>
                  </div>
                )}
                {battleMode === 'ranked' && (
                  <div className="flex justify-between pt-2 border-t border-gray-700">
                    <span className="text-gray-400 font-body">ELO Change:</span>
                    <span className="text-accent-gold font-display">Check profile for updated ELO</span>
                  </div>
                )}
              </div>
            </div>

            {/* Round Summary */}
            <div className="bg-black/50 border-2 border-white rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-display text-white mb-4">BATTLE SUMMARY</h2>
              <div className="space-y-3">
                {roundResults.map((round, i) => (
                  <div key={i} className={`border-2 rounded-lg p-3 ${
                    round.winner === 'player' ? 'border-vibrant-green bg-vibrant-green/10' :
                    round.winner === 'opponent' ? 'border-red-500 bg-red-500/10' :
                    'border-accent-gold bg-accent-gold/10'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-display">Round {i + 1}: {POSITION_NAMES[round.position]}</p>
                      <p className={`font-display ${
                        round.winner === 'player' ? 'text-vibrant-green' :
                        round.winner === 'opponent' ? 'text-red-500' :
                        'text-accent-gold'
                      }`}>
                        {round.winner === 'player' ? 'WIN' : round.winner === 'opponent' ? 'LOSS' : 'DRAW'}
                      </p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="text-white font-body">{round.myCard}</p>
                        <p className="text-electric-blue font-pixel text-xs">Power: {round.myPower}</p>
                        {round.myAbilityUsed && (
                          <p className="text-vibrant-green font-pixel text-[10px]">Used: {round.myAbilityUsed}</p>
                        )}
                      </div>
                      <div className="text-center px-4">
                        <p className="text-white font-display text-xl">VS</p>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-white font-body">{round.oppCard}</p>
                        <p className="text-red-500 font-pixel text-xs">Power: {round.oppPower}</p>
                        {round.oppAbilityUsed && (
                          <p className="text-accent-purple font-pixel text-[10px]">Used: {round.oppAbilityUsed}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={resetBattle}
                className="h-14 rounded-lg bg-electric-blue text-black font-display text-lg uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform"
              >
                BATTLE AGAIN
              </button>
              <button
                onClick={() => navigate('/')}
                className="h-14 rounded-lg bg-gray-600 text-white font-display text-lg uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform"
              >
                BACK TO HOME
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
