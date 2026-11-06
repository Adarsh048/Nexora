import { Router } from 'express';
import {
  getInboxEmails,
  approveSuggestion,
  dismissSuggestion,
  manualLinkApplication,
  simulateEmail,
  clearInboxEmails,
} from '../controllers/inboxController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getInboxEmails);
router.post('/simulate', simulateEmail);
router.post('/clear', clearInboxEmails);
router.post('/approve/:emailId', approveSuggestion);
router.post('/dismiss/:emailId', dismissSuggestion);
router.post('/link/:emailId', manualLinkApplication);

export default router;

