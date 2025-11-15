import pool from '../config/database.js';

// Get available packs
export const getPacks = async (req, res) => {
  try {
    const packs = await pool.query('SELECT * FROM packs');
    res.json({ packs: packs.rows });
  } catch (error) {
    console.error('Get packs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Buy and open a pack
export const buyPack = async (req, res) => {
  const { packId } = req.body;
  const userId = req.user.userId;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get pack details
    const pack = await client.query('SELECT * FROM packs WHERE id = $1', [packId]);

    if (pack.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pack not found' });
    }

    const packData = pack.rows[0];

    // Check if user has enough coins
    const user = await client.query('SELECT coins FROM users WHERE id = $1', [userId]);

    if (user.rows[0].coins < packData.price) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Not enough coins' });
    }

    // Deduct coins
    await client.query(
      'UPDATE users SET coins = coins - $1 WHERE id = $2',
      [packData.price, userId]
    );

    // Generate cards based on rarity distribution
    // 70% Common, 25% Rare, 5% Epic
    const cards = [];
    for (let i = 0; i < packData.card_count; i++) {
      const random = Math.random() * 100;
      let rarity;

      if (random < 5) {
        rarity = 'Epic';
      } else if (random < 30) { // 5 + 25 = 30
        rarity = 'Rare';
      } else {
        rarity = 'Common';
      }

      // Get a random card of the selected rarity
      const card = await client.query(
        'SELECT * FROM cards WHERE rarity = $1 ORDER BY RANDOM() LIMIT 1',
        [rarity]
      );

      if (card.rows.length > 0) {
        const cardData = card.rows[0];
        cards.push(cardData);

        // Add card to user's collection
        const existingCard = await client.query(
          'SELECT * FROM user_cards WHERE user_id = $1 AND card_id = $2',
          [userId, cardData.id]
        );

        if (existingCard.rows.length > 0) {
          // Increment quantity if card already exists
          await client.query(
            'UPDATE user_cards SET quantity = quantity + 1 WHERE user_id = $1 AND card_id = $2',
            [userId, cardData.id]
          );
        } else {
          // Add new card
          await client.query(
            'INSERT INTO user_cards (user_id, card_id, quantity) VALUES ($1, $2, 1)',
            [userId, cardData.id]
          );
        }
      }
    }

    // Get updated user coins
    const updatedUser = await client.query('SELECT coins FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');

    res.json({
      message: 'Pack opened successfully',
      cards,
      coins: updatedUser.rows[0].coins
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Buy pack error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};
