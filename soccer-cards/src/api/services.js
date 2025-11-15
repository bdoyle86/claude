import api from './axios';

// Auth services
export const authService = {
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Pack services
export const packService = {
  getPacks: async () => {
    const response = await api.get('/packs');
    return response.data;
  },

  buyPack: async (packId) => {
    const response = await api.post('/packs/buy', { packId });
    return response.data;
  },
};

// Collection services
export const collectionService = {
  getCollection: async (filters = {}) => {
    const response = await api.get('/collection', { params: filters });
    return response.data;
  },

  getCardDetails: async (cardId) => {
    const response = await api.get(`/collection/${cardId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/collection/stats');
    return response.data;
  },
};

// Store services
export const storeService = {
  getStoreCards: async () => {
    const response = await api.get('/store');
    return response.data;
  },

  buyCard: async (cardId) => {
    const response = await api.post('/store/buy', { cardId });
    return response.data;
  },
};
