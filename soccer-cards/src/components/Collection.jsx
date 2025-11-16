import { useState } from 'react';
import { getCardColor, getRarityName, RARITIES } from '../data/cards';
import { getCardPricesAllShops } from '../utils/marketEngine';

function Collection({ gameState, availableShops }) {
  const [sortBy, setSortBy] = useState('rating'); // rating, rarity, value, recent
  const [filterRarity, setFilterRarity] = useState('ALL');
  const [filterPosition, setFilterPosition] = useState('ALL');
  const [selectedCard, setSelectedCard] = useState(null);

  // Filter cards
  let filteredCards = [...gameState.cards];

  if (filterRarity !== 'ALL') {
    filteredCards = filteredCards.filter(c => c.rarity === filterRarity);
  }

  if (filterPosition !== 'ALL') {
    filteredCards = filteredCards.filter(c => c.position === filterPosition);
  }

  // Sort cards
  filteredCards.sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'rarity':
        return RARITIES[b.rarity].tier - RARITIES[a.rarity].tier;
      case 'value':
        return b.baseValue - a.baseValue;
      case 'recent':
        return b.acquiredAt - a.acquiredAt;
      default:
        return 0;
    }
  });

  const totalValue = gameState.cards.reduce((sum, card) => sum + card.baseValue, 0);

  return (
    <div className="collection">
      <div className="collection-header">
        <div>
          <h2>📚 My Collection</h2>
          <p className="subtitle">
            {gameState.cards.length} cards • Total Value: ${totalValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="collection-controls">
        <div className="control-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="rating">Rating</option>
            <option value="rarity">Rarity</option>
            <option value="value">Value</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>

        <div className="control-group">
          <label>Rarity:</label>
          <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)}>
            <option value="ALL">All</option>
            {Object.keys(RARITIES).map(rarity => (
              <option key={rarity} value={rarity}>
                {getRarityName(rarity)}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Position:</label>
          <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)}>
            <option value="ALL">All</option>
            <option value="GK">GK</option>
            <option value="DEF">DEF</option>
            <option value="MID">MID</option>
            <option value="ST">ST</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length > 0 ? (
        <div className="cards-grid">
          {filteredCards.map(card => (
            <div
              key={card.id}
              className="card-item"
              style={{ borderColor: getCardColor(card.rarity) }}
              onClick={() => setSelectedCard(card)}
            >
              <div className="card-rarity-badge" style={{ backgroundColor: getCardColor(card.rarity) }}>
                {getRarityName(card.rarity)}
              </div>
              <div className="card-rating-big">{card.rating}</div>
              <div className="card-name">{card.name}</div>
              <div className="card-position-badge">{card.position}</div>
              <div className="card-club-small">{card.club}</div>
              <div className="card-nation-small">{card.nation}</div>
              <div className="card-value-small">${card.baseValue.toLocaleString()}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No cards match your filters</p>
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="modal-overlay" onClick={() => setSelectedCard(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCard(null)}>×</button>

            <div className="card-detail">
              <div className="card-detail-header" style={{ borderColor: getCardColor(selectedCard.rarity) }}>
                <div className="card-rarity-badge" style={{ backgroundColor: getCardColor(selectedCard.rarity) }}>
                  {getRarityName(selectedCard.rarity)}
                </div>
                <div className="card-rating-huge">{selectedCard.rating}</div>
              </div>

              <h3>{selectedCard.name}</h3>

              <div className="card-detail-info">
                <div className="detail-row">
                  <span className="label">Position:</span>
                  <span className="value">{selectedCard.position}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Club:</span>
                  <span className="value">{selectedCard.club}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Nation:</span>
                  <span className="value">{selectedCard.nation}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Base Value:</span>
                  <span className="value">${selectedCard.baseValue.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Acquired:</span>
                  <span className="value">{new Date(selectedCard.acquiredAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Market Prices */}
              <div className="market-prices">
                <h4>Current Market Prices</h4>
                {(() => {
                  const allPrices = getCardPricesAllShops(selectedCard, availableShops, gameState.activeEvents);
                  return availableShops.map(shop => {
                    const shopPrice = allPrices[shop.id];

                    if (!shopPrice || shopPrice.buyPrice === 0) return null;

                    return (
                      <div key={shop.id} className="price-row">
                        <span className="shop-name">{shop.icon} {shop.name}</span>
                        <span className="price">${shopPrice.buyPrice.toLocaleString()}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Collection;
