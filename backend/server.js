require("dotenv").config();
const { validateEnv } = require("./config/validateEnv");
validateEnv(); // fail fast if config is missing/insecure

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const { sequelize } = require("./models");

const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const predictionRoutes = require("./routes/prediction.routes");
const doctorRoutes = require("./routes/doctor.routes");
const hospitalRoutes = require("./routes/hospital.routes");
const patientsRoutes = require("./routes/patients.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const { protect } = require("./middleware/auth.middleware");

const app = express();

// Behind a reverse proxy (Vercel/Render/nginx) so the rate limiter and
// req.ip see the real client IP, not the proxy's.
app.set("trust proxy", 1);

// ── Security & core middleware ──────────────────────────────────
// Allowed browser origins: localhost for dev + FRONTEND_URL for prod
// (comma-separated to allow multiple, e.g. a custom domain + *.vercel.app).
const allowedOrigins = [
  "http://localhost:3000",
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((s) => s.trim()).filter(Boolean)
    : []),
];

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Non-browser clients (no Origin header) and allow-listed origins pass.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// ── Rate limiting ───────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // brute-force protection on login/signup
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later" },
});
app.use("/", apiLimiter);

// ── Routes ──────────────────────────────────────────────────────
app.use("/auth", authLimiter, authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/predict", predictionRoutes);
app.use("/doctors", doctorRoutes);
app.use("/hospitals", protect, hospitalRoutes); // now authenticated
app.use("/patients", patientsRoutes);
app.use("/appointments", appointmentRoutes);

app.get("/", (_req, res) => res.json({ message: "API is running" }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Global error handler ────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack || err);
  const status = err.status || 500;
  // Never leak internal error details to clients in production.
  const isClientError = status >= 400 && status < 500;
  const message =
    process.env.NODE_ENV === "production" && !isClientError
      ? "Internal Server Error"
      : err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// ── Database + Start ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const isProd = process.env.NODE_ENV === "production";

sequelize
  .authenticate()
  .then(() => {
    console.log("[MySQL] Connected: " + (process.env.DB_HOST || "127.0.0.1"));
    // In production the schema is managed by migrations (npm run db:migrate).
    // Auto-sync only in dev, to avoid unintended ALTER/DROP on real data.
    if (isProd) {
      console.log("[MySQL] Production mode — skipping auto-sync (use migrations)");
      return Promise.resolve();
    }
    return sequelize
      .sync({ alter: process.env.DB_SYNC_ALTER === "true" })
      .then(() => console.log("[MySQL] Models synced (dev)"));
  })
  .then(() => {
    app.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("[MySQL] Connection error:", err.message);
    process.exit(1);
  });
