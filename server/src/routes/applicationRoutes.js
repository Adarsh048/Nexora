import { Router } from 'express';
import {
  getApplications,
  getKanbanBoard,
  getApplicationById,
  createApplication,
  updateApplication,
  updateStatus,
  deleteApplication,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getApplications);
router.get('/kanban', getKanbanBoard);
router.get('/:id', getApplicationById);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deleteApplication);

export default router;

