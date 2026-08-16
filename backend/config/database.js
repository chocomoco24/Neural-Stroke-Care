const { Sequelize } = require("sequelize");

// Managed cloud MySQL (Aiven, TiDB, etc.) requires TLS. Enable with DB_SSL=true.
// Local dev stays plaintext (DB_SSL unset). Some providers hand out a self-signed
// CA — set DB_SSL_REJECT_UNAUTHORIZED=false for those.
const useSSL = process.env.DB_SSL === "true";
const dialectOptions = useSSL
  ? { ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } }
  : {};

// Central Sequelize instance. All models import this.
const sequelize = new Sequelize(
  process.env.DB_NAME || "strokeapp",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: "mysql",
    dialectOptions,
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
