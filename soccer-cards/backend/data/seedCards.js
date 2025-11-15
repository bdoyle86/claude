import pool from '../config/database.js';

const soccerCards = [
  // Epic Cards (5% chance)
  {
    player_name: 'Lionel Messi',
    rarity: 'Epic',
    club: 'Inter Miami CF',
    country: 'Argentina',
    position: 'RW',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfAa60HpTDvU4iUpFBWs7uFCxdPZbb_L9epxk7SxD1ebUmGDWfp4Sp8loErxh-gFV-qsmxiDQBsoq4c9NdzQBSWnC2chb-wcompRIlzWyRtrQ63oPbctDM5ZNG2sfJnX02FJ0SX7gaJKxr7zvg6Ka3LKeNyXJjYX5O2Oaax3NbjddKwhhV4nfXHXn1yOfKwilnsZXUmpn-ZegClUy2VWIp8mwDS3Mb7VGMMffJKc2OMljoEXGS7WCajUxs4bIoIipcg8v0JI-C',
    overall_rating: 94,
    pace: 90,
    shooting: 92,
    passing: 91,
    dribbling: 95,
    defending: 35,
    physical: 68
  },
  {
    player_name: 'Cristiano Ronaldo',
    rarity: 'Epic',
    club: 'Al Nassr',
    country: 'Portugal',
    position: 'ST',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYvLI6jxVRpLEZnNnkQ-_lgxAA_DU-neK4QGB7HdeKbiW3ADEQ861nxZKXUcWYhAq48fItkF-eBCqXCdzN4YV1Kq9eEKs6Quy6CPAC5yl78Mc1wRWdWFBtsacStOlggcGn_2puYRubwsZJvZjrZBsTnCq8ImMEsVi1Npbura79hZLlwgtCx_7fziSA5ZgtZywnDXoK6nTK9jzgMLwEeCw0Iz9tjTrQ0Dh7C28Rec_7DehFMlRKyQ3PVBAtt_Ob4gJSeAGq5ybH',
    overall_rating: 91,
    pace: 84,
    shooting: 93,
    passing: 82,
    dribbling: 88,
    defending: 34,
    physical: 77
  },
  {
    player_name: 'Kevin De Bruyne',
    rarity: 'Epic',
    club: 'Manchester City',
    country: 'Belgium',
    position: 'CM',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJEst5nyxoJ4nUqb4oJ55lpHupnfLeSM94WwZYXCnM3CUzOmv69wW3tsLxs0OGl9J67yCvg00Dk4Oj3Dyw7WsR3YWDyvDof_vge9NI73yktT7NpDFBguAG5v5DmSet0mJyLaqvGNSYZrgdXtnE5ZNBJN44vu4pvfVt4j-X0uKfW2COjS8hUZeXwTH7We18n_n6R3s0GbGpiZh0i1yinInp_om_ZP6fr8zZrzv3cKfdF1NRDgiKOLVzpdg4JT0S3tHMotcomZ-H',
    overall_rating: 91,
    pace: 76,
    shooting: 86,
    passing: 93,
    dribbling: 88,
    defending: 61,
    physical: 78
  },

  // Rare Cards (25% chance)
  {
    player_name: 'Kylian Mbappé',
    rarity: 'Rare',
    club: 'Real Madrid',
    country: 'France',
    position: 'ST',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzcDjHca4qUy5uMQ2LK002S9zZw6dNnt35upnb9hb93nRDddCjug_BLn0C8K0E5H_tuNGkwZq9RIP-jshlCt0SCFVTxriPiZs7CKPlsybA5DVhcMbaQnlCb6gpOmPFTX4sxPz1YmtvQACXbIn6pZgRJMaRrGC5xoWVkvcEG1eig-mYd_OoykkGM5c0HkUY1DMKNUgVaRUrs-lZl3E6Y_gblgbQJZrBAyqY3QL3QWKhhUsgVc-7kd8JTy_YttWkpXQ07UoqKKyg',
    overall_rating: 92,
    pace: 97,
    shooting: 89,
    passing: 80,
    dribbling: 92,
    defending: 36,
    physical: 77
  },
  {
    player_name: 'Erling Haaland',
    rarity: 'Rare',
    club: 'Manchester City',
    country: 'Norway',
    position: 'ST',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIgg5o-cGopfXv9DHDB7ERf0OTse-vC1T_ifFTN3Nm4rLSW4zO3FAcssJhppKoB4fzBXtcx7xUN4q5BoV2LEFmXwc_JoUpd7lFl8M81AyN3yhLERcvQBuultmveJGL2uO4xphqbGkvU4RRB0pYq0fyhilZd50_5AcHX70KRW5I53gyrf9-pClFt7GpRcpB8swf3ilXn8Nn5vQz5zWmfKac0C5kkKU8h2D2fDgonHYuXmE8Hqw_eRzrNlWb3cpQrzarxVLAdR3o',
    overall_rating: 91,
    pace: 89,
    shooting: 92,
    passing: 65,
    dribbling: 80,
    defending: 45,
    physical: 88
  },
  {
    player_name: 'Neymar Jr.',
    rarity: 'Rare',
    club: 'Al Hilal',
    country: 'Brazil',
    position: 'LW',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkJkpCC6mMnYP0kIWAXyQBvXngEW50SX-_jQSJBvC2bDvsPAZwIhXNG91zYZeFXKLEO-1_tAjNzXe77775Qg_uEOhK96SQiXjDdJ4ax2WiXLd2xQrD68f8qvmGYHhuSzUQ64iJGqHG3W0NfxKRH4cEsK8VOIKw8yKdEn9OGK4X3TjaK3-Un38gknWiGWvjodiAPGNjTH8vNt__48VA8CXbKbTHVJMJaLX5Qj0B-kFvPrdaAiY8nVQ7VkKJQnhNuXrie7-7n0kk',
    overall_rating: 89,
    pace: 87,
    shooting: 83,
    passing: 86,
    dribbling: 94,
    defending: 37,
    physical: 63
  },
  {
    player_name: 'Mohamed Salah',
    rarity: 'Rare',
    club: 'Liverpool',
    country: 'Egypt',
    position: 'RW',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmz7gB5SKTUJY-cnT1xUk_vihCHLfKzSxFzc0f9JQYSV2NG0PiZp2NL2JJoloxUDEXa1Jm7ScgfAyYrrwEfCn5kRwAZX6cXM8IQgvfltZkFuv0Xt-EVAHo0uzhaCCikfk7cltxP--38U4lhDu4Iv7HAHfBKaQAmmAdGSOfpkwKhdS9AvcojH1wEAX-WaDVocnDMHvrOPQv0sZUapv0ld6VYzpDEPOmTcyRv0c_POTQI9ENXhSeydCJQ--vgzAUGENLBNotsnXv',
    overall_rating: 89,
    pace: 90,
    shooting: 87,
    passing: 81,
    dribbling: 90,
    defending: 45,
    physical: 75
  },
  {
    player_name: 'Virgil van Dijk',
    rarity: 'Rare',
    club: 'Liverpool',
    country: 'Netherlands',
    position: 'CB',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBymE6ZgUuc0GZUPb29C39xLcvImecis0dZ9_WWlj-F5CN4sg75-wagrVADBJN1uWeLFhmEjaLCAZ9rtiSW4ngRGlEvK3Sge97lmBTmLSUwCagd6P1rHFHfZe73frAq-7fFIuDrHAmgpCNlmrwvxhp-1FRFNT1mCIyU_d71xLkqR-ApgqpOXhXl690NJEHzd6RGTT3NU3vW8sCi94JkXVmzfVt_z5t5ctJQ5yBz5_yT1zodBofhHm6paLBUwatg1mqx5UaQw9Ui',
    overall_rating: 90,
    pace: 79,
    shooting: 60,
    passing: 71,
    dribbling: 72,
    defending: 92,
    physical: 86
  },
  {
    player_name: 'Luka Modrić',
    rarity: 'Rare',
    club: 'Real Madrid',
    country: 'Croatia',
    position: 'CM',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/21/131605.png',
    overall_rating: 88,
    pace: 74,
    shooting: 76,
    passing: 89,
    dribbling: 90,
    defending: 72,
    physical: 65
  },
  {
    player_name: 'Harry Kane',
    rarity: 'Rare',
    club: 'Bayern Munich',
    country: 'England',
    position: 'ST',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/10/50602.png',
    overall_rating: 90,
    pace: 70,
    shooting: 92,
    passing: 83,
    dribbling: 82,
    defending: 47,
    physical: 83
  },
  {
    player_name: 'Vinicius Jr.',
    rarity: 'Rare',
    club: 'Real Madrid',
    country: 'Brazil',
    position: 'LW',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/2/322658.png',
    overall_rating: 89,
    pace: 95,
    shooting: 83,
    passing: 79,
    dribbling: 92,
    defending: 29,
    physical: 61
  },

  // Common Cards (70% chance)
  {
    player_name: 'Bruno Fernandes',
    rarity: 'Common',
    club: 'Manchester United',
    country: 'Portugal',
    position: 'CAM',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/17/60849.png',
    overall_rating: 86,
    pace: 75,
    shooting: 85,
    passing: 89,
    dribbling: 84,
    defending: 69,
    physical: 77
  },
  {
    player_name: 'Son Heung-min',
    rarity: 'Common',
    club: 'Tottenham',
    country: 'South Korea',
    position: 'LW',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/23/79703.png',
    overall_rating: 87,
    pace: 88,
    shooting: 87,
    passing: 82,
    dribbling: 87,
    defending: 43,
    physical: 70
  },
  {
    player_name: 'Alisson Becker',
    rarity: 'Common',
    club: 'Liverpool',
    country: 'Brazil',
    position: 'GK',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/7/37063.png',
    overall_rating: 89,
    pace: 48,
    shooting: 52,
    passing: 75,
    dribbling: 80,
    defending: 35,
    physical: 90
  },
  {
    player_name: 'Joshua Kimmich',
    rarity: 'Common',
    club: 'Bayern Munich',
    country: 'Germany',
    position: 'CDM',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/29/81597.png',
    overall_rating: 88,
    pace: 70,
    shooting: 73,
    passing: 88,
    dribbling: 84,
    defending: 84,
    physical: 79
  },
  {
    player_name: 'Jude Bellingham',
    rarity: 'Common',
    club: 'Real Madrid',
    country: 'England',
    position: 'CM',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/1/392289.png',
    overall_rating: 87,
    pace: 75,
    shooting: 80,
    passing: 78,
    dribbling: 83,
    defending: 78,
    physical: 82
  },
  {
    player_name: 'Bukayo Saka',
    rarity: 'Common',
    club: 'Arsenal',
    country: 'England',
    position: 'RW',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/4/487492.png',
    overall_rating: 86,
    pace: 84,
    shooting: 79,
    passing: 81,
    dribbling: 86,
    defending: 46,
    physical: 70
  },
  {
    player_name: 'Bernardo Silva',
    rarity: 'Common',
    club: 'Manchester City',
    country: 'Portugal',
    position: 'RW',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/3/33795.png',
    overall_rating: 88,
    pace: 80,
    shooting: 79,
    passing: 86,
    dribbling: 90,
    defending: 62,
    physical: 73
  },
  {
    player_name: 'Thibaut Courtois',
    rarity: 'Common',
    club: 'Real Madrid',
    country: 'Belgium',
    position: 'GK',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/16/17072.png',
    overall_rating: 89,
    pace: 47,
    shooting: 51,
    passing: 74,
    dribbling: 71,
    defending: 35,
    physical: 90
  },
  {
    player_name: 'Rodri',
    rarity: 'Common',
    club: 'Manchester City',
    country: 'Spain',
    position: 'CDM',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/29/192605.png',
    overall_rating: 89,
    pace: 62,
    shooting: 74,
    passing: 79,
    dribbling: 81,
    defending: 88,
    physical: 84
  },
  {
    player_name: 'Federico Valverde',
    rarity: 'Common',
    club: 'Real Madrid',
    country: 'Uruguay',
    position: 'CM',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/31/307263.png',
    overall_rating: 87,
    pace: 83,
    shooting: 80,
    passing: 79,
    dribbling: 82,
    defending: 75,
    physical: 84
  },
  {
    player_name: 'Declan Rice',
    rarity: 'Common',
    club: 'Arsenal',
    country: 'England',
    position: 'CDM',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/21/263253.png',
    overall_rating: 86,
    pace: 72,
    shooting: 70,
    passing: 76,
    dribbling: 77,
    defending: 85,
    physical: 82
  },
  {
    player_name: 'Phil Foden',
    rarity: 'Common',
    club: 'Manchester City',
    country: 'England',
    position: 'CAM',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/5/273509.png',
    overall_rating: 87,
    pace: 85,
    shooting: 80,
    passing: 82,
    dribbling: 89,
    defending: 57,
    physical: 70
  },
  {
    player_name: 'Gianluigi Donnarumma',
    rarity: 'Common',
    club: 'PSG',
    country: 'Italy',
    position: 'GK',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/30/135262.png',
    overall_rating: 88,
    pace: 50,
    shooting: 45,
    passing: 68,
    dribbling: 75,
    defending: 40,
    physical: 88
  },
  {
    player_name: 'Rafael Leão',
    rarity: 'Common',
    club: 'AC Milan',
    country: 'Portugal',
    position: 'LW',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/17/339025.png',
    overall_rating: 86,
    pace: 95,
    shooting: 76,
    passing: 74,
    dribbling: 87,
    defending: 38,
    physical: 78
  },
  {
    player_name: 'Jamal Musiala',
    rarity: 'Common',
    club: 'Bayern Munich',
    country: 'Germany',
    position: 'CAM',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/26/411738.png',
    overall_rating: 85,
    pace: 80,
    shooting: 76,
    passing: 79,
    dribbling: 87,
    defending: 46,
    physical: 65
  },
  {
    player_name: 'Pedri',
    rarity: 'Common',
    club: 'Barcelona',
    country: 'Spain',
    position: 'CM',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/19/442419.png',
    overall_rating: 85,
    pace: 68,
    shooting: 69,
    passing: 83,
    dribbling: 87,
    defending: 61,
    physical: 63
  },
  {
    player_name: 'Ruben Dias',
    rarity: 'Common',
    club: 'Manchester City',
    country: 'Portugal',
    position: 'CB',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/1/81761.png',
    overall_rating: 88,
    pace: 62,
    shooting: 49,
    passing: 72,
    dribbling: 70,
    defending: 90,
    physical: 85
  },
  {
    player_name: 'Casemiro',
    rarity: 'Common',
    club: 'Manchester United',
    country: 'Brazil',
    position: 'CDM',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/30/50814.png',
    overall_rating: 86,
    pace: 62,
    shooting: 68,
    passing: 71,
    dribbling: 72,
    defending: 87,
    physical: 88
  },
  {
    player_name: 'Trent Alexander-Arnold',
    rarity: 'Common',
    club: 'Liverpool',
    country: 'England',
    position: 'RB',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/31/289887.png',
    overall_rating: 87,
    pace: 76,
    shooting: 74,
    passing: 89,
    dribbling: 80,
    defending: 78,
    physical: 71
  },
  {
    player_name: 'Karim Benzema',
    rarity: 'Common',
    club: 'Al Ittihad',
    country: 'France',
    position: 'ST',
    image_url: 'https://cdn.sportmonks.com/images/soccer/players/22/17366.png',
    overall_rating: 86,
    pace: 75,
    shooting: 86,
    passing: 83,
    dribbling: 87,
    defending: 39,
    physical: 78
  }
];

