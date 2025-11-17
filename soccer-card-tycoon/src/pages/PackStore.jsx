import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

export default function PackStore() {
  const [packs, setPacks] = useState([])
  const [selectedPack, setSelectedPack] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const [loading, setLoading] = useState(true)
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPacks()
  }, [])

  const fetchPacks = async () => {
    try {
      const { data, error } = await supabase
        .from('packs')
        .select('*')

      if (error) throw error
      setPacks(data || [])
    } catch (error) {
      console.error('Error fetching packs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyClick = (pack) => {
    setSelectedPack(pack)
    setShowConfirmation(true)
  }

  const confirmPurchase = async () => {
    if (!selectedPack || !profile) return

    if (profile.coins < selectedPack.price) {
      showToastMessage('Not enough coins!', 'error')
      setShowConfirmation(false)
      return
    }

    try {
      // Deduct coins
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: profile.coins - selectedPack.price })
        .eq('id', profile.id)

      if (updateError) throw updateError

      await refreshProfile()
      showToastMessage('Pack purchased!', 'success')
      setShowConfirmation(false)

      // Navigate to pack opening
      setTimeout(() => {
        navigate('/open-pack', { state: { pack: selectedPack } })
      }, 1000)
    } catch (error) {
      console.error('Error purchasing pack:', error)
      showToastMessage('Purchase failed!', 'error')
    }
  }

  const showToastMessage = (message, type) => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
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

  const defaultPack = packs[0] || {
    id: 'default',
    name: 'Standard Pack',
    description: 'Contains 5 player cards, with a chance for a rare!',
    price: 100,
    card_count: 5,
    image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800'
  }

  const getPackColor = (packName) => {
    if (packName?.includes('Elite')) return { border: 'border-accent-purple', bg: 'bg-accent-purple/20', glow: '#BE38F3' }
    if (packName?.includes('Premium')) return { border: 'border-accent-gold', bg: 'bg-accent-gold/20', glow: '#F3BE38' }
    return { border: 'border-accent-blue', bg: 'bg-accent-blue/20', glow: '#38BDF3' }
  }

  const allPacks = packs.length > 0 ? packs : [
    {
      id: 'default',
      name: 'Standard Pack',
      description: 'Contains 5 player cards',
      price: 100,
      card_count: 5,
      image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800'
    }
  ]

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-90s-combo">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 pb-2 bg-background-dark/90 backdrop-blur-sm border-b-4 border-primary">
        <div className="flex size-12 shrink-0 items-center justify-start cursor-pointer" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined text-primary text-4xl">arrow_back_ios_new</span>
        </div>
        <h2 className="flex-1 text-center text-3xl font-display leading-tight tracking-[-0.015em] text-primary text-outline-black">PACK STORE</h2>
        <div className="flex items-center justify-end rounded-lg bg-black/50 px-3 py-1.5 border-2 border-accent-gold shadow-pixel-hard-sm">
          <p className="text-accent-gold text-lg font-display leading-none shrink-0">{profile?.coins || 0}</p>
          <span className="material-symbols-outlined text-accent-gold text-xl ml-2">paid</span>
        </div>
      </div>

      <main className="flex-1 pb-24 p-4">
        <div className="flex flex-col gap-6">
          {allPacks.map((pack) => {
            const colors = getPackColor(pack.name)
            return (
              <div
                key={pack.id}
                className={`relative flex flex-col rounded-xl overflow-hidden border-4 ${colors.border} ${colors.bg} backdrop-blur-sm shadow-lg`}
                style={{ boxShadow: `0 0 20px ${colors.glow}40` }}
              >
                {/* Pack Image */}
                <div className="relative h-64 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%), url("${pack.image_url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800'}")`
                    }}
                  />

                  {/* Pack Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-3xl font-display text-white uppercase text-outline-black mb-1">
                      {pack.name}
                    </h3>
                    {pack.name?.includes('Elite') && (
                      <span className="inline-block px-3 py-1 bg-accent-purple text-white text-xs font-pixel rounded border-2 border-black">
                        BEST VALUE!
                      </span>
                    )}
                    {pack.name?.includes('Premium') && (
                      <span className="inline-block px-3 py-1 bg-accent-gold text-black text-xs font-pixel rounded border-2 border-black">
                        POPULAR!
                      </span>
                    )}
                  </div>
                </div>

                {/* Pack Details */}
                <div className="p-4 space-y-3">
                  <p className="text-white font-body text-sm">
                    {pack.description || `Contains ${pack.card_count} player cards`}
                  </p>

                  {/* Features */}
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-white text-sm">style</span>
                    <span className="text-white font-pixel text-xs">{pack.card_count} CARDS</span>
                  </div>

                  {pack.name?.includes('Elite') && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-accent-purple text-xs">●</span>
                        <span className="text-white/80 font-body text-xs">Guaranteed Epic Card</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-accent-blue text-xs">●</span>
                        <span className="text-white/80 font-body text-xs">3+ Rare Cards</span>
                      </div>
                    </div>
                  )}

                  {pack.name?.includes('Premium') && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-accent-blue text-xs">●</span>
                        <span className="text-white/80 font-body text-xs">Higher Rare Chance (40%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-accent-purple text-xs">●</span>
                        <span className="text-white/80 font-body text-xs">Epic Chance (10%)</span>
                      </div>
                    </div>
                  )}

                  {/* Price and Buy Button */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="material-symbols-outlined text-accent-gold text-2xl">paid</span>
                      <span className="text-accent-gold text-2xl font-display">{pack.price}</span>
                    </div>
                    <button
                      onClick={() => handleBuyClick(pack)}
                      className={`h-12 px-6 rounded-lg font-display uppercase border-2 border-black shadow-pixel-hard-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all ${
                        pack.name?.includes('Elite')
                          ? 'bg-accent-purple text-white'
                          : pack.name?.includes('Premium')
                          ? 'bg-accent-gold text-black'
                          : 'bg-accent-blue text-black'
                      }`}
                    >
                      Buy Pack
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-[#2A004D] p-6 m-4 text-center border-4 border-white shadow-[4px_4px_0px_#FFFFFF]">
            <h3 className="text-xl font-display text-white uppercase">Confirm?</h3>
            <p className="text-white/80 font-body text-lg">
              Buy this pack for <span className="font-display text-accent-gold">{selectedPack?.price} Coins</span>?
            </p>
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="h-12 flex-1 rounded-lg bg-black/30 text-white font-display border-2 border-black shadow-pixel-hard-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                className="h-12 flex-1 rounded-lg bg-primary text-white font-display border-2 border-black shadow-pixel-hard-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                BUY!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Messages */}
      {showToast && (
        <div className="absolute left-1/2 top-5 z-50 -translate-x-1/2">
          <div className={`flex items-center gap-3 rounded-lg px-4 py-2 shadow-pixel-hard border-2 border-black ${toastType === 'success' ? 'bg-secondary text-black' : 'bg-red-500 text-white'}`}>
            <span className="material-symbols-outlined">{toastType === 'success' ? 'check_circle' : 'cancel'}</span>
            <p className="font-display text-sm">{toastMessage}</p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
