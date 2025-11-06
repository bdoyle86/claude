import { checkQuestCompletion, getQuestProgress } from '../data/quests';
import { completeQuest } from '../utils/gameLogic';

function Quests({ gameState, availableQuests, updateGameState, showNotification }) {
  const handleClaimQuest = (quest) => {
    const result = completeQuest(gameState, quest);

    if (result.success) {
      updateGameState(result.gameState);
      showNotification(
        `Quest completed! +$${result.reward.toLocaleString()} • +${result.xpGained} XP`,
        'success'
      );
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      case 'legendary': return '#9C27B0';
      default: return '#999';
    }
  };

  const activequests = availableQuests.filter(quest =>
    !checkQuestCompletion(quest, gameState)
  );

  const completableQuests = availableQuests.filter(quest =>
    checkQuestCompletion(quest, gameState)
  );

  return (
    <div className="quests">
      <h2>🎯 Quests</h2>
      <p className="subtitle">Complete challenges to earn rewards and XP!</p>

      {/* Completed Quests Section */}
      {completableQuests.length > 0 && (
        <div className="section">
          <h3 className="section-title">✅ Ready to Claim</h3>
          <div className="quests-list">
            {completableQuests.map(quest => {
              const progress = getQuestProgress(quest, gameState);

              return (
                <div key={quest.id} className="quest-card completed">
                  <div className="quest-header">
                    <div>
                      <h4>{quest.title}</h4>
                      <span
                        className="quest-difficulty"
                        style={{ backgroundColor: getDifficultyColor(quest.difficulty) }}
                      >
                        {quest.difficulty}
                      </span>
                    </div>
                    <div className="quest-complete-badge">✅</div>
                  </div>

                  <p className="quest-description">{quest.description}</p>

                  <div className="quest-progress">
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: '100%' }} />
                    </div>
                    <div className="progress-text">
                      {progress.current.toLocaleString()} / {progress.target.toLocaleString()}
                    </div>
                  </div>

                  <div className="quest-rewards">
                    <div className="reward">
                      <span className="reward-icon">💰</span>
                      <span>${quest.reward.toLocaleString()}</span>
                    </div>
                    <div className="reward">
                      <span className="reward-icon">⭐</span>
                      <span>{quest.xpReward} XP</span>
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    onClick={() => handleClaimQuest(quest)}
                  >
                    Claim Reward
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Quests Section */}
      {activequests.length > 0 && (
        <div className="section">
          <h3 className="section-title">📋 Active Quests</h3>
          <div className="quests-list">
            {activequests.map(quest => {
              const progress = getQuestProgress(quest, gameState);
              const progressPercent = Math.min((progress.current / progress.target) * 100, 100);

              return (
                <div key={quest.id} className="quest-card">
                  <div className="quest-header">
                    <div>
                      <h4>{quest.title}</h4>
                      <span
                        className="quest-difficulty"
                        style={{ backgroundColor: getDifficultyColor(quest.difficulty) }}
                      >
                        {quest.difficulty}
                      </span>
                    </div>
                  </div>

                  <p className="quest-description">{quest.description}</p>

                  <div className="quest-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="progress-text">
                      {progress.current.toLocaleString()} / {progress.target.toLocaleString()}
                      {' '}({progressPercent.toFixed(0)}%)
                    </div>
                  </div>

                  <div className="quest-rewards">
                    <div className="reward">
                      <span className="reward-icon">💰</span>
                      <span>${quest.reward.toLocaleString()}</span>
                    </div>
                    <div className="reward">
                      <span className="reward-icon">⭐</span>
                      <span>{quest.xpReward} XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Quests Count */}
      {gameState.completedQuests.length > 0 && (
        <div className="completed-count">
          <p>🏆 Completed Quests: {gameState.completedQuests.length}</p>
        </div>
      )}

      {/* No Quests */}
      {availableQuests.length === 0 && (
        <div className="empty-state">
          <p>No quests available at your level.</p>
          <p>Keep playing to unlock more challenges!</p>
        </div>
      )}

      {/* Quest Tips */}
      <div className="tips-section">
        <h4>💡 Quest Tips</h4>
        <ul>
          <li>Quests unlock as you level up</li>
          <li>Complete quests for bonus cash and XP</li>
          <li>Some quests track your overall progress automatically</li>
          <li>Harder quests give better rewards!</li>
        </ul>
      </div>
    </div>
  );
}

export default Quests;
