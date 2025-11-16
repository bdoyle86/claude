import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function PackOpening() {
  const [cards, setCards] = useState([])
  const [revealedCards, setRevealedCards] = useState([])
  const [isRevealing, setIsRevealing] = useState(false)
  const [allRevealed, setAllRevealed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const pack = location.state?.pack

  useEffect(() => {
    if (!pack) {
      navigate('/packs')
      return
    }
    generateCards()
  }, [pack])

  const generateCards = async () => {
    try {
      // Fetch all cards
      const { data: allCards, error } = await supabase
        .from('cards')
        .select('*')

      if (error) throw error

      // Generate cards based on rarity distribution
      // 70% Common, 25% Rare, 5% Epic
      const cardCount = pack.card_count || 5
      const generatedCards = []

      for (let i = 0; i < cardCount; i++) {
        const rand = Math.random()
        let rarity

        if (rand < 0.05) {
          rarity = 'Epic'
        } else if (rand < 0.30) { // 0.05 + 0.25
          rarity = 'Rare'
        } else {
          rarity = 'Common'
        }

        // Filter cards by rarity
        const cardsOfRarity = allCards.filter(card => card.rarity === rarity)
        if (cardsOfRarity.length > 0) {
          const randomCard = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)]
          generatedCards.push(randomCard)
        }
      }

      setCards(generatedCards)

      // Add cards to user's collection
      if (user && generatedCards.length > 0) {
        const userCards = generatedCards.map(card => ({
          user_id: user.id,
          card_id: card.id,
          quantity: 1
        }))

        const { error: insertError } = await supabase
          .from('user_cards')
          .insert(userCards)

        if (insertError) console.error('Error adding cards to collection:', insertError)
      }
    } catch (error) {
      console.error('Error generating cards:', error)
    }
  }

  const revealAll = () => {
    setRevealedCards(cards.map((_, index) => index))
    setAllRevealed(true)
  }

  const revealNext = () => {
    if (revealedCards.length < cards.length) {
      setRevealedCards([...revealedCards, revealedCards.length])
    }
    if (revealedCards.length + 1 >= cards.length) {
      setAllRevealed(true)
    }
  }

  const handleFinish = () => {
    navigate('/collection')
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display overflow-x-hidden" style={{ backgroundImage: 'url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Cg fill-rule="evenodd"%3E%3Cg fill="%23a91079" fill-opacity="0.1"%3E%3Cpath d="M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\'), linear-gradient(180deg, #0D0221 0%, #A91079 100%)', backgroundColor: '#0D0221' }}>
      <div className="flex items-center p-4 pb-2 justify-between bg-transparent">
        <div className="flex size-10 shrink-0 items-center justify-center border-2 border-black bg-fuchsia-500 text-black shadow-[4px_4px_0px_#000000] cursor-pointer" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined !text-4xl">close</span>
        </div>
        <h2 className="flex-1 pr-10 text-center text-lg leading-tight text-white uppercase tracking-wider" style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 0 0 #000, -2px 0 0 #000, 0 2px 0 #000, 0 -2px 0 #000' }}>
          {pack?.name || 'Pack Opening'}
        </h2>
      </div>

      <div className="flex flex-1 flex-col justify-between px-4">
        <div className="flex flex-1 flex-col items-center justify-center py-8">
          <div className="w-full">
            <div className="flex items-center gap-4 overflow-x-auto p-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {cards.map((card, index) => {
                const isRevealed = revealedCards.includes(index)
                const isNew = true // For MVP, all cards in a pack are "new"

                return (
                  <div
                    key={index}
                    className={`relative flex min-w-48 flex-1 shrink-0 flex-col gap-2 rounded-lg border-${isRevealed ? (card.rarity === 'Epic' ? '4 border-accent-purple' : card.rarity === 'Rare' ? '4 border-accent-blue' : '2 border-slate-500') : '2 border-slate-500'} bg-black/50 p-2 ${isRevealed ? 'shadow-lg' : ''} backdrop-blur-sm`}
                  >
                    {isRevealed && isNew && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                        <div className="relative bg-vibrant-green px-3 py-1 text-black border-2 border-black">
                          <div className="absolute -inset-1 animate-ping bg-vibrant-green/50 blur-sm"></div>
                          <span className="relative font-bold text-sm font-pixel">NEW!</span>
                        </div>
                      </div>
                    )}

                    <div
                      className="relative w-full aspect-[3/4] bg-cover bg-center bg-no-repeat border-2 border-black"
                      style={{ backgroundImage: isRevealed ? `url("${card.image_url || 'https://via.placeholder.com/300x400'}")` : 'linear-gradient(45deg, #4A00E0, #8E2DE2)' }}
                    >
                      {isRevealed && (
                        <>
                          <div className="absolute inset-0 z-10 bg-[linear-gradient(45deg,rgba(255,0,222,0.4),rgba(0,255,255,0.4))] mix-blend-overlay"></div>
                          <div className={`animate-reveal absolute inset-0 bg-cover bg-center`} style={{ backgroundImage: `url("${card.image_url}")`, animation: 'reveal-glitch 0.5s ease-in-out' }}></div>
                        </>
                      )}
                      {!isRevealed && (
                        <div className="flex items-center justify-center h-full">
                          <span className="material-symbols-outlined text-white text-6xl opacity-50">help</span>
                        </div>
                      )}
                    </div>

                    {isRevealed && (
                      <div className="text-center">
                        <p className="text-base text-white">{card.player_name}</p>
                        <p className="text-xs text-slate-300">RATING: {card.overall_rating || 75}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-center py-4 pb-8">
          <div className="flex w-full max-w-[480px] flex-col items-stretch gap-4">
            {!allRevealed ? (
              <>
                <button
                  onClick={revealNext}
                  className="h-16 cursor-pointer items-center justify-center border-2 border-black bg-cyan-400 text-lg text-black shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none font-display uppercase tracking-wider"
                  disabled={revealedCards.length >= cards.length}
                >
                  REVEAL NEXT
                </button>
                <button
                  onClick={revealAll}
                  className="h-16 cursor-pointer items-center justify-center border-2 border-black bg-lime-400 text-lg text-black shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none font-display uppercase tracking-wider"
                >
                  REVEAL ALL
                </button>
              </>
            ) : (
              <button
                onClick={handleFinish}
                className="h-16 cursor-pointer items-center justify-center border-2 border-black bg-lime-400 text-lg text-black shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none font-display uppercase tracking-wider"
              >
                AWESOME!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
