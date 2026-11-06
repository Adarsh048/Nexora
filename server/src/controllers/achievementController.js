import Achievement from '../models/Achievement.js';

export async function getAchievements(req, res) {
  try {
    const achievements = await Achievement.find({ userId: req.user._id })
      .sort('unlocked -unlockedAt')
      .lean();
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    res.status(200).json({
      success: true,
      data: achievements,
      summary: {
        total: achievements.length,
        unlocked: unlockedCount,
        percentage: achievements.length ? Math.round((unlockedCount / achievements.length) * 100) : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

