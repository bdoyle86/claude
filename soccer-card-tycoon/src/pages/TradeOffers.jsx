import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrading } from '../contexts/TradeContext'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import Card from '../components/Card'

export default function TradeOffers() {
  const [activeTab, setActiveTab] = useState('incoming') // 'incoming' or 'outgoing'
  const { incomingTrades, outgoingTrades, acceptTrade, rejectTrade, cancelTrade, loading } = useTrading()
  const [processing, setProcessing] = useState(null)
  const navigate = useNavigate()

  const handleAccept = async (tradeId) => {
    if (!confirm('Accept this trade? Cards will be exchanged immediately.')) return

    setProcessing(tradeId)
    const result = await acceptTrade(tradeId)
    setProcessing(null)

    if (result.success) {
      alert('Trade accepted successfully!')
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleReject = async (tradeId) => {
    if (!confirm('Reject this trade?')) return

    setProcessing(tradeId)
    const result = await rejectTrade(tradeId)
    setProcessing(null)

    if (result.success) {
      alert('Trade rejected')
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleCancel = async (tradeId) => {
    if (!confirm('Cancel this trade offer?')) return

    setProcessing(tradeId)
    const result = await cancelTrade(tradeId)
    setProcessing(null)

    if (result.success) {
      alert('Trade cancelled')
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
      accepted: 'bg-vibrant-green/20 text-vibrant-green border-vibrant-green',
      rejected: 'bg-red-500/20 text-red-500 border-red-500',
      cancelled: 'bg-gray-500/20 text-gray-500 border-gray-500'
    }

    return (
      <span className={`px-2 py-1 rounded border font-pixel text-[10px] uppercase ${styles[status] || styles.pending}`}>
        {status}
      </span>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const TradeCard = ({ trade, isIncoming }) => {
    const otherUser = isIncoming ? trade.initiator_profile : trade.recipient_profile

    return (
      <div className="bg-black/50 border-2 border-gray-700 rounded-lg p-4 hover:border-electric-blue transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-electric-blue/20 border-2 border-electric-blue flex items-center justify-center">
              <span className="material-symbols-outlined text-electric-blue text-sm">person</span>
            </div>
            <div>
              <p className="text-white font-display">{otherUser?.username || 'Unknown'}</p>
              <p className="text-gray-400 font-body text-xs">{formatDate(trade.created_at)}</p>
            </div>
          </div>
          {getStatusBadge(trade.status)}
        </div>

        {/* Message */}
        {trade.message && (
          <div className="mb-4 p-3 bg-black/30 rounded border border-gray-700">
            <p className="text-gray-300 font-body text-sm italic">"{trade.message}"</p>
          </div>
        )}

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* They Give */}
          <div>
            <p className="text-vibrant-green font-pixel text-xs mb-2 uppercase">
              {isIncoming ? 'They Give:' : 'You Give:'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {trade.offering?.map((item, idx) => (
                <div key={idx} className="relative">
                  <Card card={item.cards} />
                  {item.quantity > 1 && (
                    <div className="absolute top-1 right-1 bg-black/80 rounded-full w-6 h-6 flex items-center justify-center">
                      <span className="text-white font-pixel text-[10px]">x{item.quantity}</span>
                    </div>
                  )}
                </div>
              ))}
              {trade.offering?.length === 0 && (
                <div className="col-span-3 text-center text-gray-500 font-body text-xs py-4">
                  Nothing
                </div>
              )}
            </div>
          </div>

          {/* You Get */}
          <div>
            <p className="text-accent-blue font-pixel text-xs mb-2 uppercase">
              {isIncoming ? 'You Give:' : 'They Give:'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {trade.requesting?.map((item, idx) => (
                <div key={idx} className="relative">
                  <Card card={item.cards} />
                  {item.quantity > 1 && (
                    <div className="absolute top-1 right-1 bg-black/80 rounded-full w-6 h-6 flex items-center justify-center">
                      <span className="text-white font-pixel text-[10px]">x{item.quantity}</span>
                    </div>
                  )}
                </div>
              ))}
              {trade.requesting?.length === 0 && (
                <div className="col-span-3 text-center text-gray-500 font-body text-xs py-4">
                  Nothing
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {trade.status === 'pending' && (
          <div className="flex gap-2">
            {isIncoming ? (
              <>
                <button
                  onClick={() => handleAccept(trade.id)}
                  disabled={processing === trade.id}
                  className="flex-1 h-10 rounded-lg bg-vibrant-green text-black font-display text-sm uppercase border-2 border-black shadow-pixel hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {processing === trade.id ? 'PROCESSING...' : 'ACCEPT'}
                </button>
                <button
                  onClick={() => handleReject(trade.id)}
                  disabled={processing === trade.id}
                  className="flex-1 h-10 rounded-lg bg-red-500 text-white font-display text-sm uppercase border-2 border-black shadow-pixel hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  REJECT
                </button>
              </>
            ) : (
              <button
                onClick={() => handleCancel(trade.id)}
                disabled={processing === trade.id}
                className="w-full h-10 rounded-lg bg-gray-600 text-white font-display text-sm uppercase border-2 border-black shadow-pixel hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {processing === trade.id ? 'PROCESSING...' : 'CANCEL'}
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background-dark to-background-light pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-electric-blue border-t-transparent"></div>
            <p className="text-gray-400 font-body mt-4">Loading trades...</p>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-dark to-background-light pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-display text-white mb-2">Trade Offers</h1>
            <p className="text-gray-400 font-body">Manage your card trades</p>
          </div>
          <button
            onClick={() => navigate('/create-trade')}
            className="h-12 px-6 rounded-lg bg-vibrant-green text-black font-display uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            NEW TRADE
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex-1 h-12 rounded-lg font-display uppercase border-2 border-black transition-all ${
              activeTab === 'incoming'
                ? 'bg-electric-blue text-black'
                : 'bg-black/30 text-gray-400 hover:bg-black/50'
            }`}
          >
            INCOMING ({incomingTrades.filter(t => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`flex-1 h-12 rounded-lg font-display uppercase border-2 border-black transition-all ${
              activeTab === 'outgoing'
                ? 'bg-electric-blue text-black'
                : 'bg-black/30 text-gray-400 hover:bg-black/50'
            }`}
          >
            SENT ({outgoingTrades.filter(t => t.status === 'pending').length})
          </button>
        </div>

        {/* Trade List */}
        <div className="space-y-4">
          {activeTab === 'incoming' ? (
            incomingTrades.length === 0 ? (
              <div className="text-center py-20 bg-black/30 rounded-lg border-2 border-gray-700">
                <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">inbox</span>
                <p className="text-gray-400 font-body">No incoming trade offers</p>
              </div>
            ) : (
              incomingTrades.map(trade => (
                <TradeCard key={trade.id} trade={trade} isIncoming={true} />
              ))
            )
          ) : (
            outgoingTrades.length === 0 ? (
              <div className="text-center py-20 bg-black/30 rounded-lg border-2 border-gray-700">
                <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">send</span>
                <p className="text-gray-400 font-body">No sent trade offers</p>
                <button
                  onClick={() => navigate('/create-trade')}
                  className="mt-4 h-12 px-6 rounded-lg bg-vibrant-green text-black font-display uppercase border-2 border-black shadow-pixel-hard hover:scale-105 transition-transform"
                >
                  CREATE YOUR FIRST TRADE
                </button>
              </div>
            ) : (
              outgoingTrades.map(trade => (
                <TradeCard key={trade.id} trade={trade} isIncoming={false} />
              ))
            )
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
