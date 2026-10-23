import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    guestName: {
      type: String,
      default: 'Valued Guest',
    },
    email: {
      type: String,
      default: '',
    },
    roomNumber: {
      type: String,
      default: 'N/A',
    },
    bookingId: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

export default Feedback;