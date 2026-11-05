import Notification from '../models/Notification.js';

export async function getNotifications(req, res) {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort('-createdAt').limit(20);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function markAsRead(req, res) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function markAllRead(req, res) {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteNotification(req, res) {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Notification removed',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

