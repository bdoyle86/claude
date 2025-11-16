import { generateCard } from '../data/cards.js';
import { AI_TRADERS, traderWantsCard, getTraderValuation } from '../data/traders.js';

// Initialize AI traders with their own card collections
export function initializeTraders(playerLevel) {
  const availableTraders = AI_TRADERS.filter(t => t.unlockLevel <= playerLevel);

  return availableTraders.map(trader => {
    // Generate random collection for each trader (between 15-40 cards)
    const collectionSize = Math.floor(Math.random() * 26) + 15;
    const collection = [];

    for (let i = 0; i < collectionSize; i++) {
      const card = generateCard();
      collection.push(card);
    }

    return {
      ...trader,
      collection,
      activeOffers: [], // Trades this trader has offered
      tradeHistory: [], // Completed trades
      lastOfferTime: 0, // When they last made an offer
    };
  });
}

// Generate a trade offer from an AI trader to the player
export function generateTradeOffer(trader, playerCollection) {
  // Find cards in player's collection that the trader wants
  const desiredCards = playerCollection.filter(card => traderWantsCard(trader, card));

  if (desiredCards.length === 0) {
    return null; // No cards the trader wants
  }

  // Pick 1-3 random cards the trader wants
  const numCards = Math.min(Math.floor(Math.random() * 3) + 1, desiredCards.length);
  const requestedCards = [];
  const shuffled = [...desiredCards].sort(() => Math.random() - 0.5);

  for (let i = 0; i < numCards; i++) {
    requestedCards.push(shuffled[i]);
  }

  // Calculate total value of requested cards
  const requestedValue = requestedCards.reduce((sum, card) => sum + card.baseValue, 0);

  // Trader offers cards from their collection
  // They try to match value (with some randomness for fairness)
  const targetOfferValue = requestedValue * (0.9 + Math.random() * 0.3); // 90-120% of requested value

  const offeredCards = selectCardsForOffer(trader.collection, targetOfferValue, requestedCards);

  if (offeredCards.length === 0) {
    return null; // Trader doesn't have suitable cards to offer
  }

  const offeredValue = offeredCards.reduce((sum, card) => sum + card.baseValue, 0);

  return {
    id: `trade_${Date.now()}_${Math.random()}`,
    traderId: trader.id,
    traderName: trader.name,
    traderAvatar: trader.avatar,
    offeredCards, // Cards trader is giving
    requestedCards, // Cards trader wants
    offeredValue,
    requestedValue,
    status: 'pending', // pending, accepted, rejected, countered
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // Expires in 24 hours (game time)
  };
}

// Helper function to select cards from trader's collection for an offer
function selectCardsForOffer(traderCollection, targetValue, playerCards) {
  // Don't offer cards that are identical to what they're requesting
  const requestedIds = playerCards.map(c => c.id);
  const availableCards = traderCollection.filter(c => !requestedIds.includes(c.id));

  if (availableCards.length === 0) return [];

  // Sort by base value
  const sorted = [...availableCards].sort((a, b) => b.baseValue - a.baseValue);

  const selectedCards = [];
  let currentValue = 0;

  // Try to match target value
  for (const card of sorted) {
    if (currentValue >= targetValue * 0.85) {
      // We've reached acceptable value (85% of target minimum)
      break;
    }

    selectedCards.push(card);
    currentValue += card.baseValue;

    // Don't offer too many cards (max 4)
    if (selectedCards.length >= 4) {
      break;
    }
  }

  return selectedCards;
}

// Evaluate if a trade is fair
export function evaluateTrade(offeredCards, requestedCards) {
  const offeredValue = offeredCards.reduce((sum, card) => sum + card.baseValue, 0);
  const requestedValue = requestedCards.reduce((sum, card) => sum + card.baseValue, 0);

  const ratio = offeredValue / requestedValue;

  let fairness = 'Fair';
  if (ratio > 1.15) {
    fairness = 'Great Deal'; // Getting 15%+ more value
  } else if (ratio > 1.05) {
    fairness = 'Good Deal'; // Getting 5-15% more value
  } else if (ratio < 0.85) {
    fairness = 'Bad Deal'; // Losing 15%+ value
  } else if (ratio < 0.95) {
    fairness = 'Poor Deal'; // Losing 5-15% value
  }

  return {
    fairness,
    offeredValue,
    requestedValue,
    valueDifference: offeredValue - requestedValue,
    ratio,
  };
}

