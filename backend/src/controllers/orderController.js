import { Order } from "../models/Order.js";
import { Medicine } from "../models/Medicine.js";

export const createOrder = async (req, res) => {
  try {
    const { prescriptionId, items } = req.body;
    const patientId = req.user.userId;

    let totalAmount = 0;
    
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine || medicine.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }
      medicine.quantity -= item.quantity;
      await medicine.save();
      
      totalAmount += item.total;
    }

    const order = new Order({
      patient: patientId,
      prescription: prescriptionId,
      items,
      totalAmount
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
};

export const getPatientOrders = async (req, res) => {
  try {
    const orders = await Order.find({ patient: req.user.userId })
      .populate('prescription')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('patient', 'full_name')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching all orders", error: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
};
