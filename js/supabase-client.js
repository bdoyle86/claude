// Supabase Database Client
// Handles all database operations for the Band Manager game

class SupabaseClient {
    constructor() {
        this.client = null;
        this.currentUser = null;
    }

    // Initialize Supabase client
    async init() {
        try {
            this.client = supabase.createClient(
                CONFIG.supabase.url,
                CONFIG.supabase.anonKey
            );

            // Check for existing session
            const { data: { session } } = await this.client.auth.getSession();
            if (session) {
                this.currentUser = session.user;
            }

            // Listen for auth changes
            this.client.auth.onAuthStateChange((event, session) => {
                this.currentUser = session?.user || null;
                this.handleAuthChange(event, session);
            });

            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            return false;
        }
    }

    handleAuthChange(event, session) {
        if (event === 'SIGNED_IN') {
            console.log('User signed in:', session.user.email);
        } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            window.location.href = '/index.html';
        }
    }

    // ===== AUTH OPERATIONS =====

    async signUp(email, password) {
        const { data, error } = await this.client.auth.signUp({
            email,
            password
        });

        if (error) throw error;
        return data;
    }

    async signIn(email, password) {
        const { data, error } = await this.client.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        this.currentUser = data.user;
        return data;
    }

    async signOut() {
        const { error } = await this.client.auth.signOut();
        if (error) throw error;
        this.currentUser = null;
    }

    async getCurrentUser() {
        const { data: { user } } = await this.client.auth.getUser();
        this.currentUser = user;
        return user;
    }

    // ===== GAME STATE OPERATIONS =====

    async getGameState() {
        const { data, error } = await this.client
            .from('game_state')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return data;
    }

    async createGameState(bandName) {
        const { data, error } = await this.client
            .from('game_state')
            .insert({
                user_id: this.currentUser.id,
                band_name: bandName,
                money: CONFIG.game.initialMoney,
                fame: CONFIG.game.initialFame,
                current_turn: 1
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateGameState(updates) {
        const { data, error } = await this.client
            .from('game_state')
            .update(updates)
            .eq('user_id', this.currentUser.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteGameState() {
        const { error } = await this.client
            .from('game_state')
            .delete()
            .eq('user_id', this.currentUser.id);

        if (error) throw error;
    }

    // ===== BAND MEMBERS OPERATIONS =====

    async getBandMembers() {
        const { data, error } = await this.client
            .from('band_members')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async addBandMember(member) {
        const { data, error } = await this.client
            .from('band_members')
            .insert({
                user_id: this.currentUser.id,
                ...member
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async removeBandMember(memberId) {
        const { error } = await this.client
            .from('band_members')
            .delete()
            .eq('id', memberId)
            .eq('user_id', this.currentUser.id);

        if (error) throw error;
    }

    // ===== ALBUMS OPERATIONS =====

    async getAlbums() {
        const { data, error } = await this.client
            .from('albums')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async addAlbum(album) {
        const { data, error } = await this.client
            .from('albums')
            .insert({
                user_id: this.currentUser.id,
                ...album
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateAlbum(albumId, updates) {
        const { data, error } = await this.client
            .from('albums')
            .update(updates)
            .eq('id', albumId)
            .eq('user_id', this.currentUser.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ===== TOURS OPERATIONS =====

    async getTours() {
        const { data, error } = await this.client
            .from('tours')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async addTour(tour) {
        const { data, error } = await this.client
            .from('tours')
            .insert({
                user_id: this.currentUser.id,
                ...tour
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ===== INBOX MESSAGES OPERATIONS =====

    async getInboxMessages() {
        const { data, error } = await this.client
            .from('inbox_messages')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('turn_received', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async addInboxMessage(message) {
        const { data, error } = await this.client
            .from('inbox_messages')
            .insert({
                user_id: this.currentUser.id,
                ...message
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async markMessageAsRead(messageId) {
        const { data, error } = await this.client
            .from('inbox_messages')
            .update({ is_read: true })
            .eq('id', messageId)
            .eq('user_id', this.currentUser.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ===== HALL OF FAME OPERATIONS =====

    async getHallOfFame(limit = 10) {
        const { data, error } = await this.client
            .from('hall_of_fame')
            .select('*')
            .order('final_fame_score', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    async addToHallOfFame(bandName, fameScore) {
        const { data, error } = await this.client
            .from('hall_of_fame')
            .insert({
                band_name: bandName,
                final_fame_score: fameScore
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ===== UTILITY OPERATIONS =====

    async resetGame() {
        // Delete all user data
        await this.client.from('band_members').delete().eq('user_id', this.currentUser.id);
        await this.client.from('albums').delete().eq('user_id', this.currentUser.id);
        await this.client.from('tours').delete().eq('user_id', this.currentUser.id);
        await this.client.from('inbox_messages').delete().eq('user_id', this.currentUser.id);
        await this.deleteGameState();
    }
}

// Create singleton instance
const db = new SupabaseClient();
