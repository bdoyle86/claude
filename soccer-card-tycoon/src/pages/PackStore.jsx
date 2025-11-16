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

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden" style={{ backgroundColor: '#4A00E0', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23F7FF00\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E"),url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%2300F0FF\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M5 0h1L0 6V5zM6 5v1H5z\'/%3E%3C/g%3E%3C/svg%3E"),linear-gradient(45deg, #4A00E0 0%, #8E2DE2 100%)', backgroundBlendMode: 'overlay, overlay, normal' }}>
      <div className="flex items-center p-4 pb-2 justify-between shrink-0 bg-transparent relative z-10">
        <div className="flex size-12 shrink-0 items-center justify-start cursor-pointer" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined text-secondary text-4xl">arrow_back_ios_new</span>
        </div>
        <h2 className="text-white text-lg font-display uppercase tracking-tighter">Pack Store</h2>
        <div className="flex items-center justify-end rounded-lg bg-black/50 px-3 py-1.5 border-2 border-accent-gold shadow-pixel-hard-sm">
          <p className="text-accent-gold text-lg font-display leading-none shrink-0">{profile?.coins || 0}</p>
          <span className="material-symbols-outlined text-accent-gold text-xl ml-2">paid</span>
        </div>
      </div>

      <div className="flex flex-col grow px-4">
        <div className="relative flex w-full grow items-center justify-center py-3">
          <div className="absolute inset-x-0 top-1/2 h-1/2 -translate-y-1/2 bg-secondary/20 blur-3xl rounded-full"></div>
          <div className="w-full max-w-xs aspect-[3/4] flex-shrink-0" style={{ transform: 'perspective(1000px) rotateY(-5deg) rotateX(2deg) scale(1.05)' }}>
            <div className="h-full w-full bg-center bg-no-repeat bg-cover rounded-xl shadow-2xl shadow-black/50 border-4 border-white" style={{ backgroundImage: `url("${defaultPack.image_url}")` }}></div>
          </div>
        </div>

        <div className="flex flex-col items-center text-center -mt-8 relative z-10">
          <h1 className="text-white text-4xl font-display uppercase tracking-tight" style={{ textShadow: '3px 3px 0px #FF3B81, 6px 6px 0px rgba(0,0,0,0.5)' }}>
            {defaultPack.name}
          </h1>
          <p className="text-white/80 text-xl font-body leading-normal pt-4 max-w-xs">
            {defaultPack.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 p-4 pt-6 bg-black/50 backdrop-blur-sm mt-4 relative z-10 border-t-4 border-primary">
        <div className="flex flex-col items-center justify-center gap-1">
          <p className="text-secondary font-display text-sm tracking-wider uppercase">Price</p>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-gold text-4xl" style={{ filter: 'drop-shadow(0 0 8px #F7FF00)' }}>paid</span>
            <h1 className="text-white text-4xl font-display leading-none tracking-tighter">{defaultPack.price}</h1>
          </div>
        </div>

        <button
          onClick={() => handleBuyClick(defaultPack)}
          className="flex h-16 w-full items-center justify-center rounded-lg bg-primary px-6 shadow-pixel-hard border-2 border-black transform transition-transform duration-150 active:scale-95 active:shadow-[2px_2px_0px_#000000]"
        >
          <span className="text-2xl font-display text-white uppercase tracking-wider" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.4)' }}>Buy Pack</span>
        </button>
      </div>

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
