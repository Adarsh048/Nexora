import { Router } from 'express';
import { getDashboardData, getFullAnalyticsData } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/dashboard', getDashboardData);
router.get('/insights', getFullAnalyticsData);

export default router;

