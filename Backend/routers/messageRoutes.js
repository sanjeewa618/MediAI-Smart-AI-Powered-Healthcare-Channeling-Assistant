import express from 'express';
import { sendMessage, getMessages, markAsRead } from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Require auth for all message routes
router.use(protect);

router.post('/', sendMessage);
router.get('/:otherUserId', getMessages);
router.put('/:senderId/read', markAsRead);

export default router;
