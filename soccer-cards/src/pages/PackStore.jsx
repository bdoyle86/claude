import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { packService } from '../api/services';

const PackStore = () => {
  const navigate = useNavigate();
  const { user, updateUserCoins } = useAuth();
  const [packs, setPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [openedCards, setOpenedCards] = useState([]);
  const [showCards, setShowCards] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      const data = await packService.getPacks();
      setPacks(data.packs);
      if (data.packs.length > 0) {
        setSelectedPack(data.packs[0]);
      }
    } catch (err) {
      setError('Failed to load packs');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPack = async () => {
    if (!selectedPack) return;
    if (user.coins < selectedPack.price) {
      setError('Not enough coins!');
      return;
    }

    setBuying(true);
    setError('');

    try {
      const data = await packService.buyPack(selectedPack.id);
      setOpenedCards(data.cards);
      updateUserCoins(data.coins);
      setShowCards(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to buy pack');
    } finally {
      setBuying(false);
    }
  };

  const handleCloseCards = () => {
    setShowCards(false);
    setOpenedCards([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (showCards) {
    return (
      <div className="min-h-screen bg-background-dark text-white p-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 mt-8">You Got!</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {openedCards.map((card, index) => (
              <div
                key={index}
                className="relative bg-cover bg-center flex flex-col justify-end aspect-[3/4] overflow-hidden card-clip border-2 shadow-lg animate-fadeIn"
                style={{
                  backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 60%), url("${card.image_url}")`,
                  borderColor: card.rarity === 'Epic' ? '#BE38F3' : card.rarity === 'Rare' ? '#38BDF3' : '#666',
                  animationDelay: `${index * 200}ms`
                }}
              >
                <div className={`absolute top-2 -right-1 flex items-center justify-center tag-clip px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm uppercase tracking-wider`}
                  style={{
                    backgroundColor: card.rarity === 'Epic' ? '#BE38F3' : card.rarity === 'Rare' ? '#38BDF3' : '#666'
                  }}
                >
                  {card.rarity}
                </div>
                <div className="p-3">
                  <p className="text-white text-base font-black leading-tight line-clamp-2 uppercase">{card.player_name}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleCloseCards}
            className="w-full bg-primary text-background-dark font-bold py-4 rounded-lg hover:bg-primary/90 transition-colors"
          >
            CONTINUE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden" style={{
      backgroundImage: `linear-gradient(rgba(10, 42, 90, 0.95), rgba(10, 42, 90, 0.95)),
                url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23ffffff' fill-opacity='0.05' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.99-7.5L26 15v18.5l-13 7.5L0 33.5V15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }}>
      {/* Top App Bar */}
      <div className="flex items-center p-4 pb-2 justify-between shrink-0 bg-transparent">
        <button
          onClick={() => navigate('/home')}
          className="flex size-12 shrink-0 items-center justify-center"
        >
          <span className="material-symbols-outlined text-white text-3xl">arrow_back_ios_new</span>
        </button>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Pack Store</h2>
        <div className="flex w-auto items-center justify-end rounded-full bg-black/30 px-3 py-1.5">
          <p className="text-[#FFD700] text-base font-bold leading-normal tracking-[0.015em] shrink-0">{user?.coins || 0}</p>
          <span className="material-symbols-outlined text-[#FFD700] text-xl ml-1">monetization_on</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col grow px-4">
        {/* Pack Image */}
        {selectedPack && (
          <>
            <div className="flex w-full grow items-center justify-center py-3">
              <div className="w-full max-w-xs aspect-[3/4] flex-shrink-0" style={{transform: 'rotate(-5deg) scale(1.05)'}}>
                <div
                  className="h-full w-full bg-center bg-no-repeat bg-cover rounded-xl shadow-2xl shadow-black/50"
                  style={{ backgroundImage: `url("${selectedPack.image_url}")` }}
                ></div>
              </div>
            </div>

            {/* Pack Details */}
            <div className="flex flex-col items-center text-center -mt-6">
              <h1 className="text-white tracking-light text-[32px] font-bold leading-tight pb-2 pt-6">{selectedPack.name}</h1>
              <p className="text-white/80 text-base font-normal leading-normal pb-3 pt-1 max-w-xs">{selectedPack.description}</p>
            </div>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 pb-2">
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm text-center">
            {error}
          </div>
        </div>
      )}

      {/* Purchase Section */}
      {selectedPack && (
        <div className="flex flex-col items-center gap-4 p-4 pt-6 bg-black/20 backdrop-blur-sm rounded-t-2xl mt-4">
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[#FFD700] text-4xl">monetization_on</span>
            <h1 className="text-white text-[28px] font-bold leading-tight tracking-[-0.015em]">{selectedPack.price} Coins</h1>
          </div>
          <button
            onClick={handleBuyPack}
            disabled={buying || user.coins < selectedPack.price}
            className="flex h-14 w-full items-center justify-center rounded-xl bg-primary px-6 shadow-[0_4px_14px_0_rgba(50,205,50,0.39)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            <span className="text-lg font-bold text-background-dark">
              {buying ? 'Opening Pack...' : 'Buy Pack'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PackStore;
