import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

export default function Market() {
  const [storeCards, setStoreCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
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
        .limit(10)

      if (error) throw error
      setStoreCards(data || [])
    } catch (error) {
      console.error('Error fetching store cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (storeCard) => {
    if (!profile || !user) return

    const card = storeCard.cards

    if (profile.coins < storeCard.price) {
      showToastMessage('Not enough coins! Play games to earn more.', 'error')
      return
    }

    try {
      // Deduct coins
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: profile.coins - storeCard.price })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Add card to user's collection
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

      await refreshProfile()
      showToastMessage(`Purchase complete! ${card.player_name} is now in your squad!`, 'success')
    } catch (error) {
      console.error('Error purchasing card:', error)
      showToastMessage('Purchase failed!', 'error')
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
        return 'border-accent-purple shadow-[8px_8px_0px_#BE38F3]'
      case 'Rare':
        return 'border-accent-blue shadow-[8px_8px_0px_#38BDF3]'
      default:
        return 'border-common-gray shadow-[8px_8px_0px_#9CA3AF]'
    }
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
    <div className="relative flex min-h-screen w-full flex-col font-display overflow-x-hidden" style={{ backgroundImage: 'linear-gradient(180deg, #1e003b 0%, #4a0072 100%), url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M5 0h1L0 6V5zM6 5v1H5z\'/%3E%3C/g%3E%3C/svg%3E")', backgroundColor: '#1e003b' }}>
      <header className="flex items-center justify-between p-4 bg-transparent text-white">
        <div className="flex size-10 shrink-0 items-center justify-center border-2 border-black bg-fuchsia-500 text-black shadow-[4px_4px_0px_#000000] cursor-pointer" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined !text-4xl">arrow_back</span>
        </div>
        <h1 className="text-xl leading-tight uppercase tracking-wider" style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 0 0 #000, -2px 0 0 #000, 0 2px 0 #000, 0 -2px 0 #000' }}>Card Store</h1>
        <div className="flex items-center gap-1 border-2 border-black bg-cyan-400 p-2 text-black shadow-[4px_4px_0px_#000000]">
          <span className="material-symbols-outlined !text-2xl">monetization_on</span>
          <span className="text-lg">{profile?.coins || 0}</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-24">
        {storeCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center mt-8">
            <span className="material-symbols-outlined text-7xl text-gray-400">store</span>
            <h3 className="text-xl font-bold text-white">Store is empty!</h3>
            <p className="text-gray-400">Check back later for new cards!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {storeCards.map((storeCard) => {
              const card = storeCard.cards
              return (
                <div key={storeCard.id} className={`flex items-center gap-4 border-4 ${getRarityColor(card.rarity)} bg-black/40 p-3`}>
                  <div className="w-24 shrink-0">
                    <div className="aspect-[3/4] w-full bg-cover bg-center border-2 border-black" style={{ backgroundImage: `url('${card.image_url || 'https://via.placeholder.com/300x400'}')` }}></div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between self-stretch">
                    <div>
                      <p className="text-lg uppercase text-white">{card.player_name}</p>
                      <p className="text-xs text-slate-300">RATING: {card.overall_rating || 75}</p>
                      <p className="text-xs text-slate-400 capitalize">{card.rarity}</p>
                    </div>
                    <button
                      onClick={() => handlePurchase(storeCard)}
                      className="mt-2 flex h-10 w-full cursor-pointer items-center justify-center gap-2 border-2 border-black bg-yellow-400 text-sm uppercase text-black shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                      <span className="material-symbols-outlined !text-lg">monetization_on</span> {storeCard.price}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Toast Messages */}
      {showToast && (
        <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2">
          <div className={`flex items-center gap-3 rounded-lg px-4 py-2 shadow-pixel-hard border-2 border-black max-w-sm ${toastType === 'success' ? 'bg-lime-400 text-black' : 'bg-rose-500 text-white'}`}>
            <span className="material-symbols-outlined">{toastType === 'success' ? 'check_circle' : 'error'}</span>
            <p className="text-sm uppercase">{toastMessage}</p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
