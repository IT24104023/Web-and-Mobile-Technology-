import mongoose from 'mongoose';
const { Schema } = mongoose;

const FeedbackSchema = new Schema({
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  appUsabilityRating: { type: Number, min: 1, max: 5, required: true },
  appUsabilityComment: { type: String, required: true },

  consultationRating: { type: Number, min: 1, max: 5, required: true },
  consultationComment: { type: String, required: true },

  doctorServiceRating: { type: Number, min: 1, max: 5, required: true },
  doctorServiceComment: { type: String, required: true },

  overallComments: { type: String, required: true },

  doctorReply: {
    text: String,
    repliedAt: Date
  },

  adminReply: {
    text: String,
    repliedAt: Date
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

export default mongoose.model('Feedback', FeedbackSchema);
