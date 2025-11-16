import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import BottomNav from '../components/BottomNav'
import Card from '../components/Card'

export default function TeamManager() {
  const [userCards, setUserCards] = useState([])
  const [selectedCards, setSelectedCards] = useState([null, null, null, null, null])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [teamName, setTeamName] = useState('My Team')
  const { user, profile } = useAuth()
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
        quantity: uc.quantity
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
        setTeamName(data.name)
        const team = [
          data.card_1_id,
          data.card_2_id,
          data.card_3_id,
          data.card_4_id,
          data.card_5_id
        ]

        // Fetch the actual card data
        const cardIds = team.filter(id => id !== null)
        if (cardIds.length > 0) {
          const { data: cards, error: cardsError } = await supabase
            .from('cards')
            .select('*')
            .in('id', cardIds)

          if (cardsError) throw cardsError

          const teamCards = team.map(id => cards?.find(c => c.id === id) || null)
          setSelectedCards(teamCards)
        }
      }
    } catch (error) {
      console.error('Error fetching team:', error)
    }
  }

  const handleCardSelect = (card, slotIndex) => {
    const newSelected = [...selectedCards]

    // Check if card is already in team
    const existingIndex = newSelected.findIndex(c => c?.id === card.id)
    if (existingIndex !== -1 && existingIndex !== slotIndex) {
      setToastMessage('Card already in team!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
      return
    }

    newSelected[slotIndex] = card
    setSelectedCards(newSelected)
  }

  const removeCard = (slotIndex) => {
    const newSelected = [...selectedCards]
    newSelected[slotIndex] = null
    setSelectedCards(newSelected)
  }

  const saveTeam = async () => {
    if (!user) return

    // Check if all 5 cards are selected
    if (selectedCards.some(card => card === null)) {
      setToastMessage('Please select 5 cards!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
      return
    }

    setSaving(true)

    try {
      const teamData = {
        user_id: user.id,
        name: teamName,
        card_1_id: selectedCards[0].id,
        card_2_id: selectedCards[1].id,
        card_3_id: selectedCards[2].id,
        card_4_id: selectedCards[3].id,
        card_5_id: selectedCards[4].id,
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
      setToastMessage('Error saving team!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const getTeamOverall = () => {
    const validCards = selectedCards.filter(c => c !== null)
    if (validCards.length === 0) return 0
    const total = validCards.reduce((sum, card) => sum + (card.overall_rating || 75), 0)
    return Math.round(total / validCards.length)
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
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 pb-2 bg-background-dark/90 backdrop-blur-sm border-b-4 border-electric-blue">
          <div className="flex size-12 shrink-0 items-center justify-start cursor-pointer" onClick={() => navigate('/')}>
            <span className="material-symbols-outlined text-electric-blue text-4xl">arrow_back_ios_new</span>
          </div>
          <h2 className="flex-1 text-center text-3xl font-display leading-tight tracking-[-0.015em] text-electric-blue text-outline-black">TEAM MANAGER</h2>
          <div className="flex items-center justify-end rounded-lg bg-black/50 px-3 py-1.5 border-2 border-electric-blue shadow-pixel-hard-sm">
            <p className="text-electric-blue text-lg font-display leading-none shrink-0">{getTeamOverall()}</p>
            <span className="material-symbols-outlined text-electric-blue text-xl ml-1">star</span>
          </div>
        </div>

        {/* Team Name Input */}
        <div className="p-4 pb-2">
          <label className="text-white font-pixel text-xs mb-2 block">TEAM NAME</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            maxLength={30}
            className="w-full px-4 py-3 bg-black/50 border-2 border-electric-blue text-white font-display rounded-lg focus:outline-none focus:border-bright-yellow"
          />
        </div>

        {/* Selected Team */}
        <div className="p-4">
          <h3 className="text-white font-display text-xl mb-3 uppercase text-outline-black">Your Team (5 Cards)</h3>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {selectedCards.map((card, index) => (
              <div key={index} className="relative">
                {card ? (
                  <div className="relative group">
                    <div
                      className="aspect-[3/4] bg-cover bg-center rounded border-2 border-electric-blue shadow-[0_0_10px_rgba(56,189,243,0.5)]"
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%), url("${card.image_url || 'https://via.placeholder.com/300x400'}")`
                      }}
                    >
                      <div className="absolute top-1 right-1 bg-black/70 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-display">
                        {card.overall_rating || 75}
                      </div>
                    </div>
                    <button
                      onClick={() => removeCard(index)}
                      className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center border border-black opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-white text-xs">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-black/30 border-2 border-dashed border-gray-600 rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-600 text-2xl">add</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={saveTeam}
            disabled={saving || selectedCards.some(c => c === null)}
            className={`w-full h-12 rounded-lg font-display uppercase border-2 border-black shadow-pixel-hard-sm transition-all ${
              saving || selectedCards.some(c => c === null)
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-electric-blue text-black active:translate-x-1 active:translate-y-1 active:shadow-none'
            }`}
          >
            {saving ? 'Saving...' : 'Save Team & Battle!'}
          </button>
        </div>

        {/* Available Cards */}
        <div className="p-4">
          <h3 className="text-white font-display text-xl mb-3 uppercase text-outline-black">Your Collection</h3>
          {userCards.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-400 font-body">No cards in collection. Buy packs to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {userCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => {
                    const emptySlot = selectedCards.findIndex(c => c === null)
                    if (emptySlot !== -1) {
                      handleCardSelect(card, emptySlot)
                    }
                  }}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <Card card={card} quantity={card.quantity} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {showToast && (
        <div className="absolute left-1/2 top-5 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-lg px-4 py-2 shadow-pixel-hard border-2 border-black bg-electric-blue text-black">
            <span className="material-symbols-outlined">info</span>
            <p className="font-display text-sm uppercase">{toastMessage}</p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
