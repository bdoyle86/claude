import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useTrading } from '../contexts/TradeContext'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import Card from '../components/Card'

export default function CreateTrade() {
  const [step, setStep] = useState(1) // 1: Select user, 2: Select cards, 3: Review
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [myCards, setMyCards] = useState([])
  const [theirCards, setTheirCards] = useState([])
  const [offeringCards, setOfferingCards] = useState([])
  const [requestingCards, setRequestingCards] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()
  const { createTrade } = useTrading()
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchMyCards()
      fetchTheirCards()
    }
  }, [selectedUser])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('username')

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchMyCards = async () => {
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

      setMyCards(cards)
    } catch (error) {
      console.error('Error fetching my cards:', error)
    }
  }

  const fetchTheirCards = async () => {
    try {
      const { data, error } = await supabase
        .from('user_cards')
        .select(`
          *,
          cards(*)
        `)
        .eq('user_id', selectedUser.id)

      if (error) throw error

      const cards = data?.map(uc => ({
        ...uc.cards,
        user_card_id: uc.id,
        available_quantity: uc.quantity,
        evolution_level: uc.evolution_level || 0,
        bonus_stats: uc.bonus_stats || 0
      })) || []

      setTheirCards(cards)
    } catch (error) {
      console.error('Error fetching their cards:', error)
    }
  }

  const toggleOffering = (card) => {
    const existing = offeringCards.find(c => c.id === card.id)
    if (existing) {
      setOfferingCards(offeringCards.filter(c => c.id !== card.id))
    } else {
      setOfferingCards([...offeringCards, { ...card, quantity: 1 }])
    }
  }

  const toggleRequesting = (card) => {
    const existing = requestingCards.find(c => c.id === card.id)
    if (existing) {
      setRequestingCards(requestingCards.filter(c => c.id !== card.id))
    } else {
      setRequestingCards([...requestingCards, { ...card, quantity: 1 }])
    }
  }

  const updateOfferingQuantity = (cardId, quantity) => {
    setOfferingCards(offeringCards.map(c =>
      c.id === cardId ? { ...c, quantity: Math.min(quantity, c.available_quantity) } : c
    ))
  }

  const updateRequestingQuantity = (cardId, quantity) => {
    setRequestingCards(requestingCards.map(c =>
      c.id === cardId ? { ...c, quantity: Math.min(quantity, c.available_quantity) } : c
    ))
  }

  const handleSubmit = async () => {
    if (offeringCards.length === 0 && requestingCards.length === 0) {
      alert('Please select at least one card to offer or request')
      return
    }

    setLoading(true)
    const result = await createTrade(selectedUser.id, offeringCards, requestingCards, message)

    if (result.success) {
      navigate('/trades')
    } else {
      alert(`Error creating trade: ${result.error}`)
    }
    setLoading(false)
  }

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-dark to-background-light pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-4xl font-display text-white mb-2">Create Trade</h1>
          <p className="text-gray-400 font-body">Propose a card trade with another player</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 gap-2">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step >= 1 ? 'bg-electric-blue text-black' : 'bg-gray-700 text-gray-400'}`}>
            <span className="font-display text-sm">1. SELECT PLAYER</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-700"></div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step >= 2 ? 'bg-electric-blue text-black' : 'bg-gray-700 text-gray-400'}`}>
            <span className="font-display text-sm">2. SELECT CARDS</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-700"></div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step >= 3 ? 'bg-electric-blue text-black' : 'bg-gray-700 text-gray-400'}`}>
            <span className="font-display text-sm">3. REVIEW</span>
          </div>
        </div>

        {/* Step 1: Select User */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-black/50 border-2 border-gray-700 rounded-lg text-white font-body placeholder-gray-500 focus:border-electric-blue outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedUser(u)
                    setStep(2)
                  }}
                  className="p-4 bg-black/50 border-2 border-gray-700 rounded-lg hover:border-electric-blue transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-electric-blue/20 border-2 border-electric-blue flex items-center justify-center">
                      <span className="material-symbols-outlined text-electric-blue">person</span>
                    </div>
                    <div>
                      <p className="text-white font-display">{u.username}</p>
                      <p className="text-gray-400 font-body text-sm">Level {u.level || 1}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Cards */}
        {step === 2 && selectedUser && (
          <div className="space-y-6">
            <div className="bg-black/30 border-2 border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 font-body mb-2">Trading with:</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-electric-blue/20 border-2 border-electric-blue flex items-center justify-center">
                  <span className="material-symbols-outlined text-electric-blue text-sm">person</span>
                </div>
                <p className="text-white font-display text-lg">{selectedUser.username}</p>
              </div>
            </div>

            {/* My Offering */}
            <div>
              <h3 className="text-xl font-display text-vibrant-green mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined">upload</span>
                YOUR OFFERING ({offeringCards.length})
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {myCards.map(card => {
                  const isSelected = offeringCards.find(c => c.id === card.id)
                  return (
                    <div key={card.id} className="relative">
                      <div
                        onClick={() => toggleOffering(card)}
                        className={`cursor-pointer transition-all ${isSelected ? 'ring-4 ring-vibrant-green scale-95' : 'hover:scale-105'}`}
                      >
                        <Card card={card} />
                      </div>
                      {card.available_quantity > 1 && (
                        <div className="absolute top-1 right-1 bg-black/80 rounded-full w-6 h-6 flex items-center justify-center">
                          <span className="text-white font-pixel text-[10px]">x{card.available_quantity}</span>
                        </div>
                      )}
                      {card.evolution_level > 0 && (
                        <div className="absolute top-1 left-1 bg-accent-gold/90 rounded px-1">
                          <span className="text-black font-pixel text-[8px]">+{card.evolution_level}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Their Cards I'm Requesting */}
            <div>
              <h3 className="text-xl font-display text-accent-blue mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined">download</span>
                YOU'RE REQUESTING ({requestingCards.length})
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {theirCards.map(card => {
                  const isSelected = requestingCards.find(c => c.id === card.id)
                  return (
                    <div key={card.id} className="relative">
                      <div
                        onClick={() => toggleRequesting(card)}
                        className={`cursor-pointer transition-all ${isSelected ? 'ring-4 ring-accent-blue scale-95' : 'hover:scale-105'}`}
                      >
                        <Card card={card} />
                      </div>
                      {card.available_quantity > 1 && (
                        <div className="absolute top-1 right-1 bg-black/80 rounded-full w-6 h-6 flex items-center justify-center">
                          <span className="text-white font-pixel text-[10px]">x{card.available_quantity}</span>
                        </div>
                      )}
                      {card.evolution_level > 0 && (
                        <div className="absolute top-1 left-1 bg-accent-gold/90 rounded px-1">
                          <span className="text-black font-pixel text-[8px]">+{card.evolution_level}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 h-14 rounded-lg bg-gray-700 text-white font-display text-lg uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform"
              >
                BACK
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={offeringCards.length === 0 && requestingCards.length === 0}
                className="flex-1 h-14 rounded-lg bg-electric-blue text-black font-display text-lg uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                NEXT
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-black/30 border-2 border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-display text-white mb-4">Trade Summary</h3>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Your Offering */}
                <div>
                  <p className="text-vibrant-green font-display mb-3">YOU GIVE:</p>
                  {offeringCards.length === 0 ? (
                    <p className="text-gray-500 font-body text-sm">Nothing</p>
                  ) : (
                    <div className="space-y-2">
                      {offeringCards.map(card => (
                        <div key={card.id} className="flex items-center gap-3 bg-black/30 p-2 rounded">
                          <div className="w-12">
                            <Card card={card} />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-pixel text-xs">{card.name}</p>
                            <p className="text-gray-400 font-body text-[10px]">{card.rarity}</p>
                          </div>
                          <input
                            type="number"
                            min="1"
                            max={card.available_quantity}
                            value={card.quantity}
                            onChange={(e) => updateOfferingQuantity(card.id, parseInt(e.target.value) || 1)}
                            className="w-16 h-8 bg-black/50 border border-gray-600 rounded text-white text-center font-pixel text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* You Receive */}
                <div>
                  <p className="text-accent-blue font-display mb-3">YOU RECEIVE:</p>
                  {requestingCards.length === 0 ? (
                    <p className="text-gray-500 font-body text-sm">Nothing</p>
                  ) : (
                    <div className="space-y-2">
                      {requestingCards.map(card => (
                        <div key={card.id} className="flex items-center gap-3 bg-black/30 p-2 rounded">
                          <div className="w-12">
                            <Card card={card} />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-pixel text-xs">{card.name}</p>
                            <p className="text-gray-400 font-body text-[10px]">{card.rarity}</p>
                          </div>
                          <input
                            type="number"
                            min="1"
                            max={card.available_quantity}
                            value={card.quantity}
                            onChange={(e) => updateRequestingQuantity(card.id, parseInt(e.target.value) || 1)}
                            className="w-16 h-8 bg-black/50 border border-gray-600 rounded text-white text-center font-pixel text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-gray-400 font-body text-sm mb-2 block">Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message to your trade offer..."
                  className="w-full h-24 p-3 bg-black/50 border-2 border-gray-700 rounded-lg text-white font-body placeholder-gray-500 focus:border-electric-blue outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 h-14 rounded-lg bg-gray-700 text-white font-display text-lg uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform"
              >
                BACK
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 h-14 rounded-lg bg-vibrant-green text-black font-display text-lg uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'SENDING...' : 'SEND TRADE OFFER'}
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
