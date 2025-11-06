import { calculateCollectionValue, calculateNetWorth, getXPProgress } from '../utils/gameLogic';
import { getRarityName, RARITIES } from '../data/cards';

function Dashboard({ gameState, onReset }) {
  const collectionValue = calculateCollectionValue(gameState.cards);
  const netWorth = calculateNetWorth(gameState);
  const xpProgress = getXPProgress(gameState.xp);

  // Calculate rarity distribution
  const rarityCount = {};
  Object.keys(RARITIES).forEach(rarity => {
    rarityCount[rarity] = gameState.cards.filter(c => c.rarity === rarity).length;
  });

  // Get net worth trend (compare to previous)
  const worthHistory = gameState.netWorthHistory;
  const worthTrend = worthHistory.length > 1
    ? netWorth - worthHistory[worthHistory.length - 2].netWorth
    : 0;

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h2>Welcome Back, Trader! 🎮</h2>
        <p className="subtitle">Level {gameState.level} • Started {new Date(gameState.gameStarted).toLocaleDateString()}</p>
      </div>

      {/* XP Progress */}
      <div className="xp-bar-container">
        <div className="xp-bar-header">
          <span>Level {gameState.level}</span>
          <span>{xpProgress.percentage}%</span>
        </div>
        <div className="xp-bar">
          <div
            className="xp-bar-fill"
            style={{ width: `${xpProgress.percentage}%` }}
          />
        </div>
        <div className="xp-bar-text">
          {xpProgress.current.toLocaleString()} / {xpProgress.needed.toLocaleString()} XP
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-label">Cash</div>
            <div className="stat-value">${gameState.cash.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <div className="stat-label">Collection Value</div>
            <div className="stat-value">${collectionValue.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💎</div>
          <div className="stat-info">
            <div className="stat-label">Net Worth</div>
            <div className="stat-value">
              ${netWorth.toLocaleString()}
              {worthTrend !== 0 && (
                <span className={`trend ${worthTrend > 0 ? 'positive' : 'negative'}`}>
                  {worthTrend > 0 ? '↑' : '↓'} ${Math.abs(worthTrend).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🃏</div>
          <div className="stat-info">
            <div className="stat-label">Total Cards</div>
            <div className="stat-value">{gameState.cards.length}</div>
          </div>
        </div>
      </div>

      {/* Collection Breakdown */}
      <div className="section">
        <h3>Collection Breakdown</h3>
        <div className="rarity-grid">
          {Object.keys(RARITIES).reverse().map(rarity => (
            <div key={rarity} className="rarity-stat">
              <div
                className="rarity-badge"
                style={{ backgroundColor: RARITIES[rarity].color }}
              >
                {getRarityName(rarity)}
              </div>
              <div className="rarity-count">{rarityCount[rarity]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Stats */}
      <div className="section">
        <h3>Trading Statistics</h3>
        <div className="trading-stats">
          <div className="trading-stat">
            <span className="label">Total Profit:</span>
            <span className="value profit">${gameState.totalProfit.toLocaleString()}</span>
          </div>
          <div className="trading-stat">
            <span className="label">Cards Bought:</span>
            <span className="value">{gameState.cardsBought}</span>
          </div>
          <div className="trading-stat">
            <span className="label">Cards Sold:</span>
            <span className="value">{gameState.cardsSold}</span>
          </div>
          <div className="trading-stat">
            <span className="label">Packs Opened:</span>
            <span className="value">{gameState.packsOpened}</span>
          </div>
        </div>
      </div>

      {/* Net Worth Chart */}
      {worthHistory.length > 1 && (
        <div className="section">
          <h3>Net Worth History</h3>
          <div className="chart-container">
            <div className="simple-chart">
              {worthHistory.map((entry, index) => {
                const maxWorth = Math.max(...worthHistory.map(e => e.netWorth));
                const height = (entry.netWorth / maxWorth) * 100;

                return (
                  <div key={index} className="chart-bar" style={{ height: `${height}%` }}>
                    <div className="chart-bar-tooltip">
                      ${entry.netWorth.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="section actions">
        <button className="btn-secondary" onClick={onReset}>
          🔄 Reset Game
        </button>
      </div>

      {/* Tips */}
      <div className="tips-section">
        <h4>💡 Trading Tips</h4>
        <ul>
          <li>Buy low, sell high - check multiple shops for the best prices!</li>
          <li>Watch for market events - they can double your profits or cause crashes!</li>
          <li>Complete quests for bonus rewards and XP!</li>
          <li>Your collection value counts toward your net worth even if you don't sell!</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
