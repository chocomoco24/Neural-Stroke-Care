"""
Stroke Prediction ML Microservice
Wraps the existing trained model.joblib and exposes it via FastAPI.
The model is NOT modified in any way.
"""

import os
import sys
import types
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import sys
sys.stdout.reconfigure(encoding='utf-8')

# Imblearn shim 
class _AnyClass:
    def __init__(self, *a, **kw): pass
    def fit(self, X, y=None): return self
    def transform(self, X): return X
    def fit_resample(self, X, y): return X, y
    def predict_proba(self, X): return [[0.5, 0.5]]

class _SmartFakeModule(types.ModuleType):
    def __getattr__(self, name):
        cls = type(name, (_AnyClass,), {})
        setattr(self, name, cls)
        return cls

for _path in [
    "imblearn", "imblearn.base", "imblearn.pipeline", "imblearn.utils",
    "imblearn.utils._validation", "imblearn.over_sampling",
    "imblearn.over_sampling._smote", "imblearn.over_sampling._smote.base",
    "imblearn.over_sampling._smote.cluster", "imblearn.over_sampling._smote.filter",
    "imblearn.over_sampling._random_oversampler",
    "imblearn.combine", "imblearn.combine._smote_enn", "imblearn.combine._smote_tomek",
    "imblearn.ensemble", "imblearn.ensemble._bagging",
    "imblearn.ensemble._easy_ensemble", "imblearn.ensemble._forest",
    "imblearn.under_sampling", "imblearn.under_sampling._prototype_generation",
    "imblearn.under_sampling._prototype_generation._cluster_centroids",
    "imblearn.under_sampling._prototype_selection",
    "imblearn.under_sampling._prototype_selection._condensed_nearest_neighbour",
    "imblearn.under_sampling._prototype_selection._edited_nearest_neighbours",
    "imblearn.under_sampling._prototype_selection._instance_hardness_threshold",
    "imblearn.under_sampling._prototype_selection._neighbourhood_cleaning_rule",
    "imblearn.under_sampling._prototype_selection._one_sided_selection",
    "imblearn.under_sampling._prototype_selection._random_under_sampler",
    "imblearn.under_sampling._prototype_selection._tomek_links",
]:
    sys.modules[_path] = _SmartFakeModule(_path)

# Load model 
MODEL_PATH = os.getenv("MODEL_PATH", "model.joblib")

try:
    model_data = joblib.load(MODEL_PATH)
    preprocessor = model_data["preprocessor"]

    # Extract real LogisticRegression from pipeline steps directly
    classifier = None
    for step_name, step_obj in model_data["model"].steps:
        if step_name == "classifier":
            classifier = step_obj
            break

    if classifier is None:
        raise ValueError("Could not find 'classifier' step in pipeline")

    print(f"[ML Service] Preprocessor: {type(preprocessor)}")
    print(f"[ML Service] Classifier:   {type(classifier)}")
    print(f"[ML Service] Model loaded successfully")

except Exception as exc:
    raise RuntimeError(f"[ML Service] Could not load model: {exc}") from exc

# App 
app = FastAPI(title="Stroke Prediction ML API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

#  Value maps — must match EXACTLY what the model was trained on 
# Categorical values are case-sensitive — do NOT lowercase them

GENDER_MAP = {
    "male":   "Male",
    "female": "Female",
    "other":  "Other",
}

MARRIED_MAP = {
    "yes": "Yes",
    "no":  "No",
}

WORK_MAP = {
    "private":        "Private",
    "self-employed":  "Self-employed",
    "government job": "Govt_job",
    "govt_job":       "Govt_job",
    "children":       "children",
    "never worked":   "Never_worked",
    "never_worked":   "Never_worked",
}

RESIDENCE_MAP = {
    "urban": "Urban",
    "rural": "Rural",
}

SMOKING_MAP = {
    "never smoked":    "never smoked",
    "formerly smoked": "formerly smoked",
    "smokes":          "smokes",
    "unknown":         "Unknown",
}

# Schemas 
class PredictRequest(BaseModel):
    gender: str
    age: int = Field(..., ge=0, le=120)
    hypertension: int = Field(..., ge=0, le=1)
    heart_disease: int = Field(..., ge=0, le=1)
    ever_married: str
    work_type: str
    Residence_type: str
    avg_glucose_level: float
    bmi: float
    smoking_status: str

class PredictResponse(BaseModel):
    result: str
    probability: float

# Endpoints 
@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_PATH}

@app.post("/predict", response_model=PredictResponse)
def predict(body: PredictRequest):
    try:
        # Normalise all values to exactly match training data casing
        gender        = GENDER_MAP.get(body.gender.strip().lower(), body.gender.strip())
        ever_married  = MARRIED_MAP.get(body.ever_married.strip().lower(), body.ever_married.strip())
        work_type     = WORK_MAP.get(body.work_type.strip().lower(), body.work_type.strip())
        residence     = RESIDENCE_MAP.get(body.Residence_type.strip().lower(), body.Residence_type.strip())
        smoking       = SMOKING_MAP.get(body.smoking_status.strip().lower(), body.smoking_status.strip())

        print(f"[ML] Input -> gender={gender}, married={ever_married}, work={work_type}, residence={residence}, smoking={smoking}")

        # Build DataFrame with exact column names the preprocessor expects
        df = pd.DataFrame([{
            "gender":            gender,
            "ever_married":      ever_married,
            "work_type":         work_type,
            "Residence_type":    residence,
            "smoking_status":    smoking,
            "age":               body.age,
            "hypertension":      body.hypertension,
            "heart_disease":     body.heart_disease,
            "avg_glucose_level": body.avg_glucose_level,
            "bmi":               body.bmi,
        }])

        # Step 1: preprocess (OneHotEncode categoricals + passthrough numerics)
        X_transformed = preprocessor.transform(df)

        # Step 2: predict with real LogisticRegression
        prob = classifier.predict_proba(X_transformed)[0][1]

        print(f"[ML] Raw probability: {prob:.4f}")

        result = "Likely" if prob >= 0.40 else "Not Likely"
        return PredictResponse(result=result, probability=round(prob * 100, 2))

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("ML_PORT", 5001)))
