import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import BottomNav from '../components/BottomNav'
import CardDetailModal from '../components/CardDetailModal'

export default function Market() {
  const [storeCards, setStoreCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const [selectedStoreCard, setSelectedStoreCard] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [filterRarity, setFilterRarity] = useState('All')
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchStoreCards()
  }, [])

  const fetchStoreCards = async () => {
    try {
      const { data, error } = await supabase
        .from('store_cards')
        .select(`
          *,
          cards (*)
        `)
        .order('price', { ascending: true })
        .limit(20)

      if (error) throw error
      setStoreCards(data || [])
    } catch (error) {
      console.error('Error fetching store cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyClick = (storeCard) => {
    setSelectedStoreCard(storeCard)
    setShowConfirmation(true)
  }

  const confirmPurchase = async () => {
    if (!profile || !user || !selectedStoreCard) return

    const card = selectedStoreCard.cards

    if (profile.coins < selectedStoreCard.price) {
      showToastMessage('Not enough coins!', 'error')
      setShowConfirmation(false)
      return
    }

    try {
      // Deduct coins
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: profile.coins - selectedStoreCard.price })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Check if user already has this card
      const { data: existingCard, error: checkError } = await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('card_id', card.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') throw checkError

      if (existingCard) {
        // Update quantity
        const { error: updateCardError } = await supabase
          .from('user_cards')
          .update({ quantity: existingCard.quantity + 1 })
          .eq('id', existingCard.id)

        if (updateCardError) throw updateCardError
      } else {
        // Add new card to user's collection
        const { error: insertError } = await supabase
          .from('user_cards')
          .insert([
            {
              user_id: user.id,
              card_id: card.id,
              quantity: 1
            }
          ])

        if (insertError) throw insertError
      }

      await refreshProfile()
      setShowConfirmation(false)
      setPurchaseSuccess(true)
      showToastMessage(`${card.player_name} added to your collection!`, 'success')

      setTimeout(() => {
        setPurchaseSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Error purchasing card:', error)
      showToastMessage('Purchase failed!', 'error')
      setShowConfirmation(false)
    }
  }

  const showToastMessage = (message, type) => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Epic':
        return 'border-accent-purple'
      case 'Rare':
        return 'border-accent-blue'
      default:
        return 'border-common-gray'
    }
  }

  const getRarityGlow = (rarity) => {
    switch (rarity) {
      case 'Epic':
        return 'shadow-[0_0_20px_rgba(190,56,243,0.6)]'
      case 'Rare':
        return 'shadow-[0_0_20px_rgba(56,189,243,0.6)]'
      default:
        return ''
    }
  }

  const filteredStoreCards = filterRarity === 'All'
    ? storeCards
    : storeCards.filter(sc => sc.cards?.rarity === filterRarity)

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
      <style>{`
        @keyframes successPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .success-pulse {
          animation: successPulse 0.5s ease-in-out;
        }

        @keyframes epicGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(190,56,243,0.4)); }
          50% { filter: drop-shadow(0 0 20px rgba(190,56,243,0.8)); }
        }

        @keyframes rareGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(56,189,243,0.4)); }
          50% { filter: drop-shadow(0 0 20px rgba(56,189,243,0.8)); }
        }

        .epic-card-glow {
          animation: epicGlow 2s ease-in-out infinite;
        }

        .rare-card-glow {
          animation: rareGlow 2s ease-in-out infinite;
        }
      `}</style>

      <main className="flex-1 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 pb-2 bg-background-dark/90 backdrop-blur-sm border-b-4 border-accent-gold">
          <div className="flex size-12 shrink-0 items-center justify-start cursor-pointer" onClick={() => navigate('/')}>
            <span className="material-symbols-outlined text-accent-gold text-4xl">arrow_back_ios_new</span>
          </div>
          <h2 className="flex-1 text-center text-3xl font-display leading-tight tracking-[-0.015em] text-accent-gold text-outline-black">CARD MARKET</h2>
          <div className="flex items-center justify-end rounded-lg bg-black/50 px-3 py-1.5 border-2 border-accent-gold shadow-pixel-hard-sm">
            <p className="text-accent-gold text-lg font-display leading-none shrink-0">{profile?.coins || 0}</p>
            <span className="material-symbols-outlined text-accent-gold text-xl ml-2">paid</span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="sticky top-[76px] z-10 flex gap-2 p-4 pt-3 bg-background-dark/80 backdrop-blur-sm flex-wrap">
          {['All', 'Common', 'Rare', 'Epic'].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterRarity(filter)}
              className={`tag-clip-90s flex h-8 shrink-0 items-center justify-center gap-x-2 pl-4 pr-3 border-2 border-black transition-all ${
                filterRarity === filter
                  ? filter === 'All' ? 'bg-accent-gold' : filter === 'Epic' ? 'bg-accent-purple' : filter === 'Rare' ? 'bg-accent-blue' : 'bg-common-gray'
                  : 'bg-gray-700 opacity-60'
              }`}
            >
              <p className={`font-pixel text-[10px] leading-normal ${filterRarity === filter && filter === 'All' ? 'text-black' : 'text-white'}`}>
                {filter}
              </p>
            </button>
          ))}
        </div>

        {filteredStoreCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center mt-8">
            <span className="material-symbols-outlined text-7xl text-gray-600">store</span>
            <h3 className="text-xl font-display text-white uppercase">No Cards Available!</h3>
            <p className="text-gray-400 font-body">
              {storeCards.length === 0
                ? "The market is empty. Check back later!"
                : "No cards match this filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            {filteredStoreCards.map((storeCard) => {
              const card = storeCard.cards
              if (!card) return null

              return (
                <div
                  key={storeCard.id}
                  className={`flex flex-col relative group ${card.rarity === 'Epic' ? 'epic-card-glow' : card.rarity === 'Rare' ? 'rare-card-glow' : ''}`}
                >
                  {/* Card Image */}
                  <div
                    onClick={() => setSelectedCard(card)}
                    className={`group relative flex flex-col justify-end aspect-[3/4] overflow-hidden card-clip-90s border-4 ${getRarityColor(card.rarity)} ${getRarityGlow(card.rarity)} bg-cover bg-center cursor-pointer hover:scale-105 transition-transform`}
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.9) 100%), url("${card.image_url || 'https://via.placeholder.com/300x400'}")`
                    }}
                  >
                    {/* Rating Badge */}
                    <div className="absolute top-0 right-0 p-2">
                      <div className={`w-10 h-10 bg-black/50 border-2 ${getRarityColor(card.rarity)} flex items-center justify-center font-display text-3xl ${card.rarity === 'Epic' ? 'text-accent-purple' : card.rarity === 'Rare' ? 'text-accent-blue' : 'text-common-gray'} text-outline-black-sm`}>
                        {card.overall_rating || 75}
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="flex flex-col p-2 z-10">
                      <div className={`tag-clip-90s ${card.rarity === 'Epic' ? 'bg-accent-purple' : card.rarity === 'Rare' ? 'bg-accent-blue' : 'bg-common-gray'} px-2 py-0.5 mb-1 self-start border-2 border-black`}>
                        <p className="font-pixel text-[8px] text-white">{card.rarity}</p>
                      </div>
                      <p className="text-white text-sm font-display leading-tight line-clamp-2 uppercase text-outline-black">
                        {card.player_name}
                      </p>
                    </div>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => handleBuyClick(storeCard)}
                    className="mt-2 flex h-10 w-full items-center justify-center gap-1 rounded bg-accent-gold border-2 border-black shadow-pixel-hard-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  >
                    <span className="material-symbols-outlined text-black text-lg">paid</span>
                    <p className="text-black font-display text-sm">{storeCard.price}</p>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Purchase Confirmation Modal */}
      {showConfirmation && selectedStoreCard && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-[#2A004D] p-6 m-4 text-center border-4 border-accent-gold shadow-[4px_4px_0px_#F3BE38]">
            <h3 className="text-2xl font-display text-accent-gold uppercase text-outline-black">Buy Card?</h3>

            {/* Card Preview */}
            <div className="flex justify-center">
              <div
                className={`w-32 aspect-[3/4] bg-cover bg-center rounded-lg border-4 ${getRarityColor(selectedStoreCard.cards.rarity)}`}
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.9) 100%), url("${selectedStoreCard.cards.image_url || 'https://via.placeholder.com/300x400'}")`
                }}
              ></div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-white font-display text-lg uppercase">{selectedStoreCard.cards.player_name}</p>
              <p className="text-white/80 font-body">
                Purchase for <span className="font-display text-accent-gold">{selectedStoreCard.price} Coins</span>?
              </p>
            </div>

            <div className="mt-4 flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="h-12 flex-1 rounded-lg bg-black/30 text-white font-display border-2 border-black shadow-pixel-hard-sm active:translate-x-1 active:translate-y-1 active:shadow-none uppercase"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                className="h-12 flex-1 rounded-lg bg-accent-gold text-black font-display border-2 border-black shadow-pixel-hard-sm active:translate-x-1 active:translate-y-1 active:shadow-none uppercase"
              >
                Buy!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}

      {/* Success Animation Overlay */}
      {purchaseSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="success-pulse bg-vibrant-green px-8 py-4 rounded-lg border-4 border-black shadow-[8px_8px_0px_#000000]">
            <p className="text-3xl font-display text-black uppercase">SUCCESS!</p>
          </div>
        </div>
      )}

      {/* Toast Messages */}
      {showToast && (
        <div className="absolute left-1/2 top-5 z-50 -translate-x-1/2">
          <div className={`flex items-center gap-3 rounded-lg px-4 py-2 shadow-pixel-hard border-2 border-black ${toastType === 'success' ? 'bg-vibrant-green text-black' : 'bg-red-500 text-white'}`}>
            <span className="material-symbols-outlined">{toastType === 'success' ? 'check_circle' : 'cancel'}</span>
            <p className="font-display text-sm uppercase">{toastMessage}</p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
