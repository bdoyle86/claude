import { useState, useEffect } from 'react';

const CoinFeedback = ({ amount, show, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  const isNegative = amount < 0;
  const displayAmount = Math.abs(amount);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <div className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl animate-[coinFloat_2s_ease-out_forwards] ${
        isNegative ? 'bg-red-500/90' : 'bg-green-500/90'
      }`}>
        <span className="material-symbols-outlined text-yellow-300 text-3xl" style={{
          filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))'
        }}>
          monetization_on
        </span>
        <span className="text-white font-bold text-2xl">
          {isNegative ? '-' : '+'}{displayAmount}
        </span>
      </div>
    </div>
  );
};

export default CoinFeedback;
