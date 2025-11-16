// AI Traders with unique personalities and trading preferences

export const TRADER_PERSONALITIES = {
  RARITY_HUNTER: 'rarity_hunter',     // Loves high rarity cards
  CLUB_COLLECTOR: 'club_collector',   // Wants specific clubs
  POSITION_SPECIALIST: 'position_specialist', // Focuses on positions
  NATION_PATRIOT: 'nation_patriot',   // Collects specific nations
  BARGAIN_HUNTER: 'bargain_hunter',   // Looks for undervalued cards
  COMPLETIONIST: 'completionist',     // Wants variety
};

export const AI_TRADERS = [
  {
    id: 'trader_1',
    name: 'Marcus "The Collector" Chen',
    avatar: '🎩',
    personality: TRADER_PERSONALITIES.RARITY_HUNTER,
    bio: 'Only the finest cards for my collection. I pay well for quality.',
    preferences: {
      rarities: ['Gold', 'Platinum', 'Icon'], // Rarities they want
      minRating: 85, // Minimum card rating
      valuationMultiplier: 1.2, // How much they value cards they want (20% premium)
    },
    unlockLevel: 1,
  },
  {
    id: 'trader_2',
    name: 'Sophie "La Liga Fanatic" Rodriguez',
    avatar: '⚽',
    personality: TRADER_PERSONALITIES.CLUB_COLLECTOR,
    bio: 'I only care about Spanish clubs. Real Madrid, Barcelona, Atlético... bring them to me!',
    preferences: {
      clubs: ['Real Madrid', 'Barcelona', 'Atlético Madrid', 'Sevilla'],
      valuationMultiplier: 1.3,
    },
    unlockLevel: 1,
  },
  {
    id: 'trader_3',
    name: 'Big Tony "The Striker"',
    avatar: '🎯',
    personality: TRADER_PERSONALITIES.POSITION_SPECIALIST,
    bio: 'Strikers win games. I need forwards who can score.',
    preferences: {
      positions: ['ST'],
      minRating: 80,
      valuationMultiplier: 1.25,
    },
    unlockLevel: 3,
  },
  {
    id: 'trader_4',
    name: 'Emma "Three Lions" Wright',
    avatar: '🦁',
    personality: TRADER_PERSONALITIES.NATION_PATRIOT,
    bio: 'English players only. It\'s coming home!',
    preferences: {
      nations: ['England'],
      valuationMultiplier: 1.4, // Really values English cards
    },
    unlockLevel: 3,
  },
  {
    id: 'trader_5',
    name: 'Viktor "The Wall" Petrov',
    avatar: '🧤',
    personality: TRADER_PERSONALITIES.POSITION_SPECIALIST,
    bio: 'Defense wins championships. Goalkeepers and defenders are my passion.',
    preferences: {
      positions: ['GK', 'DEF'],
      minRating: 82,
      valuationMultiplier: 1.3,
    },
    unlockLevel: 5,
  },
  {
    id: 'trader_6',
    name: 'Carlos "El Cheapskate" Santos',
    avatar: '💰',
    personality: TRADER_PERSONALITIES.BARGAIN_HUNTER,
    bio: 'I look for value. Your trash might be my treasure.',
    preferences: {
      rarities: ['Bronze', 'Silver'],
      valuationMultiplier: 0.9, // Actually values lower than market
    },
    unlockLevel: 1,
  },
  {
    id: 'trader_7',
    name: 'Yuki "The Completionist" Tanaka',
    avatar: '📚',
    personality: TRADER_PERSONALITIES.COMPLETIONIST,
    bio: 'I want one of everything. Variety is the spice of life!',
    preferences: {
      valuationMultiplier: 1.1,
      wantsDiversity: true, // Special flag
    },
    unlockLevel: 7,
  },
  {
    id: 'trader_8',
    name: 'Isabella "Serie A Queen" Romano',
    avatar: '👑',
    personality: TRADER_PERSONALITIES.CLUB_COLLECTOR,
    bio: 'Italian football is art. Juventus, Milan, Inter... perfection.',
    preferences: {
      clubs: ['Juventus', 'AC Milan', 'Inter Milan', 'Napoli'],
      valuationMultiplier: 1.35,
    },
    unlockLevel: 5,
  },
  {
    id: 'trader_9',
    name: 'Hans "Der Bundesliga" Müller',
    avatar: '🍺',
    personality: TRADER_PERSONALITIES.CLUB_COLLECTOR,
    bio: 'German efficiency on the pitch. Bayern, Dortmund, and the rest.',
    preferences: {
      clubs: ['Bayern Munich', 'Borussia Dortmund', 'RB Leipzig'],
      valuationMultiplier: 1.3,
    },
    unlockLevel: 5,
  },
  {
    id: 'trader_10',
    name: 'The Mysterious "Icon Whisperer"',
    avatar: '🎭',
    personality: TRADER_PERSONALITIES.RARITY_HUNTER,
    bio: 'Legends only. If it\'s not Icon or Platinum, don\'t waste my time.',
    preferences: {
      rarities: ['Platinum', 'Icon'],
      minRating: 90,
      valuationMultiplier: 1.5, // Pays premium for icons
    },
    unlockLevel: 10,
  },
  {
    id: 'trader_11',
    name: 'Pierre "Le Français" Dubois',
    avatar: '🥖',
    personality: TRADER_PERSONALITIES.NATION_PATRIOT,
    bio: 'Vive la France! French players are the best in the world.',
    preferences: {
      nations: ['France'],
      valuationMultiplier: 1.35,
    },
    unlockLevel: 7,
  },
  {
    id: 'trader_12',
    name: 'Diego "Samba King" Silva',
    avatar: '🇧🇷',
    personality: TRADER_PERSONALITIES.NATION_PATRIOT,
    bio: 'Brazilian flair, Brazilian magic. Nothing beats the Seleção.',
    preferences: {
      nations: ['Brazil'],
      valuationMultiplier: 1.4,
    },
    unlockLevel: 7,
  },
];

// Helper function to get traders available at a certain level
export function getAvailableTraders(playerLevel) {
  return AI_TRADERS.filter(trader => trader.unlockLevel <= playerLevel);
}

// Helper function to check if a card matches trader's preferences
export function traderWantsCard(trader, card) {
  const prefs = trader.preferences;

  // Check rarities
  if (prefs.rarities && !prefs.rarities.includes(card.rarity)) {
    return false;
  }

  // Check minimum rating
  if (prefs.minRating && card.rating < prefs.minRating) {
    return false;
  }

  // Check positions
  if (prefs.positions && !prefs.positions.includes(card.position)) {
    return false;
  }

  // Check clubs
  if (prefs.clubs && !prefs.clubs.includes(card.club)) {
    return false;
  }

  // Check nations
  if (prefs.nations && !prefs.nations.includes(card.nation)) {
    return false;
  }

  return true;
}

// Calculate how much a trader values a specific card
export function getTraderValuation(trader, card) {
  const baseValue = card.baseValue;

  if (traderWantsCard(trader, card)) {
    return Math.floor(baseValue * trader.preferences.valuationMultiplier);
  }

  // If trader doesn't specifically want it, they value it less
  return Math.floor(baseValue * 0.8);
}
