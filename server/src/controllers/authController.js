import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Achievement from '../models/Achievement.js';
import { format } from 'date-fns';

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'nexora_super_secure_jwt_secret_key_2026_xyz', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function sendTokenResponse(user, statusCode, res) {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        careerGoal: user.careerGoal,
        targetRole: user.targetRole,
        weeklyGoal: user.weeklyGoal,
        streak: user.streak,
        preferences: user.preferences,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
}

// Initial achievements list for new users
async function initUserAchievements(userId) {
  const initialBadges = [
    { badgeKey: 'first_step', title: 'First Step', description: 'Added your first job application', icon: 'flag', category: 'application', maxProgress: 1 },
    { badgeKey: 'streak_starter', title: 'On Fire', description: 'Maintained a 3-day job search streak', icon: 'flame', category: 'streak', maxProgress: 3 },
    { badgeKey: 'interview_ready', title: 'In the Arena', description: 'Scheduled your first interview', icon: 'video', category: 'interview', maxProgress: 1 },
    { badgeKey: 'weekly_champion', title: 'Goal Crusher', description: 'Achieved your weekly application goal', icon: 'trophy', category: 'milestone', maxProgress: 5 },
    { badgeKey: 'offer_unlocked', title: 'Offer Landed', description: 'Received a formal job offer', icon: 'award', category: 'offer', maxProgress: 1 },
    { badgeKey: 'pipeline_pro', title: 'Pipeline Master', description: 'Tracked 20 or more applications', icon: 'layers', category: 'application', maxProgress: 20 },
  ];

  for (const b of initialBadges) {
    const exists = await Achievement.findOne({ userId, badgeKey: b.badgeKey });
    if (!exists) {
      await Achievement.create({ userId, ...b });
    }
  }
}

export async function register(req, res) {
  try {
    const { name, email, password, targetRole, careerGoal, weeklyGoal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      targetRole: targetRole || 'Software Engineer',
      careerGoal: careerGoal || 'Get your next offer',
      weeklyGoal: weeklyGoal || 5,
      streak: {
        current: 1,
        best: 1,
        lastActiveDate: new Date(),
        activeDays: [format(new Date(), 'yyyy-MM-dd')],
      },
    });

    await initUserAchievements(user._id);

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Update streak on login
    await updateUserStreak(user);

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
}

export async function logout(req, res) {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        careerGoal: user.careerGoal,
        targetRole: user.targetRole,
        weeklyGoal: user.weeklyGoal,
        streak: user.streak,
        preferences: user.preferences,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, avatar, targetRole, careerGoal, weeklyGoal, preferences, onboardingCompleted } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (careerGoal !== undefined) user.careerGoal = careerGoal;
    if (weeklyGoal !== undefined) user.weeklyGoal = weeklyGoal;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (onboardingCompleted !== undefined) user.onboardingCompleted = onboardingCompleted;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        careerGoal: user.careerGoal,
        targetRole: user.targetRole,
        weeklyGoal: user.weeklyGoal,
        streak: user.streak,
        preferences: user.preferences,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Demo quick-login helper
export async function demoLogin(req, res) {
  try {
    let demoUser = await User.findOne({ email: 'adarsh@nexora.dev' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Adarsh',
        email: 'adarsh@nexora.dev',
        password: 'password123',
        careerGoal: 'Get your next offer',
        targetRole: 'Full Stack Engineer',
        weeklyGoal: 5,
        streak: {
          current: 12,
          best: 14,
          lastActiveDate: new Date(),
          activeDays: [
            format(new Date(), 'yyyy-MM-dd'),
            format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'),
            format(new Date(Date.now() - 86400000 * 2), 'yyyy-MM-dd'),
            format(new Date(Date.now() - 86400000 * 3), 'yyyy-MM-dd'),
            format(new Date(Date.now() - 86400000 * 4), 'yyyy-MM-dd'),
          ],
        },
        onboardingCompleted: true,
      });
      await initUserAchievements(demoUser._id);
    }

    sendTokenResponse(demoUser, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateUserStreak(user) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const streak = user.streak || { current: 0, best: 0, lastActiveDate: null, activeDays: [] };

  if (streak.activeDays.includes(todayStr)) {
    return; // Already logged active today
  }

  const yesterdayStr = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
  const wasActiveYesterday = streak.activeDays.includes(yesterdayStr);

  if (wasActiveYesterday || streak.current === 0) {
    streak.current += 1;
  } else {
    streak.current = 1; // streak reset
  }

  if (streak.current > streak.best) {
    streak.best = streak.current;
  }

  streak.lastActiveDate = new Date();
  streak.activeDays.push(todayStr);

  // Keep last 30 active days
  if (streak.activeDays.length > 30) {
    streak.activeDays = streak.activeDays.slice(-30);
  }

  user.streak = streak;
  await user.save();
}

