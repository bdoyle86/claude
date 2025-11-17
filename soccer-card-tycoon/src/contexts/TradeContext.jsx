import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const TradeContext = createContext()

export function useTrading() {
  const context = useContext(TradeContext)
  if (!context) {
    throw new Error('useTrading must be used within TradeProvider')
  }
  return context
}

export function TradeProvider({ children }) {
  const [incomingTrades, setIncomingTrades] = useState([])
  const [outgoingTrades, setOutgoingTrades] = useState([])
  const [pendingTradesCount, setPendingTradesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchTrades()

      // Set up real-time subscription for trade updates
      const channel = supabase
        .channel('trades-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'trades',
            filter: `recipient_id=eq.${user.id},initiator_id=eq.${user.id}`
          },
          () => {
            fetchTrades()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  const fetchTrades = async () => {
    if (!user) return

    try {
      // Fetch incoming trades (where user is recipient)
      const { data: incoming, error: incomingError } = await supabase
        .from('trades')
        .select(`
          *,
          initiator:initiator_id(id),
          recipient:recipient_id(id),
          initiator_profile:profiles!trades_initiator_id_fkey(username, avatar_url),
          recipient_profile:profiles!trades_recipient_id_fkey(username, avatar_url)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })

      if (incomingError) throw incomingError

      // Fetch trade items for incoming trades
      const incomingWithItems = await Promise.all(
        (incoming || []).map(async (trade) => {
          const { data: items, error: itemsError } = await supabase
            .from('trade_items')
            .select(`
              *,
              cards(*)
            `)
            .eq('trade_id', trade.id)

          if (itemsError) throw itemsError

          return {
            ...trade,
            items: items || [],
            offering: items?.filter(item => item.user_id === trade.initiator_id) || [],
            requesting: items?.filter(item => item.user_id === trade.recipient_id) || []
          }
        })
      )

      // Fetch outgoing trades (where user is initiator)
      const { data: outgoing, error: outgoingError } = await supabase
        .from('trades')
        .select(`
          *,
          initiator:initiator_id(id),
          recipient:recipient_id(id),
          initiator_profile:profiles!trades_initiator_id_fkey(username, avatar_url),
          recipient_profile:profiles!trades_recipient_id_fkey(username, avatar_url)
        `)
        .eq('initiator_id', user.id)
        .order('created_at', { ascending: false })

      if (outgoingError) throw outgoingError

      // Fetch trade items for outgoing trades
      const outgoingWithItems = await Promise.all(
        (outgoing || []).map(async (trade) => {
          const { data: items, error: itemsError } = await supabase
            .from('trade_items')
            .select(`
              *,
              cards(*)
            `)
            .eq('trade_id', trade.id)

          if (itemsError) throw itemsError

          return {
            ...trade,
            items: items || [],
            offering: items?.filter(item => item.user_id === trade.initiator_id) || [],
            requesting: items?.filter(item => item.user_id === trade.recipient_id) || []
          }
        })
      )

      setIncomingTrades(incomingWithItems)
      setOutgoingTrades(outgoingWithItems)
      setPendingTradesCount(incomingWithItems.filter(t => t.status === 'pending').length)
    } catch (error) {
      console.error('Error fetching trades:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTrade = async (recipientId, offeringCards, requestingCards, message = '') => {
    try {
      // Create trade
      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .insert({
          initiator_id: user.id,
          recipient_id: recipientId,
          status: 'pending',
          message
        })
        .select()
        .single()

      if (tradeError) throw tradeError

      // Add offered cards
      const offeringItems = offeringCards.map(card => ({
        trade_id: trade.id,
        user_id: user.id,
        card_id: card.id,
        quantity: card.quantity || 1
      }))

      // Add requested cards
      const requestingItems = requestingCards.map(card => ({
        trade_id: trade.id,
        user_id: recipientId,
        card_id: card.id,
        quantity: card.quantity || 1
      }))

      const allItems = [...offeringItems, ...requestingItems]

      if (allItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('trade_items')
          .insert(allItems)

        if (itemsError) throw itemsError
      }

      await fetchTrades()
      return { success: true, trade }
    } catch (error) {
      console.error('Error creating trade:', error)
      return { success: false, error: error.message }
    }
  }

  const acceptTrade = async (tradeId) => {
    try {
      const { data, error } = await supabase
        .rpc('accept_trade', { trade_id_param: tradeId })

      if (error) throw error

      if (!data.success) {
        throw new Error(data.error || 'Failed to accept trade')
      }

      await fetchTrades()
      return { success: true }
    } catch (error) {
      console.error('Error accepting trade:', error)
      return { success: false, error: error.message }
    }
  }

  const rejectTrade = async (tradeId) => {
    try {
      const { error } = await supabase
        .from('trades')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('id', tradeId)

      if (error) throw error

      await fetchTrades()
      return { success: true }
    } catch (error) {
      console.error('Error rejecting trade:', error)
      return { success: false, error: error.message }
    }
  }

  const cancelTrade = async (tradeId) => {
    try {
      const { error } = await supabase
        .from('trades')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('id', tradeId)

      if (error) throw error

      await fetchTrades()
      return { success: true }
    } catch (error) {
      console.error('Error cancelling trade:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    incomingTrades,
    outgoingTrades,
    pendingTradesCount,
    loading,
    createTrade,
    acceptTrade,
    rejectTrade,
    cancelTrade,
    refreshTrades: fetchTrades
  }

  return (
    <TradeContext.Provider value={value}>
      {children}
    </TradeContext.Provider>
  )
}
