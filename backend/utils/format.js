// Shared response formatters. Single source of truth for the snake_case
// API shape the frontend expects, so controllers don't each re-implement it.

function formatRecord(r) {
  if (!r) return null;
  return {
    id: r.id,
    prediction_result: r.predictionResult,
    risk_probability: r.riskProbability,
    age: r.age,
    bmi: r.bmi,
    avg_glucose_level: r.avgGlucoseLevel,
    hypertension: r.hypertension,
    heart_disease: r.heartDisease,
    smoking_status: r.smokingStatus,
    gender: r.gender,
    ever_married: r.everMarried,
    work_type: r.workType,
    residence_type: r.residenceType,
    created_at: r.createdAt,
  };
}

function formatUser(u, userType) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    user_type: userType || u.userType,
    specialization: u.specialization,
    is_available: u.isAvailable,
    available_from: u.availableFrom,
    available_to: u.availableTo,
  };
}

module.exports = { formatRecord, formatUser };