export async function seedCards() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting to seed cards...');

    // Check if cards already exist
    const existingCards = await client.query('SELECT COUNT(*) FROM cards');

    if (parseInt(existingCards.rows[0].count) > 0) {
      console.log('⏭️  Cards already seeded, skipping...');
      return;
    }

    // Insert all cards
    for (const card of soccerCards) {
      await client.query(
        `INSERT INTO cards (
          player_name, rarity, club, country, position, image_url,
          overall_rating, pace, shooting, passing, dribbling, defending, physical
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          card.player_name, card.rarity, card.club, card.country, card.position,
          card.image_url, card.overall_rating, card.pace, card.shooting,
          card.passing, card.dribbling, card.defending, card.physical
        ]
      );
    }

    console.log(`✅ Successfully seeded ${soccerCards.length} cards!`);

    // Also seed some cards for the single card store
    const storeCards = await client.query(
      `SELECT id FROM cards WHERE rarity IN ('Common', 'Rare') ORDER BY RANDOM() LIMIT 10`
    );

    for (const card of storeCards.rows) {
      const price = await client.query('SELECT rarity FROM cards WHERE id = $1', [card.id]);
      const rarity = price.rows[0].rarity;
      const cardPrice = rarity === 'Rare' ? 250 : 150;

      await client.query(
        'INSERT INTO store_cards (card_id, price) VALUES ($1, $2)',
        [card.id, cardPrice]
      );
    }

    console.log('✅ Successfully seeded store cards!');

  } catch (error) {
    console.error('❌ Error seeding cards:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default soccerCards;
