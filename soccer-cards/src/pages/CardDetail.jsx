import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collectionService } from '../api/services';

const CardDetail = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCard();
  }, [cardId]);

  const loadCard = async () => {
    try {
      const data = await collectionService.getCardDetails(cardId);
      setCard(data.card);
    } catch (err) {
      console.error('Failed to load card:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="text-white text-xl">Card not found</div>
      </div>
    );
  }

  const rarityColor = card.rarity === 'Epic' ? '#BE38F3' : card.rarity === 'Rare' ? '#38BDF3' : '#9CA3AF';

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-cover bg-no-repeat bg-bottom overflow-x-hidden"
      style={{ backgroundImage: `url('${card.image_url}')` }}
    >
      <div className="flex-grow bg-gradient-to-t from-[#0D1B2A] via-[#0D1B2A]/90 to-transparent">
        {/* Header */}
        <div className="flex items-center p-4 pb-2 justify-between sticky top-0 z-10">
          <button
            onClick={() => navigate('/collection')}
            className="flex size-12 shrink-0 items-center justify-center bg-white/10 backdrop-blur-sm rounded-full"
          >
            <span className="material-symbols-outlined text-white/90">arrow_back_ios_new</span>
          </button>
          <div className="size-12 shrink-0"></div>
        </div>

        {/* Main Content */}
        <main className="flex-grow px-4">
          <div className="@container">
            {/* Card Display */}
            <div
              className="relative bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-xl min-h-[380px] shadow-2xl shadow-black/50"
              style={{ backgroundImage: `url('${card.image_url}')` }}
            >
              <div
                className="absolute top-0 right-0 px-6 py-2 text-xl font-bangers tracking-widest text-white"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 15% 100%)',
                  backgroundColor: rarityColor
                }}
              >
                <p>{card.rarity.toUpperCase()}</p>
              </div>

              <div className="flex p-4 justify-between items-end bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                <div>
                  <p className="font-bangers text-white text-5xl tracking-wider leading-none" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                    {card.player_name}
                  </p>
                  {card.club && card.country && (
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-white/90 text-sm">{card.club}</p>
                      <span className="text-white/50">•</span>
                      <p className="text-white/90 text-sm">{card.country}</p>
                    </div>
                  )}
                </div>

                {card.overall_rating && (
                  <div className="flex flex-col items-center justify-center size-24 bg-accent-yellow/90 border-4 border-white rounded-full backdrop-blur-sm shadow-lg">
                    <p className="text-[#1A1D24] text-5xl font-bold font-bangers tracking-tighter">{card.overall_rating}</p>
                    <p className="text-[#1A1D24]/80 text-sm font-bold tracking-widest -mt-1">OVR</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Section */}
            {card.pace && (
              <div className="p-4 bg-white/5 backdrop-blur-md rounded-xl mt-6 border border-white/10">
                <h3 className="text-white/90 text-2xl font-bangers tracking-wider mb-4 text-center">PLAYER STATS</h3>

                <div className="flex flex-col gap-4">
                  {[
                    { name: 'Pace', value: card.pace },
                    { name: 'Shooting', value: card.shooting },
                    { name: 'Passing', value: card.passing },
                    { name: 'Dribbling', value: card.dribbling },
                    { name: 'Defending', value: card.defending },
                    { name: 'Physical', value: card.physical }
                  ].map(stat => (
                    <div key={stat.name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-baseline">
                        <p className="text-white text-lg font-semibold tracking-wide">{stat.name}</p>
                        <p className="font-bangers text-3xl text-accent-yellow leading-none">{stat.value}</p>
                      </div>
                      <div className="h-3 rounded-full bg-black/30 border border-white/20 p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#00FF99] to-[#00E086]"
                          style={{ width: `${stat.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Bottom Button */}
        <div className="sticky bottom-0 p-4 pt-8">
          <button
            onClick={() => navigate('/collection')}
            className="w-full bg-primary text-background-dark text-2xl font-bold py-4 rounded-xl shadow-[0_5px_0_0_#00CC6B] active:translate-y-1 active:shadow-none transition-all duration-150 ease-in-out border-2 border-background-dark/50"
          >
            Back to Collection
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardDetail;
