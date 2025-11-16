// Market event types that create price fluctuations
export const EVENT_TYPES = {
  PLAYER_HATTRICK: 'PLAYER_HATTRICK',
  TEAM_WIN: 'TEAM_WIN',
  POSITION_DEMAND: 'POSITION_DEMAND',
  NATION_HYPE: 'NATION_HYPE',
  SUPPLY_FLOOD: 'SUPPLY_FLOOD',
  COLLECTOR_QUEST: 'COLLECTOR_QUEST',
  RATING_BOOST: 'RATING_BOOST',
  MARKET_CRASH: 'MARKET_CRASH'
};

// Event templates
const EVENT_TEMPLATES = [
  {
    type: EVENT_TYPES.PLAYER_HATTRICK,
    generateEvent: (clubs) => {
      const club = clubs[Math.floor(Math.random() * clubs.length)];
      return {
        type: EVENT_TYPES.PLAYER_HATTRICK,
        title: '🔥 Hat-Trick Hero!',
        description: `A ${club} player just scored a hat-trick! Their cards are in high demand!`,
        filter: (card) => card.club === club,
        priceMultiplier: 1.5,
        duration: 3, // lasts 3 shop visits/actions
        icon: '⚡'
      };
    }
  },

  {
    type: EVENT_TYPES.TEAM_WIN,
    generateEvent: (clubs) => {
      const club = clubs[Math.floor(Math.random() * clubs.length)];
      return {
        type: EVENT_TYPES.TEAM_WIN,
        title: '🏆 Championship Victory!',
        description: `${club} just won the championship! Prices for their players are surging!`,
        filter: (card) => card.club === club,
        priceMultiplier: 1.4,
        duration: 2,
        icon: '📈'
      };
    }
  },

  {
    type: EVENT_TYPES.POSITION_DEMAND,
    generateEvent: (_clubs, _nations, positions) => {
      const position = positions[Math.floor(Math.random() * positions.length)];
      const positionNames = { GK: 'Goalkeepers', DEF: 'Defenders', MID: 'Midfielders', ST: 'Strikers' };
      return {
        type: EVENT_TYPES.POSITION_DEMAND,
        title: '📊 High Demand Alert!',
        description: `${positionNames[position]} are in high demand! Shops paying premium prices!`,
        filter: (card) => card.position === position,
        priceMultiplier: 1.35,
        duration: 2,
        icon: '💰'
      };
    }
  },

  {
    type: EVENT_TYPES.NATION_HYPE,
    generateEvent: (_clubs, nations) => {
      const nation = nations[Math.floor(Math.random() * nations.length)];
      return {
        type: EVENT_TYPES.NATION_HYPE,
        title: '🌍 World Cup Hype!',
        description: `${nation} is performing well in the tournament! National team prices soaring!`,
        filter: (card) => card.nation === nation,
        priceMultiplier: 1.45,
        duration: 3,
        icon: '🎯'
      };
    }
  },

  {
    type: EVENT_TYPES.SUPPLY_FLOOD,
    generateEvent: (clubs) => {
      const club = clubs[Math.floor(Math.random() * clubs.length)];
      return {
        type: EVENT_TYPES.SUPPLY_FLOOD,
        title: '📦 Market Flood!',
        description: `New ${club} card shipment arrived! Market flooded - prices crashed!`,
        filter: (card) => card.club === club,
        priceMultiplier: 0.65,
        duration: 2,
        icon: '📉'
      };
    }
  },

  {
    type: EVENT_TYPES.COLLECTOR_QUEST,
    generateEvent: (_clubs, nations) => {
      const nation = nations[Math.floor(Math.random() * nations.length)];
      return {
        type: EVENT_TYPES.COLLECTOR_QUEST,
        title: '🔍 Collector\'s Quest!',
        description: `A wealthy collector is trying to complete a ${nation} set! Paying top dollar!`,
        filter: (card) => card.nation === nation,
        priceMultiplier: 1.6,
        duration: 2,
        icon: '💎'
      };
    }
  },

  {
    type: EVENT_TYPES.RATING_BOOST,
    generateEvent: () => {
      const threshold = 80 + Math.floor(Math.random() * 10);
      return {
        type: EVENT_TYPES.RATING_BOOST,
        title: '⭐ Elite Players Rising!',
        description: `High-rated players (${threshold}+) are trending! Collectors going crazy!`,
        filter: (card) => card.rating >= threshold,
        priceMultiplier: 1.55,
        duration: 3,
        icon: '🌟'
      };
    }
  },

  {
    type: EVENT_TYPES.MARKET_CRASH,
    generateEvent: () => {
      return {
        type: EVENT_TYPES.MARKET_CRASH,
        title: '💥 Market Crash!',
        description: 'Economic crisis! All card prices have dropped significantly!',
        filter: () => true, // affects all cards
        priceMultiplier: 0.70,
        duration: 2,
        icon: '⚠️'
      };
    }
  }
];

// Generate a random market event
export const generateMarketEvent = (clubs, nations, positions) => {
  // 30% chance of no event (stable market)
  if (Math.random() < 0.30) {
    return null;
  }

  const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
  return template.generateEvent(clubs, nations, positions);
};

// Calculate price modifier for a card based on active events
export const getCardPriceModifier = (card, activeEvents) => {
  if (!activeEvents || activeEvents.length === 0) {
    return 1.0; // No modifier
  }

  let modifier = 1.0;

  // Apply all active event modifiers that affect this card
  for (const event of activeEvents) {
    if (event.filter(card)) {
      modifier *= event.priceMultiplier;
    }
  }

  return modifier;
};

// Tick down event durations
export const tickEventDurations = (events) => {
  return events
    .map(event => ({
      ...event,
      duration: event.duration - 1
    }))
    .filter(event => event.duration > 0);
};
