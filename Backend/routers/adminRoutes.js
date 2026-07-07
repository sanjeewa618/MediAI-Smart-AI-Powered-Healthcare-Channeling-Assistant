import express from 'express';
import { getSystemStats, getAllUsers, updateUserRole, deleteUser } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Require login and Admin role for all routes in this file
router.use(protect);
router.use(adminOnly);

// System Dashboard Stats
router.get('/stats', getSystemStats);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
