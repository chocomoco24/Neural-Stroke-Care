require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const predictionRoutes = require("./routes/prediction.routes");
const doctorRoutes = require("./routes/doctor.routes");
const hospitalRoutes = require("./routes/hospital.routes");
const patientsRoutes   = require("./routes/patients.routes");


const app = express();

//Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

//Routes
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/predict", predictionRoutes);
app.use("/doctors", doctorRoutes);
app.use("/hospitals", hospitalRoutes);
app.use("/patients",  patientsRoutes);


app.get("/health", (_req, res) => res.json({ status: "ok" }));

//Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

//Database + Start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI,{
  tls: true,
  tlsAllowInvalidCertificates: true,
})
  .then(() => {
    console.log("[MongoDB] Connected: " + mongoose.connection.host);
    app.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("[MongoDB] Connection error:", err.message);
    process.exit(1);
  });