// AI trader decides whether to accept/reject a counter-offer
export function traderRespondsToCounterOffer(trader, counterOffer) {
  const { offeredCards, requestedCards } = counterOffer;

  // Calculate how much the trader values what they're getting
  const perceivedValue = requestedCards.reduce((sum, card) => {
    return sum + getTraderValuation(trader, card);
  }, 0);

  // Calculate value of what they're giving up
  const costValue = offeredCards.reduce((sum, card) => sum + card.baseValue, 0);

  // Trader accepts if they perceive value is higher than cost
  const acceptanceThreshold = 0.95; // Will accept if perceived value is 95%+ of cost

  if (perceivedValue >= costValue * acceptanceThreshold) {
    return {
      accepted: true,
      message: `${trader.name}: "Deal! I like what you're offering."`,
    };
  } else if (perceivedValue >= costValue * 0.75) {
    return {
      accepted: false,
      message: `${trader.name}: "Hmm, close but not quite. I need more value."`,
    };
  } else {
    return {
      accepted: false,
      message: `${trader.name}: "Sorry, that's not a good deal for me."`,
    };
  }
}

// Execute a trade (swap cards between player and trader)
export function executeTrade(gameState, trade) {
  const newState = { ...gameState };

  // Find the trader
  const traderIndex = newState.traders.findIndex(t => t.id === trade.traderId);
  if (traderIndex === -1) return gameState;

  const trader = { ...newState.traders[traderIndex] };

  // Remove requested cards from player's collection
  const requestedCardIds = trade.requestedCards.map(c => c.id);
  newState.cards = newState.cards.filter(card => !requestedCardIds.includes(card.id));

  // Add offered cards to player's collection
  newState.cards = [...newState.cards, ...trade.offeredCards];

  // Remove offered cards from trader's collection
  const offeredCardIds = trade.offeredCards.map(c => c.id);
  trader.collection = trader.collection.filter(card => !offeredCardIds.includes(card.id));

  // Add requested cards to trader's collection
  trader.collection = [...trader.collection, ...trade.requestedCards];

  // Record trade in history
  const tradeRecord = {
    id: trade.id,
    traderId: trade.traderId,
    offeredCards: trade.offeredCards,
    requestedCards: trade.requestedCards,
    completedAt: Date.now(),
  };

  trader.tradeHistory = [...trader.tradeHistory, tradeRecord];
  newState.tradeHistory = [...(newState.tradeHistory || []), tradeRecord];

  // Update trader in array
  newState.traders[traderIndex] = trader;

  // Award XP for completing trade
  const tradeValue = trade.offeredValue + trade.requestedValue;
  const xpGained = Math.floor(tradeValue / 100);

  return {
    ...newState,
    xp: newState.xp + xpGained,
    tradesCompleted: (newState.tradesCompleted || 0) + 1,
  };
}

// Generate new offers from traders (called periodically)
export function refreshTraderOffers(gameState) {
  const newState = { ...gameState };
  const now = Date.now();

  // Each trader has a chance to make a new offer
  newState.traders = newState.traders.map(trader => {
    // Traders make offers periodically (30% chance each time this is called)
    const timeSinceLastOffer = now - (trader.lastOfferTime || 0);
    const minTimeBetweenOffers = 60000; // 1 minute minimum

    // 30% chance to make offer if enough time has passed
    if (timeSinceLastOffer >= minTimeBetweenOffers && Math.random() < 0.3) {
      const offer = generateTradeOffer(trader, gameState.cards);

      if (offer) {
        return {
          ...trader,
          activeOffers: [...trader.activeOffers, offer],
          lastOfferTime: now,
        };
      }
    }

    return trader;
  });

  return newState;
}

// Create a counter-offer (player proposes different cards)
export function createCounterOffer(originalTrade, newOfferedCards, newRequestedCards) {
  return {
    ...originalTrade,
    id: `counter_${Date.now()}_${Math.random()}`,
    offeredCards: newRequestedCards, // Swap perspective (from trader's view)
    requestedCards: newOfferedCards, // Swap perspective
    status: 'countered',
    isCounterOffer: true,
    originalTradeId: originalTrade.id,
  };
}
