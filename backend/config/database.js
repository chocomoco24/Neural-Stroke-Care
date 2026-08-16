const { Sequelize } = require("sequelize");

// Central Sequelize instance. All models import this.
const sequelize = new Sequelize(
  process.env.DB_NAME || "strokeapp",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    define: {
      // camelCase in JS <-> snake_case columns in MySQL, plus created_at/updated_at
      underscored: true,
      freezeTableName: false,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
