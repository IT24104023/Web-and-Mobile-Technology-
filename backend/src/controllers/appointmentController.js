import mongoose from "mongoose";
import { Appointment } from "../models/Appointment.js";
import { User } from "../models/User.js";

// @desc    Book a new appointment
// @route   POST /api/appointments/book
// @access  Private (Patient only)
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, doctorName, date, time, reason } = req.body;
    const patientId = req.user.user_id;
    const patientName = req.user.full_name || req.user.name;

    // Validate doctor exists and is a doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID or doctor not found",
      });
    }

    // Validate date is not in the past and within 30 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot book appointments for past dates",
      });
    }

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);
    if (appointmentDate > maxDate) {
      return res.status(400).json({
        success: false,
        message: "Cannot book appointments more than 30 days in advance",
      });
    }

    // Validate time is within working hours and in 30-minute intervals
    const validTimes = [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "01:00 PM",
      "01:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM",
      "05:00 PM",
    ];

    if (!validTimes.includes(time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time slot. Please select a time between 9:00 AM and 5:00 PM in 30-minute intervals",
      });
    }

    // Validate reason length
    if (reason && reason.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Reason cannot exceed 500 characters",
      });
    }

    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      time,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked for the selected doctor",
      });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      patientName,
      doctorName,
      date,
      time,
      reason: reason || "",
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get available slots for a doctor
// @route   GET /api/appointments/available-slots
// @access  Public
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date, excludeAppointmentId } = req.query;

    const allSlots = [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "01:00 PM",
      "01:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM",
      "05:00 PM",
    ];

    const bookedQuery = {
      doctorId,
      date: new Date(date),
      status: { $ne: "cancelled" },
    };
    if (excludeAppointmentId) {
      bookedQuery._id = { $ne: excludeAppointmentId };
    }

    const bookedSlots = await Appointment.find(bookedQuery).select("time");

    const bookedTimes = bookedSlots.map((slot) => slot.time);
    const availableSlots = allSlots.filter((slot) => !bookedTimes.includes(slot));

    res.json({ success: true, availableSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get appointments for logged in patient
// @route   GET /api/appointments/my-appointments
// @access  Private (Patient only)
export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user.user_id;
    const appointments = await Appointment.find({ patientId }).sort({ date: -1, time: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get appointments for doctor
// @route   GET /api/appointments/doctor-appointments
// @access  Private (Doctor only)
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user.user_id }).sort({ date: 1, time: 1 });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/cancel/:id
// @access  Private (Patient only)
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Check if appointment is already completed
    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel appointment that is already completed",
      });
    }

    // Only patients can cancel their own appointments
    const patientUserId = (req.user.user_id).toString();
    if (appointment.patientId.toString() !== patientUserId) {
      return res.status(403).json({ success: false, message: "Not authorized to cancel this appointment" });
    }

    // Check 24-hour time limit for cancellation
    const createdAt = new Date(appointment.createdAt);
    const now = new Date();
    const hoursSinceBooking = (now - createdAt) / (1000 * 60 * 60);

    if (hoursSinceBooking > 24) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel appointment after 24 hours from booking time",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ success: true, message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/reschedule/:id
// @access  Private (Patient only)
export const rescheduleAppointment = async (req, res) => {
  try {
    const { date, time } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Check if appointment is already completed or cancelled
    if (appointment.status === "completed" || appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot reschedule appointment that is already completed or cancelled",
      });
    }

    const patientUserId = (req.user.user_id).toString();
    if (appointment.patientId.toString() !== patientUserId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to reschedule this appointment",
      });
    }

    // Check 24-hour time limit for rescheduling
    const createdAt = new Date(appointment.createdAt);
    const now = new Date();
    const hoursSinceBooking = (now - createdAt) / (1000 * 60 * 60);

    if (hoursSinceBooking > 24) {
      return res.status(400).json({
        success: false,
        message: "Cannot reschedule appointment after 24 hours from booking time",
      });
    }

    // Validate new date is not in the past and within 30 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newAppointmentDate = new Date(date);
    newAppointmentDate.setHours(0, 0, 0, 0);

    if (newAppointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot reschedule to past dates",
      });
    }

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);
    if (newAppointmentDate > maxDate) {
      return res.status(400).json({
        success: false,
        message: "Cannot reschedule more than 30 days in advance",
      });
    }

    // Validate new time is within working hours and in 30-minute intervals
    const validTimes = [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "01:00 PM",
      "01:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM",
      "05:00 PM",
    ];

    if (!validTimes.includes(time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time slot. Please select a time between 9:00 AM and 5:00 PM in 30-minute intervals",
      });
    }

    // Check if new slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date: new Date(date),
      time,
      status: { $ne: "cancelled" },
      _id: { $ne: req.params.id },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked for the selected doctor",
      });
    }

    appointment.date = date;
    appointment.time = time;
    appointment.status = "pending";
    await appointment.save();

    res.json({ success: true, message: "Appointment rescheduled successfully", appointment });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Confirm appointment (Doctor only)
