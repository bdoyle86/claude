import { useState, useEffect } from 'react';
import { getCardColor, getRarityName } from '../data/cards';
import { generateShopInventory, getCardPrices, refreshShopInventory } from '../utils/marketEngine';
import { buyCard, sellCard } from '../utils/gameLogic';

function Shops({ gameState, availableShops, updateGameState, showNotification, onMarketUpdate }) {
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopInventories, setShopInventories] = useState({});
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'sell'

  // Initialize shop inventories
  useEffect(() => {
    if (availableShops.length > 0) {
      const inventories = {};
      availableShops.forEach(shop => {
        inventories[shop.id] = generateShopInventory(shop.id, 12);
      });
      setShopInventories(inventories);
      setSelectedShop(availableShops[0].id);
    }
  }, [availableShops]);

  // Trigger market update when changing shops
  const handleShopChange = (shopId) => {
    setSelectedShop(shopId);
    onMarketUpdate();

    // Refresh inventory slightly
    setShopInventories(prev => ({
      ...prev,
      [shopId]: refreshShopInventory(prev[shopId] || [], shopId, 0.2)
    }));
  };

  const handleBuyCard = (card, price) => {
    const result = buyCard(gameState, card, price);

    if (result.success) {
      updateGameState(result.gameState);
      showNotification(`Bought ${card.name} for $${price.toLocaleString()}! +${result.xpGained} XP`, 'success');

      // Remove card from shop inventory
      setShopInventories(prev => ({
        ...prev,
        [selectedShop]: prev[selectedShop].filter(c => c.id !== card.id)
      }));

      // Trigger market update
      onMarketUpdate();
    } else {
      showNotification(result.message, 'error');
    }
  };

  const handleSellCard = (card, price) => {
    const result = sellCard(gameState, card, price);

    if (result.success) {
      updateGameState(result.gameState);
      const profit = price - card.baseValue;
      const profitText = profit > 0 ? `+$${profit.toLocaleString()} profit!` : '';
      showNotification(`Sold ${card.name} for $${price.toLocaleString()}! ${profitText} +${result.xpGained} XP`, 'success');

      // Trigger market update
      onMarketUpdate();
    } else {
      showNotification(result.message, 'error');
    }
  };

  const handleRefreshInventory = () => {
    if (selectedShop && shopInventories[selectedShop]) {
      setShopInventories(prev => ({
        ...prev,
        [selectedShop]: refreshShopInventory(prev[selectedShop], selectedShop, 0.4)
      }));
      showNotification('Shop inventory refreshed!', 'info');
      onMarketUpdate();
    }
  };

  if (!selectedShop || availableShops.length === 0) {
    return (
      <div className="shops">
        <h2>🏪 Shops</h2>
        <p>No shops available yet. Level up to unlock shops!</p>
      </div>
    );
  }

  const currentShop = availableShops.find(s => s.id === selectedShop);
  const inventory = shopInventories[selectedShop] || [];

  return (
    <div className="shops">
      <h2>🏪 Shops</h2>
      <p className="subtitle">Buy low, sell high, and master the market!</p>

      {/* Shop Selector */}
      <div className="shop-selector">
        {availableShops.map(shop => (
          <button
            key={shop.id}
            className={`shop-button ${selectedShop === shop.id ? 'active' : ''}`}
            onClick={() => handleShopChange(shop.id)}
          >
            <span className="shop-icon">{shop.icon}</span>
            <span className="shop-name">{shop.name}</span>
          </button>
        ))}
      </div>

      {/* Shop Info */}
      <div className="shop-info">
        <h3>{currentShop.icon} {currentShop.name}</h3>
        <p>{currentShop.description}</p>
        <p className="shop-specialty">
          Specializes in: {currentShop.specialty.map(r => getRarityName(r)).join(', ')} cards
        </p>
      </div>

      {/* Buy/Sell Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'buy' ? 'active' : ''}
          onClick={() => setActiveTab('buy')}
        >
          💰 Buy Cards
        </button>
        <button
          className={activeTab === 'sell' ? 'active' : ''}
          onClick={() => setActiveTab('sell')}
        >
          💵 Sell Cards
        </button>
      </div>

      {/* Buy Tab */}
      {activeTab === 'buy' && (
        <div className="shop-content">
          <div className="shop-actions">
            <button className="btn-secondary" onClick={handleRefreshInventory}>
              🔄 Refresh Inventory
            </button>
          </div>

          {inventory.length > 0 ? (
            <div className="shop-cards-grid">
              {inventory.map(card => {
                const { sellPrice, marketModifier } = getCardPrices(card, selectedShop, gameState.activeEvents);
                const canAfford = gameState.cash >= sellPrice;
                const isAffected = marketModifier !== 1.0;

                return (
                  <div
                    key={card.id}
                    className={`shop-card ${!canAfford ? 'disabled' : ''} ${isAffected ? 'affected' : ''}`}
                    style={{ borderColor: getCardColor(card.rarity) }}
                  >
                    <div className="card-rarity-badge" style={{ backgroundColor: getCardColor(card.rarity) }}>
                      {getRarityName(card.rarity)}
                    </div>
                    <div className="card-rating-big">{card.rating}</div>
                    <div className="card-name">{card.name}</div>
                    <div className="card-info-row">
                      <span>{card.position}</span>
                      <span>•</span>
                      <span>{card.club}</span>
                    </div>
                    <div className="card-nation-small">{card.nation}</div>

                    {isAffected && (
                      <div className={`market-indicator ${marketModifier > 1 ? 'hot' : 'cold'}`}>
                        {marketModifier > 1 ? '🔥 Hot!' : '❄️ Low Demand'}
                      </div>
                    )}

                    <div className="card-price">
                      ${sellPrice.toLocaleString()}
                      {marketModifier !== 1.0 && (
                        <span className="price-modifier">
                          ({marketModifier > 1 ? '+' : ''}{((marketModifier - 1) * 100).toFixed(0)}%)
                        </span>
                      )}
                    </div>

                    <button
                      className="btn-primary btn-sm"
                      onClick={() => handleBuyCard(card, sellPrice)}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Buy' : 'Too Expensive'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>Shop is restocking...</p>
              <button className="btn-primary" onClick={handleRefreshInventory}>
                Refresh Inventory
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sell Tab */}
      {activeTab === 'sell' && (
        <div className="shop-content">
          {gameState.cards.length > 0 ? (
            <div className="shop-cards-grid">
              {gameState.cards.map(card => {
                const { buyPrice, marketModifier } = getCardPrices(card, selectedShop, gameState.activeEvents);
                const willBuy = buyPrice > 0;
                const isAffected = marketModifier !== 1.0;
                const profit = buyPrice - card.baseValue;

                return (
                  <div
                    key={card.id}
                    className={`shop-card ${!willBuy ? 'disabled' : ''} ${isAffected ? 'affected' : ''}`}
                    style={{ borderColor: getCardColor(card.rarity) }}
                  >
                    <div className="card-rarity-badge" style={{ backgroundColor: getCardColor(card.rarity) }}>
                      {getRarityName(card.rarity)}
                    </div>
                    <div className="card-rating-big">{card.rating}</div>
                    <div className="card-name">{card.name}</div>
                    <div className="card-info-row">
                      <span>{card.position}</span>
                      <span>•</span>
                      <span>{card.club}</span>
                    </div>
                    <div className="card-nation-small">{card.nation}</div>

                    {isAffected && willBuy && (
                      <div className={`market-indicator ${marketModifier > 1 ? 'hot' : 'cold'}`}>
                        {marketModifier > 1 ? '🔥 High Demand!' : '❄️ Low Price'}
                      </div>
                    )}

                    {willBuy ? (
                      <>
                        <div className="card-price">
                          ${buyPrice.toLocaleString()}
                          {profit !== 0 && (
                            <span className={`profit-indicator ${profit > 0 ? 'positive' : 'negative'}`}>
                              {profit > 0 ? '+' : ''}{profit.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => handleSellCard(card, buyPrice)}
                        >
                          Sell
                        </button>
                      </>
                    ) : (
                      <div className="not-interested">
                        Not Interested
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>You don't have any cards to sell!</p>
              <p>Buy some packs or shop around to build your collection.</p>
            </div>
          )}
        </div>
      )}

      {/* Locked Shops */}
      {gameState.level < 10 && (
        <div className="unlock-info">
          <h4>🔒 Unlock More Shops</h4>
          <ul>
            {gameState.level < 5 && <li>Champions' Hall unlocks at Level 5</li>}
            {gameState.level < 10 && <li>The Collector's Corner unlocks at Level 10</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Shops;
