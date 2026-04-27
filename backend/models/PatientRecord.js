const mongoose = require("mongoose");

const patientRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    predictionResult: {
      type: String,
      enum: ["Likely", "Not Likely"],
      required: true,
      index: true,
    },
    riskProbability: { type: Number, default: null },

    // Patient data captured at time of prediction
    gender: { type: String },
    age: { type: Number },
    hypertension: { type: Number },
    heartDisease: { type: Number },
    everMarried: { type: String },
    workType: { type: String },
    residenceType: { type: String },
    avgGlucoseLevel: { type: Number },
    bmi: { type: Number },
    smokingStatus: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PatientRecord", patientRecordSchema);
