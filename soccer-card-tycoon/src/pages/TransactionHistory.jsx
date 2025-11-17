import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import BottomNav from '../components/BottomNav'

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTransactions()
  }, [user])

  const fetchTransactions = async () => {
    if (!user) return

    try {
      // First, get battle transactions
      const { data: battles, error: battleError } = await supabase
        .from('battles')
        .select('*')
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50)

      if (battleError) throw battleError

      const battleTransactions = battles
        ?.filter(b => b.winner_id === user.id && b.rewards > 0)
        .map(b => ({
          id: `battle-${b.id}`,
          type: 'battle_reward',
          amount: b.rewards,
          description: 'Battle Victory Reward',
          created_at: b.created_at
        })) || []

      // Get pack purchases (deductions)
      // Note: We don't have a transactions table yet, so we'll show this as a placeholder
      // In a real implementation, you'd track these in the transactions table

      // Combine and sort
      const allTransactions = [...battleTransactions]
      allTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setTransactions(allTransactions)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'battle_reward':
        return { icon: 'emoji_events', color: 'text-vibrant-green', bg: 'bg-vibrant-green/20' }
      case 'daily_reward':
        return { icon: 'calendar_today', color: 'text-accent-gold', bg: 'bg-accent-gold/20' }
      case 'pack_purchase':
        return { icon: 'shopping_bag', color: 'text-red-500', bg: 'bg-red-500/20' }
      case 'card_purchase':
        return { icon: 'shopping_cart', color: 'text-accent-blue', bg: 'bg-accent-blue/20' }
      default:
        return { icon: 'paid', color: 'text-gray-400', bg: 'bg-gray-400/20' }
    }
  }

  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter)

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
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 pb-2 bg-background-dark/90 backdrop-blur-sm border-b-4 border-accent-gold">
        <div className="flex size-12 shrink-0 items-center justify-start cursor-pointer" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined text-accent-gold text-4xl">arrow_back_ios_new</span>
        </div>
        <h2 className="flex-1 text-center text-3xl font-display leading-tight tracking-[-0.015em] text-accent-gold text-outline-black">TRANSACTIONS</h2>
        <div className="w-12"></div>
      </div>

      {/* Filters */}
      <div className="sticky top-[60px] z-10 flex gap-2 p-4 bg-background-dark/80 backdrop-blur-sm border-b-2 border-gray-700 overflow-x-auto">
        {['all', 'battle_reward', 'daily_reward', 'pack_purchase', 'card_purchase'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-8 px-4 rounded-lg font-pixel text-[10px] uppercase border-2 border-black transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-accent-gold text-black shadow-pixel-hard-sm'
                : 'bg-gray-700 text-white'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <main className="flex-1 pb-24 p-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-7xl text-gray-600 mb-4">receipt_long</span>
            <p className="text-white font-display text-xl">No Transactions</p>
            <p className="text-gray-400 font-body text-sm mt-2">
              {filter === 'all'
                ? 'Start playing to see your transaction history!'
                : 'No transactions of this type yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const { icon, color, bg } = getTransactionIcon(transaction.type)
              const isPositive = transaction.amount > 0

              return (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-black/30 border-2 border-gray-700"
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bg} border-2 border-black`}>
                    <span className={`material-symbols-outlined ${color} text-2xl`}>{icon}</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <p className="text-white font-display text-sm">
                      {transaction.description}
                    </p>
                    <p className="text-gray-400 font-body text-xs mt-1">
                      {new Date(transaction.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={`font-display text-lg ${isPositive ? 'text-vibrant-green' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}{transaction.amount}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-accent-gold text-xs">paid</span>
                      <span className="text-gray-400 font-pixel text-[10px]">coins</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
