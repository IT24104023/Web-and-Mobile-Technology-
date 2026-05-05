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

    // Group contacts by patient
    const grouped = {};
    contacts.forEach((c) => {
      const pid = c.patientId?._id?.toString() || c.patientId?.toString();
      if (!pid) return;

      if (!grouped[pid]) {
        grouped[pid] = {
          _id: pid, // Use patient ID as record ID
          patient_id: c.patientId,
          primary: null,
          secondary: null,
        };
      }

      if (c.isPrimary) {
        grouped[pid].primary = c;
      } else if (!grouped[pid].secondary) {
        grouped[pid].secondary = c;
      }
    });

    res.json({ success: true, data: Object.values(grouped) });
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

    const { id: patientId } = req.params;
    const { primary, secondary } = req.body;

    // Process Primary
    if (primary) {
      const pData = {
        name: primary.name,
        relationship: primary.relationship,
        phone: primary.phone,
        isPrimary: true,
        patientId,
        isDeleted: false,
      };
      if (primary._id) {
        await EmergencyContact.findByIdAndUpdate(primary._id, pData);
      } else {
        await EmergencyContact.create(pData);
      }
    }

    // Process Secondary
    if (secondary && secondary.name) {
      const sData = {
        name: secondary.name,
        relationship: secondary.relationship,
        phone: secondary.phone,
        isPrimary: false,
        patientId,
        isDeleted: false,
      };
      if (secondary._id) {
        await EmergencyContact.findByIdAndUpdate(secondary._id, sData);
      } else {
        await EmergencyContact.create(sData);
      }
    } else if (secondary === null) {
      await EmergencyContact.updateMany(
        { patientId, isPrimary: false, isDeleted: false },
        { $set: { isDeleted: true } }
      );
    }

    // Return grouped result
    const updatedContacts = await EmergencyContact.find({ patientId, isDeleted: false })
      .populate("patientId", "full_name email phone")
      .lean();

    const data = {
      _id: patientId,
      patient_id: updatedContacts[0]?.patientId,
      primary: updatedContacts.find((c) => c.isPrimary) || null,
      secondary: updatedContacts.find((c) => !c.isPrimary) || null,
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error("updateAdminContact error:", error);
    res.status(500).json({ message: "Server error while updating contact." });
  }
};

export const deleteAdminContact = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "doctor") {
      return res.status(403).json({ message: "Admin or Doctor access required" });
    }

    const { id: patientId } = req.params;
    await EmergencyContact.updateMany({ patientId }, { $set: { isDeleted: true } });

    res.json({ success: true, message: "Contact record deleted successfully" });
  } catch (error) {
    console.error("deleteAdminContact error:", error);
    res.status(500).json({ message: "Server error while deleting contact." });
  }
};

export const getPatientContacts = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "doctor") {
      return res.status(403).json({ message: "Admin or Doctor access required" });
    }

    const { patientId } = req.params;
    const contacts = await EmergencyContact.find({ patientId, isDeleted: false })
      .populate("patientId", "full_name email phone")
      .lean();

    if (!contacts || contacts.length === 0) {
      return res.status(404).json({ message: "No emergency contacts found for this patient." });
    }

    const data = {
      patient_id: contacts[0].patientId,
      primary: contacts.find((c) => c.isPrimary) || null,
      secondary: contacts.find((c) => !c.isPrimary) || null,
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error("getPatientContacts error:", error);
    res.status(500).json({ message: "Server error while fetching contacts." });
  }
};

// Web Frontend Helpers
export const getMyContactsWeb = async (req, res) => {
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

    const primary = contacts.find((c) => c.isPrimary) || null;
    const secondary = contacts.find((c) => !c.isPrimary) || null;

    res.json({
      success: true,
      data: {
        primary,
        secondary,
      },
    });
  } catch (error) {
    console.error("getMyContactsWeb error:", error);
    res.status(500).json({ message: "Server error while fetching emergency contacts." });
  }
};

export const syncMyContacts = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { primary, secondary } = req.body;
    const patientId = req.user.user_id;

    // Handle Primary
    if (primary && primary.name) {
      const pData = {
        name: primary.name,
        relationship: primary.relationship,
        phone: primary.phone,
        alternatePhone: primary.alternatePhone || "",
        email: primary.email || "",
        isPrimary: true,
        patientId,
        isDeleted: false,
      };

      if (primary._id) {
        await EmergencyContact.findByIdAndUpdate(primary._id, pData, { upsert: true });
      } else {
        // Check if a primary already exists for this patient
        const existingPrimary = await EmergencyContact.findOne({ patientId, isPrimary: true, isDeleted: false });
        if (existingPrimary) {
          await EmergencyContact.findByIdAndUpdate(existingPrimary._id, pData);
        } else {
          await EmergencyContact.create(pData);
        }
      }
    }

    // Handle Secondary
    if (secondary && secondary.name) {
      const sData = {
        name: secondary.name,
        relationship: secondary.relationship,
        phone: secondary.phone,
        alternatePhone: secondary.alternatePhone || "",
        email: secondary.email || "",
        isPrimary: false,
        patientId,
        isDeleted: false,
      };

      if (secondary._id) {
        await EmergencyContact.findByIdAndUpdate(secondary._id, sData, { upsert: true });
      } else {
        // Check if a secondary already exists
        const existingSecondary = await EmergencyContact.findOne({ patientId, isPrimary: false, isDeleted: false });
        if (existingSecondary) {
          await EmergencyContact.findByIdAndUpdate(existingSecondary._id, sData);
        } else {
          await EmergencyContact.create(sData);
        }
      }
    } else {
      // If secondary is null/empty but exists in DB, we should probably mark it as deleted 
      // if the user explicitly removed it in the web UI.
      // But for safety and to avoid breaking mobile multi-contacts, let's only do it if the user intended.
      // In the web UI, 'secondary' being null means it was removed.
      if (secondary === null) {
         await EmergencyContact.updateMany(
           { patientId, isPrimary: false, isDeleted: false },
           { $set: { isDeleted: true } }
         );
      }
    }

    res.json({ success: true, message: "Emergency contacts updated successfully" });
  } catch (error) {
    console.error("syncMyContacts error:", error);
    res.status(500).json({ message: "Server error while syncing emergency contacts." });
  }
};
