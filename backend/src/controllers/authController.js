import bcrypt from "bcryptjs";
import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";
import { User } from "../models/User.js";
import { Appointment } from "../models/Appointment.js";
import { EmergencyContact } from "../models/EmergencyContact.js";
import Feedback from "../models/Feedback.js";
import { Prescription } from "../models/Prescription.js";
import { Order } from "../models/Order.js";
import { Admin } from "../models/Admin.js";
import { createToken } from "../utils/createToken.js";

const validRolesForRegistration = ["patient", "doctor"];
const validRolesForLogin = ["patient", "doctor", "admin"];

const sanitizeUser = (user) => ({
  user_id: user._id,
  full_name: user.full_name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  profile_image: user.profile_image,
  status: user.status,
  created_at: user.created_at,
});

export const register = async (req, res) => {
  try {
    const body = req.body;
    const parsedPatient = typeof body.patient === "string" ? JSON.parse(body.patient) : body.patient;
    const parsedDoctor = typeof body.doctor === "string" ? JSON.parse(body.doctor) : body.doctor;
    const uploadedProfileImage = req.file ? `/uploads/${req.file.filename}` : "";

    const {
      full_name,
      email,
      password,
      confirm_password,
      phone,
      role,
      profile_image,
    } = body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ message: "full_name, email, password, and role are required" });
    }

    if (!validRolesForRegistration.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Use patient or doctor" });
    }

    if (confirm_password && password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Validate doctor working hours if registering as doctor
    if (role === "doctor" && parsedDoctor?.working_hours_start && parsedDoctor?.working_hours_end) {
      const workStart = parsedDoctor.working_hours_start;
      const workEnd = parsedDoctor.working_hours_end;

      // Convert to minutes for comparison
      const [startHour, startMin] = workStart.split(":").map(Number);
      const [endHour, endMin] = workEnd.split(":").map(Number);
      const startTimeInMinutes = startHour * 60 + startMin;
      const endTimeInMinutes = endHour * 60 + endMin;

      // Clinic hours: 09:00 (540 minutes) to 22:00 (1320 minutes)
      const clinicStartInMinutes = 9 * 60; // 09:00
      const clinicEndInMinutes = 22 * 60; // 22:00

      if (startTimeInMinutes < clinicStartInMinutes || startTimeInMinutes > clinicEndInMinutes) {
        return res.status(400).json({
          message: "Working hours start time must be between 09:00 and 22:00",
        });
      }

      if (endTimeInMinutes < clinicStartInMinutes || endTimeInMinutes > clinicEndInMinutes) {
        return res.status(400).json({
          message: "Working hours end time must be between 09:00 and 22:00",
        });
      }

      if (startTimeInMinutes >= endTimeInMinutes) {
        return res.status(400).json({
          message: "Working hours end time must be after start time",
        });
      }
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name,
      email,
      password_hash,
      phone: phone || "",
      role,
      profile_image: uploadedProfileImage || profile_image || "",
      status: "active",
    });

    if (role === "patient") {
      await Patient.create({
        user_id: user._id,
        date_of_birth: parsedPatient?.date_of_birth || undefined,
        gender: parsedPatient?.gender || "prefer_not_to_say",
        blood_group: parsedPatient?.blood_group || "",
        address: parsedPatient?.address || "",
        allergies: parsedPatient?.allergies || "",
        medical_notes: parsedPatient?.medical_notes || "",
      });
    }

    if (role === "doctor") {
      await Doctor.create({
        user_id: user._id,
        specialization: parsedDoctor?.specialization || "",
        license_number: parsedDoctor?.license_number || "",
        qualification: parsedDoctor?.qualification || "",
        experience: Number(parsedDoctor?.experience || 0),
        clinic_name: parsedDoctor?.clinic_name || "",
        working_hours_start: parsedDoctor?.working_hours_start || "09:00",
        working_hours_end: parsedDoctor?.working_hours_end || "17:00",
      });
    }

    const token = createToken({ user_id: user._id, role: user.role, email: user.email });

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "email, password and role are required" });
    }

    if (!validRolesForLogin.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Use patient, doctor, or admin" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role !== role) {
      return res.status(403).json({ message: "Role mismatch for this account" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken({ user_id: user._id, role: user.role, email: user.email });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const getPatientSettings = async (req, res) => {
  try {
    const { user_id } = req.user;
    console.log("Fetching settings for user_id:", user_id);

    const user = await User.findById(user_id);
    if (!user) {
      console.log("User not found for user_id:", user_id);
      return res.status(404).json({ message: "User not found" });
    }

    const patient = await Patient.findOne({ user_id });
    if (!patient) {
      console.log("Patient record not found for user_id:", user_id);
      return res.status(404).json({ message: "Patient record not found" });
    }

    console.log("Settings retrieved successfully for user_id:", user_id);
    return res.status(200).json({
      message: "Settings retrieved successfully",
      data: {
        user: {
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          profile_image: user.profile_image,
        },
        patient: {
          date_of_birth: patient.date_of_birth,
          gender: patient.gender,
          blood_group: patient.blood_group,
          address: patient.address,
          allergies: patient.allergies,
          medical_notes: patient.medical_notes,
        },
      },
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return res.status(500).json({ message: "Failed to retrieve settings", error: error.message });
  }
};

export const updatePatientSettings = async (req, res) => {
  try {
    const { user_id } = req.user;
    const {
      full_name,
      phone,
      date_of_birth,
      gender,
      blood_group,
      address,
      allergies,
      medical_notes,
    } = req.body;

    const uploadedProfileImage = req.file ? `/uploads/${req.file.filename}` : "";

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user info
    if (full_name) user.full_name = full_name;
    if (phone) user.phone = phone;
    if (uploadedProfileImage) {
      console.log("Updating profile image to:", uploadedProfileImage);
      user.profile_image = uploadedProfileImage;
    }
    await user.save();

    // Update patient info
    const patient = await Patient.findOne({ user_id });
    if (!patient) {
      return res.status(404).json({ message: "Patient record not found" });
    }

    if (date_of_birth) patient.date_of_birth = date_of_birth;
    if (gender) patient.gender = gender;
    if (blood_group !== undefined) patient.blood_group = blood_group;
    if (address !== undefined) patient.address = address;
    if (allergies !== undefined) patient.allergies = allergies;
    if (medical_notes !== undefined) patient.medical_notes = medical_notes;
    await patient.save();

    console.log("Settings updated successfully for user_id:", user_id);
    return res.status(200).json({
      message: "Settings updated successfully",
      data: {
        user: {
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          profile_image: user.profile_image,
        },
        patient: {
          date_of_birth: patient.date_of_birth,
          gender: patient.gender,
          blood_group: patient.blood_group,
          address: patient.address,
          allergies: patient.allergies,
          medical_notes: patient.medical_notes,
        },
      },
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return res.status(500).json({ message: "Failed to update settings", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { user_id, role } = req.user;
    const {
      full_name,
      email,
      phone,
      specialization,
      bio,
      clinic_name,
      clinic_address,
      working_hours_start,
      working_hours_end,
    } = req.body;

    console.log("UpdateProfile called with:", { user_id, role, body: req.body });

    const uploadedProfileImage = req.file ? `/uploads/${req.file.filename}` : "";

    const user = await User.findById(user_id);
    if (!user) {
      console.log("User not found:", user_id);
      return res.status(404).json({ message: "User not found" });
    }

    // Validate doctor working hours if updating as doctor
    if (role === "doctor" && (working_hours_start || working_hours_end)) {
      // Get current values from database if not updating
      const doctor = await Doctor.findOne({ user_id });
      const currentStart = working_hours_start || doctor?.working_hours_start || "09:00";
      const currentEnd = working_hours_end || doctor?.working_hours_end || "17:00";

      // Convert to minutes for comparison
      const [startHour, startMin] = currentStart.split(":").map(Number);
      const [endHour, endMin] = currentEnd.split(":").map(Number);
      const startTimeInMinutes = startHour * 60 + startMin;
      const endTimeInMinutes = endHour * 60 + endMin;

      // Clinic hours: 09:00 (540 minutes) to 22:00 (1320 minutes)
      const clinicStartInMinutes = 9 * 60; // 09:00
      const clinicEndInMinutes = 22 * 60; // 22:00

      if (startTimeInMinutes < clinicStartInMinutes || startTimeInMinutes > clinicEndInMinutes) {
        return res.status(400).json({
          message: "Working hours start time must be between 09:00 and 22:00",
        });
      }

      if (endTimeInMinutes < clinicStartInMinutes || endTimeInMinutes > clinicEndInMinutes) {
        return res.status(400).json({
          message: "Working hours end time must be between 09:00 and 22:00",
        });
      }

      if (startTimeInMinutes >= endTimeInMinutes) {
        return res.status(400).json({
          message: "Working hours end time must be after start time",
        });
      }
    }

    // Update user info
    if (full_name) user.full_name = full_name;
    if (phone) user.phone = phone;
    if (uploadedProfileImage) {
      user.profile_image = uploadedProfileImage;
    }
    await user.save();
    console.log("User updated successfully");

    // Update doctor info if user is a doctor
    if (role === "doctor") {
      const doctor = await Doctor.findOne({ user_id });
      if (!doctor) {
        console.log("Doctor record not found for user_id:", user_id);
        return res.status(404).json({ message: "Doctor record not found" });
      }

      if (specialization) doctor.specialization = specialization;
      if (bio) doctor.bio = bio;
      if (clinic_name) doctor.clinic_name = clinic_name;
      if (clinic_address) doctor.clinic_address = clinic_address;
      if (working_hours_start) doctor.working_hours_start = working_hours_start;
      if (working_hours_end) doctor.working_hours_end = working_hours_end;
      await doctor.save();
      console.log("Doctor updated successfully");

      return res.status(200).json({
        message: "Profile updated successfully",
        data: {
          user: {
            user_id: user._id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            profile_image: user.profile_image,
            role: user.role,
          },
          doctor: {
            specialization: doctor.specialization,
            bio: doctor.bio,
            clinic_name: doctor.clinic_name,
            clinic_address: doctor.clinic_address,
            working_hours_start: doctor.working_hours_start,
            working_hours_end: doctor.working_hours_end,
          },
        },
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      data: {
        user: {
          user_id: user._id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          profile_image: user.profile_image,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { current_password, new_password } = req.body;

    console.log("ChangePassword called for user_id:", user_id);

    // Validation
    if (!current_password || !new_password) {
      console.log("Missing current_password or new_password");
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (new_password.length < 8) {
      console.log("New password too short");
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }

    // Find user
    const user = await User.findById(user_id);
    if (!user) {
      console.log("User not found:", user_id);
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isPasswordValid) {
      console.log("Current password is incorrect for user:", user_id);
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // Update password
    user.password_hash = hashedNewPassword;
    await user.save();

    console.log("Password changed successfully for user:", user_id);
    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    return res.status(500).json({ message: "Failed to change password", error: error.message });
  }
};

export const deactivateAccount = async (req, res) => {
  try {
    const { user_id } = req.user;
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.status = "inactive";
    await user.save();
    return res.status(200).json({ message: "Account deactivated successfully" });
  } catch (error) {
    console.error("Deactivate account error:", error);
    return res.status(500).json({ message: "Failed to deactivate account", error: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { user_id } = req.user;
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Delete Role Specific Data
    if (user.role === "patient") {
      await Patient.findOneAndDelete({ user_id });
    } else if (user.role === "doctor") {
      await Doctor.findOneAndDelete({ user_id });
    } else if (user.role === "admin") {
      await Admin.findOneAndDelete({ user_id });
    }

    // 2. Cascade Delete All Related Records
    await Appointment.deleteMany({ $or: [{ patientId: user_id }, { doctorId: user_id }] });
    await EmergencyContact.deleteMany({ patientId: user_id });
    await Feedback.deleteMany({ $or: [{ patientId: user_id }, { doctorId: user_id }] });
    await Prescription.deleteMany({ $or: [{ patient: user_id }, { doctor: user_id }] });
    await Order.deleteMany({ patient: user_id });
    
    // 3. Delete Core User Data
    await User.findByIdAndDelete(user_id);

    return res.status(200).json({ message: "Account and all associated data deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ message: "Failed to delete account", error: error.message });
  }
};

// GET: Get users by role (admin only)
export const getUsersByRole = async (req, res) => {
  try {
    const { user_id, role } = req.user;
    const { role: queryRole } = req.query;

    // Verify admin or doctor access
    if (role !== "admin" && role !== "doctor") {
      return res.status(403).json({ message: "Only admins and doctors can access this endpoint" });
    }

    if (!queryRole) {
      return res.status(400).json({ message: "Role query parameter is required" });
    }

    // Get users with specified role (all statuses)
    const users = await User.find({
      role: queryRole,
    }).select("-password");

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// GET: Get all doctors with their specialization (admin only)
export const getDoctorsWithSpecialization = async (req, res) => {
  try {
    const { role } = req.user;

    // Verify admin access
    if (role !== "admin") {
      return res.status(403).json({ message: "Only admins can access this endpoint" });
    }

    // Get all active doctors with their specialization
    const doctors = await Doctor.find()
      .populate({
        path: "user_id",
        select: "full_name profile_image status",
        match: { status: "active" },
      })
      .lean();

    // Filter out doctors where user_id is null (deleted or inactive users)
    const activeDoctors = doctors
      .filter((doc) => doc.user_id !== null)
      .map((doc) => ({
        id: doc._id,
        user_id: doc.user_id._id,
        name: doc.user_id.full_name,
        profile_image: doc.user_id.profile_image,
        specialization: doc.specialization || "General Dentistry",
      }));

    return res.status(200).json({
      success: true,
      data: activeDoctors,
    });
  } catch (error) {
    console.error("Error fetching doctors with specialization:", error);
    return res.status(500).json({ message: "Failed to fetch doctors", error: error.message });
  }
};

// PUT: Update user status (admin only)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    const { role } = req.user;

    // Verify admin access
    if (role !== "admin") {
      return res.status(403).json({ message: "Only admins can update user status" });
    }

    // Validate status value
    const validStatuses = ["active", "inactive", "blocked"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select("full_name email status role");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return res.status(500).json({ message: "Failed to update user status", error: error.message });
  }
};
