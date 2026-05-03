import { EmergencyContact } from "../models/EmergencyContact.js";

export const addContact = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { name, relationship, phone, alternatePhone, email, isPrimary } = req.body;

    if (!name || !relationship || !phone) {
      return res.status(400).json({ message: "Name, relationship, and phone are required." });
    }

    const contact = await EmergencyContact.create({
      patientId: req.user.user_id,
      name,
      relationship,
      phone,
      alternatePhone: alternatePhone || "",
      email: email || "",
      isPrimary: Boolean(isPrimary),
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error("addContact error:", error);
    res.status(500).json({ message: "Server error while adding emergency contact." });
  }
};

export const getMyContacts = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const contacts = await EmergencyContact.find({
      patientId: req.user.user_id,
      isDeleted: false,
    })
      .sort({ isPrimary: -1, createdAt: -1 })
      .lean();

    res.json(contacts);
  } catch (error) {
    console.error("getMyContacts error:", error);
    res.status(500).json({ message: "Server error while fetching emergency contacts." });
  }
};

export const updateContact = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;
    const { name, relationship, phone, alternatePhone, email, isPrimary } = req.body;

    const contact = await EmergencyContact.findOne({
      _id: id,
      patientId: req.user.user_id,
      isDeleted: false,
    });

    if (!contact) {
      return res.status(404).json({ message: "Emergency contact not found." });
    }

    contact.name = name || contact.name;
    contact.relationship = relationship || contact.relationship;
    contact.phone = phone || contact.phone;
    contact.alternatePhone = alternatePhone !== undefined ? alternatePhone : contact.alternatePhone;
    contact.email = email !== undefined ? email : contact.email;
    contact.isPrimary = Boolean(isPrimary);

    await contact.save();

    res.json(contact);
  } catch (error) {
    console.error("updateContact error:", error);
    res.status(500).json({ message: "Server error while updating emergency contact." });
  }
};

export const deleteContact = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;

    const contact = await EmergencyContact.findOne({
      _id: id,
      patientId: req.user.user_id,
      isDeleted: false,
    });

    if (!contact) {
      return res.status(404).json({ message: "Emergency contact not found." });
    }

    contact.isDeleted = true;
    contact.isPrimary = false;
    await contact.save();

    res.json({ message: "Emergency contact deleted successfully." });
  } catch (error) {
    console.error("deleteContact error:", error);
    res.status(500).json({ message: "Server error while deleting emergency contact." });
  }
};

export const setPrimary = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;

    const contact = await EmergencyContact.findOne({
      _id: id,
      patientId: req.user.user_id,
      isDeleted: false,
    });

    if (!contact) {
      return res.status(404).json({ message: "Emergency contact not found." });
    }

    contact.isPrimary = true;
    await contact.save();

    res.json(contact);
  } catch (error) {
    console.error("setPrimary error:", error);
    res.status(500).json({ message: "Server error while setting primary emergency contact." });
  }
};

// Admin Functions
export const getAdminAllContacts = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const contacts = await EmergencyContact.find({ isDeleted: false })
      .populate("patientId", "full_name email phone")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error("getAdminAllContacts error:", error);
    res.status(500).json({ message: "Server error while fetching all contacts." });
  }
};

export const updateAdminContact = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;
    const { name, relationship, phone, alternatePhone, email, isPrimary } = req.body;

    const contact = await EmergencyContact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    contact.name = name || contact.name;
    contact.relationship = relationship || contact.relationship;
    contact.phone = phone || contact.phone;
    contact.alternatePhone = alternatePhone !== undefined ? alternatePhone : contact.alternatePhone;
    contact.email = email !== undefined ? email : contact.email;
    contact.isPrimary = Boolean(isPrimary);

    await contact.save();
    
    // Return populated contact
    const updated = await EmergencyContact.findById(id).populate("patientId", "full_name email phone");
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("updateAdminContact error:", error);
    res.status(500).json({ message: "Server error while updating contact." });
  }
};

export const deleteAdminContact = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;
    const contact = await EmergencyContact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    contact.isDeleted = true;
    await contact.save();

    res.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error("deleteAdminContact error:", error);
    res.status(500).json({ message: "Server error while deleting contact." });
  }
};
