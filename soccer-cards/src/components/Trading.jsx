import { useState } from 'react';
import { evaluateTrade } from '../utils/tradingLogic.js';

export default function Trading({ gameState, onAcceptTrade, onRejectTrade, onRequestTrade }) {
  const [selectedTrader, setSelectedTrader] = useState(null);
  const [viewingOffer, setViewingOffer] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Get all active trade offers across all traders
  const allActiveOffers = gameState.traders?.flatMap(trader =>
    trader.activeOffers.filter(offer => offer.status === 'pending')
  ) || [];

  // Get completed trades
  const tradeHistory = gameState.tradeHistory || [];

  const handleAcceptTrade = (trade) => {
    onAcceptTrade(trade);
    setViewingOffer(null);
  };

  const handleRejectTrade = (trade) => {
    onRejectTrade(trade);
    setViewingOffer(null);
  };

  const handleRequestTrade = (trader) => {
    onRequestTrade(trader);
  };

  if (viewingOffer) {
    return <TradeOfferView
      offer={viewingOffer}
      onAccept={() => handleAcceptTrade(viewingOffer)}
      onReject={() => handleRejectTrade(viewingOffer)}
      onBack={() => setViewingOffer(null)}
    />;
  }

  if (showHistory) {
    return <TradeHistory
      history={tradeHistory}
      onBack={() => setShowHistory(false)}
    />;
  }

  return (
    <div className="trading-container">
      <div className="trading-header">
        <h2>🤝 Trading Hub</h2>
        <p>Trade cards with AI collectors to build your dream collection</p>
      </div>

      {/* Active Trade Offers */}
      {allActiveOffers.length > 0 && (
        <div className="trade-offers-section">
          <h3>📬 Active Trade Offers ({allActiveOffers.length})</h3>
          <div className="trade-offers-list">
            {allActiveOffers.map(offer => (
              <TradeOfferCard
                key={offer.id}
                offer={offer}
                onClick={() => setViewingOffer(offer)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Traders */}
      <div className="traders-section">
        <div className="section-header">
          <h3>👥 Available Traders ({gameState.traders?.length || 0})</h3>
          {tradeHistory.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={() => setShowHistory(true)}
            >
              View Trade History ({tradeHistory.length})
            </button>
          )}
        </div>

        <div className="traders-grid">
          {gameState.traders?.map(trader => (
            <TraderCard
              key={trader.id}
              trader={trader}
              onSelect={() => setSelectedTrader(trader)}
              onRequestTrade={() => handleRequestTrade(trader)}
            />
          ))}
        </div>

        {(!gameState.traders || gameState.traders.length === 0) && (
          <div className="empty-state">
            <p>No traders available yet. Level up to unlock more traders!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Individual trader card component
function TraderCard({ trader, onSelect, onRequestTrade }) {
  const activeOffers = trader.activeOffers?.filter(o => o.status === 'pending').length || 0;
  const completedTrades = trader.tradeHistory?.length || 0;

  return (
    <div className="trader-card">
      <div className="trader-avatar">{trader.avatar}</div>
      <div className="trader-info">
        <h4>{trader.name}</h4>
        <p className="trader-bio">{trader.bio}</p>
        <div className="trader-stats">
          <span>📦 Collection: {trader.collection?.length || 0} cards</span>
          <span>🤝 Trades: {completedTrades}</span>
          {activeOffers > 0 && (
            <span className="active-offers">✉️ {activeOffers} offer{activeOffers > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
      <div className="trader-actions">
        <button className="btn btn-primary" onClick={onRequestTrade}>
          Request Trade
        </button>
      </div>
    </div>
  );
}

// Trade offer card (in the offers list)
function TradeOfferCard({ offer, onClick }) {
  const evaluation = evaluateTrade(offer.offeredCards, offer.requestedCards);

  return (
    <div className="trade-offer-card" onClick={onClick}>
      <div className="offer-header">
        <span className="trader-name">{offer.traderAvatar} {offer.traderName}</span>
        <span className={`fairness-badge ${evaluation.fairness.toLowerCase().replace(' ', '-')}`}>
          {evaluation.fairness}
        </span>
      </div>
      <div className="offer-summary">
        <div className="offer-side">
          <span className="offer-label">You receive:</span>
          <span className="card-count">{offer.offeredCards.length} card{offer.offeredCards.length > 1 ? 's' : ''}</span>
          <span className="value">${offer.offeredValue.toLocaleString()}</span>
        </div>
        <div className="offer-arrow">⇄</div>
        <div className="offer-side">
          <span className="offer-label">You give:</span>
          <span className="card-count">{offer.requestedCards.length} card{offer.requestedCards.length > 1 ? 's' : ''}</span>
          <span className="value">${offer.requestedValue.toLocaleString()}</span>
        </div>
      </div>
      <button className="btn btn-sm">View Details</button>
    </div>
  );
}

// Detailed trade offer view
function TradeOfferView({ offer, onAccept, onReject, onBack }) {
  const evaluation = evaluateTrade(offer.offeredCards, offer.requestedCards);

  return (
    <div className="trade-offer-view">
      <div className="trade-header">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <h2>Trade Offer from {offer.traderName}</h2>
      </div>

      <div className="trade-evaluation">
        <div className={`fairness-indicator ${evaluation.fairness.toLowerCase().replace(' ', '-')}`}>
          <h3>{evaluation.fairness}</h3>
          <p>
            {evaluation.valueDifference >= 0
              ? `You gain $${evaluation.valueDifference.toLocaleString()} in value`
              : `You lose $${Math.abs(evaluation.valueDifference).toLocaleString()} in value`
            }
          </p>
        </div>
      </div>

      <div className="trade-details">
        <div className="trade-side">
          <h3>You Receive (${offer.offeredValue.toLocaleString()})</h3>
          <div className="cards-grid">
            {offer.offeredCards.map(card => (
              <CardDisplay key={card.id} card={card} />
            ))}
          </div>
        </div>

        <div className="trade-divider">⇄</div>

        <div className="trade-side">
          <h3>You Give (${offer.requestedValue.toLocaleString()})</h3>
          <div className="cards-grid">
            {offer.requestedCards.map(card => (
              <CardDisplay key={card.id} card={card} />
            ))}
          </div>
        </div>
      </div>

      <div className="trade-actions">
        <button className="btn btn-danger" onClick={onReject}>
          ✗ Reject Trade
        </button>
        <button className="btn btn-success" onClick={onAccept}>
          ✓ Accept Trade
        </button>
      </div>
    </div>
  );
}

// Card display component
function CardDisplay({ card }) {
  return (
    <div className={`card-item rarity-${card.rarity.toLowerCase()}`}>
      <div className="card-header">
        <span className="card-name">{card.name}</span>
        <span className="card-rating">{card.rating}</span>
      </div>
      <div className="card-details">
        <span>{card.position}</span>
        <span className="rarity-badge">{card.rarity}</span>
      </div>
      <div className="card-meta">
        <span>{card.club}</span>
        <span>{card.nation}</span>
      </div>
      <div className="card-value">${card.baseValue.toLocaleString()}</div>
    </div>
  );
}

// Trade history view
function TradeHistory({ history, onBack }) {
  return (
    <div className="trade-history-view">
      <div className="trade-header">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <h2>Trade History</h2>
      </div>

      <div className="history-list">
        {history.length === 0 ? (
          <div className="empty-state">
            <p>No completed trades yet. Start trading to build your history!</p>
          </div>
        ) : (
          history.slice().reverse().map((trade, index) => (
            <TradeHistoryItem key={trade.id || index} trade={trade} />
          ))
        )}
      </div>
    </div>
  );
}

// Single trade history item
function TradeHistoryItem({ trade }) {
  const date = new Date(trade.completedAt);
  const offeredValue = trade.offeredCards.reduce((sum, c) => sum + c.baseValue, 0);
  const requestedValue = trade.requestedCards.reduce((sum, c) => sum + c.baseValue, 0);
  const profit = offeredValue - requestedValue;

  return (
    <div className="history-item">
      <div className="history-header">
        <span className="history-date">{date.toLocaleString()}</span>
        <span className={`profit ${profit >= 0 ? 'positive' : 'negative'}`}>
          {profit >= 0 ? '+' : ''}${profit.toLocaleString()}
        </span>
      </div>
      <div className="history-summary">
        <div className="history-side">
          <span className="label">Received:</span>
          <span>{trade.offeredCards.length} card(s) - ${offeredValue.toLocaleString()}</span>
        </div>
        <div className="history-side">
          <span className="label">Gave:</span>
          <span>{trade.requestedCards.length} card(s) - ${requestedValue.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
