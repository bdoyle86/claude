import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import Card from '../components/Card'

export default function Collection() {
  const [userCards, setUserCards] = useState([])
  const [filteredCards, setFilteredCards] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('name')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchUserCards()
    }
  }, [user])

  useEffect(() => {
    filterAndSortCards()
  }, [userCards, selectedFilter, sortOrder])

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

      // Extract the card data
      const cards = data.map(uc => uc.cards).filter(Boolean)
      setUserCards(cards)
    } catch (error) {
      console.error('Error fetching user cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortCards = () => {
    let filtered = [...userCards]

    // Apply filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(card => card.rarity === selectedFilter)
    }

    // Apply sort
    if (sortOrder === 'name') {
      filtered.sort((a, b) => a.player_name.localeCompare(b.player_name))
    } else if (sortOrder === 'rating') {
      filtered.sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0))
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

        <div className="sticky top-[76px] z-10 flex flex-wrap gap-3 p-4 bg-background-dark/80 backdrop-blur-sm">
          <button
            onClick={() => setSortOrder(sortOrder === 'name' ? 'rating' : 'name')}
            className="filter-clip-90s flex h-12 flex-1 items-center justify-center gap-x-2 bg-electric-blue hover:bg-cyan-400 pixel-border"
          >
            <span className="material-symbols-outlined text-black text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>sort_by_alpha</span>
            <p className="text-base font-display leading-normal text-black text-outline-white-sm">
              {sortOrder === 'name' ? 'SORT A-Z' : 'SORT RATING'}
            </p>
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
              <Card key={`${card.id}-${index}`} card={card} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
