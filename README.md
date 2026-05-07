# 🧠 Neural Stroke Care

> A full-stack, AI-powered stroke risk assessment platform built with the MERN stack and a Python/FastAPI machine learning microservice.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=flat-square&logo=react)
![ML](https://img.shields.io/badge/ML-FastAPI%20%2B%20scikit--learn-009688?style=flat-square&logo=fastapi)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Data Models](#-data-models)
- [API Reference](#-api-reference)
- [ML Service](#-ml-service)
- [Flowcharts](#-flowcharts)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Running Each Service Independently](#-running-each-service-independently)
  - [1. ML Service (Python/FastAPI)](#1-ml-service-pythonfastapi)
  - [2. Backend (Node.js/Express)](#2-backend-nodejsexpress)
  - [3. Frontend (React)](#3-frontend-react)
- [Running Everything Together](#-running-everything-together)
- [User Roles & Access Control](#-user-roles--access-control)
- [Pages & Routes](#-pages--routes)
- [Contributing](#-contributing)

---

## 🔍 Overview

**Neural Stroke Care** is a clinical decision-support web application that predicts a patient's risk of stroke using a trained Logistic Regression model. The platform supports two user roles — **Patients** and **Doctors** — each with their own tailored dashboard experience.

Patients fill out a health assessment form, receive an instant AI-driven risk prediction (Likely / Not Likely), and can view their full test history. Doctors get a real-time feed of high-risk patients and can manage their availability.

---

## ✨ Features

- 🔐 JWT-based authentication with role-based access control (Patient / Doctor)
- 🤖 Stroke risk prediction via a trained ML model served as a FastAPI microservice
- 📊 Patient dashboard with latest result, test history, and available doctors list
- 🩺 Doctor dashboard showing all patients flagged as high-risk
- 📁 Full prediction history with timestamps and detailed clinical inputs
- 🏥 Hospital and doctor directory with specialization filtering
- ⚡ Concurrently runnable with a single `npm run dev` command

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Axios, Context API |
| **Backend** | Node.js, Express.js, Mongoose, JWT, bcryptjs |
| **Database** | MongoDB |
| **ML Service** | Python 3.11, FastAPI, scikit-learn, pandas, joblib, uvicorn |
| **Dev Tools** | nodemon, concurrently, morgan |

---

## 🏗 Architecture

The application is composed of **three independently runnable services** that communicate over HTTP:

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│              React SPA  (localhost:3000)                     │
└──────────────────────┬───────────────────────────────────────┘
                       │  REST API calls (Axios)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                     EXPRESS BACKEND                          │
│              Node.js / Express  (localhost:5000)             │
│   ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐    │
│   │  /auth   │  │ /predict  │  │ /doctors │  │/patients │    │
│   └──────────┘  └─────┬─────┘  └──────────┘  └──────────┘    │
│                       │  HTTP POST (axios)                   │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                     ML MICROSERVICE                          │
│           FastAPI / uvicorn  (localhost:5001)                │
│         Logistic Regression model (model.joblib)             │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                       MONGODB                                │
│            Collections: users, patientrecords                │
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Neural_Stroke_Care_MERN/
│
├── package.json                  # Root – concurrently scripts
│
├── backend/                      # Node.js / Express API
│   ├── server.js                 # App entry point
│   ├── .env                      # Environment variables
│   ├── package.json
│   │
│   ├── controllers/
│   │   ├── auth.controller.js        # Signup, login, getMe
│   │   ├── dashboard.controller.js   # Patient & doctor dashboard data
│   │   ├── doctor.controller.js      # Doctor listing, availability toggle
│   │   ├── hospital.controller.js    # Hospital listing
│   │   └── prediction.controller.js  # Stroke prediction & history
│   │
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT protect + role authorise
│   │
│   ├── models/
│   │   ├── User.js               # Mongoose User schema
│   │   └── PatientRecord.js      # Mongoose PatientRecord schema
│   │
│   └── routes/
│       ├── auth.routes.js
│       ├── dashboard.routes.js
│       ├── doctor.routes.js
│       ├── hospital.routes.js
│       ├── patients.routes.js
│       └── prediction.routes.js
│
├── frontend/                     # React SPA
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── src/
│       ├── App.jsx               # Router + context providers
│       ├── index.js
│       │
│       ├── assets/css/
│       │   └── global.css
│       │
│       ├── components/
│       │   ├── FlashMessages.jsx
│       │   ├── Footer.jsx
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── Spinner.jsx
│       │
│       ├── context/
│       │   ├── AuthContext.jsx   # Global auth state + JWT storage
│       │   └── FlashContext.jsx  # Flash notification state
│       │
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Dashboard.jsx       # Role-based redirect hub
│       │   ├── PatientDashboard.jsx
│       │   ├── DoctorDashboard.jsx
│       │   ├── Assessment.jsx      # Stroke risk form (patient only)
│       │   ├── Result.jsx          # Prediction result display
│       │   ├── TestHistory.jsx     # Patient's past assessments
│       │   ├── Doctors.jsx         # Doctor directory
│       │   └── Patients.jsx        # Patient records (doctor only)
│       │
│       └── services/
│           └── api.js            # Axios instance + all API calls
│
└── ml-service/                   # Python FastAPI ML microservice
    ├── ml_api.py                 # FastAPI app + prediction logic
    ├── model.joblib              # Trained Logistic Regression model
    └── requirements.txt
```

---

## 🗄 Data Models

### User (`backend/models/User.js`)

Stores both patients and doctors in a single collection, differentiated by `userType`.

| Field | Type | Description |
|---|---|---|
| `name` | String | Full name |
| `email` | String | Unique, indexed, lowercased |
| `password` | String | bcrypt-hashed (never returned in JSON) |
| `userType` | String | `"patient"` or `"doctor"` |
| `specialization` | String | Doctor-only (e.g. `"Neurologist"`) |
| `isAvailable` | Boolean | Doctor-only availability flag |
| `availableFrom` | String | Doctor-only start time `"HH:MM"` |
| `availableTo` | String | Doctor-only end time `"HH:MM"` |
| `createdAt` | Date | Auto-managed by Mongoose timestamps |
| `updatedAt` | Date | Auto-managed by Mongoose timestamps |

**Pre-save hook:** Passwords are automatically hashed with bcrypt (salt rounds: 10) before every save.

**toJSON transform:** The `password` field is stripped from all serialised output.

---

### PatientRecord (`backend/models/PatientRecord.js`)

Stores one document per stroke-risk assessment, linked to a User.

| Field | Type | Description |
|---|---|---|
| `patientId` | ObjectId | Ref → `User`, indexed |
| `predictionResult` | String | `"Likely"` or `"Not Likely"` |
| `riskProbability` | Number | Probability percentage (0–100) |
| `gender` | String | |
| `age` | Number | |
| `hypertension` | Number | `0` or `1` |
| `heartDisease` | Number | `0` or `1` |
| `everMarried` | String | `"Yes"` / `"No"` |
| `workType` | String | `"Private"`, `"Govt_job"`, etc. |
| `residenceType` | String | `"Urban"` / `"Rural"` |
| `avgGlucoseLevel` | Number | mg/dL |
| `bmi` | Number | Body Mass Index |
| `smokingStatus` | String | `"never smoked"`, `"smokes"`, etc. |
| `createdAt` | Date | Assessment timestamp |

---

## 📡 API Reference

All backend routes are served from `http://localhost:5000`. Protected routes require the header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Authentication — `/auth`

| Method | Endpoint | Auth | Body / Notes |
|---|---|---|---|
| `POST` | `/auth/signup` | ❌ | `{ name, email, password, userType, ...doctorFields }` |
| `POST` | `/auth/login` | ❌ | `{ email, password, userType }` |
| `GET` | `/auth/me` | ✅ | Returns current user object |

### Prediction — `/predict`

| Method | Endpoint | Auth | Role | Notes |
|---|---|---|---|---|
| `POST` | `/predict` | ✅ | patient | Sends health data to ML service, saves & returns result |
| `GET` | `/predict/history` | ✅ | any | Returns the authenticated user's prediction history |

### Dashboard — `/dashboard`

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| `GET` | `/dashboard` | ✅ | Auto-routes by role (patient/doctor) |
| `GET` | `/dashboard/patient` | ✅ | Latest record + history + doctor list |
| `GET` | `/dashboard/doctor` | ✅ | All high-risk (`"Likely"`) patient records |

### Doctors — `/doctors`

| Method | Endpoint | Auth | Role | Notes |
|---|---|---|---|---|
| `GET` | `/doctors` | ✅ | any | List all doctors |
| `GET` | `/doctors/specializations` | ✅ | any | Unique specialization list |
| `GET` | `/doctors/patients` | ✅ | doctor | Patients linked to this doctor |
| `POST` | `/doctors/toggle-availability` | ✅ | doctor | Toggle isAvailable flag |
| `PATCH` | `/doctors/availability` | ✅ | doctor | Same as above |

### Patients — `/patients`

| Method | Endpoint | Auth | Role | Notes |
|---|---|---|---|---|
| `GET` | `/patients` | ✅ | doctor | All patient records with populated patient info |

### Health Check

| Method | Endpoint | Notes |
|---|---|---|
| `GET` | `/health` | Returns `{ status: "ok" }` |

---

## 🤖 ML Service

The ML microservice is a **FastAPI** application (`ml-service/ml_api.py`) that wraps a pre-trained `model.joblib`.

### Model Details

- **Algorithm:** Logistic Regression (extracted from a scikit-learn Pipeline)
- **Preprocessing:** ColumnTransformer with OneHotEncoding for categorical features and passthrough for numerics
- **Classification threshold:** `probability >= 0.40` → `"Likely"`, otherwise `"Not Likely"`
- **Training data features:** Gender, Age, Hypertension, Heart Disease, Ever Married, Work Type, Residence Type, Avg Glucose Level, BMI, Smoking Status

### ML API Endpoints

| Method | Endpoint | Notes |
|---|---|---|
| `GET` | `/health` | Returns `{ status: "ok", model: "model.joblib" }` |
| `POST` | `/predict` | Accepts health data, returns prediction result and probability |

#### Request Schema (`POST /predict`)

```json
{
  "gender": "Male",
  "age": 67,
  "hypertension": 0,
  "heart_disease": 1,
  "ever_married": "Yes",
  "work_type": "Private",
  "Residence_type": "Urban",
  "avg_glucose_level": 228.69,
  "bmi": 36.6,
  "smoking_status": "formerly smoked"
}
```

#### Response Schema

```json
{
  "result": "Likely",
  "probability": 72.45
}
```

---

## 🔄 Flowcharts

### Overall Application Flow

```
User visits /
      │
      ├─── Not logged in ──► Landing Page
      │                          │
      │                    Login / Signup
      │                          │
      │                    JWT issued & stored
      │
      └─── Logged in ──────► /dashboard
                                  │
               ┌──────────────────┴─────────────────────┐
               │                                        │
          [Patient]                                 [Doctor]
               │                                        │
      PatientDashboard                         DoctorDashboard
      (latest result,                     (all "Likely" patient
       history, doctors)                    records feed)
               │
        /assessment
      Fill health form
               │
          POST /predict
               │
        Backend validates
               │
         POST ml-service/predict
               │
       ML returns result + probability
               │
       Saved to PatientRecord (MongoDB)
               │
         /result page
       Display risk + recommendations
```

### Authentication Flow

```
POST /auth/signup or /auth/login
        │
   Validate inputs
        │
   [signup] Hash password (bcrypt, 10 rounds)
   [login]  Compare password hash
        │
   Sign JWT (HS256, 7-day expiry)
        │
   Return { token, user }
        │
   Frontend: store token in localStorage
        │
   Subsequent requests:
   Authorization: Bearer <token>
        │
   auth.middleware.js → jwt.verify()
        │
   req.user = User.findById(decoded.id)
        │
   authorise("doctor" | "patient") guard
```

### Prediction Pipeline

```
Patient submits Assessment form
          │
    Frontend (Assessment.jsx)
    POST /predict  { gender, age, hypertension, ... }
          │
    Backend prediction.controller.js
          │
    Normalise values (case/key mapping)
    e.g. "private" → "Private"
          │
    axios.post → ML Service /predict
          │
    ┌─────────────────────────────────┐
    │       ml_api.py (FastAPI)       │
    │  1. Normalise categorical vals  │
    │  2. Build pandas DataFrame      │
    │  3. preprocessor.transform(df)  │
    │     (OneHotEncode + passthrough)│
    │  4. classifier.predict_proba()  │
    │  5. prob >= 0.40 → "Likely"     │
    └─────────────────────────────────┘
          │
    { result, probability }
          │
    Save PatientRecord to MongoDB
          │
    Return 201 { result, probability, record }
          │
    Frontend navigates to /result
```

---

## ✅ Prerequisites

Make sure you have the following installed:

| Tool | Version | Download |
|---|---|---|
| **Node.js** | v18+ | https://nodejs.org |
| **npm** | v9+ | Bundled with Node.js |
| **Python** | 3.11 | https://python.org |
| **MongoDB** | 6+ (local) or Atlas URI | https://mongodb.com |

---

## 🔐 Environment Variables

### `backend/.env`

Create this file before running the backend:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/strokeapp

# Auth
JWT_SECRET=replace_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d

# ML Microservice URL
ML_API_URL=http://localhost:5001
```

### `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000
```

> **⚠️ Security Note:** Never commit your `.env` files to version control. Add them to `.gitignore`.

---

## 🚀 Running Each Service Independently {RECOMMENDED FOR THE FIRST TIME}

### 1. ML Service (Python/FastAPI)

The ML service must be running before the backend can process predictions.

```bash
# Navigate to the ml-service directory
cd ml-service

# Create a virtual environment{ONLY FOR THE FIRST TIME}
python -m venv .venv

# Activate the virtual environment{ONLY FOR THE FIRST TIME}
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies{ONLY FOR THE FIRST TIME}
pip install -r requirements.txt

# Start the FastAPI server (runs on port 5001)
uvicorn ml_api:app --host 0.0.0.0 --port 5001
```

**Verify it's running:**
```bash
curl http://localhost:5001/health
# Expected: {"status":"ok","model":"model.joblib"}
```

For live-reload during development:
```bash
uvicorn ml_api:app --host 0.0.0.0 --port 5001 --reload
```

---

### 2. Backend (Node.js/Express)

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Ensure backend/.env is configured (see Environment Variables above)

# Start in development mode (with nodemon hot-reload)
npm run dev

# Start in production mode
npm start
```

**Verify it's running:**
```bash
curl http://localhost:5000/health
# Expected: {"status":"ok"}
```

The backend runs on **port 5000** by default.

---

### 3. Frontend (React)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The app will open in your browser at **http://localhost:3000**.

To create a production build:
```bash
npm run build
```

---

## ⚡ Running Everything Together

The root `package.json` uses **concurrently** to spin up all three services with a single command.

```bash
# From the project root directory

# Create environment for the ML Model {ONLY FOR THE FIRST TIME}
npm run ml-setup

# Install the root devDependencies (Run it inside the frontend and backend folders) {ONLY FOR THE FIRST TIME}
npm install

# Start all three services simultaneously
npm run dev
```

This runs:
- `ml-service` → FastAPI on port **5001**
- `backend` → Express on port **5000**
- `frontend` → React on port **3000**

> **Note:** The `npm run dev` script in the root `package.json` activates the Python virtual environment using a Windows-style path (`.venv\Scripts\activate`). On **macOS/Linux**, you may need to update the `ml-service` script in `package.json` to use `source .venv/bin/activate` instead.

### Quick Start (Step-by-Step)

```bash
# 1. Clone the repository
git clone https://github.com/chocomoco24/Neural-Stroke-Care.git
cd Neural-Stroke-Care

# 2. Set up backend and frontend environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your MongoDB URL and JWT secret

# 3. Install all Node dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 4. Set up Python virtual environment
cd ml-service
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cd ..

# 5. Start everything
npm run dev
```

---

## 👥 User Roles & Access Control

The `auth.middleware.js` enforces two layers of protection on all non-public routes:

**`protect`** — Verifies the JWT token and attaches `req.user`.

**`authorise(...roles)`** — Checks `req.user.userType` against allowed roles.

| Feature | Patient | Doctor |
|---|---|---|
| Sign up / Log in | ✅ | ✅ |
| View own dashboard | ✅ | ✅ |
| Submit stroke assessment | ✅ | ❌ |
| View personal test history | ✅ | ❌ |
| View doctor directory | ✅ | ✅ |
| View all patient records | ❌ | ✅ |
| Toggle availability | ❌ | ✅ |

---

## 🗺 Pages & Routes

### Frontend Routes

| Path | Component | Access | Description |
|---|---|---|---|
| `/` | `Landing` | Public | Hero landing page |
| `/login/:userType` | `Login` | Public | Login for `patient` or `doctor` |
| `/signup/:userType` | `Signup` | Public | Registration form |
| `/dashboard` | `Dashboard` | Auth | Redirects to role-specific dashboard |
| `/assessment` | `Assessment` | Patient | Health data form for prediction |
| `/result` | `Result` | Auth | Displays prediction outcome |
| `/history` | `TestHistory` | Patient | Past assessment records |
| `/doctors` | `Doctors` | Auth | Browse available doctors |
| `/patients` | `Patients` | Doctor | All patient assessment records |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please ensure your code follows the existing style conventions and that all three services start cleanly before submitting a PR.

---

<p align="center">
  Built with ❤️ using MongoDB · Express · React · Node.js · FastAPI
</p>
