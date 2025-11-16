import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import PackOpening from './components/PackOpening';
import Collection from './components/Collection';
import Shops from './components/Shops';
import Quests from './components/Quests';
import MarketNews from './components/MarketNews';
import Trading from './components/Trading';
import {
  createInitialGameState,
  saveGame,
  loadGame,
  calculateNetWorth,
  calculateLevel
} from './utils/gameLogic';
import { triggerMarketEvent } from './utils/marketEngine';
import {
  executeTrade,
  generateTradeOffer,
  refreshTraderOffers,
  initializeTraders
} from './utils/tradingLogic';
import { getAvailableShops } from './data/shops';
import { getAvailablePacks } from './data/packs';
import { getAvailableQuests } from './data/quests';

function App() {
  const [gameState, setGameState] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [notification, setNotification] = useState(null);

  // Initialize game
  useEffect(() => {
    const savedGame = loadGame();
    if (savedGame) {
      // Recalculate level in case XP thresholds changed
      savedGame.level = calculateLevel(savedGame.xp);

      // Backward compatibility: Initialize traders if they don't exist
      if (!savedGame.traders) {
        savedGame.traders = initializeTraders(savedGame.level);
        savedGame.tradeHistory = [];
      }

      setGameState(savedGame);
    } else {
      const newGame = createInitialGameState();
      setGameState(newGame);
      saveGame(newGame);
    }
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!gameState) return;

    const interval = setInterval(() => {
      saveGame(gameState);
    }, 30000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Update game state and save
  const updateGameState = (newState) => {
    // Check for level up
    if (newState.level > gameState.level) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }

    setGameState(newState);
    saveGame(newState);
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Trigger market event (called when visiting shops)
  const handleMarketUpdate = () => {
    const updatedState = triggerMarketEvent(gameState);
    setGameState(updatedState);
    saveGame(updatedState);
  };

  // Reset game
  const handleReset = () => {
    if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
      const newGame = createInitialGameState();
      setGameState(newGame);
      saveGame(newGame);
      setCurrentView('dashboard');
      showNotification('Game reset successfully!', 'success');
    }
  };

  // Trading handlers
  const handleAcceptTrade = (trade) => {
    const updatedState = executeTrade(gameState, trade);

    // Remove the offer from trader's active offers
    const traders = updatedState.traders.map(trader => {
      if (trader.id === trade.traderId) {
        return {
          ...trader,
          activeOffers: trader.activeOffers.filter(o => o.id !== trade.id)
        };
      }
      return trader;
    });

    const finalState = { ...updatedState, traders };
    updateGameState(finalState);
    showNotification(`✅ Trade completed with ${trade.traderName}!`, 'success');
  };

  const handleRejectTrade = (trade) => {
    // Remove the offer from trader's active offers
    const traders = gameState.traders.map(trader => {
      if (trader.id === trade.traderId) {
        return {
          ...trader,
          activeOffers: trader.activeOffers.filter(o => o.id !== trade.id)
        };
      }
      return trader;
    });

    const updatedState = { ...gameState, traders };
    updateGameState(updatedState);
    showNotification(`❌ Trade rejected`, 'info');
  };

  const handleRequestTrade = (trader) => {
    // Generate a new trade offer from this trader
    const offer = generateTradeOffer(trader, gameState.cards);

    if (!offer) {
      showNotification(`${trader.name} doesn't have any trades available right now.`, 'info');
      return;
    }

    // Add offer to trader's active offers
    const traders = gameState.traders.map(t => {
      if (t.id === trader.id) {
        return {
          ...t,
          activeOffers: [...t.activeOffers, offer]
        };
      }
      return t;
    });

    const updatedState = { ...gameState, traders };
    updateGameState(updatedState);
    showNotification(`📬 New trade offer from ${trader.name}!`, 'success');
  };

  if (!gameState) {
    return (
      <div className="loading">
        <h1>⚽ Loading Soccer Card Trader...</h1>
      </div>
    );
  }

  const availableShops = getAvailableShops(gameState.level);
  const availablePacks = getAvailablePacks(gameState.level);
  const availableQuests = getAvailableQuests(gameState.level, gameState.completedQuests);
  const netWorth = calculateNetWorth(gameState);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="game-title">⚽ Soccer Card Trader</h1>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-label">Level</span>
              <span className="stat-value">{gameState.level}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Cash</span>
              <span className="stat-value cash">${gameState.cash.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Net Worth</span>
              <span className="stat-value">${netWorth.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Market News */}
      {gameState.activeEvents.length > 0 && (
        <MarketNews events={gameState.activeEvents} />
      )}

      {/* Navigation */}
      <nav className="navigation">
        <button
          className={currentView === 'dashboard' ? 'active' : ''}
          onClick={() => setCurrentView('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={currentView === 'packs' ? 'active' : ''}
          onClick={() => setCurrentView('packs')}
        >
          📦 Packs
        </button>
        <button
          className={currentView === 'shops' ? 'active' : ''}
          onClick={() => setCurrentView('shops')}
        >
          🏪 Shops
        </button>
        <button
          className={currentView === 'trading' ? 'active' : ''}
          onClick={() => setCurrentView('trading')}
        >
          🤝 Trading
        </button>
        <button
          className={currentView === 'collection' ? 'active' : ''}
          onClick={() => setCurrentView('collection')}
        >
          📚 Collection
        </button>
        <button
          className={currentView === 'quests' ? 'active' : ''}
          onClick={() => setCurrentView('quests')}
        >
          🎯 Quests {availableQuests.length > 0 && `(${availableQuests.length})`}
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {currentView === 'dashboard' && (
          <Dashboard
            gameState={gameState}
            onReset={handleReset}
          />
        )}

        {currentView === 'packs' && (
          <PackOpening
            gameState={gameState}
            availablePacks={availablePacks}
            updateGameState={updateGameState}
            showNotification={showNotification}
          />
        )}

        {currentView === 'shops' && (
          <Shops
            gameState={gameState}
            availableShops={availableShops}
            updateGameState={updateGameState}
            showNotification={showNotification}
            onMarketUpdate={handleMarketUpdate}
          />
        )}

        {currentView === 'collection' && (
          <Collection
            gameState={gameState}
            availableShops={availableShops}
          />
        )}

        {currentView === 'quests' && (
          <Quests
            gameState={gameState}
            availableQuests={availableQuests}
            updateGameState={updateGameState}
            showNotification={showNotification}
          />
        )}

        {currentView === 'trading' && (
          <Trading
            gameState={gameState}
            onAcceptTrade={handleAcceptTrade}
            onRejectTrade={handleRejectTrade}
            onRequestTrade={handleRequestTrade}
          />
        )}
      </main>

      {/* Level Up Notification */}
      {showLevelUp && (
        <div className="level-up-modal">
          <div className="level-up-content">
            <h2>🎉 LEVEL UP! 🎉</h2>
            <p className="level-up-text">You reached Level {gameState.level}!</p>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Made for learning about markets and commerce! 📈</p>
      </footer>
    </div>
  );
}

export default App;
