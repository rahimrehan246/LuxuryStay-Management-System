import Task from '../models/Task.mjs';
import Room from '../models/Room.mjs';
import User from '../models/User.mjs';
import { notifyMultipleRoles } from './notificationController.mjs';

// @desc    Create service request from guest portal
// @route   POST /api/service-requests
// @access  Public
export const createServiceRequest = async (req, res) => {
  try {
    const { roomNumber, type, details, guestName } = req.body;

    if (!roomNumber || !type) {
      return res.status(400).json({ message: 'Room number and service type are required' });
    }

    // 1. Room document dhoondein taake ObjectId mil sake
    const cleanRoomNum = String(roomNumber).replace(/[^0-9]/g, '');
    let roomDoc = await Room.findOne({
      $or: [
        { roomNumber: roomNumber },
        { roomNumber: cleanRoomNum },
        { roomNumber: Number(cleanRoomNum) || 0 },
      ],
    });

    if (!roomDoc) {
      roomDoc = await Room.findOne();
    }

    if (!roomDoc) {
      return res.status(404).json({ message: 'No rooms found in database.' });
    }

    // 2. Default admin fetch karein agar createdBy required ho
    let defaultAdmin = await User.findOne({ role: 'Admin' });

    const dept = type === 'Dining' ? 'Kitchen' : 'Housekeeping';
    const taskTitle = `${type} Request - Room ${roomDoc.roomNumber}`;
    const taskDesc = `${details || type} (Requested by: ${guestName || 'In-House Guest'})`;

    // 3. Task create karein
    const taskPayload = {
      title: taskTitle,
      description: taskDesc,
      department: dept,
      priority: 'High',
      status: 'Pending',
      room: roomDoc._id,
      roomNumber: String(roomDoc.roomNumber),
      notes: details || '',
    };

    if (defaultAdmin?._id) {
      taskPayload.createdBy = defaultAdmin._id;
    }

    const newTask = await Task.create(taskPayload);

    // 4. Notification broadcast (type ko 'Task' rakha hai jo enum validation pass karega)
    try {
      await notifyMultipleRoles(
        ['Receptionist', 'Housekeeping', 'Admin'],
        `Room ${roomDoc.roomNumber} requested ${type}: "${details || 'Service requested'}"`,
        'Task',
        '/tasks'
      );
    } catch (nErr) {
      console.warn('Notification trigger skipped:', nErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Service request submitted successfully',
      task: newTask,
    });
  } catch (error) {
    console.error('Final Service Request Error:', error);
    res.status(500).json({
      message: error.message || 'Server error processing service request',
    });
  }
};

// @desc    Get all service requests/tasks
// @route   GET /api/service-requests
// @access  Private (Staff)
export const getServiceRequests = async (req, res) => {
  try {
    const tasks = await Task.find({})
      .populate('room')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching service requests' });
  }
};

// @desc    Update service request status
// @route   PATCH /api/service-requests/:id/status
// @access  Private (Staff)
export const updateServiceRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    res.json({ message: `Status updated to ${status}`, task });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating status' });
  }
};