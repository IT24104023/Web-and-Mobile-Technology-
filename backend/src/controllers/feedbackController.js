import Feedback from '../models/Feedback.js';
import { User } from '../models/User.js';
import { Appointment } from '../models/Appointment.js';

const isWithinEditWindow = (createdAt) => {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  return (now - created) < 10 * 60 * 1000;
};

export const submitFeedback = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can submit feedback', data: null });
    }

    const {
      appointmentId,
      doctorId,
      appUsabilityRating,
      appUsabilityComment,
      consultationRating,
      consultationComment,
      doctorServiceRating,
      doctorServiceComment,
      overallComments
    } = req.body;

    let appointment = null;
    if (Appointment) {
      appointment = await Appointment.findById(appointmentId);
      if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found', data: null });

      if (String(appointment.patientId) !== String(user.user_id)) {
        return res.status(403).json({ success: false, message: 'You can only submit feedback for your own appointment', data: null });
      }

      if (appointment.status !== 'completed') {
        return res.status(400).json({ success: false, message: 'Feedback allowed only for completed appointments', data: null });
      }
    } else {
      console.warn('Appointment model not found; skipping appointment ownership and status checks');
    }

    const existing = await Feedback.findOne({ appointmentId });
    if (existing) return res.status(400).json({ success: false, message: 'Feedback already submitted for this appointment', data: null });

    const feedback = await Feedback.create({
      appointmentId,
      patientId: user.user_id,
      doctorId,
      appUsabilityRating,
      appUsabilityComment,
      consultationRating,
      consultationComment,
      doctorServiceRating,
      doctorServiceComment,
      overallComments
    });

    return res.status(201).json({ success: true, message: 'Feedback submitted', data: feedback });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const getMyFeedbacks = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'patient') return res.status(403).json({ success: false, message: 'Only patients can view their feedbacks', data: null });

    const feedbacks = await Feedback.find({ patientId: user.user_id }).populate({ path: 'doctorId', select: 'full_name' }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, message: 'My feedbacks fetched', data: feedbacks });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const getClinicReviews = async (req, res) => {
  try {
    const reviews = await Feedback.find({ overallComments: { $exists: true, $ne: '' } })
      .populate({ path: 'patientId', select: 'full_name' })
      .populate({ path: 'doctorId', select: 'full_name' })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, message: 'Clinic reviews fetched', data: reviews });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const editFeedback = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const feedback = await Feedback.findById(id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found', data: null });

    if (String(feedback.patientId) !== String(user.user_id)) return res.status(403).json({ success: false, message: 'Not authorized', data: null });

    if (!isWithinEditWindow(feedback.createdAt)) {
      return res.status(403).json({ success: false, message: 'Edit window has expired', data: null });
    }

    const allowed = [
      'appUsabilityRating', 'appUsabilityComment',
      'consultationRating', 'consultationComment',
      'doctorServiceRating', 'doctorServiceComment',
      'overallComments'
    ];

    allowed.forEach(field => {
      if (req.body[field] !== undefined) feedback[field] = req.body[field];
    });

    feedback.updatedAt = new Date();
    await feedback.save();

    return res.status(200).json({ success: true, message: 'Feedback updated', data: feedback });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const feedback = await Feedback.findById(id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found', data: null });

    if (String(feedback.patientId) !== String(user.user_id)) return res.status(403).json({ success: false, message: 'Not authorized', data: null });

    if (!isWithinEditWindow(feedback.createdAt)) {
      return res.status(403).json({ success: false, message: 'Edit window has expired', data: null });
    }

    await feedback.deleteOne();
    return res.status(200).json({ success: true, message: 'Feedback deleted', data: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const doctorReply = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'doctor') return res.status(403).json({ success: false, message: 'Only doctors can reply', data: null });

    const { id } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Reply text required', data: null });

    const feedback = await Feedback.findById(id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found', data: null });

    if (String(feedback.doctorId) !== String(user.user_id)) return res.status(403).json({ success: false, message: 'Not authorized to reply', data: null });

    feedback.doctorReply = { text, repliedAt: new Date() };
    await feedback.save();

    return res.status(200).json({ success: true, message: 'Doctor reply saved', data: feedback });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const adminReply = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only admins can reply', data: null });

    const { id } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Reply text required', data: null });

    const feedback = await Feedback.findById(id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found', data: null });

    feedback.adminReply = { text, repliedAt: new Date() };
    await feedback.save();

    return res.status(200).json({ success: true, message: 'Admin reply saved', data: feedback });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};
