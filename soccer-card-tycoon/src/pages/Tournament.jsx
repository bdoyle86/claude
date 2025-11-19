import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
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

const WEATHER_CONDITIONS = {
  'rainy': { name: 'Rainy', description: 'Defenders +15%', icon: '🌧️', bonus: { DEF: 15 } },
  'sunny': { name: 'Sunny', description: 'Forwards +15%', icon: '☀️', bonus: { FWD: 15 } },
  'neutral': { name: 'Clear', description: 'No bonuses', icon: '☁️', bonus: {} }
}

const FORMATION_BONUSES = {
  '1-1-2': { attackBonus: 10, defenseBonus: -10 },
  '1-2-1': { attackBonus: 0, defenseBonus: 0 },
  '2-1-1': { attackBonus: -10, defenseBonus: 10 }
}

export default function Tournament() {
  const [tournaments, setTournaments] = useState([])
  const [userProgress, setUserProgress] = useState(null)
  const [userTrophies, setUserTrophies] = useState([])
  const [selectedTournament, setSelectedTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list', 'bracket', 'battle', 'victory'

  // Battle state
  const [myTeam, setMyTeam] = useState(null)
  const [currentOpponent, setCurrentOpponent] = useState(null)
  const [allOpponents, setAllOpponents] = useState([])
  const [currentRound, setCurrentRound] = useState(0)
  const [roundResults, setRoundResults] = useState([])
  const [myScore, setMyScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [weather, setWeather] = useState('neutral')
  const [battlePhase, setBattlePhase] = useState('ready') // 'ready', 'fighting', 'roundEnd', 'matchEnd'
  const [animating, setAnimating] = useState(false)
  const [roundWinner, setRoundWinner] = useState(null)
  const [damageNumbers, setDamageNumbers] = useState({ my: 0, opp: 0 })
  const [tournamentWins, setTournamentWins] = useState(0)

  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  useEffect(() => {
    if (battlePhase === 'fighting' && !animating && currentRound >= 0 && currentRound <= 3) {
      const timer = setTimeout(() => executeRound(), 800)
      return () => clearTimeout(timer)
    }
  }, [battlePhase, currentRound, animating])

  const fetchData = async () => {
    try {
      // Fetch tournaments
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .order('difficulty')

      if (tournamentsError) throw tournamentsError
      setTournaments(tournamentsData || [])

      // Fetch user's tournament progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_tournament_progress')
        .select('*, tournaments(*)')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .single()

      if (progressError && progressError.code !== 'PGRST116') throw progressError
      setUserProgress(progressData)

      // Fetch user's trophies
      const { data: trophiesData, error: trophiesError } = await supabase
        .from('user_trophies')
        .select('*, tournaments(*)')
        .eq('user_id', user.id)

      if (trophiesError) throw trophiesError
      setUserTrophies(trophiesData || [])

      // Fetch user's team
      await fetchMyTeam()
    } catch (error) {
      console.error('Error fetching tournament data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (!data) {
        alert('Please create a team first!')
        navigate('/team-manager')
        return
      }

      const cardIds = [data.goalkeeper_id, data.defender_id, data.midfielder_id, data.forward_id].filter(Boolean)

      if (cardIds.length < 4) {
        alert('Please complete your team first!')
        navigate('/team-manager')
        return
      }

      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('id', cardIds)

      if (cardsError) throw cardsError

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
    }
  }

  const enterTournament = async (tournament) => {
    // Check requirements
    if ((profile?.elo_rating || 1000) < tournament.required_elo) {
      alert(`You need at least ${tournament.required_elo} ELO to enter this tournament!`)
      return
    }

    if ((profile?.coins || 0) < tournament.entry_fee) {
      alert(`You need ${tournament.entry_fee} coins to enter this tournament!`)
      return
    }

    if (!myTeam) {
      alert('Please create a team first!')
      navigate('/team-manager')
      return
    }

    try {
      // Deduct entry fee
      if (tournament.entry_fee > 0) {
        const { error: coinError } = await supabase
          .from('profiles')
          .update({ coins: (profile?.coins || 0) - tournament.entry_fee })
          .eq('id', user.id)

        if (coinError) throw coinError
        await refreshProfile()
      }

      // Create tournament progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_tournament_progress')
        .insert({
          user_id: user.id,
          tournament_id: tournament.id,
          current_round: 0,
          wins: 0,
          losses: 0,
          status: 'in_progress'
        })
        .select()
        .single()

      if (progressError) throw progressError

      setUserProgress({ ...progressData, tournaments: tournament })
      setSelectedTournament(tournament)
      setTournamentWins(0)

      // Load AI opponents for this tournament
      await loadTournamentOpponents(tournament)

      setView('bracket')
    } catch (error) {
      console.error('Error entering tournament:', error)
      alert('Failed to enter tournament. Please try again.')
    }
  }

  const loadTournamentOpponents = async (tournament) => {
    try {
      // Get AI opponents based on tournament difficulty
      const minElo = 800 + (tournament.difficulty * 100)
      const maxElo = minElo + 200

      const { data: aiTeams, error } = await supabase
        .from('teams')
        .select('*, profiles!inner(username, elo_rating, is_bot)')
        .eq('profiles.is_bot', true)
        .gte('profiles.elo_rating', minElo)
        .lte('profiles.elo_rating', maxElo)
        .limit(20)

      if (error) throw error

      if (!aiTeams || aiTeams.length === 0) {
        // Fallback: get any AI opponents
        const { data: fallbackTeams, error: fallbackError } = await supabase
          .from('teams')
          .select('*, profiles!inner(username, elo_rating, is_bot)')
          .eq('profiles.is_bot', true)
          .limit(20)

        if (fallbackError) throw fallbackError
        const shuffled = (fallbackTeams || []).sort(() => Math.random() - 0.5)
        setAllOpponents(shuffled.slice(0, tournament.rounds))
      } else {
        const shuffled = aiTeams.sort(() => Math.random() - 0.5)
        setAllOpponents(shuffled.slice(0, tournament.rounds))
      }
    } catch (error) {
      console.error('Error loading opponents:', error)
      alert('Failed to load opponents. Please try again.')
    }
  }

  const continueExistingTournament = async () => {
    if (!userProgress) return

    setSelectedTournament(userProgress.tournaments)
    setTournamentWins(userProgress.wins)

    await loadTournamentOpponents(userProgress.tournaments)
    setView('bracket')
  }

  const startNextBattle = async () => {
    if (!allOpponents || allOpponents.length === 0) {
      alert('No opponents available!')
      return
    }

    const opponentTeamData = allOpponents[tournamentWins]

    if (!opponentTeamData) {
      // Tournament completed!
      await completeTournament()
      return
    }

    try {
      // Fetch opponent's cards
      const cardIds = [
        opponentTeamData.goalkeeper_id,
        opponentTeamData.defender_id,
        opponentTeamData.midfielder_id,
        opponentTeamData.forward_id
      ].filter(Boolean)

      const { data: oppCards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('id', cardIds)

      if (cardsError) throw cardsError

      const { data: oppUserCards, error: ucError } = await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', opponentTeamData.user_id)
        .in('card_id', cardIds)

      if (ucError) throw ucError

      const oppTeamCards = {
        GK: oppCards.find(c => c.id === opponentTeamData.goalkeeper_id),
        DEF: oppCards.find(c => c.id === opponentTeamData.defender_id),
        MID: oppCards.find(c => c.id === opponentTeamData.midfielder_id),
        FWD: oppCards.find(c => c.id === opponentTeamData.forward_id)
      }

      Object.keys(oppTeamCards).forEach(pos => {
        const uc = oppUserCards?.find(u => u.card_id === oppTeamCards[pos].id)
        if (uc) {
          oppTeamCards[pos].evolution_level = uc.evolution_level || 0
          oppTeamCards[pos].bonus_stats = uc.bonus_stats || 0
        }
      })

      setCurrentOpponent({
        ...opponentTeamData,
        cards: oppTeamCards,
        username: opponentTeamData.profiles?.username || 'AI Opponent',
        elo_rating: opponentTeamData.profiles?.elo_rating || 1000
      })

      // Randomly select weather
      const weatherTypes = ['rainy', 'sunny', 'neutral']
      const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)]
      setWeather(randomWeather)

      setRoundResults([])
      setMyScore(0)
      setOpponentScore(0)
      setCurrentRound(0)
      setBattlePhase('fighting')
      setView('battle')
    } catch (error) {
      console.error('Error starting battle:', error)
      alert('Failed to start battle. Please try again.')
    }
  }

  const calculateCardPower = (card, position, isOpponent = false) => {
    let power = (card.overall_rating || 75) + (card.bonus_stats || 0)

    const formation = isOpponent ? currentOpponent.formation : myTeam.formation
    if (formation && FORMATION_BONUSES[formation]) {
      const bonus = FORMATION_BONUSES[formation]
      if (position === 'FWD') {
        power += (power * bonus.attackBonus / 100)
      } else if (position === 'DEF') {
        power += (power * bonus.defenseBonus / 100)
      }
    }

    const weatherBonus = WEATHER_CONDITIONS[weather]?.bonus || {}
    if (weatherBonus[position]) {
      power += (power * weatherBonus[position] / 100)
    }

    return Math.round(power)
  }

  const executeRound = async () => {
    const position = POSITIONS[currentRound]
    const myCard = myTeam.cards[position]
    const oppCard = currentOpponent.cards[position]

    let myPower = calculateCardPower(myCard, position, false)
    let oppPower = calculateCardPower(oppCard, position, true)

    let abilityEffects = []

    // Apply rarity bonuses
    if (myCard.rarity === 'Epic' && currentRound === 3) {
      myPower *= 2
      abilityEffects.push('EPIC FINISHER activated! 2x power!')
    }
    if (oppCard.rarity === 'Epic' && currentRound === 3) {
      oppPower *= 2
    }

    // Critical Hit (10% chance)
    const playerCrit = Math.random() < 0.10
    if (playerCrit) {
      myPower = Math.round(myPower * 1.5)
      abilityEffects.push('💥 CRITICAL HIT! +50% damage!')
    }

    const oppCrit = Math.random() < 0.10
    if (oppCrit) {
      oppPower = Math.round(oppPower * 1.5)
      abilityEffects.push('⚠️ Opponent CRITICAL HIT!')
    }

    setDamageNumbers({ my: myPower, opp: oppPower })

    let roundWon = myPower > oppPower ? 'player' : myPower < oppPower ? 'opponent' : 'draw'

    // Miracle Save (5% chance)
    if (roundWon === 'opponent' && Math.random() < 0.05) {
      roundWon = 'draw'
      abilityEffects.push('✨ MIRACLE SAVE! Loss negated!')
    }

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
      effects: abilityEffects
    }

    setRoundResults(prev => [...prev, result])
    setAnimating(true)

    setTimeout(() => {
      setAnimating(false)
      setRoundWinner(null)

      if (currentRound < 3) {
        setCurrentRound(prev => prev + 1)
      } else {
        finishBattle(newMyScore, newOppScore)
      }
    }, 3500)
  }

  const finishBattle = async (finalMyScore, finalOppScore) => {
    setBattlePhase('matchEnd')

    const won = finalMyScore > finalOppScore

    try {
      if (won) {
        // Update tournament progress - increment wins
        const { error: progressError } = await supabase
          .from('user_tournament_progress')
          .update({
            wins: tournamentWins + 1,
            current_round: tournamentWins + 1
          })
          .eq('user_id', user.id)
          .eq('tournament_id', selectedTournament.id)
          .eq('status', 'in_progress')

        if (progressError) throw progressError

        setTournamentWins(prev => prev + 1)

        // Check if tournament is complete
        if (tournamentWins + 1 >= selectedTournament.rounds) {
          await completeTournament()
        } else {
          // Move to next round
          setTimeout(() => {
            setBattlePhase('ready')
            setView('bracket')
          }, 3000)
        }
      } else {
        // Tournament lost
        await failTournament()
      }
    } catch (error) {
      console.error('Error finishing battle:', error)
    }
  }

  const completeTournament = async () => {
    try {
      // Mark tournament as won
      const { error: progressError } = await supabase
        .from('user_tournament_progress')
        .update({
          status: 'won',
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('tournament_id', selectedTournament.id)
        .eq('status', 'in_progress')

      if (progressError) throw progressError

      // Award trophy (if not already won)
      const { error: trophyError } = await supabase
        .from('user_trophies')
        .insert({
          user_id: user.id,
          tournament_id: selectedTournament.id
        })
        .select()

      // Ignore duplicate error (already won before)
      if (trophyError && trophyError.code !== '23505') throw trophyError

      // Award coins
      const { error: coinsError } = await supabase
        .from('profiles')
        .update({
          coins: (profile?.coins || 0) + selectedTournament.reward_coins
        })
        .eq('id', user.id)

      if (coinsError) throw coinsError

      await refreshProfile()
      await fetchData()

      setView('victory')
    } catch (error) {
      console.error('Error completing tournament:', error)
    }
  }

  const failTournament = async () => {
    try {
      const { error } = await supabase
        .from('user_tournament_progress')
        .update({
          status: 'lost',
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('tournament_id', selectedTournament.id)
        .eq('status', 'in_progress')

      if (error) throw error

      await fetchData()

      setTimeout(() => {
        setView('list')
        setUserProgress(null)
      }, 3000)
    } catch (error) {
      console.error('Error failing tournament:', error)
    }
  }

  const resetToList = () => {
    setView('list')
    setSelectedTournament(null)
    setCurrentOpponent(null)
    setAllOpponents([])
    setTournamentWins(0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background-dark to-background-light pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-electric-blue border-t-transparent"></div>
          <p className="text-gray-400 font-body mt-4">Loading tournaments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-dark to-background-light pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Tournament List View */}
        {view === 'list' && (
          <div>
            <div className="mb-6 text-center">
              <h1 className="text-5xl font-display text-white mb-2">🏆 TOURNAMENTS</h1>
              <p className="text-gray-400 font-body">Compete against AI opponents for glory and rewards!</p>
            </div>

            {/* Continue Tournament Banner */}
            {userProgress && (
              <div className="bg-gradient-to-r from-vibrant-green/20 to-accent-gold/20 border-4 border-vibrant-green rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-display text-white mb-2">
                      {userProgress.tournaments.name}
                    </h2>
                    <p className="text-gray-300 font-body">
                      Progress: {userProgress.wins}/{userProgress.tournaments.rounds} wins
                    </p>
                  </div>
                  <button
                    onClick={continueExistingTournament}
                    className="h-14 px-6 rounded-lg bg-vibrant-green text-black font-display text-lg uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform"
                  >
                    CONTINUE
                  </button>
                </div>
              </div>
            )}

            {/* Trophy Case */}
            {userTrophies.length > 0 && (
              <div className="bg-black/50 border-2 border-accent-gold rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-display text-accent-gold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-3xl">emoji_events</span>
                  TROPHY CASE ({userTrophies.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {userTrophies.map(trophy => (
                    <div key={trophy.id} className="text-center p-4 bg-accent-gold/10 border-2 border-accent-gold rounded-lg">
                      <span className="material-symbols-outlined text-5xl text-accent-gold mb-2">emoji_events</span>
                      <p className="text-white font-pixel text-xs">{trophy.tournaments.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Tournaments */}
            <div className="grid md:grid-cols-2 gap-6">
              {tournaments.map(tournament => {
                const hasWon = userTrophies.some(t => t.tournament_id === tournament.id)
                const canEnter = (profile?.elo_rating || 1000) >= tournament.required_elo &&
                                 (profile?.coins || 0) >= tournament.entry_fee
                const isActive = userProgress?.tournament_id === tournament.id

                return (
                  <div
                    key={tournament.id}
                    className={`bg-black/50 rounded-xl p-6 border-4 ${
                      tournament.difficulty === 1 ? 'border-common-gray' :
                      tournament.difficulty === 2 ? 'border-accent-blue' :
                      tournament.difficulty === 3 ? 'border-electric-blue' :
                      tournament.difficulty === 4 ? 'border-accent-gold' :
                      'border-accent-purple'
                    } ${!canEnter && !isActive ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-display text-white mb-2">{tournament.name}</h3>
                        <p className="text-gray-400 font-body text-sm mb-3">{tournament.description}</p>
                      </div>
                      {hasWon && (
                        <span className="material-symbols-outlined text-4xl text-accent-gold">emoji_events</span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Difficulty:</span>
                        <span className="text-white font-display">
                          {'★'.repeat(tournament.difficulty)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Rounds:</span>
                        <span className="text-white">{tournament.rounds} battles</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Required ELO:</span>
                        <span className={`${canEnter || (profile?.elo_rating || 1000) >= tournament.required_elo ? 'text-vibrant-green' : 'text-red-500'}`}>
                          {tournament.required_elo}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Entry Fee:</span>
                        <span className={`${canEnter || (profile?.coins || 0) >= tournament.entry_fee ? 'text-white' : 'text-red-500'}`}>
                          {tournament.entry_fee} coins
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Reward:</span>
                        <span className="text-accent-gold font-display">{tournament.reward_coins} coins + Trophy</span>
                      </div>
                    </div>

                    {!isActive && (
                      <button
                        onClick={() => enterTournament(tournament)}
                        disabled={!canEnter}
                        className={`w-full h-12 rounded-lg font-display text-lg uppercase border-2 border-black shadow-pixel-hard transition-transform ${
                          canEnter
                            ? 'bg-vibrant-green text-black hover:scale-105'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {hasWon ? 'REPLAY' : 'ENTER TOURNAMENT'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tournament Bracket View */}
        {view === 'bracket' && selectedTournament && (
          <div>
            <div className="mb-6 text-center">
              <h1 className="text-4xl font-display text-white mb-2">{selectedTournament.name}</h1>
              <p className="text-gray-400 font-body">Round {tournamentWins + 1} of {selectedTournament.rounds}</p>
            </div>

            {/* Progress Bar */}
            <div className="bg-black/50 border-2 border-white rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                {Array.from({ length: selectedTournament.rounds }).map((_, i) => (
                  <div key={i} className="flex items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                      i < tournamentWins ? 'bg-vibrant-green border-vibrant-green' :
                      i === tournamentWins ? 'bg-electric-blue border-electric-blue animate-pulse' :
                      'bg-gray-700 border-gray-700'
                    }`}>
                      {i < tournamentWins ? (
                        <span className="material-symbols-outlined text-black text-2xl">check</span>
                      ) : (
                        <span className="text-white font-display">{i + 1}</span>
                      )}
                    </div>
                    {i < selectedTournament.rounds - 1 && (
                      <div className={`flex-1 h-1 ${i < tournamentWins ? 'bg-vibrant-green' : 'bg-gray-700'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Next Opponent */}
            {allOpponents[tournamentWins] && (
              <div className="bg-black/50 border-2 border-electric-blue rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-display text-white mb-4 text-center">Next Opponent</h2>
                <div className="text-center">
                  <span className="material-symbols-outlined text-7xl text-red-500 mb-4">shield_person</span>
                  <p className="text-white font-display text-2xl">
                    {allOpponents[tournamentWins].profiles?.username || 'AI Opponent'}
                  </p>
                  <p className="text-gray-400">ELO: {allOpponents[tournamentWins].profiles?.elo_rating || 1000}</p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={startNextBattle}
                className="h-16 rounded-lg bg-vibrant-green text-black font-display text-2xl uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform"
              >
                ⚔️ START BATTLE
              </button>
              <button
                onClick={resetToList}
                className="h-16 rounded-lg bg-gray-600 text-white font-display text-xl uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform"
              >
                EXIT TOURNAMENT
              </button>
            </div>
          </div>
        )}

        {/* Battle View */}
        {view === 'battle' && currentOpponent && battlePhase === 'fighting' && (
          <div>
            {/* Weather Display */}
            <div className="bg-black/50 border-2 border-accent-gold rounded-xl p-4 mb-4">
              <div className="text-center">
                <p className="text-gray-400 font-pixel text-xs mb-1">WEATHER</p>
                <p className="text-accent-gold font-display text-2xl">{WEATHER_CONDITIONS[weather]?.icon}</p>
                <p className="text-white font-pixel text-[10px]">{WEATHER_CONDITIONS[weather]?.name}</p>
              </div>
            </div>

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
                  <p className="text-red-500 font-display text-xl">{currentOpponent.username}</p>
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
                    {calculateCardPower(myTeam.cards[POSITIONS[currentRound]], POSITIONS[currentRound], false)}
                  </p>
                </div>

                {/* Opponent Card */}
                <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-6">
                  <div className="w-48 mx-auto mb-4">
                    <Card card={currentOpponent.cards[POSITIONS[currentRound]]} />
                  </div>
                  <p className="text-white font-display text-xl text-center mb-2">
                    {currentOpponent.cards[POSITIONS[currentRound]].name}
                  </p>
                  <p className="text-accent-gold font-display text-2xl text-center">
                    {calculateCardPower(currentOpponent.cards[POSITIONS[currentRound]], POSITIONS[currentRound], true)}
                  </p>
                </div>
              </div>
            </div>

            {/* Round Result Animation */}
            {animating && roundWinner && (
              <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-8 mb-8">
                    <div className="relative">
                      <div className="w-40 transform -rotate-12 animate-pulse">
                        <Card card={myTeam.cards[POSITIONS[currentRound]]} />
                      </div>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
                        <p className="text-electric-blue font-display text-4xl drop-shadow-[0_0_10px_rgba(0,150,255,0.8)]">
                          {damageNumbers.my}
                        </p>
                      </div>
                    </div>

                    <div className="text-white text-6xl animate-ping">⚔️</div>

                    <div className="relative">
                      <div className="w-40 transform rotate-12 animate-pulse">
                        <Card card={currentOpponent.cards[POSITIONS[currentRound]]} />
                      </div>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
                        <p className="text-red-500 font-display text-4xl drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
                          {damageNumbers.opp}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="animate-bounce">
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
                  </div>

                  <div className="mt-6">
                    {roundResults[currentRound]?.effects.map((effect, i) => (
                      <p key={i} className="text-white font-body text-xl mt-2 animate-pulse">{effect}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Match End - Win/Loss */}
        {view === 'battle' && battlePhase === 'matchEnd' && (
          <div className="text-center">
            {myScore > opponentScore ? (
              <>
                <span className="material-symbols-outlined text-9xl text-vibrant-green mb-4 animate-bounce">emoji_events</span>
                <h1 className="text-6xl font-display text-vibrant-green mb-2">VICTORY!</h1>
                <p className="text-white font-display text-4xl mb-4">{myScore} - {opponentScore}</p>
                <p className="text-gray-400 font-body text-xl">
                  {tournamentWins >= selectedTournament?.rounds - 1
                    ? 'Tournament Complete! Claiming trophy...'
                    : 'Advancing to next round...'}
                </p>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-9xl text-red-500 mb-4">sentiment_dissatisfied</span>
                <h1 className="text-6xl font-display text-red-500 mb-2">DEFEAT</h1>
                <p className="text-white font-display text-4xl mb-4">{myScore} - {opponentScore}</p>
                <p className="text-gray-400 font-body text-xl">Tournament ended. Try again!</p>
              </>
            )}
          </div>
        )}

        {/* Victory Screen */}
        {view === 'victory' && (
          <div className="text-center">
            <span className="material-symbols-outlined text-9xl text-accent-gold mb-4 animate-bounce">emoji_events</span>
            <h1 className="text-6xl font-display text-accent-gold mb-4">TOURNAMENT WON!</h1>
            <h2 className="text-4xl font-display text-white mb-6">{selectedTournament?.name}</h2>

            <div className="bg-black/50 border-4 border-accent-gold rounded-xl p-8 mb-8 max-w-md mx-auto">
              <h3 className="text-2xl font-display text-white mb-4">REWARDS</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Trophy:</span>
                  <span className="material-symbols-outlined text-accent-gold text-3xl">emoji_events</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Coins:</span>
                  <span className="text-accent-gold font-display text-2xl">+{selectedTournament?.reward_coins}</span>
                </div>
              </div>
            </div>

            <button
              onClick={resetToList}
              className="h-16 px-8 rounded-lg bg-vibrant-green text-black font-display text-2xl uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform"
            >
              BACK TO TOURNAMENTS
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
