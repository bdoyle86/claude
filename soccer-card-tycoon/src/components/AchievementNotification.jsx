import { useAchievements } from '../contexts/AchievementContext'

export default function AchievementNotification() {
  const { notification, closeNotification } = useAchievements()

  if (!notification) return null

  const { achievement, coins } = notification

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'border-accent-gold bg-accent-gold/20'
      case 'epic':
        return 'border-accent-purple bg-accent-purple/20'
      case 'rare':
        return 'border-accent-blue bg-accent-blue/20'
      default:
        return 'border-common-gray bg-common-gray/20'
    }
  }

  const getRarityGlow = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'shadow-[0_0_30px_rgba(243,190,56,0.8)]'
      case 'epic':
        return 'shadow-[0_0_30px_rgba(190,56,243,0.8)]'
      case 'rare':
        return 'shadow-[0_0_20px_rgba(56,189,243,0.6)]'
      default:
        return ''
    }
  }

  return (
    <>
      <style>{`
        @keyframes achievementSlideIn {
          0% {
            transform: translateX(400px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes achievementPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .achievement-notification {
          animation: achievementSlideIn 0.5s ease-out, achievementPulse 0.5s ease-in-out 0.5s;
        }
      `}</style>

      <div className="fixed top-20 right-4 z-[100] max-w-sm">
        <div
          className={`achievement-notification flex flex-col gap-3 p-4 rounded-lg border-4 ${getRarityColor(achievement.rarity)} ${getRarityGlow(achievement.rarity)} backdrop-blur-sm`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-vibrant-green text-2xl">verified</span>
              <p className="text-vibrant-green font-pixel text-xs uppercase">Achievement Unlocked!</p>
            </div>
            <button
              onClick={closeNotification}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Achievement Info */}
          <div className="flex items-center gap-3">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center border-2 ${getRarityColor(achievement.rarity)}`}>
              <span className="material-symbols-outlined text-4xl text-white">{achievement.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-display text-lg leading-tight">{achievement.title}</h3>
              <p className="text-gray-300 font-body text-xs mt-1">{achievement.description}</p>
            </div>
          </div>

          {/* Rewards */}
          {coins > 0 && (
            <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2 border border-accent-gold">
              <span className="material-symbols-outlined text-accent-gold text-xl">paid</span>
              <span className="text-accent-gold font-display text-lg">+{coins}</span>
              <span className="text-gray-400 font-pixel text-xs">coins</span>
            </div>
          )}

          {/* Rarity Badge */}
          <div className="flex justify-end">
            <span className={`px-3 py-1 rounded text-xs font-pixel uppercase ${
              achievement.rarity === 'legendary'
                ? 'bg-accent-gold text-black'
                : achievement.rarity === 'epic'
                ? 'bg-accent-purple text-white'
                : achievement.rarity === 'rare'
                ? 'bg-accent-blue text-white'
                : 'bg-common-gray text-white'
            } border-2 border-black`}>
              {achievement.rarity}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
