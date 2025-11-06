import { useState } from 'react';
import { PACKS, openPack } from '../data/packs';
import { openPack as openPackLogic } from '../utils/gameLogic';
import { getCardColor, getRarityName } from '../data/cards';

function PackOpening({ gameState, availablePacks, updateGameState, showNotification }) {
  const [opening, setOpening] = useState(false);
  const [revealedCards, setRevealedCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleOpenPack = (packType) => {
    if (opening) return;

    const pack = PACKS[packType];
    if (gameState.cash < pack.price) {
      showNotification('Not enough cash!', 'error');
      return;
    }

    // Generate cards
    const cards = openPack(packType);

    // Start opening animation
    setOpening(true);
    setRevealedCards(cards);
    setCurrentCardIndex(0);

    // Reveal cards one by one
    let index = 0;
    const revealInterval = setInterval(() => {
      index++;
      setCurrentCardIndex(index);

      if (index >= cards.length) {
        clearInterval(revealInterval);
        setTimeout(() => {
          // Update game state
          const result = openPackLogic(gameState, pack.price, cards);
          if (result.success) {
            updateGameState(result.gameState);
            showNotification(`Opened ${pack.name}! +${result.xpGained} XP`, 'success');
          }

          // Reset state
          setOpening(false);
          setRevealedCards([]);
          setCurrentCardIndex(0);
        }, 1500);
      }
    }, 800);
  };

  return (
    <div className="pack-opening">
      <h2>📦 Card Packs</h2>
      <p className="subtitle">Open packs to discover new cards for your collection!</p>

      {!opening ? (
        <div className="packs-grid">
          {availablePacks.map(pack => {
            const canAfford = gameState.cash >= pack.price;

            return (
              <div key={pack.id} className={`pack-card ${!canAfford ? 'disabled' : ''}`}>
                <div className="pack-icon">📦</div>
                <h3>{pack.name}</h3>
                <p className="pack-description">{pack.description}</p>
                <div className="pack-details">
                  <div className="pack-detail">
                    <span className="label">Cards:</span>
                    <span className="value">{pack.cardCount}</span>
                  </div>
                  <div className="pack-detail">
                    <span className="label">Price:</span>
                    <span className="value">${pack.price.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => handleOpenPack(pack.id)}
                  disabled={!canAfford || opening}
                >
                  {canAfford ? 'Open Pack' : 'Not Enough Cash'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="pack-opening-animation">
          <h3>Opening Pack... 🎁</h3>
          <div className="cards-reveal">
            {revealedCards.map((card, index) => (
              <div
                key={index}
                className={`card-reveal ${index < currentCardIndex ? 'revealed' : ''}`}
              >
                {index < currentCardIndex ? (
                  <div className="card-front" style={{ borderColor: getCardColor(card.rarity) }}>
                    <div className="card-rarity" style={{ backgroundColor: getCardColor(card.rarity) }}>
                      {getRarityName(card.rarity)}
                    </div>
                    <div className="card-rating">{card.rating}</div>
                    <div className="card-name">{card.name}</div>
                    <div className="card-position">{card.position}</div>
                    <div className="card-club">{card.club}</div>
                    <div className="card-nation">{card.nation}</div>
                    <div className="card-value">${card.baseValue.toLocaleString()}</div>
                  </div>
                ) : (
                  <div className="card-back">?</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pack unlocking info */}
      {gameState.level < 20 && (
        <div className="unlock-info">
          <h4>🔒 Unlock More Packs</h4>
          <ul>
            {gameState.level < 3 && <li>Premium Pack unlocks at Level 3</li>}
            {gameState.level < 7 && <li>Elite Pack unlocks at Level 7</li>}
            {gameState.level < 15 && <li>Icon Pack unlocks at Level 15</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PackOpening;
