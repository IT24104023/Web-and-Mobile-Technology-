import mongoose from "mongoose";

const EmergencyContactSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    relationship: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please use a valid email address"],
      default: "",
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

EmergencyContactSchema.pre("save", async function (next) {
  if (!this.isModified("isPrimary") || !this.isPrimary) {
    return next();
  }

  try {
    await this.constructor.updateMany(
      {
        patientId: this.patientId,
        _id: { $ne: this._id },
        isPrimary: true,
      },
      { $set: { isPrimary: false } }
    );
    next();
  } catch (error) {
    next(error);
  }
});

EmergencyContactSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (!update) {
    return next();
  }

  const isPrimary = update.isPrimary !== undefined ? update.isPrimary : update.$set?.isPrimary;

  if (!isPrimary) {
    return next();
  }

  try {
    const contact = await this.model.findOne(this.getQuery()).lean();
    if (!contact) {
      return next();
    }

    await this.model.updateMany(
      {
        patientId: contact.patientId,
        _id: { $ne: contact._id },
        isPrimary: true,
      },
      { $set: { isPrimary: false } }
    );

    next();
  } catch (error) {
    next(error);
  }
});

export const EmergencyContact = mongoose.model("EmergencyContact", EmergencyContactSchema);
