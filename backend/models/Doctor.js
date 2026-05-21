const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true },
    specialization: { type: String, default: "General Physician" },
    isAvailable: { type: Boolean, default: false },
    availableFrom: { type: String, default: null }, // "HH:MM"
    availableTo: { type: String, default: null },   // "HH:MM"
  },
  { timestamps: true }
);

// Hash password before save
doctorSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to check password
doctorSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Never return the password
doctorSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model("Doctor", doctorSchema);
