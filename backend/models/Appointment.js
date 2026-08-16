const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Appointment extends Model {}

Appointment.init(
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
    doctorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    appointmentDate: {
      type: DataTypes.STRING, // "YYYY-MM-DD"
      allowNull: true,
    },
    appointmentTime: {
      type: DataTypes.STRING, // "HH:MM"
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Appointment",
    tableName: "appointments",
    indexes: [
      // At most one appointment row per patient-doctor pair.
      // Re-requesting after a rejection reuses this row (see controller).
      { unique: true, fields: ["patient_id", "doctor_id"] },
    ],
  }
);

module.exports = Appointment;
