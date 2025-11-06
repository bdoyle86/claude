import { generateCard } from './cards.js';

// Pack definitions
export const PACKS = {
  STARTER: {
    id: 'STARTER',
    name: 'Starter Pack',
    price: 1000,
    cardCount: 5,
    description: 'Basic pack with mostly common cards',
    minRarity: 'BRONZE',
    guaranteedRarities: ['BRONZE', 'BRONZE', 'BRONZE', 'BRONZE', 'SILVER']
  },

  STANDARD: {
    id: 'STANDARD',
    name: 'Standard Pack',
    price: 2500,
    cardCount: 5,
    description: 'Standard pack with a chance at rare cards',
    minRarity: 'BRONZE',
    guaranteedRarities: null // Random based on drop rates
  },

  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium Pack',
    price: 7500,
    cardCount: 7,
    description: 'Premium pack with guaranteed Gold card',
    minRarity: 'SILVER',
    guaranteedRarities: ['SILVER', 'SILVER', 'SILVER', 'SILVER', 'GOLD', null, null]
  },

  ELITE: {
    id: 'ELITE',
    name: 'Elite Pack',
    price: 20000,
    cardCount: 10,
    description: 'Elite pack with guaranteed Platinum card',
    minRarity: 'GOLD',
    guaranteedRarities: ['GOLD', 'GOLD', 'GOLD', 'GOLD', 'GOLD', 'PLATINUM', null, null, null, null]
  },

  ICON: {
    id: 'ICON',
    name: 'Icon Pack',
    price: 100000,
    cardCount: 5,
    description: 'Legendary pack with guaranteed Icon card',
    minRarity: 'PLATINUM',
    guaranteedRarities: ['PLATINUM', 'PLATINUM', 'PLATINUM', 'PLATINUM', 'ICON']
  }
};

// Open a pack and generate cards
export const openPack = (packType) => {
  const pack = PACKS[packType];
  if (!pack) return [];

  const cards = [];

  if (pack.guaranteedRarities) {
    // Generate cards based on guaranteed rarities
    for (const rarity of pack.guaranteedRarities) {
      cards.push(generateCard(rarity)); // null will generate random based on drop rates
    }
  } else {
    // Generate completely random cards based on drop rates
    for (let i = 0; i < pack.cardCount; i++) {
      cards.push(generateCard());
    }
  }

  return cards;
};

// Get available packs based on player level
export const getAvailablePacks = (level) => {
  const allPacks = Object.values(PACKS);

  // Unlock packs based on level
  if (level < 3) {
    return allPacks.filter(p => ['STARTER', 'STANDARD'].includes(p.id));
  } else if (level < 7) {
    return allPacks.filter(p => ['STARTER', 'STANDARD', 'PREMIUM'].includes(p.id));
  } else if (level < 15) {
    return allPacks.filter(p => ['STARTER', 'STANDARD', 'PREMIUM', 'ELITE'].includes(p.id));
  } else {
    return allPacks;
  }
};
