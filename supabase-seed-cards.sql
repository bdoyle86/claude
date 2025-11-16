-- ============================================
-- SEED SOCCER PLAYER CARDS
-- Run this after running supabase-schema.sql
-- ============================================

-- Epic Cards (5% chance)
INSERT INTO cards (player_name, rarity, club, country, position, image_url, overall_rating, pace, shooting, passing, dribbling, defending, physical)
VALUES
('Lionel Messi', 'Epic', 'Inter Miami CF', 'Argentina', 'RW', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfAa60HpTDvU4iUpFBWs7uFCxdPZbb_L9epxk7SxD1ebUmGDWfp4Sp8loErxh-gFV-qsmxiDQBsoq4c9NdzQBSWnC2chb-wcompRIlzWyRtrQ63oPbctDM5ZNG2sfJnX02FJ0SX7gaJKxr7zvg6Ka3LKeNyXJjYX5O2Oaax3NbjddKwhhV4nfXHXn1yOfKwilnsZXUmpn-ZegClUy2VWIp8mwDS3Mb7VGMMffJKc2OMljoEXGS7WCajUxs4bIoIipcg8v0JI-C', 94, 90, 92, 91, 95, 35, 68),
('Cristiano Ronaldo', 'Epic', 'Al Nassr', 'Portugal', 'ST', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYvLI6jxVRpLEZnNnkQ-_lgxAA_DU-neK4QGB7HdeKbiW3ADEQ861nxZKXUcWYhAq48fItkF-eBCqXCdzN4YV1Kq9eEKs6Quy6CPAC5yl78Mc1wRWdWFBtsacStOlggcGn_2puYRubwsZJvZjrZBsTnCq8ImMEsVi1Npbura79hZLlwgtCx_7fziSA5ZgtZywnDXoK6nTK9jzgMLwEeCw0Iz9tjTrQ0Dh7C28Rec_7DehFMlRKyQ3PVBAtt_Ob4gJSeAGq5ybH', 91, 84, 93, 82, 88, 34, 77),
('Kevin De Bruyne', 'Epic', 'Manchester City', 'Belgium', 'CM', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJEst5nyxoJ4nUqb4oJ55lpHupnfLeSM94WwZYXCnM3CUzOmv69wW3tsLxs0OGl9J67yCvg00Dk4Oj3Dyw7WsR3YWDyvDof_vge9NI73yktT7NpDFBguAG5v5DmSet0mJyLaqvGNSYZrgdXtnE5ZNBJN44vu4pvfVt4j-X0uKfW2COjS8hUZeXwTH7We18n_n6R3s0GbGpiZh0i1yinInp_om_ZP6fr8zZrzv3cKfdF1NRDgiKOLVzpdg4JT0S3tHMotcomZ-H', 91, 76, 86, 93, 88, 61, 78);

-- Rare Cards (25% chance)
INSERT INTO cards (player_name, rarity, club, country, position, image_url, overall_rating, pace, shooting, passing, dribbling, defending, physical)
VALUES
('Kylian Mbappé', 'Rare', 'Real Madrid', 'France', 'ST', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzcDjHca4qUy5uMQ2LK002S9zZw6dNnt35upnb9hb93nRDddCjug_BLn0C8K0E5H_tuNGkwZq9RIP-jshlCt0SCFVTxriPiZs7CKPlsybA5DVhcMbaQnlCb6gpOmPFTX4sxPz1YmtvQACXbIn6pZgRJMaRrGC5xoWVkvcEG1eig-mYd_OoykkGM5c0HkUY1DMKNUgVaRUrs-lZl3E6Y_gblgbQJZrBAyqY3QL3QWKhhUsgVc-7kd8JTy_YttWkpXQ07UoqKKyg', 92, 97, 89, 80, 92, 36, 77),
('Erling Haaland', 'Rare', 'Manchester City', 'Norway', 'ST', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIgg5o-cGopfXv9DHDB7ERf0OTse-vC1T_ifFTN3Nm4rLSW4zO3FAcssJhppKoB4fzBXtcx7xUN4q5BoV2LEFmXwc_JoUpd7lFl8M81AyN3yhLERcvQBuultmveJGL2uO4xphqbGkvU4RRB0pYq0fyhilZd50_5AcHX70KRW5I53gyrf9-pClFt7GpRcpB8swf3ilXn8Nn5vQz5zWmfKac0C5kkKU8h2D2fDgonHYuXmE8Hqw_eRzrNlWb3cpQrzarxVLAdR3o', 91, 89, 92, 65, 80, 45, 88),
('Neymar Jr.', 'Rare', 'Al Hilal', 'Brazil', 'LW', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkJkpCC6mMnYP0kIWAXyQBvXngEW50SX-_jQSJBvC2bDvsPAZwIhXNG91zYZeFXKLEO-1_tAjNzXe77775Qg_uEOhK96SQiXjDdJ4ax2WiXLd2xQrD68f8qvmGYHhuSzUQ64iJGqHG3W0NfxKRH4cEsK8VOIKw8yKdEn9OGK4X3TjaK3-Un38gknWiGWvjodiAPGNjTH8vNt__48VA8CXbKbTHVJMJaLX5Qj0B-kFvPrdaAiY8nVQ7VkKJQnhNuXrie7-7n0kk', 89, 87, 83, 86, 94, 37, 63),
('Mohamed Salah', 'Rare', 'Liverpool', 'Egypt', 'RW', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmz7gB5SKTUJY-cnT1xUk_vihCHLfKzSxFzc0f9JQYSV2NG0PiZp2NL2JJoloxUDEXa1Jm7ScgfAyYrrwEfCn5kRwAZX6cXM8IQgvfltZkFuv0Xt-EVAHo0uzhaCCikfk7cltxP--38U4lhDu4Iv7HAHfBKaQAmmAdGSOfpkwKhdS9AvcojH1wEAX-WaDVocnDMHvrOPQv0sZUapv0ld6VYzpDEPOmTcyRv0c_POTQI9ENXhSeydCJQ--vgzAUGENLBNotsnXv', 89, 90, 87, 81, 90, 45, 75),
('Virgil van Dijk', 'Rare', 'Liverpool', 'Netherlands', 'CB', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBymE6ZgUuc0GZUPb29C39xLcvImecis0dZ9_WWlj-F5CN4sg75-wagrVADBJN1uWeLFhmEjaLCAZ9rtiSW4ngRGlEvK3Sge97lmBTmLSUwCagd6P1rHFHfZe73frAq-7fFIuDrHAmgpCNlmrwvxhp-1FRFNT1mCIyU_d71xLkqR-ApgqpOXhXl690NJEHzd6RGTT3NU3vW8sCi94JkXVmzfVt_z5t5ctJQ5yBz5_yT1zodBofhHm6paLBUwatg1mqx5UaQw9Ui', 90, 79, 60, 71, 72, 92, 86),
('Luka Modrić', 'Rare', 'Real Madrid', 'Croatia', 'CM', 'https://cdn.sportmonks.com/images/soccer/players/21/131605.png', 88, 74, 76, 89, 90, 72, 65),
('Harry Kane', 'Rare', 'Bayern Munich', 'England', 'ST', 'https://cdn.sportmonks.com/images/soccer/players/10/50602.png', 90, 70, 92, 83, 82, 47, 83),
('Vinicius Jr.', 'Rare', 'Real Madrid', 'Brazil', 'LW', 'https://cdn.sportmonks.com/images/soccer/players/2/322658.png', 89, 95, 83, 79, 92, 29, 61);

-- Common Cards (70% chance)
INSERT INTO cards (player_name, rarity, club, country, position, image_url, overall_rating, pace, shooting, passing, dribbling, defending, physical)
VALUES
('Bruno Fernandes', 'Common', 'Manchester United', 'Portugal', 'CAM', 'https://cdn.sportmonks.com/images/soccer/players/17/60849.png', 86, 75, 85, 89, 84, 69, 77),
('Son Heung-min', 'Common', 'Tottenham', 'South Korea', 'LW', 'https://cdn.sportmonks.com/images/soccer/players/23/79703.png', 87, 88, 87, 82, 87, 43, 70),
('Alisson Becker', 'Common', 'Liverpool', 'Brazil', 'GK', 'https://cdn.sportmonks.com/images/soccer/players/7/37063.png', 89, 48, 52, 75, 80, 35, 90),
('Joshua Kimmich', 'Common', 'Bayern Munich', 'Germany', 'CDM', 'https://cdn.sportmonks.com/images/soccer/players/29/81597.png', 88, 70, 73, 88, 84, 84, 79),
('Jude Bellingham', 'Common', 'Real Madrid', 'England', 'CM', 'https://cdn.sportmonks.com/images/soccer/players/1/392289.png', 87, 75, 80, 78, 83, 78, 82),
('Bukayo Saka', 'Common', 'Arsenal', 'England', 'RW', 'https://cdn.sportmonks.com/images/soccer/players/4/487492.png', 86, 84, 79, 81, 86, 46, 70),
('Bernardo Silva', 'Common', 'Manchester City', 'Portugal', 'RW', 'https://cdn.sportmonks.com/images/soccer/players/3/33795.png', 88, 80, 79, 86, 90, 62, 73),
('Thibaut Courtois', 'Common', 'Real Madrid', 'Belgium', 'GK', 'https://cdn.sportmonks.com/images/soccer/players/16/17072.png', 89, 47, 51, 74, 71, 35, 90),
('Rodri', 'Common', 'Manchester City', 'Spain', 'CDM', 'https://cdn.sportmonks.com/images/soccer/players/29/192605.png', 89, 62, 74, 79, 81, 88, 84),
('Federico Valverde', 'Common', 'Real Madrid', 'Uruguay', 'CM', 'https://cdn.sportmonks.com/images/soccer/players/31/307263.png', 87, 83, 80, 79, 82, 75, 84),
('Declan Rice', 'Common', 'Arsenal', 'England', 'CDM', 'https://cdn.sportmonks.com/images/soccer/players/21/263253.png', 86, 72, 70, 76, 77, 85, 82),
('Phil Foden', 'Common', 'Manchester City', 'England', 'CAM', 'https://cdn.sportmonks.com/images/soccer/players/5/273509.png', 87, 85, 80, 82, 89, 57, 70),
('Gianluigi Donnarumma', 'Common', 'PSG', 'Italy', 'GK', 'https://cdn.sportmonks.com/images/soccer/players/30/135262.png', 88, 50, 45, 68, 75, 40, 88),
('Rafael Leão', 'Common', 'AC Milan', 'Portugal', 'LW', 'https://cdn.sportmonks.com/images/soccer/players/17/339025.png', 86, 95, 76, 74, 87, 38, 78),
('Jamal Musiala', 'Common', 'Bayern Munich', 'Germany', 'CAM', 'https://cdn.sportmonks.com/images/soccer/players/26/411738.png', 85, 80, 76, 79, 87, 46, 65),
('Pedri', 'Common', 'Barcelona', 'Spain', 'CM', 'https://cdn.sportmonks.com/images/soccer/players/19/442419.png', 85, 68, 69, 83, 87, 61, 63),
('Ruben Dias', 'Common', 'Manchester City', 'Portugal', 'CB', 'https://cdn.sportmonks.com/images/soccer/players/1/81761.png', 88, 62, 49, 72, 70, 90, 85),
('Casemiro', 'Common', 'Manchester United', 'Brazil', 'CDM', 'https://cdn.sportmonks.com/images/soccer/players/30/50814.png', 86, 62, 68, 71, 72, 87, 88),
('Trent Alexander-Arnold', 'Common', 'Liverpool', 'England', 'RB', 'https://cdn.sportmonks.com/images/soccer/players/31/289887.png', 87, 76, 74, 89, 80, 78, 71),
('Karim Benzema', 'Common', 'Al Ittihad', 'France', 'ST', 'https://cdn.sportmonks.com/images/soccer/players/22/17366.png', 86, 75, 86, 83, 87, 39, 78);

-- Seed some store cards (10 random cards for direct purchase)
INSERT INTO store_cards (card_id, price, stock)
SELECT id, 
  CASE 
    WHEN rarity = 'Epic' THEN 500
    WHEN rarity = 'Rare' THEN 250
    ELSE 150
  END as price,
  -1 as stock
FROM cards
ORDER BY RANDOM()
LIMIT 10;
