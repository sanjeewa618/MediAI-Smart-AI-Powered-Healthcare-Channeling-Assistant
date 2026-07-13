import express from 'express';
import { analyzeSymptoms, getAIHistory, analyzeReports } from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Require auth for all AI Assistant routes
router.use(protect);

router.post('/analyze', analyzeSymptoms);
router.post('/chat', analyzeReports);
router.get('/history', getAIHistory);

export default router;
