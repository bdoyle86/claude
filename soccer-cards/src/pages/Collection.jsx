import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collectionService } from '../api/services';

const Collection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    loadCollection();
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [selectedRarity, sortBy, cards]);

  const loadCollection = async () => {
    try {
      const data = await collectionService.getCollection();
      setCards(data.cards);
    } catch (err) {
      console.error('Failed to load collection:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSort = () => {
    let filtered = [...cards];

    // Filter by rarity
    if (selectedRarity !== 'All') {
      filtered = filtered.filter(card => card.rarity === selectedRarity);
    }

    // Sort
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.player_name.localeCompare(b.player_name));
    } else if (sortBy === 'rarity') {
      const rarityOrder = { 'Epic': 1, 'Rare': 2, 'Common': 3 };
      filtered.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    }

    setFilteredCards(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="text-white text-xl">Loading collection...</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark/95 backdrop-blur-sm overflow-x-hidden">
      <main className="flex-1 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 pb-2 bg-background-dark/80 backdrop-blur-sm">
          <button
            onClick={() => navigate('/home')}
            className="flex size-12 shrink-0 items-center justify-start"
          >
            <span className="material-symbols-outlined text-white text-3xl">arrow_back_ios_new</span>
          </button>
          <h2 className="flex-1 text-center text-2xl font-bungee leading-tight tracking-[-0.015em] text-white text-outline-black uppercase">
            My Collection
          </h2>
          <div className="flex w-12 items-center justify-end">
            <p className="shrink-0 text-xs font-bold leading-normal tracking-[0.015em] text-gray-400">
              {filteredCards.length}/{cards.length}
            </p>
          </div>
        </div>

        {/* Filter/Sort Controls */}
        <div className="sticky top-[72px] z-10 flex flex-wrap gap-3 p-4 bg-background-dark/80 backdrop-blur-sm">
          <button
            onClick={() => setSortBy('name')}
            className={`flex h-12 flex-1 items-center justify-center gap-x-2 rounded-lg border-2 ${
              sortBy === 'name' ? 'bg-primary/20 border-primary' : 'bg-gray-800 border-gray-700 hover:border-primary'
            }`}
          >
            <span className="material-symbols-outlined text-primary text-xl">sort_by_alpha</span>
            <p className="text-sm font-bold uppercase leading-normal text-white">Sort A-Z</p>
          </button>
          <button
            onClick={() => setSortBy('rarity')}
            className={`flex h-12 flex-1 items-center justify-center gap-x-2 rounded-lg border-2 ${
              sortBy === 'rarity' ? 'bg-primary/20 border-primary' : 'bg-gray-800 border-gray-700 hover:border-primary'
            }`}
          >
            <span className="material-symbols-outlined text-primary text-xl">filter_list</span>
            <p className="text-sm font-bold uppercase leading-normal text-white">Rarity</p>
          </button>
        </div>

        {/* Rarity Filter Pills */}
        <div className="flex gap-2 p-4 pt-0 flex-wrap">
          {['All', 'Epic', 'Rare', 'Common'].map(rarity => (
            <button
              key={rarity}
              onClick={() => setSelectedRarity(rarity)}
              className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full pl-4 pr-4 ${
                selectedRarity === rarity
                  ? 'bg-primary text-black'
                  : rarity === 'Epic'
                  ? 'bg-accent-purple/20 border border-accent-purple text-accent-purple'
                  : rarity === 'Rare'
                  ? 'bg-accent-blue/20 border border-accent-blue text-accent-blue'
                  : 'bg-gray-800 border border-gray-600 text-gray-300'
              }`}
            >
              <p className="text-xs font-bold leading-normal uppercase tracking-wider">{rarity}</p>
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        {filteredCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center mt-8">
            <span className="material-symbols-outlined text-7xl text-gray-600">sentiment_dissatisfied</span>
            <h3 className="text-xl font-bold text-white">No Cards Found!</h3>
            <p className="text-gray-400">
              {cards.length === 0
                ? "You don't have any cards yet. Start opening packs!"
                : "No cards match this filter."}
            </p>
            <button
              onClick={() => navigate('/packs')}
              className="mt-4 flex h-12 items-center justify-center gap-x-2 rounded-lg bg-primary px-6"
            >
              <p className="text-base font-bold leading-normal text-black">Open Packs</p>
              <span className="material-symbols-outlined text-black">arrow_forward</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-4 p-4">
            {filteredCards.map(card => (
              <div
                key={card.id}
                onClick={() => navigate(`/card/${card.id}`)}
                className="group relative bg-cover bg-center flex flex-col justify-end aspect-[3/4] overflow-hidden card-clip border-2 shadow-lg cursor-pointer hover:scale-105 transition-transform"
                style={{
                  backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 60%), url("${card.image_url}")`,
                  borderColor: card.rarity === 'Epic' ? '#BE38F3' : card.rarity === 'Rare' ? '#38BDF3' : '#666',
                  boxShadow: card.rarity === 'Epic' ? '0 4px 20px rgba(190, 56, 243, 0.2)' : card.rarity === 'Rare' ? '0 4px 20px rgba(56, 189, 243, 0.2)' : 'none'
                }}
              >
                <div
                  className="absolute top-2 -right-1 flex items-center justify-center tag-clip px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm uppercase tracking-wider"
                  style={{
                    backgroundColor: card.rarity === 'Epic' ? '#BE38F3' : card.rarity === 'Rare' ? '#38BDF3' : '#666'
                  }}
                >
                  {card.rarity}
                </div>
                {card.quantity > 1 && (
                  <div className="absolute top-2 left-2 bg-black/70 rounded-full px-2 py-1 text-xs font-bold text-white">
                    x{card.quantity}
                  </div>
                )}
                <div className="p-3">
                  <p className="text-white text-base font-black leading-tight line-clamp-2 uppercase">{card.player_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Collection;
