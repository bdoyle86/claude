import pool from '../config/database.js';

// Get user's collection
export const getCollection = async (req, res) => {
  const userId = req.user.userId;
  const { rarity, sort } = req.query;

  try {
    let query = `
      SELECT
        c.*,
        uc.quantity,
        uc.acquired_at
      FROM user_cards uc
      JOIN cards c ON uc.card_id = c.id
      WHERE uc.user_id = $1
    `;

    const params = [userId];

    // Add rarity filter if specified
    if (rarity && rarity !== 'All') {
      query += ` AND c.rarity = $2`;
      params.push(rarity);
    }

    // Add sorting
    if (sort === 'name') {
      query += ` ORDER BY c.player_name ASC`;
    } else if (sort === 'rarity') {
      query += ` ORDER BY
        CASE c.rarity
          WHEN 'Epic' THEN 1
          WHEN 'Rare' THEN 2
          WHEN 'Common' THEN 3
        END`;
    } else if (sort === 'rating') {
      query += ` ORDER BY c.overall_rating DESC`;
    } else {
      query += ` ORDER BY uc.acquired_at DESC`;
    }

    const cards = await pool.query(query, params);

    res.json({ cards: cards.rows });

  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single card details
export const getCardDetails = async (req, res) => {
  const { cardId } = req.params;
  const userId = req.user.userId;

  try {
    const card = await pool.query(
      `SELECT
        c.*,
        uc.quantity
      FROM cards c
      LEFT JOIN user_cards uc ON c.id = uc.card_id AND uc.user_id = $1
      WHERE c.id = $2`,
      [userId, cardId]
    );

    if (card.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json({ card: card.rows[0] });

  } catch (error) {
    console.error('Get card details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get collection stats
export const getCollectionStats = async (req, res) => {
  const userId = req.user.userId;

  try {
    const stats = await pool.query(
      `SELECT
        COUNT(DISTINCT uc.card_id) as total_unique_cards,
        SUM(uc.quantity) as total_cards,
        COUNT(CASE WHEN c.rarity = 'Common' THEN 1 END) as common_count,
        COUNT(CASE WHEN c.rarity = 'Rare' THEN 1 END) as rare_count,
        COUNT(CASE WHEN c.rarity = 'Epic' THEN 1 END) as epic_count
      FROM user_cards uc
      JOIN cards c ON uc.card_id = c.id
      WHERE uc.user_id = $1`,
      [userId]
    );

    const totalCards = await pool.query('SELECT COUNT(*) as total FROM cards');

    res.json({
      stats: {
        ...stats.rows[0],
        total_available_cards: totalCards.rows[0].total
      }
    });

  } catch (error) {
    console.error('Get collection stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
