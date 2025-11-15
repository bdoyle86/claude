import express from 'express';
import { getStoreCards, buyCard } from '../controllers/storeController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// All store routes require authentication
router.get('/', authenticateToken, getStoreCards);
router.post('/buy', authenticateToken, buyCard);

export default router;
