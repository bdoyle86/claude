-- Band Manager Simulation Database Schema
-- This file contains all table definitions for the game

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Game State Table (One row per user)
CREATE TABLE game_state (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    band_name TEXT NOT NULL,
    money INTEGER DEFAULT 5000,
    fame INTEGER DEFAULT 0,
    current_turn INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Band Members Table
CREATE TABLE band_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    instrument TEXT NOT NULL,
    skill_level INTEGER NOT NULL CHECK (skill_level >= 0 AND skill_level <= 100),
    genre TEXT NOT NULL,
    salary_per_turn INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Albums Table
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
    genre TEXT NOT NULL,
    total_money_made INTEGER DEFAULT 0,
    turn_created INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tours Table
CREATE TABLE tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    money_made INTEGER DEFAULT 0,
    fame_gained INTEGER DEFAULT 0,
    turn_completed INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inbox Messages Table
CREATE TABLE inbox_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    turn_received INTEGER NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hall of Fame Table (Public high scores)
CREATE TABLE hall_of_fame (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    band_name TEXT NOT NULL,
    final_fame_score INTEGER NOT NULL,
    date_achieved TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_band_members_user_id ON band_members(user_id);
CREATE INDEX idx_albums_user_id ON albums(user_id);
CREATE INDEX idx_tours_user_id ON tours(user_id);
CREATE INDEX idx_inbox_messages_user_id ON inbox_messages(user_id);
CREATE INDEX idx_inbox_messages_turn ON inbox_messages(turn_received);
CREATE INDEX idx_hall_of_fame_score ON hall_of_fame(final_fame_score DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_messages ENABLE ROW LEVEL SECURITY;

-- Policies for game_state
CREATE POLICY "Users can view their own game state"
    ON game_state FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game state"
    ON game_state FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game state"
    ON game_state FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game state"
    ON game_state FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for band_members
CREATE POLICY "Users can view their own band members"
    ON band_members FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own band members"
    ON band_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own band members"
    ON band_members FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own band members"
    ON band_members FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for albums
CREATE POLICY "Users can view their own albums"
    ON albums FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own albums"
    ON albums FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own albums"
    ON albums FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for tours
CREATE POLICY "Users can view their own tours"
    ON tours FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tours"
    ON tours FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tours"
    ON tours FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for inbox_messages
CREATE POLICY "Users can view their own messages"
    ON inbox_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
    ON inbox_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
    ON inbox_messages FOR UPDATE
    USING (auth.uid() = user_id);

-- Hall of Fame is publicly readable
ALTER TABLE hall_of_fame ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hall of fame"
    ON hall_of_fame FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can add to hall of fame"
    ON hall_of_fame FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_game_state_updated_at
    BEFORE UPDATE ON game_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
