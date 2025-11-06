import { RARITIES } from './cards.js';

// Shop definitions
export const SHOPS = {
  LOCAL_PITCH: {
    id: 'LOCAL_PITCH',
    name: 'The Local Pitch',
    description: 'A friendly neighborhood shop that deals in common cards',
    specialty: ['BRONZE', 'SILVER'],
    unlockLevel: 1,
    icon: '⚽',

    // Calculate buy price (what shop pays you)
    getBuyPrice: (card, marketMod = 1) => {
      // This shop won't buy high-tier cards
      if (!['BRONZE', 'SILVER'].includes(card.rarity)) {
        return 0; // Won't buy
      }

      // Base: 60% of base value
      let price = card.baseValue * 0.60;

      // Apply market modifier
      price *= marketMod;

      return Math.floor(price);
    },

    // Calculate sell price (what you pay shop)
    getSellPrice: (card, marketMod = 1) => {
      if (!['BRONZE', 'SILVER'].includes(card.rarity)) {
        return 0; // Doesn't sell
      }

      // Base: 140% of base value
      let price = card.baseValue * 1.40;

      // Apply market modifier
      price *= marketMod;

      return Math.floor(price);
    }
  },

  CHAMPIONS_HALL: {
    id: 'CHAMPIONS_HALL',
    name: "Champions' Hall",
    description: 'An exclusive shop dealing only in rare and valuable cards',
    specialty: ['GOLD', 'PLATINUM'],
    unlockLevel: 5,
    icon: '🏆',

    getBuyPrice: (card, marketMod = 1) => {
      if (!['GOLD', 'PLATINUM'].includes(card.rarity)) {
        return 0;
      }

      // Base: 70% of base value (better than Local Pitch)
      let price = card.baseValue * 0.70;
      price *= marketMod;

      return Math.floor(price);
    },

    getSellPrice: (card, marketMod = 1) => {
      if (!['GOLD', 'PLATINUM'].includes(card.rarity)) {
        return 0;
      }

      // Base: 130% of base value
      let price = card.baseValue * 1.30;
      price *= marketMod;

      return Math.floor(price);
    }
  },

  COLLECTORS_CORNER: {
    id: 'COLLECTORS_CORNER',
    name: "The Collector's Corner",
    description: 'A mysterious shop with volatile prices and legendary cards',
    specialty: ['PLATINUM', 'ICON'],
    unlockLevel: 10,
    icon: '💎',

    getBuyPrice: (card, marketMod = 1) => {
      if (!['PLATINUM', 'ICON'].includes(card.rarity)) {
        return 0;
      }

      // Base: 75% of base value
      // This shop has MORE volatile prices (marketMod has bigger impact)
      let price = card.baseValue * 0.75;

      // Double the market modifier effect for volatility
      const volatileModifier = 1 + (marketMod - 1) * 2;
      price *= volatileModifier;

      return Math.floor(price);
    },

    getSellPrice: (card, marketMod = 1) => {
      if (!['PLATINUM', 'ICON'].includes(card.rarity)) {
        return 0;
      }

      // Base: 125% of base value
      let price = card.baseValue * 1.25;

      // Double the market modifier effect
      const volatileModifier = 1 + (marketMod - 1) * 2;
      price *= volatileModifier;

      return Math.floor(price);
    }
  },

  BOOT_ROOM: {
    id: 'BOOT_ROOM',
    name: 'The Boot Room',
    description: 'A pawn shop that buys anything... but at terrible prices',
    specialty: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'ICON'],
    unlockLevel: 1,
    icon: '🥾',

    getBuyPrice: (card, marketMod = 1) => {
      // Buys ANY card, but at 50% of base value
      let price = card.baseValue * 0.50;
      price *= marketMod;

      return Math.floor(price);
    },

    getSellPrice: (card, marketMod = 1) => {
      // Sells at high markup (180% of base value)
      let price = card.baseValue * 1.80;
      price *= marketMod;

      return Math.floor(price);
    }
  }
};

// Get available shops based on level
export const getAvailableShops = (level) => {
  return Object.values(SHOPS).filter(shop => level >= shop.unlockLevel);
};

// Get inventory for a shop (cards available to buy)
export const getShopInventory = (shopId, allCards, count = 10) => {
  const shop = SHOPS[shopId];
  if (!shop) return [];

  // Filter cards by shop specialty
  const availableCards = allCards.filter(card =>
    shop.specialty.includes(card.rarity)
  );

  // Return random selection
  return availableCards
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
};
