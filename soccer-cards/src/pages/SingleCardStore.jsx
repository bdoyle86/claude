import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

const SingleCardStore = () => {
  const navigate = useNavigate();
  const { user, profile, updateUserCoins } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadStoreCards();
  }, []);

  const loadStoreCards = async () => {
    try {
      const { data, error } = await supabase
        .from('store_cards')
        .select(`
          price,
          stock,
          cards (*)
        `)
        .neq('stock', 0)
        .order('cards(rarity)', { ascending: false });

      if (error) throw error;

      // Flatten the data structure - spread card fields and add price/stock
      const flattenedCards = data.map(item => ({
        ...item.cards,
        price: item.price,
        stock: item.stock
      }));

      setCards(flattenedCards);
    } catch (err) {
      setError('Failed to load store cards');
      console.error('Load store cards error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCard = async (cardId, price) => {
    if (!user || !profile) return;

    if (profile.coins < price) {
      setError('Not enough coins!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setBuying(cardId);
    setError('');

    try {
      // Get card details for success message
      const { data: cardData, error: cardError } = await supabase
        .from('cards')
        .select('player_name')
        .eq('id', cardId)
        .single();

      if (cardError) throw cardError;

      // Deduct coins from profile
      const newCoins = profile.coins - price;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: newCoins })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Check if card is already in user's collection
      const { data: existingCard, error: checkError } = await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('card_id', cardId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingCard) {
        // Increment quantity
        const { error: incrementError } = await supabase
          .from('user_cards')
          .update({ quantity: existingCard.quantity + 1 })
          .eq('user_id', user.id)
          .eq('card_id', cardId);

        if (incrementError) throw incrementError;
      } else {
        // Add new card
        const { error: insertError } = await supabase
          .from('user_cards')
          .insert({ user_id: user.id, card_id: cardId, quantity: 1 });

        if (insertError) throw insertError;
      }

      // Update coins in context
      updateUserCoins(newCoins);
      setSuccess(`${cardData.player_name} added to your collection!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to buy card');
      console.error('Buy card error:', err);
      setTimeout(() => setError(''), 3000);
    } finally {
      setBuying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="text-white text-xl">Loading store...</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark text-white overflow-x-hidden pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center p-4 justify-between bg-background-dark/80 backdrop-blur-sm border-b border-white/10">
        <button
          onClick={() => navigate('/home')}
          className="flex size-12 shrink-0 items-center justify-center"
        >
          <span className="material-symbols-outlined text-white text-3xl">arrow_back_ios_new</span>
        </button>
        <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Card Store
        </h2>
        <div className="flex w-auto items-center justify-end rounded-full bg-black/30 px-3 py-1.5">
          <p className="text-[#FFD700] text-base font-bold leading-normal tracking-[0.015em] shrink-0">{profile?.coins || 0}</p>
          <span className="material-symbols-outlined text-[#FFD700] text-xl ml-1">monetization_on</span>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mx-4 mt-4 bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mx-4 mt-4 bg-green-500/20 border border-green-500 text-green-500 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Store Info */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-yellow-500 text-3xl">storefront</span>
            <div>
              <h3 className="text-white font-bold text-lg">Featured Cards</h3>
              <p className="text-white/70 text-sm">Buy specific cards at fixed prices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center mt-8">
          <span className="material-symbols-outlined text-7xl text-gray-600">store</span>
          <h3 className="text-xl font-bold text-white">No Cards Available</h3>
          <p className="text-gray-400">Check back later for new cards!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
          {cards.map(card => {
            const rarityColor = card.rarity === 'Epic' ? '#BE38F3' : card.rarity === 'Rare' ? '#38BDF3' : '#666';

            return (
              <div
                key={card.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-primary/50 transition-colors"
              >
                {/* Card Image */}
                <div
                  className="relative bg-cover bg-center h-48"
                  style={{
                    backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 60%), url("${card.image_url}")`
                  }}
                >
                  <div
                    className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: rarityColor }}
                  >
                    {card.rarity}
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-1">{card.player_name}</h3>
                  {card.club && (
                    <p className="text-white/60 text-sm mb-3">{card.club}</p>
                  )}

                  {/* Price and Buy Button */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent-yellow">monetization_on</span>
                      <span className="text-white font-bold text-xl">{card.price}</span>
                    </div>
                    <button
                      onClick={() => handleBuyCard(card.id, card.price)}
                      disabled={buying === card.id || !profile || profile.coins < card.price}
                      className="flex-1 bg-primary text-background-dark font-bold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {buying === card.id ? 'Buying...' : !profile || profile.coins < card.price ? 'Not Enough Coins' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <BottomNav />
    </div>
  );
};

export default SingleCardStore;
