-- Trading System Migration
-- This migration creates the necessary tables for player-to-player card trading

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'cancelled'
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT different_users CHECK (initiator_id != recipient_id)
);

-- Create trade_items table (cards being offered in each trade)
CREATE TABLE IF NOT EXISTS trade_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trades_initiator ON trades(initiator_id);
CREATE INDEX IF NOT EXISTS idx_trades_recipient ON trades(recipient_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trade_items_trade ON trade_items(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_items_user ON trade_items(user_id);

-- Enable Row Level Security
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trades table
-- Users can view trades they're involved in
CREATE POLICY "Users can view their trades"
  ON trades FOR SELECT
  USING (
    auth.uid() = initiator_id OR
    auth.uid() = recipient_id
  );

-- Users can create trades
CREATE POLICY "Users can create trades"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);

-- Users can update trades they're involved in
CREATE POLICY "Users can update their trades"
  ON trades FOR UPDATE
  USING (
    auth.uid() = initiator_id OR
    auth.uid() = recipient_id
  )
  WITH CHECK (
    auth.uid() = initiator_id OR
    auth.uid() = recipient_id
  );

-- RLS Policies for trade_items table
-- Users can view trade items for trades they're involved in
CREATE POLICY "Users can view trade items"
  ON trade_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_items.trade_id
      AND (trades.initiator_id = auth.uid() OR trades.recipient_id = auth.uid())
    )
  );

-- Users can insert trade items for their own trades
CREATE POLICY "Users can create trade items"
  ON trade_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_items.trade_id
      AND trades.initiator_id = auth.uid()
    )
  );

-- Create function to handle trade acceptance
CREATE OR REPLACE FUNCTION accept_trade(trade_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  trade_record RECORD;
  item RECORD;
  user_card RECORD;
BEGIN
  -- Get trade details
  SELECT * INTO trade_record FROM trades WHERE id = trade_id_param;

  -- Verify trade exists and is pending
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Trade not found');
  END IF;

  IF trade_record.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Trade is not pending');
  END IF;

  -- Verify caller is the recipient
  IF auth.uid() != trade_record.recipient_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;

  -- Verify both users have the cards they're offering
  FOR item IN
    SELECT * FROM trade_items WHERE trade_id = trade_id_param
  LOOP
    SELECT * INTO user_card
    FROM user_cards
    WHERE user_id = item.user_id
    AND card_id = item.card_id;

    IF NOT FOUND OR user_card.quantity < item.quantity THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient cards');
    END IF;
  END LOOP;

  -- Transfer cards
  FOR item IN
    SELECT * FROM trade_items WHERE trade_id = trade_id_param
  LOOP
    -- Determine who receives this card (the other person)
    DECLARE
      recipient_user_id UUID;
    BEGIN
      IF item.user_id = trade_record.initiator_id THEN
        recipient_user_id := trade_record.recipient_id;
      ELSE
        recipient_user_id := trade_record.initiator_id;
      END IF;

      -- Remove from sender
      UPDATE user_cards
      SET quantity = quantity - item.quantity
      WHERE user_id = item.user_id AND card_id = item.card_id;

      -- Delete if quantity reaches 0
      DELETE FROM user_cards
      WHERE user_id = item.user_id
      AND card_id = item.card_id
      AND quantity <= 0;

      -- Add to recipient
      SELECT * INTO user_card
      FROM user_cards
      WHERE user_id = recipient_user_id
      AND card_id = item.card_id;

      IF FOUND THEN
        UPDATE user_cards
        SET quantity = quantity + item.quantity
        WHERE user_id = recipient_user_id AND card_id = item.card_id;
      ELSE
        INSERT INTO user_cards (user_id, card_id, quantity)
        VALUES (recipient_user_id, item.card_id, item.quantity);
      END IF;
    END;
  END LOOP;

  -- Update trade status
  UPDATE trades
  SET status = 'accepted',
      updated_at = NOW(),
      completed_at = NOW()
  WHERE id = trade_id_param;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION accept_trade(UUID) TO authenticated;
