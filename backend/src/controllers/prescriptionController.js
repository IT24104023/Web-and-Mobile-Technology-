import { Prescription } from "../models/Prescription.js";

export const createPrescription = async (req, res) => {
  try {
    const { patientId, medicines } = req.body;
    const doctorId = req.user.userId;

    const prescription = new Prescription({
      patient: patientId,
      doctor: doctorId,
      medicines
    });
    
    await prescription.save();
    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ message: "Error creating prescription", error: err.message });
  }
};

export const getPatientPrescriptions = async (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.userId : req.params.patientId;
    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('doctor', 'full_name')
      .populate('medicines.medicine')
      .sort({ createdAt: -1 });
    res.status(200).json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching prescriptions", error: err.message });
  }
};

export const getDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.user.userId })
      .populate('patient', 'full_name')
      .sort({ createdAt: -1 });
    res.status(200).json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching prescriptions", error: err.message });
  }
};
