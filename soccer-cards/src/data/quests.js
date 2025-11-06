// Quest types
export const QUEST_TYPES = {
  PROFIT: 'PROFIT',
  BUY_CARDS: 'BUY_CARDS',
  SELL_CARDS: 'SELL_CARDS',
  OPEN_PACKS: 'OPEN_PACKS',
  COLLECT_RARITY: 'COLLECT_RARITY',
  COLLECT_POSITION: 'COLLECT_POSITION',
  REACH_VALUE: 'REACH_VALUE'
};

// Quest definitions
export const QUEST_TEMPLATES = [
  // Beginner quests
  {
    id: 'profit_1000',
    title: 'First Profit',
    description: 'Make $1,000 in profit from card trading',
    type: QUEST_TYPES.PROFIT,
    target: 1000,
    reward: 500,
    difficulty: 'easy',
    xpReward: 100
  },
  {
    id: 'buy_3_cards',
    title: 'Shopping Spree',
    description: 'Buy 3 cards from any shop',
    type: QUEST_TYPES.BUY_CARDS,
    target: 3,
    reward: 300,
    difficulty: 'easy',
    xpReward: 50
  },
  {
    id: 'open_3_packs',
    title: 'Pack Hunter',
    description: 'Open 3 card packs',
    type: QUEST_TYPES.OPEN_PACKS,
    target: 3,
    reward: 1000,
    difficulty: 'easy',
    xpReward: 150
  },

  // Intermediate quests
  {
    id: 'profit_5000',
    title: 'Rising Trader',
    description: 'Make $5,000 in profit',
    type: QUEST_TYPES.PROFIT,
    target: 5000,
    reward: 2000,
    difficulty: 'medium',
    xpReward: 300
  },
  {
    id: 'collect_3_gold',
    title: 'Gold Rush',
    description: 'Collect 3 Gold rarity cards',
    type: QUEST_TYPES.COLLECT_RARITY,
    target: 3,
    targetRarity: 'GOLD',
    reward: 3000,
    difficulty: 'medium',
    xpReward: 400
  },
  {
    id: 'collect_5_strikers',
    title: 'Strike Force',
    description: 'Collect 5 Striker cards',
    type: QUEST_TYPES.COLLECT_POSITION,
    target: 5,
    targetPosition: 'ST',
    reward: 1500,
    difficulty: 'medium',
    xpReward: 250
  },
  {
    id: 'sell_10_cards',
    title: 'Master Seller',
    description: 'Sell 10 cards to shops',
    type: QUEST_TYPES.SELL_CARDS,
    target: 10,
    reward: 1000,
    difficulty: 'medium',
    xpReward: 200
  },

  // Advanced quests
  {
    id: 'profit_25000',
    title: 'Market Master',
    description: 'Make $25,000 in profit',
    type: QUEST_TYPES.PROFIT,
    target: 25000,
    reward: 10000,
    difficulty: 'hard',
    xpReward: 800
  },
  {
    id: 'collect_platinum',
    title: 'Elite Collector',
    description: 'Collect a Platinum card',
    type: QUEST_TYPES.COLLECT_RARITY,
    target: 1,
    targetRarity: 'PLATINUM',
    reward: 15000,
    difficulty: 'hard',
    xpReward: 1000
  },
  {
    id: 'reach_value_100k',
    title: 'Six Figure Collection',
    description: 'Reach a collection value of $100,000',
    type: QUEST_TYPES.REACH_VALUE,
    target: 100000,
    reward: 20000,
    difficulty: 'hard',
    xpReward: 1500
  },

  // Legendary quests
  {
    id: 'collect_icon',
    title: 'Icon Hunter',
    description: 'Collect an Icon card',
    type: QUEST_TYPES.COLLECT_RARITY,
    target: 1,
    targetRarity: 'ICON',
    reward: 50000,
    difficulty: 'legendary',
    xpReward: 3000
  },
  {
    id: 'profit_100000',
    title: 'Trading Tycoon',
    description: 'Make $100,000 in profit',
    type: QUEST_TYPES.PROFIT,
    target: 100000,
    reward: 50000,
    difficulty: 'legendary',
    xpReward: 5000
  }
];

// Get active quests based on player level and completed quests
export const getAvailableQuests = (level, completedQuestIds) => {
  const difficultyByLevel = {
    easy: level >= 1,
    medium: level >= 3,
    hard: level >= 8,
    legendary: level >= 15
  };

  return QUEST_TEMPLATES.filter(quest =>
    difficultyByLevel[quest.difficulty] &&
    !completedQuestIds.includes(quest.id)
  );
};

// Check if a quest is completed
export const checkQuestCompletion = (quest, gameState) => {
  switch (quest.type) {
    case QUEST_TYPES.PROFIT:
      return gameState.totalProfit >= quest.target;

    case QUEST_TYPES.BUY_CARDS:
      return gameState.cardsBought >= quest.target;

    case QUEST_TYPES.SELL_CARDS:
      return gameState.cardsSold >= quest.target;

    case QUEST_TYPES.OPEN_PACKS:
      return gameState.packsOpened >= quest.target;

    case QUEST_TYPES.COLLECT_RARITY:
      const rarityCount = gameState.cards.filter(
        card => card.rarity === quest.targetRarity
      ).length;
      return rarityCount >= quest.target;

    case QUEST_TYPES.COLLECT_POSITION:
      const positionCount = gameState.cards.filter(
        card => card.position === quest.targetPosition
      ).length;
      return positionCount >= quest.target;

    case QUEST_TYPES.REACH_VALUE:
      const collectionValue = gameState.cards.reduce(
        (sum, card) => sum + card.baseValue,
        0
      );
      return collectionValue >= quest.target;

    default:
      return false;
  }
};

// Get quest progress
export const getQuestProgress = (quest, gameState) => {
  switch (quest.type) {
    case QUEST_TYPES.PROFIT:
      return { current: gameState.totalProfit, target: quest.target };

    case QUEST_TYPES.BUY_CARDS:
      return { current: gameState.cardsBought, target: quest.target };

    case QUEST_TYPES.SELL_CARDS:
      return { current: gameState.cardsSold, target: quest.target };

    case QUEST_TYPES.OPEN_PACKS:
      return { current: gameState.packsOpened, target: quest.target };

    case QUEST_TYPES.COLLECT_RARITY:
      const rarityCount = gameState.cards.filter(
        card => card.rarity === quest.targetRarity
      ).length;
      return { current: rarityCount, target: quest.target };

    case QUEST_TYPES.COLLECT_POSITION:
      const positionCount = gameState.cards.filter(
        card => card.position === quest.targetPosition
      ).length;
      return { current: positionCount, target: quest.target };

    case QUEST_TYPES.REACH_VALUE:
      const collectionValue = gameState.cards.reduce(
        (sum, card) => sum + card.baseValue,
        0
      );
      return { current: collectionValue, target: quest.target };

    default:
      return { current: 0, target: quest.target };
  }
};
