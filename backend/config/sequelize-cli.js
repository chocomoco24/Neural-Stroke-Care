// Config consumed by sequelize-cli (migrations). Reads the same .env the app uses.
require("dotenv").config();

const useSSL = process.env.DB_SSL === "true";

const common = {
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "strokeapp",
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  dialect: "mysql",
  define: { underscored: true },
  dialectOptions: useSSL
    ? { ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } }
    : {},
};

module.exports = {
  development: common,
  test: common,
  production: common,
};
