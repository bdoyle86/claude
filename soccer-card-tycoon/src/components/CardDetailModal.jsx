export default function CardDetailModal({ card, onClose, quantity = 1, onSell }) {
  if (!card) return null

  const getSellPrice = (card) => {
    const basePrice = {
      'Epic': 250,
      'Rare': 150,
      'Common': 50
    }
    return basePrice[card.rarity] || 50
  }

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Epic':
        return 'border-accent-purple bg-accent-purple/10'
      case 'Rare':
        return 'border-accent-blue bg-accent-blue/10'
      default:
        return 'border-common-gray bg-common-gray/10'
    }
  }

  const getRarityBg = (rarity) => {
    switch (rarity) {
      case 'Epic':
        return 'bg-accent-purple'
      case 'Rare':
        return 'bg-accent-blue'
      default:
        return 'bg-common-gray'
    }
  }

  const stats = [
    { name: 'PACE', value: card.pace || 75 },
    { name: 'SHOOTING', value: card.shooting || 75 },
    { name: 'PASSING', value: card.passing || 75 },
    { name: 'DRIBBLING', value: card.dribbling || 75 },
    { name: 'DEFENDING', value: card.defending || 75 },
    { name: 'PHYSICAL', value: card.physical || 75 },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="relative flex w-full flex-col overflow-hidden bg-brand-blue border-4 border-black shadow-pixel-hard max-w-md my-auto" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#0096C7', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center p-4 pb-2 justify-between shrink-0 relative z-10">
          <div className="flex size-12 shrink-0 items-center justify-start"></div>
          <h2 className="text-white text-lg font-display uppercase tracking-tighter">Card Details</h2>
          <button
            onClick={onClose}
            className="flex size-12 shrink-0 items-center justify-center border-2 border-black bg-neon-yellow text-black shadow-pixel-hard-sm active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            <span className="material-symbols-outlined text-4xl">close</span>
          </button>
        </div>

        {/* Card Display */}
        <div className="flex flex-col px-4 overflow-y-auto flex-1">
          <div className="relative flex w-full items-center justify-center py-3">
            <div className="absolute inset-x-0 top-1/2 h-1/2 -translate-y-1/2 bg-secondary/20 blur-3xl rounded-full"></div>
            <div className="w-full max-w-xs aspect-[3/4] flex-shrink-0" style={{ transform: 'perspective(1000px) rotateY(0deg) scale(1.05)' }}>
              <div
                className={`h-full w-full bg-center bg-no-repeat bg-cover rounded-xl shadow-2xl shadow-black/50 border-4 ${getRarityColor(card.rarity).split(' ')[0]}`}
                style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.9) 100%), url("${card.image_url || 'https://via.placeholder.com/300x400'}")` }}
              >
                {/* Rating Badge */}
                <div className="absolute top-0 right-0 p-2">
                  <div className={`w-16 h-16 bg-black/50 border-2 ${getRarityColor(card.rarity).split(' ')[0]} flex items-center justify-center rounded-lg`}>
                    <p className="text-white text-4xl font-display tracking-tighter">{card.overall_rating || 75}</p>
                  </div>
                </div>

                {/* Quantity Badge */}
                {quantity > 1 && (
                  <div className="absolute top-0 left-0 p-2">
                    <div className="bg-black/90 border-2 border-white px-3 py-1 rounded-lg">
                      <p className="text-white font-pixel text-sm">x{quantity}</p>
                    </div>
                  </div>
                )}

                {/* Card Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className={`tag-clip-90s ${getRarityBg(card.rarity)} px-3 py-1 mb-2 inline-block border-2 border-black`}>
                    <p className="font-pixel text-[10px] text-white">{card.rarity}</p>
                  </div>
                  <p className="text-white text-2xl font-display leading-tight uppercase text-outline-black">
                    {card.player_name}
                  </p>
                  <div className="flex gap-2 mt-2 items-center">
                    {card.position && (
                      <span className="text-white/80 text-sm font-bold bg-black/50 px-2 py-1 rounded border border-white/30">
                        {card.position}
                      </span>
                    )}
                    {card.club && (
                      <span className="text-white/80 text-sm">{card.club}</span>
                    )}
                  </div>
                  {card.country && (
                    <span className="text-white/70 text-sm">{card.country}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex flex-col items-center text-center -mt-8 relative z-10 mb-4">
            <div className="w-full bg-brand-yellow border-4 border-black shadow-pixel-hard p-4 rounded-lg">
              <h3 className="text-center font-pixel text-xl text-black mb-4">STATS</h3>
              <div className="flex flex-col gap-3">
                {stats.map((stat) => (
                  <div key={stat.name} className="flex items-center gap-3">
                    <p className="w-28 shrink-0 font-pixel text-xs text-black text-left">{stat.name}</p>
                    <div className="w-full h-6 bg-black border-2 border-black p-0.5">
                      <div
                        className="h-full bg-neon-pink transition-all duration-300"
                        style={{ width: `${stat.value}%` }}
                      ></div>
                    </div>
                    <p className="w-8 shrink-0 text-right font-pixel text-lg font-bold text-black">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {onSell && quantity > 0 && (
            <div className="p-4 pb-6">
              <button
                onClick={() => onSell(card)}
                className="w-full h-14 rounded-lg bg-red-500 hover:bg-red-600 text-white font-display text-lg uppercase border-2 border-black shadow-pixel-hard active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-2xl">sell</span>
                SELL FOR {getSellPrice(card)} COINS
                {quantity > 1 && ` (Have ${quantity})`}
              </button>
              <p className="text-white/70 text-center mt-2 text-xs font-body">
                Selling will remove 1 copy from your collection
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
