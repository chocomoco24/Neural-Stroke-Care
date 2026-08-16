"use strict";

/** Initial schema: patients, doctors, patient_records, appointments. */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { INTEGER, FLOAT, STRING, BOOLEAN, ENUM, DATE } = Sequelize;
    const pk = { type: INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true };
    const timestamps = {
      created_at: { type: DATE, allowNull: false },
      updated_at: { type: DATE, allowNull: false },
    };

    await queryInterface.createTable("patients", {
      id: pk,
      name: { type: STRING, allowNull: false },
      email: { type: STRING, allowNull: false, unique: true },
      password: { type: STRING, allowNull: false },
      ...timestamps,
    });

    await queryInterface.createTable("doctors", {
      id: pk,
      name: { type: STRING, allowNull: false },
      email: { type: STRING, allowNull: false, unique: true },
      password: { type: STRING, allowNull: false },
      specialization: { type: STRING, allowNull: false, defaultValue: "General Physician" },
      is_available: { type: BOOLEAN, allowNull: false, defaultValue: false },
      available_from: { type: STRING, allowNull: true },
      available_to: { type: STRING, allowNull: true },
      ...timestamps,
    });

    await queryInterface.createTable("patient_records", {
      id: pk,
      patient_id: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "patients", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      prediction_result: { type: ENUM("Likely", "Not Likely"), allowNull: false },
      risk_probability: { type: FLOAT, allowNull: true },
      gender: { type: STRING, allowNull: true },
      age: { type: INTEGER, allowNull: true },
      hypertension: { type: INTEGER, allowNull: true },
      heart_disease: { type: INTEGER, allowNull: true },
      ever_married: { type: STRING, allowNull: true },
      work_type: { type: STRING, allowNull: true },
      residence_type: { type: STRING, allowNull: true },
      avg_glucose_level: { type: FLOAT, allowNull: true },
      bmi: { type: FLOAT, allowNull: true },
      smoking_status: { type: STRING, allowNull: true },
      ...timestamps,
    });
    await queryInterface.addIndex("patient_records", ["patient_id"]);
    await queryInterface.addIndex("patient_records", ["prediction_result"]);

    await queryInterface.createTable("appointments", {
      id: pk,
      patient_id: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "patients", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      doctor_id: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "doctors", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      status: { type: ENUM("pending", "accepted", "rejected"), allowNull: false, defaultValue: "pending" },
      appointment_date: { type: STRING, allowNull: true },
      appointment_time: { type: STRING, allowNull: true },
      ...timestamps,
    });
    await queryInterface.addIndex("appointments", ["patient_id", "doctor_id"], {
      unique: true,
      name: "appointments_patient_id_doctor_id",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("appointments");
    await queryInterface.dropTable("patient_records");
    await queryInterface.dropTable("doctors");
    await queryInterface.dropTable("patients");
  },
};
