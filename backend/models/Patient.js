const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

patientSchema.pre("save", async function () {
  if (!this.isModified("password")) return next();  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

patientSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

patientSchema.set("toJSON", {
  transform: (_doc, ret) => { delete ret.password; return ret; },
});

module.exports = mongoose.model("Patient", patientSchema);