import { Medicine } from "../models/Medicine.js";

export const createMedicine = async (req, res) => {
  try {
    const { name, description, unitPrice, quantity, defaultDosage } = req.body;
    const medicine = new Medicine({ name, description, unitPrice, quantity, defaultDosage });
    await medicine.save();
    res.status(201).json(medicine);
  } catch (err) {
    res.status(500).json({ message: "Error creating medicine", error: err.message });
  }
};

export const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    res.status(200).json(medicines);
  } catch (err) {
    res.status(500).json({ message: "Error fetching medicines", error: err.message });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.status(200).json(medicine);
  } catch (err) {
    res.status(500).json({ message: "Error updating medicine", error: err.message });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.status(200).json({ message: "Medicine deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting medicine", error: err.message });
  }
};
