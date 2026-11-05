import { Router } from 'express';
import { register, login, logout, getMe, updateProfile, demoLogin } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import Application from '../models/Application.js';
import ApplicationEvent from '../models/ApplicationEvent.js';
import CalendarEvent from '../models/CalendarEvent.js';
import ProcessedEmail from '../models/ProcessedEmail.js';
import Company from '../models/Company.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/demo', demoLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Clear user data (start fresh with 0 applications)
router.post('/clear-data', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    await Promise.all([
      Application.deleteMany({ userId }),
      ApplicationEvent.deleteMany({ userId }),
      CalendarEvent.deleteMany({ userId }),
      ProcessedEmail.deleteMany({ userId }),
      Company.deleteMany({ userId }),
    ]);

    res.status(200).json({
      success: true,
      message: 'All application records cleared. Workspace is now completely fresh.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
