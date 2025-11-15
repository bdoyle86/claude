import pool from '../config/database.js';

// Get available cards in store
export const getStoreCards = async (req, res) => {
  try {
    const cards = await pool.query(
      `SELECT
        c.*,
        sc.price,
        sc.stock
      FROM store_cards sc
      JOIN cards c ON sc.card_id = c.id
      WHERE sc.stock != 0
      ORDER BY c.rarity DESC, c.overall_rating DESC`
    );

    res.json({ cards: cards.rows });

  } catch (error) {
    console.error('Get store cards error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Buy a specific card from store
export const buyCard = async (req, res) => {
  const { cardId } = req.body;
  const userId = req.user.userId;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get card from store
    const storeCard = await client.query(
      `SELECT
        c.*,
        sc.price,
        sc.stock,
        sc.id as store_id
      FROM store_cards sc
      JOIN cards c ON sc.card_id = c.id
      WHERE c.id = $1`,
      [cardId]
    );

    if (storeCard.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Card not available in store' });
    }

    const card = storeCard.rows[0];

    // Check stock (if stock tracking is enabled, -1 means unlimited)
    if (card.stock !== -1 && card.stock <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Card out of stock' });
    }

    // Check if user has enough coins
    const user = await client.query('SELECT coins FROM users WHERE id = $1', [userId]);

    if (user.rows[0].coins < card.price) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Not enough coins' });
    }

    // Deduct coins
    await client.query(
      'UPDATE users SET coins = coins - $1 WHERE id = $2',
      [card.price, userId]
    );

    // Update stock if tracking
    if (card.stock !== -1) {
      await client.query(
        'UPDATE store_cards SET stock = stock - 1 WHERE id = $1',
        [card.store_id]
      );
    }

    // Add card to user's collection
    const existingCard = await client.query(
      'SELECT * FROM user_cards WHERE user_id = $1 AND card_id = $2',
      [userId, cardId]
    );

    if (existingCard.rows.length > 0) {
      await client.query(
        'UPDATE user_cards SET quantity = quantity + 1 WHERE user_id = $1 AND card_id = $2',
        [userId, cardId]
      );
    } else {
      await client.query(
        'INSERT INTO user_cards (user_id, card_id, quantity) VALUES ($1, $2, 1)',
        [userId, cardId]
      );
    }

    // Get updated user coins
    const updatedUser = await client.query('SELECT coins FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');

    res.json({
      message: 'Card purchased successfully',
      card: {
        id: card.id,
        player_name: card.player_name,
        rarity: card.rarity,
        image_url: card.image_url
      },
      coins: updatedUser.rows[0].coins
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Buy card error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};
