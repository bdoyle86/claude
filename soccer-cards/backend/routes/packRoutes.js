import express from 'express';
import { getPacks, buyPack } from '../controllers/packController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// All pack routes require authentication
router.get('/', authenticateToken, getPacks);
router.post('/buy', authenticateToken, buyPack);

export default router;
