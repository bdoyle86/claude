import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [stats, setStats] = useState({
    totalCards: 0,
    uniqueCards: 0,
    commonCount: 0,
    rareCount: 0,
    epicCount: 0,
    totalAvailableCards: 0
  });
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get user's collection with card details
      const { data: userCards, error: cardsError } = await supabase
        .from('user_cards')
        .select(`
          quantity,
          cards (rarity)
        `)
        .eq('user_id', user.id);

      if (cardsError) throw cardsError;

      // Get total available cards in database
      const { count: totalAvailable, error: countError } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Calculate stats
      let totalCards = 0;
      let commonCount = 0;
      let rareCount = 0;
      let epicCount = 0;

      userCards.forEach(item => {
        totalCards += item.quantity;
        if (item.cards.rarity === 'Common') commonCount++;
        else if (item.cards.rarity === 'Rare') rareCount++;
        else if (item.cards.rarity === 'Epic') epicCount++;
      });

      setStats({
        totalCards,
        uniqueCards: userCards.length,
        commonCount,
        rareCount,
        epicCount,
        totalAvailableCards: totalAvailable || 0
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError('Failed to load profile statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUsername = () => {
    setNewUsername(profile?.username || '');
    setIsEditingUsername(true);
    setError('');
    setSuccess('');
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    if (newUsername === profile?.username) {
      setIsEditingUsername(false);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess('Username updated successfully!');
      setIsEditingUsername(false);
      setTimeout(() => setSuccess(''), 3000);

      // Reload the page to get updated profile data
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Failed to update username');
      console.error('Update username error:', err);
    } finally {
      setSaving(false);
    }
  };

  const collectionProgress = stats.totalAvailableCards > 0
    ? Math.round((stats.uniqueCards / stats.totalAvailableCards) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="text-white text-xl">Loading profile...</div>
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
          My Profile
        </h2>
        <div className="w-12"></div>
      </div>

      <main className="flex-1 p-4 space-y-6">
        {/* Notifications */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-500 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-primary/20 to-accent-blue/20 border border-primary/30 rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-4 border-4 border-background-dark shadow-xl">
              <span className="material-symbols-outlined text-background-dark text-5xl">person</span>
            </div>

            {/* Username */}
            {isEditingUsername ? (
              <div className="w-full space-y-3">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-background-dark/50 border border-white/20 rounded-lg px-4 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter new username"
                  maxLength={20}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveUsername}
                    disabled={saving}
                    className="flex-1 bg-primary text-background-dark font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setIsEditingUsername(false)}
                    disabled={saving}
                    className="flex-1 bg-white/10 text-white font-bold py-2 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-white mb-1">{profile?.username}</h1>
                <button
                  onClick={handleEditUsername}
                  className="flex items-center gap-1 text-primary text-sm hover:text-primary/80 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Edit Username
                </button>
              </>
            )}

            {/* Email */}
            <p className="text-white/60 text-sm mt-2">{user?.email}</p>

            {/* Coins */}
            <div className="mt-4 flex items-center gap-2 bg-background-dark/50 px-6 py-3 rounded-full">
              <span className="material-symbols-outlined text-accent-yellow text-3xl" style={{filter: 'drop-shadow(0 0 5px #FFD700)'}}>
                monetization_on
              </span>
              <span className="text-white font-bold text-2xl">{profile?.coins || 0}</span>
            </div>
          </div>
        </div>

        {/* Collection Stats */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bar_chart</span>
            Collection Statistics
          </h2>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-white/80 text-sm">Collection Progress</span>
              <span className="text-primary font-bold text-lg">{collectionProgress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent-blue transition-all duration-500 rounded-full"
                style={{ width: `${collectionProgress}%` }}
              ></div>
            </div>
            <p className="text-white/60 text-xs mt-1">
              {stats.uniqueCards} of {stats.totalAvailableCards} unique cards collected
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Cards */}
            <div className="bg-background-dark/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-white/60">style</span>
                <p className="text-white/60 text-sm">Total Cards</p>
              </div>
              <p className="text-white font-bold text-3xl">{stats.totalCards}</p>
            </div>

            {/* Unique Cards */}
            <div className="bg-background-dark/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-white/60">collections_bookmark</span>
                <p className="text-white/60 text-sm">Unique</p>
              </div>
              <p className="text-white font-bold text-3xl">{stats.uniqueCards}</p>
            </div>

            {/* Epic Cards */}
            <div className="bg-accent-purple/20 rounded-xl p-4 border border-accent-purple/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-accent-purple">star</span>
                <p className="text-accent-purple text-sm font-bold">Epic</p>
              </div>
              <p className="text-white font-bold text-3xl">{stats.epicCount}</p>
            </div>

            {/* Rare Cards */}
            <div className="bg-accent-blue/20 rounded-xl p-4 border border-accent-blue/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-accent-blue">auto_awesome</span>
                <p className="text-accent-blue text-sm font-bold">Rare</p>
              </div>
              <p className="text-white font-bold text-3xl">{stats.rareCount}</p>
            </div>

            {/* Common Cards */}
            <div className="bg-white/10 rounded-xl p-4 border border-white/20 col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-white/60">workspace_premium</span>
                  <p className="text-white/60 text-sm">Common</p>
                </div>
                <p className="text-white font-bold text-3xl">{stats.commonCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white px-2">Quick Actions</h3>

          <button
            onClick={() => navigate('/collection')}
            className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">collections_bookmark</span>
              <span className="text-white font-medium">View Collection</span>
            </div>
            <span className="material-symbols-outlined text-white/40 group-hover:text-white/60">arrow_forward</span>
          </button>

          <button
            onClick={() => navigate('/packs')}
            className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">style</span>
              <span className="text-white font-medium">Open Packs</span>
            </div>
            <span className="material-symbols-outlined text-white/40 group-hover:text-white/60">arrow_forward</span>
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-red-600/20 border border-red-500 text-red-500 px-4 py-4 hover:bg-red-600/30 transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-bold">Logout</span>
        </button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
