import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useAchievements } from '../contexts/AchievementContext'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import Card from '../components/Card'

export default function CardEvolution() {
  const [userCards, setUserCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [evolving, setEvolving] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'evolvable', 'evolved'
  const { user } = useAuth()
  const { achievements } = useAchievements()
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserCards()
  }, [user])

  const fetchUserCards = async () => {
    try {
      const { data, error } = await supabase
        .from('user_cards')
        .select(`
          *,
          cards(*)
        `)
        .eq('user_id', user.id)

      if (error) throw error

      const cards = data?.map(uc => ({
        ...uc.cards,
        user_card_id: uc.id,
        available_quantity: uc.quantity,
        evolution_level: uc.evolution_level || 0,
        bonus_stats: uc.bonus_stats || 0
      })) || []

      setUserCards(cards)
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEvolutionCost = (currentLevel) => {
    switch (currentLevel) {
      case 0: return 2
      case 1: return 3
      case 2: return 5
      case 3: return 8
      default: return 10
    }
  }

  const getEvolutionBonus = (rarity, level) => {
    const baseBonus = rarity === 'Epic' ? 3 : rarity === 'Rare' ? 2 : 1
    return baseBonus * (level + 1)
  }

  const handleEvolve = async () => {
    if (!selectedCard) return

    const cost = getEvolutionCost(selectedCard.evolution_level)

    if (selectedCard.available_quantity <= cost) {
      alert(`You need at least ${cost + 1} copies of this card (${cost} to evolve + 1 to keep)`)
      return
    }

    if (!confirm(`Evolve this card? This will consume ${cost} duplicates and cannot be undone.`)) {
      return
    }

    setEvolving(true)

    try {
      const { data, error } = await supabase
        .rpc('evolve_card', {
          user_card_id_param: selectedCard.user_card_id,
          duplicates_to_consume: cost
        })

      if (error) throw error

      if (!data.success) {
        throw new Error(data.error || 'Evolution failed')
      }

      alert(`Evolution successful! +${data.stats_gained} stats (Total: +${data.total_bonus})`)

      // Check evolution achievements
      const { data: evolutions, error: evoError } = await supabase
        .from('card_evolutions')
        .select('*')
        .eq('user_id', user.id)

      if (!evoError && evolutions) {
        const evolutionAchievement = achievements.find(a => a.name === 'first_evolution')
        const masterAchievement = achievements.find(a => a.name === 'evolution_master')

        // Check first evolution
        if (evolutionAchievement && evolutions.length === 1) {
          // Will be picked up by achievement system
        }

        // Check evolution master (10 evolutions)
        if (masterAchievement && evolutions.length === 10) {
          // Will be picked up by achievement system
        }
      }

      await fetchUserCards()
      setSelectedCard(null)
    } catch (error) {
      console.error('Error evolving card:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setEvolving(false)
    }
  }

  const filteredCards = userCards.filter(card => {
    if (filter === 'evolvable') {
      const cost = getEvolutionCost(card.evolution_level)
      return card.available_quantity > cost && card.evolution_level < 5
    }
    if (filter === 'evolved') {
      return card.evolution_level > 0
    }
    return true
  })

  const sortedCards = filteredCards.sort((a, b) => {
    // Sort by: can evolve first, then by evolution level desc, then by rarity, then by overall
    const aCost = getEvolutionCost(a.evolution_level)
    const bCost = getEvolutionCost(b.evolution_level)
    const aCanEvolve = a.available_quantity > aCost && a.evolution_level < 5
    const bCanEvolve = b.available_quantity > bCost && b.evolution_level < 5

    if (aCanEvolve && !bCanEvolve) return -1
    if (!aCanEvolve && bCanEvolve) return 1

    if (a.evolution_level !== b.evolution_level) {
      return b.evolution_level - a.evolution_level
    }

    const rarityOrder = { Epic: 3, Rare: 2, Common: 1 }
    if (rarityOrder[a.rarity] !== rarityOrder[b.rarity]) {
      return rarityOrder[b.rarity] - rarityOrder[a.rarity]
    }

    return (b.overall_rating || 0) - (a.overall_rating || 0)
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background-dark to-background-light pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent-gold border-t-transparent"></div>
            <p className="text-gray-400 font-body mt-4">Loading cards...</p>
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
          <h1 className="text-4xl font-display text-accent-gold mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-5xl">upgrade</span>
            CARD EVOLUTION
          </h1>
          <p className="text-gray-400 font-body">Burn duplicate cards to increase their power</p>
        </div>

        {/* Info Panel */}
        <div className="bg-accent-gold/10 border-2 border-accent-gold rounded-lg p-4 mb-6">
          <h3 className="text-accent-gold font-display mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">info</span>
            HOW IT WORKS
          </h3>
          <ul className="text-gray-300 font-body text-sm space-y-1">
            <li>• Sacrifice duplicate cards to permanently boost a card's stats</li>
            <li>• Each evolution level requires more duplicates (2, 3, 5, 8, 10...)</li>
            <li>• Epic cards gain +3 per level, Rare +2, Common +1 (multiplied by level)</li>
            <li>• Maximum evolution level: 5</li>
            <li>• Evolved cards keep their bonuses forever!</li>
          </ul>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 h-10 rounded-lg font-display text-sm uppercase border-2 border-black transition-all ${
              filter === 'all' ? 'bg-accent-gold text-black' : 'bg-black/30 text-gray-400 hover:bg-black/50'
            }`}
          >
            ALL ({userCards.length})
          </button>
          <button
            onClick={() => setFilter('evolvable')}
            className={`flex-1 h-10 rounded-lg font-display text-sm uppercase border-2 border-black transition-all ${
              filter === 'evolvable' ? 'bg-vibrant-green text-black' : 'bg-black/30 text-gray-400 hover:bg-black/50'
            }`}
          >
            EVOLVABLE ({userCards.filter(c => {
              const cost = getEvolutionCost(c.evolution_level)
              return c.available_quantity > cost && c.evolution_level < 5
            }).length})
          </button>
          <button
            onClick={() => setFilter('evolved')}
            className={`flex-1 h-10 rounded-lg font-display text-sm uppercase border-2 border-black transition-all ${
              filter === 'evolved' ? 'bg-electric-blue text-black' : 'bg-black/30 text-gray-400 hover:bg-black/50'
            }`}
          >
            EVOLVED ({userCards.filter(c => c.evolution_level > 0).length})
          </button>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 mb-6">
          {sortedCards.map(card => {
            const cost = getEvolutionCost(card.evolution_level)
            const canEvolve = card.available_quantity > cost && card.evolution_level < 5
            const isSelected = selectedCard?.id === card.id

            return (
              <div key={card.user_card_id} className="relative">
                <div
                  onClick={() => setSelectedCard(card)}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-4 ring-accent-gold scale-95' : 'hover:scale-105'
                  } ${canEvolve ? 'animate-pulse-glow' : ''}`}
                >
                  <Card card={card} />
                </div>

                {/* Quantity Badge */}
                {card.available_quantity > 1 && (
                  <div className="absolute top-1 right-1 bg-black/90 rounded-full w-7 h-7 flex items-center justify-center border-2 border-white">
                    <span className="text-white font-pixel text-[10px]">x{card.available_quantity}</span>
                  </div>
                )}

                {/* Evolution Level Badge */}
                {card.evolution_level > 0 && (
                  <div className="absolute top-1 left-1 bg-accent-gold rounded px-2 py-0.5 border-2 border-black">
                    <span className="text-black font-display text-xs">+{card.evolution_level}</span>
                  </div>
                )}

                {/* Can Evolve Indicator */}
                {canEvolve && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-vibrant-green rounded-full w-6 h-6 flex items-center justify-center border-2 border-black animate-bounce">
                    <span className="material-symbols-outlined text-black text-sm">arrow_upward</span>
                  </div>
                )}

                {/* Max Level */}
                {card.evolution_level >= 5 && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-accent-gold/90 rounded px-2 py-0.5 border border-black">
                    <span className="text-black font-pixel text-[8px]">MAX</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {sortedCards.length === 0 && (
          <div className="text-center py-20 bg-black/30 rounded-lg border-2 border-gray-700">
            <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">filter_alt_off</span>
            <p className="text-gray-400 font-body">No cards match this filter</p>
          </div>
        )}

        {/* Selected Card Details */}
        {selectedCard && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background-dark border-4 border-accent-gold rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-display text-accent-gold flex items-center gap-2">
                  <span className="material-symbols-outlined">upgrade</span>
                  EVOLVE CARD
                </h2>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Card Preview */}
              <div className="flex gap-4 mb-6">
                <div className="w-32">
                  <Card card={selectedCard} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-display text-xl mb-1">{selectedCard.name}</p>
                  <p className="text-gray-400 font-body text-sm mb-2">{selectedCard.position}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-display text-3xl">{selectedCard.overall_rating + selectedCard.bonus_stats}</span>
                    {selectedCard.bonus_stats > 0 && (
                      <span className="text-vibrant-green font-display text-lg">+{selectedCard.bonus_stats}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-accent-gold/20 border border-accent-gold rounded">
                      <span className="text-accent-gold font-pixel text-xs">LVL {selectedCard.evolution_level}</span>
                    </div>
                    <div className="px-2 py-1 bg-white/10 border border-gray-600 rounded">
                      <span className="text-white font-pixel text-xs">x{selectedCard.available_quantity}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedCard.evolution_level >= 5 ? (
                <div className="text-center py-6 bg-accent-gold/20 border-2 border-accent-gold rounded-lg">
                  <span className="material-symbols-outlined text-accent-gold text-5xl mb-2">star</span>
                  <p className="text-accent-gold font-display text-xl">MAX LEVEL REACHED</p>
                  <p className="text-gray-400 font-body text-sm mt-2">This card cannot be evolved further</p>
                </div>
              ) : (
                <>
                  {/* Evolution Details */}
                  <div className="bg-black/50 border-2 border-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-400 font-body text-sm">Evolution Cost:</span>
                      <span className="text-white font-display">{getEvolutionCost(selectedCard.evolution_level)} Duplicates</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-400 font-body text-sm">Stats Gained:</span>
                      <span className="text-vibrant-green font-display">+{getEvolutionBonus(selectedCard.rarity, selectedCard.evolution_level)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-body text-sm">New Level:</span>
                      <span className="text-accent-gold font-display">{selectedCard.evolution_level} → {selectedCard.evolution_level + 1}</span>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-vibrant-green/10 border-2 border-vibrant-green rounded-lg p-4 mb-6">
                    <p className="text-vibrant-green font-pixel text-xs mb-2">AFTER EVOLUTION:</p>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-body text-sm">Overall Rating:</span>
                      <span className="text-white font-display text-lg">
                        {selectedCard.overall_rating + selectedCard.bonus_stats + getEvolutionBonus(selectedCard.rarity, selectedCard.evolution_level)}
                      </span>
                    </div>
                  </div>

                  {/* Evolution Button */}
                  <button
                    onClick={handleEvolve}
                    disabled={evolving || selectedCard.available_quantity <= getEvolutionCost(selectedCard.evolution_level)}
                    className="w-full h-14 rounded-lg bg-accent-gold text-black font-display text-lg uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {evolving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></div>
                        EVOLVING...
                      </>
                    ) : selectedCard.available_quantity <= getEvolutionCost(selectedCard.evolution_level) ? (
                      <>
                        <span className="material-symbols-outlined">error</span>
                        NOT ENOUGH DUPLICATES
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">upgrade</span>
                        EVOLVE CARD
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <BottomNav />

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>
    </div>
  )
}
