import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function DailyReward() {
  const [canClaim, setCanClaim] = useState(false)
  const [streak, setStreak] = useState(0)
  const [claiming, setClaiming] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { user, profile, refreshProfile } = useAuth()

  const DAILY_REWARD = 50
  const STREAK_BONUS = 10 // Extra coins per day of streak

  useEffect(() => {
    checkRewardStatus()
  }, [profile])

  const checkRewardStatus = () => {
    if (!profile) return

    const today = new Date().toDateString()
    const lastLogin = profile.last_login_date ? new Date(profile.last_login_date).toDateString() : null

    // Can claim if never logged in or last login was not today
    setCanClaim(!lastLogin || lastLogin !== today)
    setStreak(profile.login_streak || 0)
  }

  const claimReward = async () => {
    if (!canClaim || claiming) return

    setClaiming(true)

    try {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const lastLogin = profile.last_login_date ? new Date(profile.last_login_date) : null
      const lastLoginDate = lastLogin ? lastLogin.toDateString() : null
      const yesterdayDate = yesterday.toDateString()

      // Calculate new streak
      let newStreak = 1
      if (lastLoginDate === yesterdayDate) {
        // Consecutive day
        newStreak = (profile.login_streak || 0) + 1
      }

      // Calculate reward with streak bonus
      const totalReward = DAILY_REWARD + (newStreak > 1 ? (newStreak - 1) * STREAK_BONUS : 0)
      const newCoins = profile.coins + totalReward

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          coins: newCoins,
          last_login_date: today.toISOString().split('T')[0],
          login_streak: newStreak,
          last_reward_claimed_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          transaction_type: 'daily_reward',
          amount: totalReward,
          description: `Daily login reward (${newStreak} day streak)`,
          metadata: { streak: newStreak, base_reward: DAILY_REWARD, bonus: totalReward - DAILY_REWARD }
        }])

      if (transactionError) console.error('Transaction logging error:', transactionError)

      await refreshProfile()
      setCanClaim(false)
      setStreak(newStreak)
      setShowSuccess(true)

      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error claiming reward:', error)
    } finally {
      setClaiming(false)
    }
  }

  if (!canClaim && !streak) return null

  const potentialReward = DAILY_REWARD + (streak > 0 ? streak * STREAK_BONUS : 0)

  return (
    <>
      <div className="relative flex flex-col items-center gap-4 rounded-xl bg-card-dark p-4 border-4 border-black shadow-pixel-hard">
        <div
          className="w-24 h-24 bg-center bg-no-repeat bg-contain flex-shrink-0 z-10 -mt-12"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ctext y=\'.9em\' font-size=\'90\'%3E💰%3C/text%3E%3C/svg%3E")',
            filter: 'drop-shadow(0 4px 0px rgba(0,0,0,0.5))'
          }}
        ></div>

        <div className="flex flex-col gap-3 z-10 text-center items-center">
          <div className="flex flex-col gap-1">
            <p className="text-white text-lg font-display leading-tight tracking-tighter">
              {canClaim ? 'DAILY LOGIN!' : 'COME BACK TOMORROW!'}
            </p>
            <p className="text-text-dark-secondary text-sm font-medium leading-normal">
              {canClaim
                ? `Claim your daily ${potentialReward} coins!`
                : `Current streak: ${streak} day${streak !== 1 ? 's' : ''}!`}
            </p>
            {streak > 0 && canClaim && (
              <p className="text-accent-gold text-xs font-bold">
                🔥 {streak} day streak! +{streak * STREAK_BONUS} bonus coins!
              </p>
            )}
          </div>

          {canClaim && (
            <button
              onClick={claimReward}
              disabled={claiming}
              className="w-full max-w-xs cursor-pointer rounded-lg border-2 border-black bg-accent-yellow px-6 py-3 text-sm font-display leading-none text-black shadow-pixel-hard-sm transition-transform active:translate-y-0.5 active:shadow-none disabled:opacity-50"
            >
              <span className="truncate">{claiming ? 'CLAIMING...' : 'CLAIM NOW!'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2 animate-bounce">
          <div className="flex items-center gap-3 rounded-lg bg-vibrant-green px-6 py-3 shadow-pixel-hard border-4 border-black">
            <span className="text-4xl">💰</span>
            <div>
              <p className="font-pixel text-sm text-black">+{potentialReward} COINS!</p>
              {streak > 1 && <p className="font-pixel text-xs text-black/70">{streak} DAY STREAK!</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
