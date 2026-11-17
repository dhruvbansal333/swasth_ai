"""
Swasth AI - Multi-Disease Prediction, Risk Stratification & Explainability Service
Loads calibrated models for Diabetes, Heart Disease, and Hypertension.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml_models")

_diabetes_model = None
_heart_model = None
_hypertension_model = None

_diabetes_meta = None
_heart_meta = None
_hypertension_meta = None


def load_models():
    global _diabetes_model, _heart_model, _hypertension_model
    global _diabetes_meta, _heart_meta, _hypertension_meta

    d_path = os.path.join(MODELS_DIR, "diabetes_pipeline.joblib")
    h_path = os.path.join(MODELS_DIR, "heart_pipeline.joblib")
    hyp_path = os.path.join(MODELS_DIR, "hypertension_pipeline.joblib")

    if os.path.exists(d_path):
        _diabetes_model = joblib.load(d_path)
        with open(os.path.join(MODELS_DIR, "diabetes_metadata.json")) as f:
            _diabetes_meta = json.load(f)

    if os.path.exists(h_path):
        _heart_model = joblib.load(h_path)
        with open(os.path.join(MODELS_DIR, "heart_metadata.json")) as f:
            _heart_meta = json.load(f)

    if os.path.exists(hyp_path):
        _hypertension_model = joblib.load(hyp_path)
        with open(os.path.join(MODELS_DIR, "hypertension_metadata.json")) as f:
            _hypertension_meta = json.load(f)

    print("[ML Engine] Models loaded into memory successfully.")


def get_risk_tier(probability: float) -> dict:
    if probability < 0.35:
        return {"tier": "Low Risk", "badge": "success", "level": 1, "description": "Within normal statistical boundaries."}
    elif probability < 0.65:
        return {"tier": "Moderate Risk", "badge": "warning", "level": 2, "description": "Elevated indicators warranting preventive monitoring."}
    else:
        return {"tier": "High Risk", "badge": "danger", "level": 3, "description": "Clinically significant elevation warranting medical review."}


def validate_vitals(data: dict) -> list:
    """Validates physical plausibility of medical values and returns warnings if any."""
    warnings = []
    age = data.get("age")
    if age is not None:
        if age < 1 or age > 120:
            warnings.append(f"Age ({age}) is outside expected clinical range (1-120).")

    bp = data.get("bp") or data.get("sysBP")
    if bp is not None:
        if bp < 50 or bp > 280:
            warnings.append(f"Systolic blood pressure ({bp} mmHg) is biologically extreme.")

    glucose = data.get("glucose")
    if glucose is not None:
        if glucose < 30 or glucose > 600:
            warnings.append(f"Blood glucose ({glucose} mg/dL) is outside standard laboratory limits.")

    chol = data.get("cholesterol") or data.get("totChol")
    if chol is not None:
        if chol < 50 or chol > 600:
            warnings.append(f"Cholesterol ({chol} mg/dL) is outside standard laboratory limits.")

    bmi = data.get("bmi")
    if bmi is not None:
        if bmi < 10 or bmi > 75:
            warnings.append(f"BMI ({bmi}) is outside physiological boundaries.")

    return warnings


def predict_diabetes_risk(data: dict) -> dict:
    if _diabetes_model is None:
        raise RuntimeError("Diabetes model is not loaded.")

    glucose = float(data.get("glucose")) if data.get("glucose") not in (None, "") else np.nan
    bp = float(data.get("bp")) if data.get("bp") not in (None, "") else np.nan
    skin = float(data.get("skinThickness")) if data.get("skinThickness") not in (None, "") else np.nan
    insulin = float(data.get("insulin")) if data.get("insulin") not in (None, "") else np.nan
    bmi = float(data.get("bmi")) if data.get("bmi") not in (None, "") else np.nan
    dpf = float(data.get("dpf")) if data.get("dpf") not in (None, "") else np.nan
    age = float(data.get("age")) if data.get("age") not in (None, "") else np.nan
    preg = float(data.get("pregnancies")) if data.get("pregnancies") not in (None, "") else 0.0

    input_df = pd.DataFrame([{
        "Pregnancies": preg,
        "Glucose": glucose,
        "BloodPressure": bp,
        "SkinThickness": skin,
        "Insulin": insulin,
        "BMI": bmi,
        "DiabetesPedigreeFunction": dpf,
        "Age": age
    }])

    proba = float(_diabetes_model.predict_proba(input_df)[0, 1])
    risk_info = get_risk_tier(proba)

    # Explainable factor analysis
    factors = []
    if not np.isnan(glucose):
        if glucose >= 140:
            factors.append({"factor": "Elevated Glucose", "impact": "High Positive", "note": f"Fasting/random glucose is {glucose} mg/dL (threshold: 140)."})
        elif glucose >= 100:
            factors.append({"factor": "Borderline Glucose", "impact": "Moderate Positive", "note": f"Pre-diabetic threshold range ({glucose} mg/dL)."})
        else:
            factors.append({"factor": "Normal Glucose", "impact": "Protective", "note": f"Normal blood glucose level ({glucose} mg/dL)."})

    if not np.isnan(bmi):
        if bmi >= 30:
            factors.append({"factor": "Elevated BMI", "impact": "Moderate Positive", "note": f"BMI ({bmi}) falls within clinical obesity tier."})
        elif bmi >= 25:
            factors.append({"factor": "Overweight BMI", "impact": "Mild Positive", "note": f"BMI ({bmi}) indicates overweight classification."})
        else:
            factors.append({"factor": "Healthy BMI", "impact": "Protective", "note": f"Normal BMI ({bmi})."})

    if not np.isnan(age) and age >= 45:
        factors.append({"factor": "Age (>45)", "impact": "Mild Positive", "note": "Type 2 diabetes risk increases statistically after age 45."})

    return {
        "disease": "Diabetes",
        "probability": round(proba, 4),
        "percentage": round(proba * 100, 1),
        "riskTier": risk_info["tier"],
        "badge": risk_info["badge"],
        "level": risk_info["level"],
        "description": risk_info["description"],
        "factors": factors,
        "featuresUsed": [k for k, v in input_df.iloc[0].items() if not pd.isna(v)],
        "missingFeaturesImputed": [k for k, v in input_df.iloc[0].items() if pd.isna(v)]
    }


def predict_heart_risk(data: dict) -> dict:
    if _heart_model is None:
        raise RuntimeError("Heart disease model is not loaded.")

    age = float(data.get("age")) if data.get("age") not in (None, "") else np.nan
    sex = "M" if str(data.get("sex", data.get("gender", ""))).lower() in ("1", "m", "male") else "F"

    # Chest pain mapping
    cp_raw = str(data.get("cp", "ASY"))
    cp_map = {"0": "TA", "1": "ATA", "2": "NAP", "3": "ASY", "TA": "TA", "ATA": "ATA", "NAP": "NAP", "ASY": "ASY"}
    cp = cp_map.get(cp_raw, "ASY")

    resting_bp = float(data.get("trestbps", data.get("bp", np.nan))) if data.get("trestbps", data.get("bp")) not in (None, "") else np.nan
    chol = float(data.get("chol", data.get("cholesterol", np.nan))) if data.get("chol", data.get("cholesterol")) not in (None, "") else np.nan
    fbs = int(data.get("fbs", 0)) if data.get("fbs") not in (None, "") else 0

    restecg_raw = str(data.get("restecg", "Normal"))
    restecg_map = {"0": "Normal", "1": "ST", "2": "LVH", "Normal": "Normal", "ST": "ST", "LVH": "LVH"}
    restecg = restecg_map.get(restecg_raw, "Normal")

    max_hr = float(data.get("thalach", data.get("heartRate", np.nan))) if data.get("thalach", data.get("heartRate")) not in (None, "") else np.nan
    exang = "Y" if str(data.get("exang", "0")) in ("1", "Y", "yes") else "N"
    oldpeak = float(data.get("oldpeak", 0.0)) if data.get("oldpeak") not in (None, "") else 0.0

    slope_raw = str(data.get("slope", "Flat"))
    slope_map = {"0": "Up", "1": "Flat", "2": "Down", "Up": "Up", "Flat": "Flat", "Down": "Down"}
    slope = slope_map.get(slope_raw, "Flat")

    input_df = pd.DataFrame([{
        "Age": age,
        "Sex": sex,
        "ChestPainType": cp,
        "RestingBP": resting_bp,
        "Cholesterol": chol,
        "FastingBS": fbs,
        "RestingECG": restecg,
        "MaxHR": max_hr,
        "ExerciseAngina": exang,
        "Oldpeak": oldpeak,
        "ST_Slope": slope
    }])

    proba = float(_heart_model.predict_proba(input_df)[0, 1])
    risk_info = get_risk_tier(proba)

    factors = []
    if not np.isnan(resting_bp) and resting_bp >= 140:
        factors.append({"factor": "High Resting BP", "impact": "Moderate Positive", "note": f"Resting blood pressure ({resting_bp} mmHg) elevates cardiac workload."})

    if not np.isnan(chol) and chol >= 200:
        factors.append({"factor": "Elevated Cholesterol", "impact": "Moderate Positive", "note": f"Total cholesterol ({chol} mg/dL) exceeds optimal threshold (200)."})

    if exang == "Y":
        factors.append({"factor": "Exercise-Induced Angina", "impact": "High Positive", "note": "Chest pain during physical exertion is a notable ischemic indicator."})

    if cp in ("ASY", "TA"):
        factors.append({"factor": f"Chest Pain ({cp})", "impact": "Moderate Positive", "note": "Specific anginal patterns statistically correlate with coronary risk."})

    return {
        "disease": "Heart Disease",
        "probability": round(proba, 4),
        "percentage": round(proba * 100, 1),
        "riskTier": risk_info["tier"],
        "badge": risk_info["badge"],
        "level": risk_info["level"],
        "description": risk_info["description"],
        "factors": factors,
        "featuresUsed": [k for k, v in input_df.iloc[0].items() if not pd.isna(v)],
        "missingFeaturesImputed": [k for k, v in input_df.iloc[0].items() if pd.isna(v)]
    }


def predict_hypertension_risk(data: dict) -> dict:
    if _hypertension_model is None:
        raise RuntimeError("Hypertension model is not loaded.")

    male = 1 if str(data.get("sex", data.get("gender", ""))).lower() in ("1", "m", "male") else 0
    age = float(data.get("age")) if data.get("age") not in (None, "") else np.nan
    smoker = 1 if str(data.get("smoker", data.get("currentSmoker", "0"))).lower() in ("1", "y", "yes", "true") else 0
    tot_chol = float(data.get("cholesterol", data.get("totChol", np.nan))) if data.get("cholesterol", data.get("totChol")) not in (None, "") else np.nan

    sys_bp = float(data.get("sysBP", data.get("bp", np.nan))) if data.get("sysBP", data.get("bp")) not in (None, "") else np.nan
    dia_bp = float(data.get("diaBP", np.nan)) if data.get("diaBP") not in (None, "") else np.nan

    # If diastolic BP is missing, estimate physiological approximation based on pulse pressure
    if np.isnan(dia_bp) and not np.isnan(sys_bp):
        dia_bp = sys_bp * 0.65

    bmi = float(data.get("bmi")) if data.get("bmi") not in (None, "") else np.nan
    heart_rate = float(data.get("heartRate", data.get("thalach", np.nan))) if data.get("heartRate", data.get("thalach")) not in (None, "") else np.nan
    glucose = float(data.get("glucose")) if data.get("glucose") not in (None, "") else np.nan

    input_df = pd.DataFrame([{
        "male": male,
        "age": age,
        "currentSmoker": smoker,
        "totChol": tot_chol,
        "sysBP": sys_bp,
        "diaBP": dia_bp,
        "BMI": bmi,
        "heartRate": heart_rate,
        "glucose": glucose
    }])

    proba = float(_hypertension_model.predict_proba(input_df)[0, 1])
    risk_info = get_risk_tier(proba)

    factors = []
    if not np.isnan(sys_bp):
        if sys_bp >= 140 or (not np.isnan(dia_bp) and dia_bp >= 90):
            factors.append({"factor": "Stage 2 Hypertensive BP", "impact": "High Positive", "note": f"Blood pressure ({round(sys_bp)}/{round(dia_bp) if not np.isnan(dia_bp) else '-'} mmHg) exceeds Stage 2 AHA guidelines."})
        elif sys_bp >= 130 or (not np.isnan(dia_bp) and dia_bp >= 80):
            factors.append({"factor": "Stage 1 Hypertensive BP", "impact": "Moderate Positive", "note": f"Blood pressure ({round(sys_bp)}/{round(dia_bp) if not np.isnan(dia_bp) else '-'} mmHg) indicates Stage 1 hypertension."})
        elif sys_bp >= 120:
            factors.append({"factor": "Elevated Systolic BP", "impact": "Mild Positive", "note": f"Systolic reading ({round(sys_bp)} mmHg) is elevated above optimal (<120)."})
        else:
            factors.append({"factor": "Optimal Blood Pressure", "impact": "Protective", "note": f"Blood pressure is within optimal limits ({round(sys_bp)} mmHg)."})

    if smoker == 1:
        factors.append({"factor": "Current Smoker", "impact": "Moderate Positive", "note": "Nicotine causes acute arterial constriction and arterial stiffness."})

    if not np.isnan(bmi) and bmi >= 30:
        factors.append({"factor": "Elevated BMI", "impact": "Moderate Positive", "note": "Adiposity requires higher systemic vascular resistance."})

    return {
        "disease": "Hypertension",
        "probability": round(proba, 4),
        "percentage": round(proba * 100, 1),
        "riskTier": risk_info["tier"],
        "badge": risk_info["badge"],
        "level": risk_info["level"],
        "description": risk_info["description"],
        "factors": factors,
        "featuresUsed": [k for k, v in input_df.iloc[0].items() if not pd.isna(v)],
        "missingFeaturesImputed": [k for k, v in input_df.iloc[0].items() if pd.isna(v)]
    }


def evaluate_full_patient_assessment(data: dict) -> dict:
    """Evaluates all three conditions comprehensively."""
    warnings = validate_vitals(data)

    diabetes_res = predict_diabetes_risk(data)
    heart_res = predict_heart_risk(data)
    hypertension_res = predict_hypertension_risk(data)

    # Compute overall composite risk score
    max_level = max(diabetes_res["level"], heart_res["level"], hypertension_res["level"])
    avg_proba = (diabetes_res["probability"] + heart_res["probability"] + hypertension_res["probability"]) / 3.0

    if max_level == 3 or avg_proba >= 0.65:
        overall_tier = "High Health Risk"
        overall_summary = "Significant clinical risk markers detected across one or more cardiovascular/metabolic domains. Consultation with a certified medical practitioner is recommended."
        overall_badge = "danger"
    elif max_level == 2 or avg_proba >= 0.35:
        overall_tier = "Moderate Health Risk"
        overall_summary = "Borderline indicators detected. Lifestyle modifications and routine surveillance are advised."
        overall_badge = "warning"
    else:
        overall_tier = "Low Health Risk"
        overall_summary = "All evaluated parameters fall within standard population reference thresholds."
        overall_badge = "success"

    return {
        "overall": {
            "tier": overall_tier,
            "badge": overall_badge,
            "averageProbability": round(avg_proba, 4),
            "summary": overall_summary,
            "warnings": warnings
        },
        "diseases": {
            "diabetes": diabetes_res,
            "heart": heart_res,
            "hypertension": hypertension_res
        },
        "disclaimer": "Swasth AI provides statistical risk estimation powered by population clinical models. It is an educational health aid and not a diagnostic medical device."
    }
