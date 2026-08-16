const { DataTypes, Model } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");

class Patient extends Model {
  // Instance method to check password
  async matchPassword(plain) {
    return bcrypt.compare(plain, this.password);
  }

  // Never leak the password hash
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

Patient.init(
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
  },
  {
    sequelize,
    modelName: "Patient",
    tableName: "patients",
    hooks: {
      // Hash password before insert/update when it changed
      beforeSave: async (patient) => {
        if (patient.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          patient.password = await bcrypt.hash(patient.password, salt);
        }
      },
    },
  }
);

module.exports = Patient;
