export default function Card({ card, onClick, showNew = false }) {
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

  const getRarityTextColor = (rarity) => {
    switch (rarity) {
      case 'Epic':
        return 'text-accent-purple'
      case 'Rare':
        return 'text-accent-blue'
      default:
        return 'text-common-gray'
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

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col justify-end aspect-[3/4] overflow-hidden card-clip-90s border-4 ${getRarityColor(card.rarity)} bg-cover bg-center cursor-pointer hover:scale-105 transition-transform`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.9) 100%), url("${card.image_url || 'https://via.placeholder.com/300x400'}")`
      }}
    >
      {showNew && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
          <div className="relative bg-vibrant-green px-3 py-1 text-black border-2 border-black">
            <div className="absolute -inset-1 animate-ping bg-vibrant-green/50 blur-sm"></div>
            <span className="relative font-pixel text-sm font-bold">NEW!</span>
          </div>
        </div>
      )}

      <div className="absolute top-0 right-0 p-2">
        <div className={`w-12 h-12 bg-black/50 border-2 ${getRarityColor(card.rarity)} flex items-center justify-center font-display text-4xl ${getRarityTextColor(card.rarity)} text-outline-black-sm`}>
          {card.overall_rating || 75}
        </div>
      </div>

      <div className="flex flex-col p-3 z-10">
        <div className={`tag-clip-90s ${getRarityBg(card.rarity)} px-3 py-1 mb-1 self-start border-2 border-black`}>
          <p className="font-pixel text-[10px] text-white">{card.rarity}</p>
        </div>
        <p className="text-white text-lg font-display leading-tight line-clamp-2 uppercase text-outline-black">
          {card.player_name}
        </p>
      </div>
    </div>
  )
}
