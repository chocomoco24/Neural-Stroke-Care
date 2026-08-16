const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class PatientRecord extends Model {}

PatientRecord.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    predictionResult: {
      type: DataTypes.ENUM("Likely", "Not Likely"),
      allowNull: false,
    },
    riskProbability: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    // Patient data captured at time of prediction
    gender: { type: DataTypes.STRING, allowNull: true },
    age: { type: DataTypes.INTEGER, allowNull: true },
    hypertension: { type: DataTypes.INTEGER, allowNull: true },
    heartDisease: { type: DataTypes.INTEGER, allowNull: true },
    everMarried: { type: DataTypes.STRING, allowNull: true },
    workType: { type: DataTypes.STRING, allowNull: true },
    residenceType: { type: DataTypes.STRING, allowNull: true },
    avgGlucoseLevel: { type: DataTypes.FLOAT, allowNull: true },
    bmi: { type: DataTypes.FLOAT, allowNull: true },
    smokingStatus: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: "PatientRecord",
    tableName: "patient_records",
    indexes: [
      { fields: ["patient_id"] },
      { fields: ["prediction_result"] },
    ],
  }
);

module.exports = PatientRecord;
