// backend/src/routes/analytics.routes.ts
import { Router } from 'express';
import { logVisit, getDashboardStats } from '../controllers/analytics.controller';
import { requireAdminAuth } from '../middlewares/auth.middleware';

const router = Router();

// Public: Log visitor count upon catalog landing
router.post('/visit', logVisit);

// Admin: Retrieve dashboard statistics
router.get('/stats', requireAdminAuth, getDashboardStats);

export default router;
