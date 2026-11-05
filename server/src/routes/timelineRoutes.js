import { Router } from 'express';
import { getApplicationTimeline, addTimelineEvent, getActivityFeed } from '../controllers/timelineController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/feed', getActivityFeed);
router.get('/application/:applicationId', getApplicationTimeline);
router.post('/application/:applicationId', addTimelineEvent);

export default router;

