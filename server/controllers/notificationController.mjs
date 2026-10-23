import Notification from '../models/Notification.mjs';
import User from '../models/User.mjs';

// Reusable helper — single role broadcast
export const notifyRole = async (recipientRole, message, type = 'System', link = '') => {
  try {
    const doc = await Notification.create({ recipientRole, message, type, link });
    console.log(`[DB Notification Created] Role: ${recipientRole} | Msg: ${message}`);
    return doc;
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

// Reusable helper — multiple roles broadcast
export const notifyMultipleRoles = async (roles = [], message, type = 'System', link = '') => {
  try {
    const promises = roles.map((role) =>
      Notification.create({ recipientRole: role, message, type, link })
    );
    await Promise.all(promises);
    console.log(`[DB Broadcast] Sent to roles: ${roles.join(', ')}`);
  } catch (error) {
    console.error('Error creating multi-role notifications:', error.message);
  }
};

// Direct personal notification
export const notifyUser = async (recipientId, message, type = 'System', link = '') => {
  try {
    const doc = await Notification.create({ recipient: recipientId, message, type, link });
    return doc;
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

// @desc    Get notifications relevant to the logged-in user (their role broadcasts + personal)
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ recipient: req.user._id }, { recipientRole: req.user.role }],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const withReadFlag = notifications.map((n) => ({
      ...n.toObject(),
      isRead: n.readBy.some((id) => String(id) === String(req.user._id)),
    }));

    res.json(withReadFlag);
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (!notification.readBy.some((id) => String(id) === String(req.user._id))) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error.message);
    res.status(500).json({ message: 'Server error updating notification' });
  }
};

// @desc    Mark all of the user's notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ recipient: req.user._id }, { recipientRole: req.user.role }],
      readBy: { $ne: req.user._id },
    });

    await Promise.all(
      notifications.map((n) => {
        n.readBy.push(req.user._id);
        return n.save();
      })
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error.message);
    res.status(500).json({ message: 'Server error updating notifications' });
  }
};