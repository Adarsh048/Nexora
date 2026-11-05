import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllRead);
router.delete('/:id', deleteNotification);

export default router;

