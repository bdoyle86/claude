import { generateMarketEvent, getCardPriceModifier, tickEventDurations } from '../data/events.js';
import { CLUBS, NATIONS, POSITIONS, generateCard } from '../data/cards.js';
import { SHOPS } from '../data/shops.js';

// Generate shop inventory (cards available to buy)
export const generateShopInventory = (shopId, cardCount = 12) => {
  const shop = SHOPS[shopId];
  if (!shop) return [];

  const inventory = [];

  // Generate cards matching shop specialty
  for (let i = 0; i < cardCount; i++) {
    // Pick a random rarity from shop specialty
    const rarity = shop.specialty[Math.floor(Math.random() * shop.specialty.length)];
    const card = generateCard(rarity);

    inventory.push({
      ...card,
      shopId,
      generatedAt: Date.now()
    });
  }

  return inventory;
};

// Refresh shop inventory (simulate new stock)
export const refreshShopInventory = (currentInventory, shopId, refreshPercent = 0.3) => {
  const shop = SHOPS[shopId];
  if (!shop) return currentInventory;

  // Keep some cards, refresh others
  const cardsToKeep = Math.floor(currentInventory.length * (1 - refreshPercent));
  const cardsToRefresh = currentInventory.length - cardsToKeep;

  // Shuffle and keep some cards
  const shuffled = [...currentInventory].sort(() => Math.random() - 0.5);
  const keptCards = shuffled.slice(0, cardsToKeep);

  // Generate new cards
  const newCards = [];
  for (let i = 0; i < cardsToRefresh; i++) {
    const rarity = shop.specialty[Math.floor(Math.random() * shop.specialty.length)];
    const card = generateCard(rarity);
    newCards.push({
      ...card,
      shopId,
      generatedAt: Date.now()
    });
  }

  return [...keptCards, ...newCards];
};

// Generate new market event
export const triggerMarketEvent = (gameState) => {
  // Tick down existing events
  const updatedEvents = tickEventDurations(gameState.activeEvents);

  // Random chance to generate new event
  const shouldGenerateEvent = Math.random() < 0.40; // 40% chance

  if (shouldGenerateEvent) {
    const newEvent = generateMarketEvent(CLUBS, NATIONS, POSITIONS);
    if (newEvent) {
      return {
        ...gameState,
        activeEvents: [...updatedEvents, newEvent]
      };
    }
  }

  return {
    ...gameState,
    activeEvents: updatedEvents
  };
};

// Get card prices at a shop
export const getCardPrices = (card, shopId, activeEvents) => {
  const shop = SHOPS[shopId];
  if (!shop) {
    return { buyPrice: 0, sellPrice: 0 };
  }

  // Calculate market modifier from active events
  const marketModifier = getCardPriceModifier(card, activeEvents);

  // Get prices from shop
  const buyPrice = shop.getBuyPrice(card, marketModifier);
  const sellPrice = shop.getSellPrice(card, marketModifier);

  return { buyPrice, sellPrice, marketModifier };
};

// Get all prices for a card across all shops
export const getCardPricesAllShops = (card, availableShops, activeEvents) => {
  const prices = {};

  for (const shop of availableShops) {
    const { buyPrice, sellPrice, marketModifier } = getCardPrices(
      card,
      shop.id,
      activeEvents
    );

    prices[shop.id] = {
      shopName: shop.name,
      buyPrice,
      sellPrice,
      marketModifier
    };
  }

  return prices;
};

// Find best place to sell a card
export const findBestShopToSell = (card, availableShops, activeEvents) => {
  let bestShop = null;
  let bestPrice = 0;

  for (const shop of availableShops) {
    const { buyPrice } = getCardPrices(card, shop.id, activeEvents);

    if (buyPrice > bestPrice) {
      bestPrice = buyPrice;
      bestShop = shop;
    }
  }

  return { shop: bestShop, price: bestPrice };
};

// Find best place to buy a card (lowest price)
export const findBestShopToBuy = (card, availableShops, activeEvents) => {
  let bestShop = null;
  let bestPrice = Infinity;

  for (const shop of availableShops) {
    const { sellPrice } = getCardPrices(card, shop.id, activeEvents);

    if (sellPrice > 0 && sellPrice < bestPrice) {
      bestPrice = sellPrice;
      bestShop = shop;
    }
  }

  return { shop: bestShop, price: bestPrice };
};

// Calculate potential profit for arbitrage
export const calculateArbitragePotential = (card, availableShops, activeEvents) => {
  const buyOpportunity = findBestShopToBuy(card, availableShops, activeEvents);
  const sellOpportunity = findBestShopToSell(card, availableShops, activeEvents);

  if (buyOpportunity.price === Infinity || sellOpportunity.price === 0) {
    return null;
  }

  const profit = sellOpportunity.price - buyOpportunity.price;
  const profitPercent = (profit / buyOpportunity.price) * 100;

  return {
    buyFrom: buyOpportunity.shop,
    buyPrice: buyOpportunity.price,
    sellTo: sellOpportunity.shop,
    sellPrice: sellOpportunity.price,
    profit,
    profitPercent
  };
};

// Get market summary statistics
export const getMarketSummary = (availableShops, activeEvents) => {
  return {
    activeEvents: activeEvents.length,
    availableShops: availableShops.length,
    marketVolatility: activeEvents.length > 0 ? 'High' : 'Normal'
  };
};
