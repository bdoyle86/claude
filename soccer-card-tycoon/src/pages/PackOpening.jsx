import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useAchievements } from '../contexts/AchievementContext'

export default function PackOpening() {
  const [cards, setCards] = useState([])
  const [revealedCards, setRevealedCards] = useState([])
  const [isRevealing, setIsRevealing] = useState(false)
  const [allRevealed, setAllRevealed] = useState(false)
  const [animatingIndex, setAnimatingIndex] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { checkPackAchievements, checkCollectionAchievements, checkRarityAchievements } = useAchievements()
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
      const { data: allCards, error } = await supabase
        .from('cards')
        .select('*')

      if (error) throw error

      const cardCount = pack.card_count || 5
      const generatedCards = []
      const packName = pack.name || ''

      // Determine drop rates based on pack type
      let epicChance, rareChance
      let guaranteedEpic = false
      let minRares = 0

      if (packName.includes('Elite')) {
        // Elite Pack: Guaranteed Epic + 3+ Rares
        epicChance = 0.20  // 20% for additional epics
        rareChance = 0.70  // 70% for rares
        guaranteedEpic = true
        minRares = 3
      } else if (packName.includes('Premium')) {
        // Premium Pack: 10% Epic, 40% Rare
        epicChance = 0.10
        rareChance = 0.50  // 40% rare + 10% epic = 50% total
      } else {
        // Standard Pack: 5% Epic, 25% Rare
        epicChance = 0.05
        rareChance = 0.30  // 25% rare + 5% epic = 30% total
      }

      // First, add guaranteed Epic for Elite packs
      if (guaranteedEpic) {
        const epicCards = allCards.filter(card => card.rarity === 'Epic')
        if (epicCards.length > 0) {
          const randomEpic = epicCards[Math.floor(Math.random() * epicCards.length)]
          generatedCards.push(randomEpic)
        }
      }

      // Add minimum guaranteed Rares for Elite packs
      if (minRares > 0) {
        const rareCards = allCards.filter(card => card.rarity === 'Rare')
        for (let i = 0; i < minRares && rareCards.length > 0; i++) {
          const randomRare = rareCards[Math.floor(Math.random() * rareCards.length)]
          generatedCards.push(randomRare)
        }
      }

      // Fill remaining slots
      const remainingSlots = cardCount - generatedCards.length
      for (let i = 0; i < remainingSlots; i++) {
        const rand = Math.random()
        let rarity

        if (rand < epicChance) {
          rarity = 'Epic'
        } else if (rand < rareChance) {
          rarity = 'Rare'
        } else {
          rarity = 'Common'
        }

        const cardsOfRarity = allCards.filter(card => card.rarity === rarity)
        if (cardsOfRarity.length > 0) {
          const randomCard = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)]
          generatedCards.push(randomCard)
        }
      }

      setCards(generatedCards)

      // Add cards to user's collection
      if (user && generatedCards.length > 0) {
        for (const card of generatedCards) {
          // Check if user already has this card
          const { data: existingCard, error: checkError } = await supabase
            .from('user_cards')
            .select('*')
            .eq('user_id', user.id)
            .eq('card_id', card.id)
            .single()

          if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking card:', checkError)
            continue
          }

          if (existingCard) {
            // Update quantity
            const { error: updateError } = await supabase
              .from('user_cards')
              .update({ quantity: existingCard.quantity + 1 })
              .eq('id', existingCard.id)

            if (updateError) console.error('Error updating card quantity:', updateError)
          } else {
            // Insert new card
            const { error: insertError } = await supabase
              .from('user_cards')
              .insert({
                user_id: user.id,
                card_id: card.id,
                quantity: 1
              })

            if (insertError) console.error('Error inserting card:', insertError)
          }
        }

        // Check achievements after opening pack
        try {
          // Fetch updated collection stats
          const { data: userCards, error: cardsError } = await supabase
            .from('user_cards')
            .select(`
              quantity,
              cards (
                rarity
              )
            `)
            .eq('user_id', user.id)

          if (!cardsError && userCards) {
            // Calculate total cards and rarity counts
            let totalCards = 0
            let rareCount = 0
            let epicCount = 0

            userCards.forEach(uc => {
              const qty = uc.quantity || 1
              totalCards += qty
              if (uc.cards?.rarity === 'Rare') rareCount += qty
              if (uc.cards?.rarity === 'Epic') epicCount += qty
            })

            // Check collection achievements
            await checkCollectionAchievements(totalCards)

            // Check rarity achievements
            await checkRarityAchievements(rareCount, epicCount)
          }

          // Track packs opened
          const { data: transactions, error: transError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'pack_purchase')

          if (!transError && transactions) {
            await checkPackAchievements(transactions.length)
          }
        } catch (error) {
          console.error('Error checking achievements:', error)
        }
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
      const nextIndex = revealedCards.length
      setAnimatingIndex(nextIndex)
      setTimeout(() => {
        setRevealedCards([...revealedCards, nextIndex])
        setAnimatingIndex(null)
      }, 300)
    }
    if (revealedCards.length + 1 >= cards.length) {
      setTimeout(() => setAllRevealed(true), 500)
    }
  }

  const handleFinish = () => {
    navigate('/collection')
  }

  const getRarityGlow = (rarity) => {
    switch (rarity) {
      case 'Epic':
        return 'shadow-[0_0_30px_rgba(190,56,243,0.8)]'
      case 'Rare':
        return 'shadow-[0_0_20px_rgba(56,189,243,0.6)]'
      default:
        return ''
    }
  }

  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'Epic':
        return 'border-4 border-accent-purple'
      case 'Rare':
        return 'border-4 border-accent-blue'
      default:
        return 'border-2 border-slate-500'
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display overflow-x-hidden" style={{ backgroundImage: 'url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Cg fill-rule="evenodd"%3E%3Cg fill="%23a91079" fill-opacity="0.1"%3E%3Cpath d="M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\'), linear-gradient(180deg, #0D0221 0%, #A91079 100%)', backgroundColor: '#0D0221' }}>
      <style>{`
        @keyframes cardFlip {
          0% { transform: rotateY(0deg) scale(1); }
          50% { transform: rotateY(90deg) scale(1.1); }
          100% { transform: rotateY(0deg) scale(1); }
        }

        @keyframes epicParticles {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }

        @keyframes rarePulse {
          0%, 100% { box-shadow: 0 0 20px rgba(56,189,243,0.6); }
          50% { box-shadow: 0 0 40px rgba(56,189,243,1); }
        }

        @keyframes epicPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(190,56,243,0.8); }
          50% { box-shadow: 0 0 60px rgba(190,56,243,1); }
        }

        .card-flip {
          animation: cardFlip 0.6s ease-in-out;
        }

        .epic-pulse {
          animation: epicPulse 2s ease-in-out infinite;
        }

        .rare-pulse {
          animation: rarePulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="flex items-center p-4 pb-2 justify-between bg-transparent">
        <div className="flex size-10 shrink-0 items-center justify-center border-2 border-black bg-fuchsia-500 text-black shadow-[4px_4px_0px_#000000] cursor-pointer" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined !text-4xl">close</span>
        </div>
        <h2 className="flex-1 pr-10 text-center text-lg leading-tight text-white uppercase tracking-wider" style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 0 0 #000, -2px 0 0 #000, 0 2px 0 #000, 0 -2px 0 #000' }}>
          {pack?.name || 'Pack Opening'}
        </h2>
      </div>

      <div className="flex flex-1 flex-col justify-between px-4 pb-24">
        <div className="flex flex-1 flex-col items-center justify-center py-8">
          <div className="w-full">
            <div className="flex items-center gap-4 overflow-x-auto p-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {cards.map((card, index) => {
                const isRevealed = revealedCards.includes(index)
                const isAnimating = animatingIndex === index
                const isNew = true

                return (
                  <div
                    key={index}
                    className={`relative flex min-w-48 flex-1 shrink-0 flex-col gap-2 rounded-lg ${getRarityBorder(isRevealed ? card.rarity : 'Common')} bg-black/50 p-2 backdrop-blur-sm transition-all duration-300 ${isAnimating ? 'card-flip' : ''} ${isRevealed && card.rarity === 'Epic' ? 'epic-pulse' : isRevealed && card.rarity === 'Rare' ? 'rare-pulse' : ''}`}
                  >
                    {/* Particle effect for Epic cards */}
                    {isRevealed && card.rarity === 'Epic' && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-accent-purple rounded-full"
                            style={{
                              top: '50%',
                              left: '50%',
                              '--tx': `${Math.cos(i * 30 * Math.PI / 180) * 100}px`,
                              '--ty': `${Math.sin(i * 30 * Math.PI / 180) * 100}px`,
                              animation: `epicParticles 1.5s ease-out ${i * 0.1}s infinite`
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Particle effect for Rare cards */}
                    {isRevealed && card.rarity === 'Rare' && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-accent-blue rounded-full"
                            style={{
                              top: '50%',
                              left: '50%',
                              '--tx': `${Math.cos(i * 45 * Math.PI / 180) * 80}px`,
                              '--ty': `${Math.sin(i * 45 * Math.PI / 180) * 80}px`,
                              animation: `epicParticles 1.2s ease-out ${i * 0.15}s infinite`
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {isRevealed && isNew && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                        <div className="relative bg-vibrant-green px-3 py-1 text-black border-2 border-black rounded">
                          <div className="absolute -inset-1 animate-ping bg-vibrant-green/50 blur-sm"></div>
                          <span className="relative font-bold text-sm font-pixel">NEW!</span>
                        </div>
                      </div>
                    )}

                    <div
                      className={`relative w-full aspect-[3/4] bg-cover bg-center bg-no-repeat border-2 border-black rounded-lg overflow-hidden transition-all duration-500 ${isRevealed ? 'scale-100' : 'scale-95'}`}
                      style={{
                        backgroundImage: isRevealed
                          ? `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.9) 100%), url("${card.image_url || 'https://via.placeholder.com/300x400'}")`
                          : 'linear-gradient(45deg, #4A00E0, #8E2DE2)',
                      }}
                    >
                      {!isRevealed && !isAnimating && (
                        <div className="flex items-center justify-center h-full animate-pulse">
                          <span className="material-symbols-outlined text-white text-6xl opacity-50">help</span>
                        </div>
                      )}

                      {isRevealed && (
                        <div className="absolute bottom-0 left-0 right-0 p-2 z-10">
                          <div className={`inline-block px-2 py-1 rounded ${card.rarity === 'Epic' ? 'bg-accent-purple' : card.rarity === 'Rare' ? 'bg-accent-blue' : 'bg-common-gray'} border-2 border-black`}>
                            <span className="text-white font-pixel text-[10px]">{card.rarity}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {isRevealed && (
                      <div className="text-center animate-fade-in">
                        <p className="text-base text-white font-bold">{card.player_name}</p>
                        <p className="text-xs text-slate-300">RATING: {card.overall_rating || 75}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-center py-4">
          <div className="flex w-full max-w-[480px] flex-col items-stretch gap-4">
            {!allRevealed ? (
              <>
                <button
                  onClick={revealNext}
                  className="h-16 cursor-pointer items-center justify-center border-2 border-black bg-cyan-400 text-lg text-black shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none font-display uppercase tracking-wider transition-all hover:scale-105"
                  disabled={revealedCards.length >= cards.length}
                >
                  REVEAL NEXT
                </button>
                <button
                  onClick={revealAll}
                  className="h-16 cursor-pointer items-center justify-center border-2 border-black bg-lime-400 text-lg text-black shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none font-display uppercase tracking-wider transition-all hover:scale-105"
                >
                  REVEAL ALL
                </button>
              </>
            ) : (
              <button
                onClick={handleFinish}
                className="h-16 cursor-pointer items-center justify-center border-2 border-black bg-lime-400 text-lg text-black shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none font-display uppercase tracking-wider animate-bounce"
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
