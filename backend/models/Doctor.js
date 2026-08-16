const { DataTypes, Model } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");

class Doctor extends Model {
  async matchPassword(plain) {
    return bcrypt.compare(plain, this.password);
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

Doctor.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("email", String(value).toLowerCase().trim());
      },
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "General Physician",
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    availableFrom: {
      type: DataTypes.STRING, // "HH:MM"
      allowNull: true,
    },
    availableTo: {
      type: DataTypes.STRING, // "HH:MM"
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Doctor",
    tableName: "doctors",
    hooks: {
      beforeSave: async (doctor) => {
        if (doctor.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          doctor.password = await bcrypt.hash(doctor.password, salt);
        }
      },
    },
  }
);

module.exports = Doctor;
