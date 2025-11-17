import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const AchievementContext = createContext()

export function useAchievements() {
  const context = useContext(AchievementContext)
  if (!context) {
    throw new Error('useAchievements must be used within AchievementProvider')
  }
  return context
}

export function AchievementProvider({ children }) {
  const { user, profile, refreshProfile } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [userAchievements, setUserAchievements] = useState([])
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (user) {
      fetchAchievements()
      fetchUserAchievements()
    }
  }, [user])

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true })

      if (error) throw error
      setAchievements(data || [])
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }
  }

  const fetchUserAchievements = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      setUserAchievements(data || [])
    } catch (error) {
      console.error('Error fetching user achievements:', error)
    }
  }

  const checkAchievement = async (category, value) => {
    if (!user) return

    const relevantAchievements = achievements.filter(a => a.category === category)

    for (const achievement of relevantAchievements) {
      // Check if already unlocked
      const alreadyUnlocked = userAchievements.find(
        ua => ua.achievement_id === achievement.id
      )

      if (alreadyUnlocked) continue

      // Check if requirement is met
      const requirementMet = value >= achievement.requirement_value

      if (requirementMet) {
        await unlockAchievement(achievement)
      }
    }
  }

  const unlockAchievement = async (achievement) => {
    if (!user) return

    try {
      // Insert user achievement
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievement.id,
          progress: achievement.requirement_value
        })

      if (insertError) throw insertError

      // Award coins
      if (achievement.reward_coins > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ coins: (profile?.coins || 0) + achievement.reward_coins })
          .eq('id', user.id)

        if (updateError) throw updateError
        await refreshProfile()
      }

      // Refresh user achievements
      await fetchUserAchievements()

      // Show notification
      setNotification({
        achievement,
        coins: achievement.reward_coins
      })

      // Hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000)
    } catch (error) {
      console.error('Error unlocking achievement:', error)
    }
  }

  const checkBattleAchievements = async (wins) => {
    await checkAchievement('battle', wins)
  }

  const checkCollectionAchievements = async (totalCards) => {
    await checkAchievement('collection', totalCards)
  }

  const checkRarityAchievements = async (rareCount, epicCount) => {
    // Check rare achievements
    const rareAchievements = achievements.filter(a =>
      a.category === 'rarity' && a.name.includes('rare')
    )
    for (const achievement of rareAchievements) {
      const alreadyUnlocked = userAchievements.find(ua => ua.achievement_id === achievement.id)
      if (!alreadyUnlocked && rareCount >= achievement.requirement_value) {
        await unlockAchievement(achievement)
      }
    }

    // Check epic achievements
    const epicAchievements = achievements.filter(a =>
      a.category === 'rarity' && (a.name.includes('epic') || a.name.includes('legendary'))
    )
    for (const achievement of epicAchievements) {
      const alreadyUnlocked = userAchievements.find(ua => ua.achievement_id === achievement.id)
      if (!alreadyUnlocked && epicCount >= achievement.requirement_value) {
        await unlockAchievement(achievement)
      }
    }
  }

  const checkPackAchievements = async (packsOpened) => {
    await checkAchievement('pack', packsOpened)
  }

  const checkCoinAchievements = async (totalCoinsEarned) => {
    await checkAchievement('coins', totalCoinsEarned)
  }

  const isUnlocked = (achievementName) => {
    const achievement = achievements.find(a => a.name === achievementName)
    if (!achievement) return false
    return userAchievements.some(ua => ua.achievement_id === achievement.id)
  }

  const getProgress = (achievementName) => {
    const achievement = achievements.find(a => a.name === achievementName)
    if (!achievement) return 0
    const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id)
    return userAchievement?.progress || 0
  }

  const value = {
    achievements,
    userAchievements,
    notification,
    checkBattleAchievements,
    checkCollectionAchievements,
    checkRarityAchievements,
    checkPackAchievements,
    checkCoinAchievements,
    isUnlocked,
    getProgress,
    closeNotification: () => setNotification(null)
  }

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  )
}
