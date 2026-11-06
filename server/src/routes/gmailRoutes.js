import { Router } from 'express';
import { getGmailStatus, getAuthUrl, oauthCallback, disconnect, syncNow, connectDemoGmail } from '../controllers/gmailController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// OAuth callback is called by Google's redirect
router.get('/oauth/callback', oauthCallback);

// Protected routes
router.use(protect);
router.get('/status', getGmailStatus);
router.get('/auth-url', getAuthUrl);
router.post('/sync', syncNow);
router.post('/demo-connect', connectDemoGmail);
router.post('/disconnect', disconnect);

export default router;

