import express from 'express';
import { getCollection, getCardDetails, getCollectionStats } from '../controllers/collectionController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// All collection routes require authentication
router.get('/', authenticateToken, getCollection);
router.get('/stats', authenticateToken, getCollectionStats);
router.get('/:cardId', authenticateToken, getCardDetails);

export default router;
