import Guest from '../models/Guest.mjs';

// @desc    Get all guests
// @route   GET /api/guests
// @access  Private (Admin, Manager, Receptionist)
export const getGuests = async (req, res) => {
  try {
    const guests = await Guest.find({}).sort({ createdAt: -1 });
    res.json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error.message);
    res.status(500).json({ message: 'Server error fetching guests' });
  }
};

// @desc    Get single guest by ID
// @route   GET /api/guests/:id
// @access  Private
export const getGuestById = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }
    res.json(guest);
  } catch (error) {
    console.error('Error fetching guest details:', error.message);
    res.status(500).json({ message: 'Server error fetching guest details' });
  }
};

// @desc    Create a new guest (Public booking safe with duplicate handling)
// @route   POST /api/guests
// @access  Public / Private
export const createGuest = async (req, res) => {
  try {
    const { fullName, name, email, phone, idNumber, address } = req.body;

    const guestEmail = (email || '').trim().toLowerCase();

    // Check karein kya yeh guest pehle se mojood hai
    if (guestEmail) {
      const existingGuest = await Guest.findOne({ email: guestEmail });
      if (existingGuest) {
        return res.status(200).json(existingGuest);
      }
    }

    const guest = await Guest.create({
      fullName: fullName || name || 'Guest User',
      email: guestEmail,
      phone: phone || '',
      idNumber: idNumber || `WEB-${Date.now().toString().slice(-6)}`,
      address: address || 'Online Guest Booking',
    });

    res.status(201).json(guest);
  } catch (error) {
    console.error('Error creating guest:', error.message);
    res.status(500).json({ message: 'Server error creating guest' });
  }
};

// @desc    Update guest details
// @route   PUT /api/guests/:id
// @access  Private (Admin, Manager, Receptionist)
export const updateGuest = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    res.json(guest);
  } catch (error) {
    console.error('Error updating guest:', error.message);
    res.status(500).json({ message: 'Server error updating guest' });
  }
};

// @desc    Delete guest
// @route   DELETE /api/guests/:id
// @access  Private (Admin only)
export const deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }
    res.json({ message: 'Guest removed successfully' });
  } catch (error) {
    console.error('Error deleting guest:', error.message);
    res.status(500).json({ message: 'Server error deleting guest' });
  }
};