-- Soccer Card Tycoon - Feature Enhancements Migration
-- Run this script in your Supabase SQL Editor after the initial seed data

-- 1. Add daily login tracking to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_login_date DATE,
ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reward_claimed_at TIMESTAMP WITH TIME ZONE;

-- 2. Create transaction history table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  transaction_type VARCHAR NOT NULL CHECK (transaction_type IN ('pack_purchase', 'card_purchase', 'card_sell', 'daily_reward')),
  amount INTEGER NOT NULL, -- Negative for spending, positive for earning
  description TEXT,
  metadata JSONB, -- Store additional data like pack_id, card_id, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON public.transactions(created_at DESC);

-- 3. Update user_cards to properly track quantities
-- Add unique constraint to prevent duplicate entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_cards_user_card_unique'
  ) THEN
    ALTER TABLE public.user_cards
    ADD CONSTRAINT user_cards_user_card_unique UNIQUE (user_id, card_id);
  END IF;
END $$;

-- 4. Add more pack types to packs table
INSERT INTO public.packs (name, description, price, card_count, image_url) VALUES
('Premium Pack', 'Better odds! 50% Common, 35% Rare, 15% Epic!', 200, 5, 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800'),
('Elite Pack', 'Guaranteed Rare or better! The best pack available!', 500, 5, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800')
ON CONFLICT DO NOTHING;

-- 5. Create leaderboard view for easy querying
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.id,
  p.username,
  p.coins,
  COUNT(uc.id) as total_cards,
  COUNT(CASE WHEN c.rarity = 'Epic' THEN 1 END) as epic_cards,
  COUNT(CASE WHEN c.rarity = 'Rare' THEN 1 END) as rare_cards,
  COUNT(CASE WHEN c.rarity = 'Common' THEN 1 END) as common_cards,
  COALESCE(SUM(uc.quantity), 0) as total_card_count
FROM public.profiles p
LEFT JOIN public.user_cards uc ON p.id = uc.user_id
LEFT JOIN public.cards c ON uc.card_id = c.id
GROUP BY p.id, p.username, p.coins
ORDER BY total_cards DESC, epic_cards DESC;

-- Success message
SELECT 'Enhanced features migration completed! Added daily rewards, transactions, premium packs, and leaderboard support.' as message;
