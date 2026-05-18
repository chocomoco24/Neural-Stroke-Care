const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    specialization: { type: String, default: "General Physician" },
    isAvailable: { type: Boolean, default: false },
    availableFrom: { type: String, default: null },
    availableTo: { type: String, default: null },
  },
  { timestamps: true }
);

doctorSchema.pre("save", async function () {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

doctorSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

doctorSchema.set("toJSON", {
  transform: (_doc, ret) => { delete ret.password; return ret; },
});

module.exports = mongoose.model("Doctor", doctorSchema);