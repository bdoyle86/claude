import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hetjmscabxbmnolsofyk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhldGptc2NhYnhibW5vbHNvZnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNDMzMzgsImV4cCI6MjA3ODgxOTMzOH0.pVoUFSzaokNw7c3vtQyA5LmfTAkyxJxMyEnUbdrnT-w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
