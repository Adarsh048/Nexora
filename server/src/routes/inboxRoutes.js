import { Router } from 'express';
import {
  getInboxEmails,
  approveSuggestion,
  dismissSuggestion,
  manualLinkApplication,
} from '../controllers/inboxController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getInboxEmails);
router.post('/approve/:emailId', approveSuggestion);
router.post('/dismiss/:emailId', dismissSuggestion);
router.post('/link/:emailId', manualLinkApplication);

export default router;

