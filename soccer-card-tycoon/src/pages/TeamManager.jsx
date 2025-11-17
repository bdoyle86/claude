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

const FORMATIONS = {
  '1-1-2': {
    name: 'Offensive',
    description: '+10% Attack, -10% Defense',
    attackBonus: 10,
    defenseBonus: -10,
    icon: 'rocket_launch'
  },
  '1-2-1': {
    name: 'Balanced',
    description: 'No bonuses or penalties',
    attackBonus: 0,
    defenseBonus: 0,
    icon: 'balance'
  },
  '2-1-1': {
    name: 'Defensive',
    description: '+10% Defense, -10% Attack',
    attackBonus: -10,
    defenseBonus: 10,
    icon: 'shield'
  }
}

export default function TeamManager() {
  const [userCards, setUserCards] = useState([])
  const [selectedCards, setSelectedCards] = useState({
    GK: null,
    DEF: null,
    MID: null,
    FWD: null
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [filterPosition, setFilterPosition] = useState('ALL')
  const [formation, setFormation] = useState('1-2-1')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserCards()
    fetchExistingTeam()
  }, [user])

  const fetchUserCards = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_cards')
        .select(`
          *,
          cards (*)
        `)
        .eq('user_id', user.id)

      if (error) throw error

      const cardsWithQuantity = data?.map(uc => ({
        ...uc.cards,
        user_card_id: uc.id,
        quantity: uc.quantity,
        evolution_level: uc.evolution_level || 0,
        bonus_stats: uc.bonus_stats || 0
      })) || []

      setUserCards(cardsWithQuantity)
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingTeam = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        // Set formation
        if (data.formation) {
          setFormation(data.formation)
        }

        // Fetch the actual card data for each position
        const positions = {
          GK: data.goalkeeper_id,
          DEF: data.defender_id,
          MID: data.midfielder_id,
          FWD: data.forward_id
        }

        const cardIds = Object.values(positions).filter(id => id !== null)

        if (cardIds.length > 0) {
          const { data: cards, error: cardsError } = await supabase
            .from('cards')
            .select('*')
            .in('id', cardIds)

          if (cardsError) throw cardsError

          const teamCards = {
            GK: cards?.find(c => c.id === positions.GK) || null,
            DEF: cards?.find(c => c.id === positions.DEF) || null,
            MID: cards?.find(c => c.id === positions.MID) || null,
            FWD: cards?.find(c => c.id === positions.FWD) || null
          }

          setSelectedCards(teamCards)
        }
      }
    } catch (error) {
      console.error('Error fetching team:', error)
    }
  }

  const handleCardSelect = (card, position) => {
    // Check if card position matches slot position
    if (card.position !== position) {
      setToastMessage(`This card is a ${POSITION_NAMES[card.position]}, not a ${POSITION_NAMES[position]}!`)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
      return
    }

    // Check if card is already in another position
    const cardInTeam = Object.entries(selectedCards).find(([pos, c]) => c?.id === card.id && pos !== position)
    if (cardInTeam) {
      setToastMessage('Card already in team!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
      return
    }

    setSelectedCards({
      ...selectedCards,
      [position]: card
    })
  }

  const removeCard = (position) => {
    setSelectedCards({
      ...selectedCards,
      [position]: null
    })
  }

  const saveTeam = async () => {
    if (!user) return

    // Check if all 4 positions are filled
    if (Object.values(selectedCards).some(card => card === null)) {
      setToastMessage('Please select one card for each position!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
      return
    }

    setSaving(true)

    try {
      const teamData = {
        user_id: user.id,
        goalkeeper_id: selectedCards.GK.id,
        defender_id: selectedCards.DEF.id,
        midfielder_id: selectedCards.MID.id,
        forward_id: selectedCards.FWD.id,
        formation: formation,
        updated_at: new Date().toISOString()
      }

      // Check if team exists
      const { data: existingTeam, error: checkError } = await supabase
        .from('teams')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') throw checkError

      if (existingTeam) {
        // Update existing team
        const { error: updateError } = await supabase
          .from('teams')
          .update(teamData)
          .eq('user_id', user.id)

        if (updateError) throw updateError
      } else {
        // Insert new team
        const { error: insertError } = await supabase
          .from('teams')
          .insert(teamData)

        if (insertError) throw insertError
      }

      setToastMessage('Team saved successfully!')
      setShowToast(true)
      setTimeout(() => {
        setShowToast(false)
        navigate('/battle')
      }, 1500)
    } catch (error) {
      console.error('Error saving team:', error)
      setToastMessage(`Error saving team: ${error.message}`)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const getTeamOverall = () => {
    const validCards = Object.values(selectedCards).filter(c => c !== null)
    if (validCards.length === 0) return 0
    const total = validCards.reduce((sum, card) => sum + ((card.overall_rating || 75) + (card.bonus_stats || 0)), 0)
    return Math.round(total / validCards.length)
  }

  const getPositionIcon = (position) => {
    const icons = {
      'GK': 'sports_soccer',
      'DEF': 'shield',
      'MID': 'bolt',
      'FWD': 'rocket_launch'
    }
    return icons[position] || 'person'
  }

  const getPositionColor = (position) => {
    const colors = {
      'GK': 'from-yellow-500 to-orange-500',
      'DEF': 'from-blue-500 to-blue-700',
      'MID': 'from-green-500 to-emerald-600',
      'FWD': 'from-red-500 to-red-700'
    }
    return colors[position] || 'from-gray-500 to-gray-700'
  }

  const filteredCards = filterPosition === 'ALL'
    ? userCards
    : userCards.filter(card => card.position === filterPosition)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background-dark to-background-light pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-electric-blue border-t-transparent"></div>
            <p className="text-gray-400 font-body mt-4">Loading your collection...</p>
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
        <div className="mb-6">
          <h1 className="text-4xl font-display text-white mb-2">Team Manager</h1>
          <p className="text-gray-400 font-body">Select one player for each position</p>
        </div>

        {/* Formation Selection */}
        <div className="bg-black/50 border-2 border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-display text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">strategy</span>
            SELECT FORMATION
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(FORMATIONS).map(([key, formationData]) => (
              <button
                key={key}
                onClick={() => setFormation(key)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formation === key
                    ? 'bg-electric-blue border-electric-blue text-black'
                    : 'bg-black/30 border-gray-600 text-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-2xl">
                    {formationData.icon}
                  </span>
                  <div className="text-left">
                    <div className="font-display text-lg">{key}</div>
                    <div className="font-body text-sm opacity-80">{formationData.name}</div>
                  </div>
                </div>
                <p className="text-sm font-body opacity-80">{formationData.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Team Overview */}
        <div className="bg-black/50 border-2 border-electric-blue rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display text-electric-blue flex items-center gap-2">
              <span className="material-symbols-outlined">group</span>
              YOUR TEAM
            </h2>
            <div className="text-right">
              <p className="text-gray-400 font-body text-sm">Team Rating</p>
              <p className="text-3xl font-display text-white">{getTeamOverall()}</p>
            </div>
          </div>

          {/* Position Slots - Formation Style */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {POSITIONS.map(position => {
                const card = selectedCards[position]
                return (
                  <div key={position} className="relative">
                    <div className={`bg-gradient-to-br ${getPositionColor(position)} p-4 rounded-xl border-2 border-black shadow-pixel-hard`}>
                      {/* Position Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-white text-xl">
                            {getPositionIcon(position)}
                          </span>
                          <span className="text-white font-display text-sm">{POSITION_NAMES[position]}</span>
                        </div>
                        <span className="bg-black/50 text-white font-pixel text-xs px-2 py-1 rounded">{position}</span>
                      </div>

                      {/* Card Slot */}
                      {card ? (
                        <div className="relative">
                          <div className="transform hover:scale-105 transition-transform">
                            <Card card={card} />
                          </div>
                          {card.evolution_level > 0 && (
                            <div className="absolute top-1 left-1 bg-accent-gold rounded px-1 border border-black">
                              <span className="text-black font-pixel text-[8px]">+{card.evolution_level}</span>
                            </div>
                          )}
                          <button
                            onClick={() => removeCard(position)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full border-2 border-black flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ) : (
                        <div className="aspect-[2/3] bg-black/30 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <span className="material-symbols-outlined text-white/50 text-4xl mb-2">add</span>
                            <p className="text-white/50 font-pixel text-xs">Select {POSITION_NAMES[position]}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={saveTeam}
            disabled={saving || Object.values(selectedCards).some(c => c === null)}
            className="w-full mt-6 h-14 rounded-lg bg-vibrant-green text-black font-display text-lg uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></div>
                SAVING...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                SAVE TEAM & GO TO BATTLE
              </>
            )}
          </button>
        </div>

        {/* Card Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display text-white flex items-center gap-2">
              <span className="material-symbols-outlined">collections</span>
              YOUR COLLECTION
            </h2>
          </div>

          {/* Position Filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            <button
              onClick={() => setFilterPosition('ALL')}
              className={`px-4 py-2 rounded-lg font-display text-sm uppercase border-2 border-black transition-all whitespace-nowrap ${
                filterPosition === 'ALL' ? 'bg-white text-black' : 'bg-black/30 text-gray-400 hover:bg-black/50'
              }`}
            >
              ALL ({userCards.length})
            </button>
            {POSITIONS.map(position => (
              <button
                key={position}
                onClick={() => setFilterPosition(position)}
                className={`px-4 py-2 rounded-lg font-display text-sm uppercase border-2 border-black transition-all whitespace-nowrap flex items-center gap-2 ${
                  filterPosition === position
                    ? `bg-gradient-to-r ${getPositionColor(position)} text-white`
                    : 'bg-black/30 text-gray-400 hover:bg-black/50'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{getPositionIcon(position)}</span>
                {position} ({userCards.filter(c => c.position === position).length})
              </button>
            ))}
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {filteredCards.map(card => {
              const isSelected = Object.values(selectedCards).some(c => c?.id === card.id)
              const canSelect = !isSelected

              return (
                <div key={card.id} className="relative">
                  <div
                    onClick={() => canSelect && handleCardSelect(card, card.position)}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'opacity-30 scale-95' : 'hover:scale-105'
                    } ${!canSelect ? 'cursor-not-allowed' : ''}`}
                  >
                    <Card card={card} />
                  </div>

                  {/* Position Badge */}
                  <div className={`absolute top-1 right-1 bg-gradient-to-br ${getPositionColor(card.position)} text-white font-pixel text-[8px] px-1.5 py-0.5 rounded border border-black`}>
                    {card.position}
                  </div>

                  {/* Evolution Badge */}
                  {card.evolution_level > 0 && (
                    <div className="absolute top-1 left-1 bg-accent-gold rounded px-1 border border-black">
                      <span className="text-black font-pixel text-[8px]">+{card.evolution_level}</span>
                    </div>
                  )}

                  {/* Selected Checkmark */}
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                      <div className="w-10 h-10 bg-vibrant-green rounded-full border-2 border-black flex items-center justify-center">
                        <span className="material-symbols-outlined text-black text-2xl">check</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filteredCards.length === 0 && (
            <div className="text-center py-20 bg-black/30 rounded-lg border-2 border-gray-700">
              <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">inbox</span>
              <p className="text-gray-400 font-body mb-4">No {filterPosition === 'ALL' ? 'cards' : `${POSITION_NAMES[filterPosition]}s`} in your collection</p>
              <button
                onClick={() => navigate('/packs')}
                className="h-12 px-6 rounded-lg bg-electric-blue text-black font-display uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform"
              >
                OPEN PACKS
              </button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black border-2 border-white rounded-lg px-6 py-3 shadow-pixel-hard z-50 animate-bounce">
          <p className="text-white font-display text-sm">{toastMessage}</p>
        </div>
      )}
    </div>
  )
}
