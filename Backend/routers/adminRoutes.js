import express from 'express';
import { getSystemStats, getAllUsers, updateUserRole, deleteUser, getPendingRequests, approveRequest, rejectRequest, requestAdditionalDocuments, addUser, updateUserDetails, updateUserStatus, getAnalyticsMetrics, getAdminReport, exportAdminReport } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Require login and Admin role for all routes in this file
router.use(protect);
router.use(adminOnly);

// System Dashboard Stats
router.get('/stats', getSystemStats);
router.get('/analytics', getAnalyticsMetrics);
router.get('/reports', getAdminReport);
router.get('/reports/export', exportAdminReport);

// User Management
router.get('/users', getAllUsers);
router.post('/users', addUser);
router.put('/users/:id', updateUserDetails);
router.patch('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Requests Management
router.get('/requests', getPendingRequests);
router.put('/requests/:id/approve', approveRequest);
router.put('/requests/:id/reject', rejectRequest);
router.put('/requests/:id/request-docs', requestAdditionalDocuments);

export default router;