// @route   PUT /api/appointments/confirm/:id
// @access  Private (Doctor only)
export const confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Doctor can only confirm appointments assigned to them
    const doctorUserId = (req.user.user_id).toString();
    if (appointment.doctorId.toString() !== doctorUserId) {
      return res.status(403).json({
        success: false,
        message: "Doctor can only confirm appointments assigned to them",
      });
    }

    // Cannot confirm cancelled appointments
    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot confirm cancelled appointment",
      });
    }

    appointment.status = "confirmed";
    await appointment.save();

    res.json({ success: true, message: "Appointment confirmed", appointment });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Complete appointment (Doctor only)
// @route   PUT /api/appointments/complete/:id
// @access  Private (Doctor only)
export const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Doctor can only complete appointments assigned to them
    const doctorUserId = (req.user.user_id).toString();
    if (appointment.doctorId.toString() !== doctorUserId) {
      return res.status(403).json({
        success: false,
        message: "Doctor can only complete appointments assigned to them",
      });
    }

    // Only confirmed appointments can be completed
    if (appointment.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed appointments can be marked as completed",
      });
    }

    appointment.status = "completed";
    await appointment.save();

    res.json({ success: true, message: "Appointment marked as completed", appointment });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get appointment stats for patient
// @route   GET /api/appointments/stats
// @access  Private (Patient only)
export const getAppointmentStats = async (req, res) => {
  try {
    const total = await Appointment.countDocuments({ patientId: req.user.user_id });
    const upcoming = await Appointment.countDocuments({
      patientId: req.user.user_id,
      date: { $gte: new Date() },
      status: { $in: ["pending", "confirmed"] },
    });
    const completed = await Appointment.countDocuments({
      patientId: req.user.user_id,
      status: "completed",
    });
    const cancelled = await Appointment.countDocuments({
      patientId: req.user.user_id,
      status: "cancelled",
    });

    res.json({ success: true, total, upcoming, completed, cancelled });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all appointments (Admin only)
// @route   GET /api/appointments/all
// @access  Private (Admin only)
export const getAllAppointments = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();
    const status = (req.query.status || "all").trim();

    const filter = {};
    if (status !== "all") {
      filter.status = status;
    }
    if (search) {
      filter.$or = [{ patientName: { $regex: search, $options: "i" } }, { doctorName: { $regex: search, $options: "i" } }];
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.json({
      success: true,
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update any appointment (Admin only)
// @route   PUT /api/appointments/admin/:id
// @access  Private (Admin only)
export const updateAppointmentByAdmin = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const { patientName, doctorName, date, time, status, reason } = req.body;

    // Check for double booking only if both date and time are provided
    if (date && time) {
      const existingAppointment = await Appointment.findOne({
        doctorId: appointment.doctorId,
        date: new Date(date),
        time,
        status: { $ne: "cancelled" },
        _id: { $ne: req.params.id },
      });

      if (existingAppointment) {
        return res.status(400).json({
          success: false,
          message: "This time slot is already booked",
        });
      }
    }

    if (patientName !== undefined) appointment.patientName = patientName;
    if (doctorName !== undefined) appointment.doctorName = doctorName;
    if (date !== undefined) appointment.date = date;
    if (time !== undefined) appointment.time = time;
    if (status !== undefined) appointment.status = status;
    if (reason !== undefined) appointment.reason = reason;

    await appointment.save();

    res.json({
      success: true,
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Admin update error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Delete appointment (Admin only)
// @route   DELETE /api/appointments/admin/:id
// @access  Private (Admin only)
export const deleteAppointmentByAdmin = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    await Appointment.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
