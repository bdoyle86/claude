// Card rarities and their drop rates
export const RARITIES = {
  BRONZE: { name: 'Bronze', chance: 0.60, color: '#CD7F32', tier: 1 },
  SILVER: { name: 'Silver', chance: 0.25, color: '#C0C0C0', tier: 2 },
  GOLD: { name: 'Gold', chance: 0.10, color: '#FFD700', tier: 3 },
  PLATINUM: { name: 'Platinum', chance: 0.04, color: '#E5E4E2', tier: 4 },
  ICON: { name: 'Icon', chance: 0.01, color: '#FF1493', tier: 5 }
};

// Card positions
export const POSITIONS = ['GK', 'DEF', 'MID', 'ST'];

// Clubs and nations for variety
export const CLUBS = [
  'Manchester City', 'Real Madrid', 'Barcelona', 'Bayern Munich',
  'Liverpool', 'PSG', 'Chelsea', 'Arsenal', 'Juventus', 'AC Milan',
  'Inter Milan', 'Atletico Madrid', 'Borussia Dortmund', 'Ajax',
  'Manchester United', 'Tottenham', 'Porto', 'Benfica'
];

export const NATIONS = [
  'England', 'Spain', 'France', 'Germany', 'Brazil', 'Argentina',
  'Portugal', 'Netherlands', 'Italy', 'Belgium', 'Croatia', 'Uruguay'
];

// Player name pools by position
const PLAYER_NAMES = {
  GK: [
    'David Martinez', 'Alex Johnson', 'Marco Santos', 'Luca Romano',
    'Pierre Dubois', 'Jan Kowalski', 'Carlos Silva', 'Ahmed Hassan'
  ],
  DEF: [
    'Marcus Williams', 'Diego Torres', 'Lucas Fischer', 'Antonio Rossi',
    'Jean Martin', 'Pablo Garcia', 'Miguel Fernandez', 'Bruno Costa',
    'Matteo Bianchi', 'Andre Silva', 'Roberto Lopez', 'Stefan Mueller'
  ],
  MID: [
    'James Anderson', 'Carlos Rodriguez', 'Thomas Schneider', 'Marco Verratti',
    'Antoine Giroud', 'Pedro Martinez', 'Luis Hernandez', 'Kevin De Bruyne',
    'Sergio Ramirez', 'Francesco Totti', 'Andres Santos', 'Luka Modric'
  ],
  ST: [
    'Cristiano Silva', 'Lionel Garcia', 'Kylian Johnson', 'Erling Hansen',
    'Robert Williams', 'Harry Taylor', 'Karim Benzema', 'Gabriel Jesus',
    'Romelu Lukaku', 'Alexis Sanchez', 'Edinson Cavani', 'Luis Suarez'
  ]
};

// Generate card ID
let cardIdCounter = 1;
const generateCardId = () => `card_${cardIdCounter++}`;

// Calculate base value based on rarity and rating
const calculateBaseValue = (rarity, rating) => {
  const rarityMultipliers = {
    BRONZE: 100,
    SILVER: 500,
    GOLD: 2000,
    PLATINUM: 10000,
    ICON: 50000
  };

  const baseValue = rarityMultipliers[rarity];
  const ratingBonus = (rating - 50) * 10;
  return baseValue + ratingBonus;
};

// Generate a random card based on rarity
export const generateCard = (rarity = null) => {
  // If no rarity specified, pick one based on drop rates
  if (!rarity) {
    const roll = Math.random();
    let cumulative = 0;

    for (const [rarityKey, rarityData] of Object.entries(RARITIES)) {
      cumulative += rarityData.chance;
      if (roll <= cumulative) {
        rarity = rarityKey;
        break;
      }
    }
  }

  // Pick random attributes
  const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  const name = PLAYER_NAMES[position][Math.floor(Math.random() * PLAYER_NAMES[position].length)];
  const club = CLUBS[Math.floor(Math.random() * CLUBS.length)];
  const nation = NATIONS[Math.floor(Math.random() * NATIONS.length)];

  // Generate rating based on rarity
  const ratingRanges = {
    BRONZE: [50, 65],
    SILVER: [66, 75],
    GOLD: [76, 85],
    PLATINUM: [86, 92],
    ICON: [93, 99]
  };

  const [minRating, maxRating] = ratingRanges[rarity];
  const rating = Math.floor(Math.random() * (maxRating - minRating + 1)) + minRating;

  const card = {
    id: generateCardId(),
    name,
    club,
    nation,
    position,
    rarity,
    rating,
    baseValue: calculateBaseValue(rarity, rating),
    acquiredAt: Date.now()
  };

  return card;
};

// Generate a starter pack (5 cards, mostly bronze)
export const generateStarterPack = () => {
  return [
    generateCard('BRONZE'),
    generateCard('BRONZE'),
    generateCard('BRONZE'),
    generateCard('BRONZE'),
    generateCard('SILVER')
  ];
};

// Get card display color
export const getCardColor = (rarity) => {
  return RARITIES[rarity]?.color || '#808080';
};

// Get card rarity name
export const getRarityName = (rarity) => {
  return RARITIES[rarity]?.name || 'Unknown';
};
