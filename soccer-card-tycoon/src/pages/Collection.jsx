import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import Card from '../components/Card'
import CardDetailModal from '../components/CardDetailModal'

export default function Collection() {
  const [userCards, setUserCards] = useState([])
  const [filteredCards, setFilteredCards] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('name')
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState(null)
  const [cardQuantities, setCardQuantities] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [positionFilter, setPositionFilter] = useState('All')
  const [minRating, setMinRating] = useState(0)
  const [maxRating, setMaxRating] = useState(100)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchUserCards()
    }
  }, [user])

  useEffect(() => {
    filterAndSortCards()
  }, [userCards, selectedFilter, sortOrder, searchQuery, positionFilter, minRating, maxRating])

  const fetchUserCards = async () => {
    try {
      const { data, error } = await supabase
        .from('user_cards')
        .select(`
          *,
          cards (*)
        `)
        .eq('user_id', user.id)

      if (error) throw error

      // Extract the card data and track quantities
      const cards = data.map(uc => uc.cards).filter(Boolean)
      const quantities = {}
      data.forEach(uc => {
        if (uc.cards) {
          quantities[uc.cards.id] = uc.quantity || 1
        }
      })

      setUserCards(cards)
      setCardQuantities(quantities)
    } catch (error) {
      console.error('Error fetching user cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortCards = () => {
    let filtered = [...userCards]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(card =>
        card.player_name?.toLowerCase().includes(query) ||
        card.club?.toLowerCase().includes(query) ||
        card.country?.toLowerCase().includes(query)
      )
    }

    // Apply rarity filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(card => card.rarity === selectedFilter)
    }

    // Apply position filter
    if (positionFilter !== 'All') {
      filtered = filtered.filter(card => card.position === positionFilter)
    }

    // Apply rating filter
    filtered = filtered.filter(card => {
      const rating = card.overall_rating || 75
      return rating >= minRating && rating <= maxRating
    })

    // Apply sort
    if (sortOrder === 'name') {
      filtered.sort((a, b) => a.player_name.localeCompare(b.player_name))
    } else if (sortOrder === 'rating') {
      filtered.sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0))
    } else if (sortOrder === 'rarity') {
      const rarityOrder = { 'Epic': 3, 'Rare': 2, 'Common': 1 }
      filtered.sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0))
    }

    setFilteredCards(filtered)
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
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 pb-2 bg-background-dark/80 backdrop-blur-sm border-b-4 border-hot-pink">
          <div className="flex size-12 shrink-0 items-center justify-start cursor-pointer" onClick={() => navigate('/')}>
            <span className="material-symbols-outlined text-electric-blue text-4xl">arrow_back_ios_new</span>
          </div>
          <h2 className="flex-1 text-center text-3xl font-display leading-tight tracking-[-0.015em] text-primary text-outline-black">MY COLLECTION</h2>
          <div className="flex w-12 items-center justify-end">
            <div className="flex items-center justify-center gap-1 rounded bg-black/50 px-2 py-1 border-2 border-electric-blue">
              <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>style</span>
              <p className="shrink-0 text-xs font-bold leading-normal text-white">{userCards.length}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="sticky top-[76px] z-10 p-4 bg-background-dark/80 backdrop-blur-sm border-b-2 border-gray-700">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search players, clubs, countries..."
                className="w-full h-12 px-4 pl-12 bg-black/50 border-2 border-electric-blue text-white font-body rounded-lg focus:outline-none focus:border-accent-gold placeholder-gray-500"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-electric-blue text-2xl">search</span>
            </div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`h-12 px-4 rounded-lg font-display border-2 border-black transition-all ${
                showAdvancedFilters ? 'bg-accent-gold text-black' : 'bg-gray-700 text-white'
              }`}
            >
              <span className="material-symbols-outlined">tune</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-4 p-4 bg-black/50 rounded-lg border-2 border-electric-blue space-y-4">
              {/* Position Filter */}
              <div>
                <label className="text-white font-pixel text-xs mb-2 block">POSITION</label>
                <div className="flex gap-2 flex-wrap">
                  {['All', 'GK', 'DEF', 'MID', 'FWD'].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setPositionFilter(pos)}
                      className={`px-3 py-1 rounded font-pixel text-[10px] border-2 border-black ${
                        positionFilter === pos ? 'bg-electric-blue text-black' : 'bg-gray-700 text-white'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Range */}
              <div>
                <label className="text-white font-pixel text-xs mb-2 block">
                  RATING: {minRating} - {maxRating}
                </label>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minRating}
                    onChange={(e) => setMinRating(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={maxRating}
                    onChange={(e) => setMaxRating(parseInt(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedFilter('All')
                  setPositionFilter('All')
                  setMinRating(0)
                  setMaxRating(100)
                }}
                className="w-full h-10 rounded-lg bg-red-500 text-white font-display border-2 border-black"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Sort Controls */}
        <div className={`${showAdvancedFilters ? 'sticky top-[350px]' : 'sticky top-[196px]'} z-10 flex flex-wrap gap-3 p-4 bg-background-dark/80 backdrop-blur-sm`}>
          <button
            onClick={() => setSortOrder('name')}
            className={`filter-clip-90s flex h-10 flex-1 items-center justify-center gap-x-2 pixel-border ${sortOrder === 'name' ? 'bg-electric-blue' : 'bg-gray-700'}`}
          >
            <span className="material-symbols-outlined text-${sortOrder === 'name' ? 'black' : 'white'} text-xl">sort_by_alpha</span>
            <p className={`text-sm font-pixel ${sortOrder === 'name' ? 'text-black' : 'text-white'}`}>A-Z</p>
          </button>
          <button
            onClick={() => setSortOrder('rating')}
            className={`filter-clip-90s flex h-10 flex-1 items-center justify-center gap-x-2 pixel-border ${sortOrder === 'rating' ? 'bg-accent-gold' : 'bg-gray-700'}`}
          >
            <span className="material-symbols-outlined text-${sortOrder === 'rating' ? 'black' : 'white'} text-xl">star</span>
            <p className={`text-sm font-pixel ${sortOrder === 'rating' ? 'text-black' : 'text-white'}`}>RATING</p>
          </button>
          <button
            onClick={() => setSortOrder('rarity')}
            className={`filter-clip-90s flex h-10 flex-1 items-center justify-center gap-x-2 pixel-border ${sortOrder === 'rarity' ? 'bg-accent-purple' : 'bg-gray-700'}`}
          >
            <span className="material-symbols-outlined text-${sortOrder === 'rarity' ? 'white' : 'white'} text-xl">diamond</span>
            <p className={`text-sm font-pixel text-white`}>RARITY</p>
          </button>
        </div>

        <div className="flex gap-2 p-4 pt-0 flex-wrap">
          {['All', 'Common', 'Rare', 'Epic'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`tag-clip-90s flex h-8 shrink-0 items-center justify-center gap-x-2 pl-4 pr-3 border-2 border-black ${
                selectedFilter === filter
                  ? filter === 'All' ? 'bg-primary' : filter === 'Epic' ? 'bg-accent-purple' : filter === 'Rare' ? 'bg-accent-blue' : 'bg-common-gray'
                  : 'bg-gray-700'
              }`}
            >
              <p className={`font-pixel text-[10px] leading-normal ${selectedFilter === filter && filter === 'All' ? 'text-black' : 'text-white'}`}>
                {filter}
              </p>
            </button>
          ))}
        </div>

        {filteredCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center mt-8">
            <span className="material-symbols-outlined text-7xl text-gray-600">sentiment_dissatisfied</span>
            <h3 className="text-xl font-bold text-white">No Cards Found!</h3>
            <p className="text-gray-400">
              {userCards.length === 0
                ? "You don't have any cards yet. Go open some packs!"
                : "No cards match this filter. Try a different filter!"}
            </p>
            {userCards.length === 0 && (
              <button
                onClick={() => navigate('/packs')}
                className="mt-4 flex h-12 items-center justify-center gap-x-2 rounded-lg bg-primary px-6 border-2 border-black shadow-pixel-hard active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                <p className="text-base font-bold leading-normal text-black">Open Packs</p>
                <span className="material-symbols-outlined text-black">arrow_forward</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-4 p-4">
            {filteredCards.map((card, index) => (
              <Card
                key={`${card.id}-${index}`}
                card={card}
                onClick={() => setSelectedCard(card)}
                quantity={cardQuantities[card.id]}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          quantity={cardQuantities[selectedCard.id]}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  )
}
