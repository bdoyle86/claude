import { generateStarterPack } from '../data/cards.js';

// Level thresholds
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  500,    // Level 2
  1200,   // Level 3
  2000,   // Level 4
  3000,   // Level 5
  4500,   // Level 6
  6500,   // Level 7
  9000,   // Level 8
  12000,  // Level 9
  15500,  // Level 10
  20000,  // Level 11
  25000,  // Level 12
  30000,  // Level 13
  36000,  // Level 14
  43000,  // Level 15
  51000,  // Level 16
  60000,  // Level 17
  70000,  // Level 18
  82000,  // Level 19
  95000   // Level 20
];

// Create initial game state
export const createInitialGameState = () => {
  const starterCards = generateStarterPack();

  return {
    // Resources
    cash: 10000,
    cards: starterCards,

    // Progression
    level: 1,
    xp: 0,
    totalProfit: 0,

    // Stats
    cardsBought: 0,
    cardsSold: 0,
    packsOpened: 1, // starter pack
    netWorthHistory: [
      {
        timestamp: Date.now(),
        netWorth: 10000 + starterCards.reduce((sum, c) => sum + c.baseValue, 0)
      }
    ],

    // Active systems
    activeEvents: [],
    activeQuests: [],
    completedQuests: [],

    // Timestamps
    lastSaved: Date.now(),
    gameStarted: Date.now()
  };
};

// Calculate collection value
export const calculateCollectionValue = (cards) => {
  return cards.reduce((sum, card) => sum + card.baseValue, 0);
};

// Calculate net worth
export const calculateNetWorth = (gameState) => {
  return gameState.cash + calculateCollectionValue(gameState.cards);
};

// Calculate level from XP
export const calculateLevel = (xp) => {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
};

// Get XP needed for next level
export const getXPForNextLevel = (currentLevel) => {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return null; // Max level
  }
  return LEVEL_THRESHOLDS[currentLevel];
};

// Get XP progress to next level
export const getXPProgress = (xp) => {
  const currentLevel = calculateLevel(xp);
  const xpForCurrentLevel = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const xpForNextLevel = getXPForNextLevel(currentLevel);

  if (!xpForNextLevel) {
    return { current: 0, needed: 0, percentage: 100 };
  }

  const current = xp - xpForCurrentLevel;
  const needed = xpForNextLevel - xpForCurrentLevel;
  const percentage = Math.floor((current / needed) * 100);

  return { current, needed, percentage };
};

// Add XP and check for level up
export const addXP = (gameState, amount) => {
  const oldLevel = gameState.level;
  const newXP = gameState.xp + amount;
  const newLevel = calculateLevel(newXP);

  return {
    ...gameState,
    xp: newXP,
    level: newLevel,
    leveledUp: newLevel > oldLevel
  };
};

// Record net worth snapshot
export const recordNetWorth = (gameState) => {
  const netWorth = calculateNetWorth(gameState);
  const history = [...gameState.netWorthHistory];

  // Add new entry
  history.push({
    timestamp: Date.now(),
    netWorth
  });

  // Keep only last 50 entries
  if (history.length > 50) {
    history.shift();
  }

  return {
    ...gameState,
    netWorthHistory: history
  };
};

// Sell card to shop
export const sellCard = (gameState, card, price) => {
  if (!gameState.cards.find(c => c.id === card.id)) {
    return { success: false, message: 'Card not in collection' };
  }

  // Calculate profit (compare to base value)
  const profit = price - card.baseValue;

  const newState = {
    ...gameState,
    cash: gameState.cash + price,
    cards: gameState.cards.filter(c => c.id !== card.id),
    cardsSold: gameState.cardsSold + 1,
    totalProfit: gameState.totalProfit + Math.max(0, profit)
  };

  // Add XP for selling
  const xpGained = Math.floor(price / 100);
  const finalState = addXP(newState, xpGained);

  return {
    success: true,
    gameState: recordNetWorth(finalState),
    xpGained
  };
};

// Buy card from shop
export const buyCard = (gameState, card, price) => {
  if (gameState.cash < price) {
    return { success: false, message: 'Not enough cash' };
  }

  const newCard = {
    ...card,
    id: `${card.id}_${Date.now()}`, // Generate unique ID
    acquiredAt: Date.now()
  };

  const newState = {
    ...gameState,
    cash: gameState.cash - price,
    cards: [...gameState.cards, newCard],
    cardsBought: gameState.cardsBought + 1
  };

  // Add XP for buying
  const xpGained = Math.floor(price / 200);
  const finalState = addXP(newState, xpGained);

  return {
    success: true,
    gameState: recordNetWorth(finalState),
    xpGained
  };
};

// Open a pack
export const openPack = (gameState, packPrice, cards) => {
  if (gameState.cash < packPrice) {
    return { success: false, message: 'Not enough cash' };
  }

  const newState = {
    ...gameState,
    cash: gameState.cash - packPrice,
    cards: [...gameState.cards, ...cards],
    packsOpened: gameState.packsOpened + 1
  };

  // Add XP for opening pack
  const xpGained = Math.floor(packPrice / 50);
  const finalState = addXP(newState, xpGained);

  return {
    success: true,
    gameState: recordNetWorth(finalState),
    cards,
    xpGained
  };
};

// Complete quest
export const completeQuest = (gameState, quest) => {
  const newState = {
    ...gameState,
    cash: gameState.cash + quest.reward,
    completedQuests: [...gameState.completedQuests, quest.id],
    activeQuests: gameState.activeQuests.filter(q => q.id !== quest.id)
  };

  // Add XP reward
  const finalState = addXP(newState, quest.xpReward);

  return {
    success: true,
    gameState: recordNetWorth(finalState),
    reward: quest.reward,
    xpGained: quest.xpReward
  };
};

// Save game to localStorage
export const saveGame = (gameState) => {
  try {
    const saveData = {
      ...gameState,
      lastSaved: Date.now()
    };
    localStorage.setItem('soccerCardGame', JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
};

// Load game from localStorage
export const loadGame = () => {
  try {
    const saveData = localStorage.getItem('soccerCardGame');
    if (saveData) {
      return JSON.parse(saveData);
    }
  } catch (error) {
    console.error('Failed to load game:', error);
  }
  return null;
};

// Reset game
export const resetGame = () => {
  localStorage.removeItem('soccerCardGame');
  return createInitialGameState();
};
