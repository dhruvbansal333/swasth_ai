"""
Swasth AI - Multi-Disease Prediction, Risk Stratification & Explainability Service
Loads calibrated models for Diabetes, Coronary Heart Disease, and Hypertension.
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
        meta_d = os.path.join(MODELS_DIR, "diabetes_metadata.json")
        if os.path.exists(meta_d):
            with open(meta_d) as f:
                _diabetes_meta = json.load(f)

    if os.path.exists(h_path):
        _heart_model = joblib.load(h_path)
        meta_h = os.path.join(MODELS_DIR, "heart_metadata.json")
        if os.path.exists(meta_h):
            with open(meta_h) as f:
                _heart_meta = json.load(f)

    if os.path.exists(hyp_path):
        _hypertension_model = joblib.load(hyp_path)
        meta_hyp = os.path.join(MODELS_DIR, "hypertension_metadata.json")
        if os.path.exists(meta_hyp):
            with open(meta_hyp) as f:
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
    if age is not None and str(age) != "":
        try:
            age_f = float(age)
            if age_f < 1 or age_f > 120:
                warnings.append(f"Age ({age_f}) is outside expected clinical range (1-120).")
        except ValueError:
            warnings.append("Age must be a valid number.")

    bp = data.get("bp") or data.get("sysBP")
    if bp is not None and str(bp) != "":
        try:
            bp_f = float(bp)
            if bp_f < 50 or bp_f > 280:
                warnings.append(f"Systolic blood pressure ({bp_f} mmHg) is biologically extreme.")
        except ValueError:
            warnings.append("Systolic blood pressure must be a valid number.")

    dia_bp = data.get("diaBP")
    if dia_bp is not None and str(dia_bp) != "":
        try:
            dia_f = float(dia_bp)
            if dia_f < 30 or dia_f > 180:
                warnings.append(f"Diastolic blood pressure ({dia_f} mmHg) is biologically extreme.")
        except ValueError:
            warnings.append("Diastolic blood pressure must be a valid number.")

    glucose = data.get("glucose")
    if glucose is not None and str(glucose) != "":
        try:
            gluc_f = float(glucose)
            if gluc_f < 30 or gluc_f > 600:
                warnings.append(f"Blood glucose ({gluc_f} mg/dL) is outside standard laboratory limits.")
        except ValueError:
            warnings.append("Blood glucose must be a valid number.")

    chol = data.get("cholesterol") or data.get("totChol")
    if chol is not None and str(chol) != "":
        try:
            chol_f = float(chol)
            if chol_f < 50 or chol_f > 600:
                warnings.append(f"Cholesterol ({chol_f} mg/dL) is outside standard laboratory limits.")
        except ValueError:
            warnings.append("Cholesterol must be a valid number.")

    bmi = data.get("bmi")
    if bmi is not None and str(bmi) != "":
        try:
            bmi_f = float(bmi)
            if bmi_f < 10 or bmi_f > 75:
                warnings.append(f"BMI ({bmi_f}) is outside physiological boundaries.")
        except ValueError:
            warnings.append("BMI must be a valid number.")

    return warnings


def predict_diabetes_risk(data: dict) -> dict:
    if _diabetes_model is None:
        raise RuntimeError("Diabetes model is not loaded.")

    glucose = float(data.get("glucose")) if data.get("glucose") not in (None, "") else np.nan

    # Blood pressure: Pima Indians dataset records DIASTOLIC blood pressure (mmHg).
    # If diaBP is provided, use it. If only systolic bp is provided, approximate diastolic (~0.65 * sysBP).
    dia_bp = data.get("diaBP")
    sys_bp = data.get("bp") or data.get("sysBP")
    if dia_bp not in (None, ""):
        bp = float(dia_bp)
    elif sys_bp not in (None, ""):
        bp = float(sys_bp) * 0.65
    else:
        bp = np.nan

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
            factors.append({"factor": "Elevated Glucose", "impact": "High Positive", "note": f"Fasting/random glucose is {glucose} mg/dL (threshold: >=140)."})
        elif glucose >= 100:
            factors.append({"factor": "Borderline Glucose", "impact": "Moderate Positive", "note": f"Pre-diabetic threshold range ({glucose} mg/dL, 100-139)."})
        else:
            factors.append({"factor": "Normal Glucose", "impact": "Protective", "note": f"Normal blood glucose level ({glucose} mg/dL, <100)."})

    if not np.isnan(bmi):
        if bmi >= 30:
            factors.append({"factor": "Elevated BMI", "impact": "Moderate Positive", "note": f"BMI ({bmi}) falls within clinical obesity tier."})
        elif bmi >= 25:
            factors.append({"factor": "Overweight BMI", "impact": "Mild Positive", "note": f"BMI ({bmi}) indicates overweight classification."})
        else:
            factors.append({"factor": "Healthy BMI", "impact": "Protective", "note": f"Normal BMI ({bmi}, 18.5-24.9)."})

    if not np.isnan(age) and age >= 45:
        factors.append({"factor": "Age (>=45)", "impact": "Mild Positive", "note": "Type 2 diabetes incidence increases statistically after age 45."})
    elif not np.isnan(age) and age < 35:
        factors.append({"factor": "Younger Age (<35)", "impact": "Protective", "note": "Younger age is statistically associated with lower baseline type 2 diabetes prevalence."})

    return {
        "disease": "Type 2 Diabetes",
        "probability": round(proba, 4),
        "percentage": round(proba * 100, 1),
        "riskTier": risk_info["tier"],
        "badge": risk_info["badge"],
        "level": risk_info["level"],
        "description": risk_info["description"],
        "factors": factors,
        "featuresUsed": [k for k, v in input_df.iloc[0].items() if not pd.isna(v)],
        "missingFeaturesImputed": [k for k, v in input_df.iloc[0].items() if pd.isna(v)],
        "modelInfo": "Pima Indians Diabetes NIDDK Calibrated Random Forest (ROC-AUC ~0.82)"
    }


def predict_heart_risk(data: dict) -> dict:
    if _heart_model is None:
        raise RuntimeError("Heart disease model is not loaded.")

    age = float(data.get("age")) if data.get("age") not in (None, "") else np.nan
    sex = "M" if str(data.get("sex", data.get("gender", ""))).lower() in ("1", "m", "male") else "F"

    # Chest Pain Mapping:
    # In UCI cardiology referral dataset:
    #   TA  = Typical Angina
    #   ATA = Atypical Angina
    #   NAP = Non-Anginal Discomfort (musculoskeletal / atypical non-coronary)
    #   ASY = Asymptomatic (silent ischemia in patients referred for angiography)
    # For a general health screening individual reporting NO chest pain, mapping to catheter-referral ASY is
    # statistically inappropriate and causes severe false-positive inflation (+1.26 log-odds).
    # Absence of anginal symptoms is correctly mapped to non-anginal (NAP) unless the patient
    # explicitly specifies known silent ischemia / prior cardiac catheterization referral.
    cp_raw = str(data.get("cp", "NONE")).strip().upper()
    cp_map = {
        "NONE": "NAP",
        "NO": "NAP",
        "0": "NAP",
        "NAP": "NAP",
        "NON-ANGINAL": "NAP",
        "ATA": "ATA",
        "ATYPICAL": "ATA",
        "1": "ATA",
        "TA": "TA",
        "TYPICAL": "TA",
        "2": "TA",
        "ASY": "ASY",
        "SILENT": "ASY",
        "3": "ASY"
    }
    cp = cp_map.get(cp_raw, "NAP")

    resting_bp = float(data.get("trestbps", data.get("bp", data.get("sysBP", np.nan)))) if data.get("trestbps", data.get("bp", data.get("sysBP"))) not in (None, "") else np.nan
    chol = float(data.get("chol", data.get("cholesterol", np.nan))) if data.get("chol", data.get("cholesterol")) not in (None, "") else np.nan
    # Fasting blood sugar derivation:
    # If explicit 'fbs' (0 or 1) is provided, use it.
    # Otherwise derive from 'glucose' (standard clinical threshold: FastingBS = 1 if glucose > 120 mg/dL).
    if data.get("fbs") not in (None, ""):
        try:
            fbs = int(data.get("fbs"))
        except (ValueError, TypeError):
            fbs = 0
    elif data.get("glucose") not in (None, ""):
        try:
            fbs = 1 if float(data.get("glucose")) > 120 else 0
        except (ValueError, TypeError):
            fbs = 0
    else:
        fbs = 0

    restecg_raw = str(data.get("restecg", "Normal")).capitalize()
    restecg_map = {"0": "Normal", "1": "ST", "2": "LVH", "Normal": "Normal", "ST": "ST", "LVH": "LVH"}
    restecg = restecg_map.get(restecg_raw, "Normal")

    # MaxHR vs Resting Heart Rate:
    # UCI dataset 'MaxHR' is maximum exercise heart rate attained during a Bruce treadmill stress test.
    # Normal resting heart rate (60-80 bpm) must NOT be passed as maximum exercise heart rate.
    # If explicit treadmill test max HR is provided ('thalach' or 'max_hr' > 100), use it.
    # Otherwise, calculate physiological age-predicted maximal exercise heart rate (Tanaka formula: 208 - 0.7 * age).
    explicit_max_hr = data.get("thalach") if data.get("thalach") not in (None, "") else data.get("max_hr")
    if explicit_max_hr not in (None, "") and float(explicit_max_hr) > 100:
        max_hr = float(explicit_max_hr)
    elif not np.isnan(age):
        max_hr = float(round(208 - (0.7 * age)))
    else:
        max_hr = np.nan

    exang_raw = str(data.get("exang", "0")).lower()
    exang = "Y" if exang_raw in ("1", "y", "yes", "true") else "N"
    oldpeak = float(data.get("oldpeak", 0.0)) if data.get("oldpeak") not in (None, "") else 0.0

    # ST_Slope:
    # 'Up' is normal physiological upsloping ST response to exercise.
    # 'Flat' is ischemic horizontal depression. 'Down' is severe ischemic downsloping.
    # If explicit treadmill test slope is provided, use it.
    # Otherwise correlate with exertion: patients with exertional angina (exang='Y') predominantly
    # present with ischemic flat depression, whereas asymptomatic patients present with normal upsloping.
    slope_raw = data.get("slope")
    if slope_raw not in (None, ""):
        slope_map = {"0": "Up", "1": "Flat", "2": "Down", "Up": "Up", "Flat": "Flat", "Down": "Down"}
        slope = slope_map.get(str(slope_raw).capitalize(), "Up")
    else:
        slope = "Flat" if exang == "Y" else "Up"

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
    if not np.isnan(resting_bp):
        if resting_bp >= 140:
            factors.append({"factor": "High Resting Systolic BP", "impact": "Moderate Positive", "note": f"Resting blood pressure ({resting_bp} mmHg) elevates vascular workload."})
        elif resting_bp < 120:
            factors.append({"factor": "Optimal Blood Pressure", "impact": "Protective", "note": f"Resting blood pressure ({resting_bp} mmHg) is in optimal cardioprotective range."})

    if not np.isnan(chol):
        if chol >= 240:
            factors.append({"factor": "High Serum Cholesterol", "impact": "High Positive", "note": f"Total cholesterol ({chol} mg/dL) significantly exceeds optimal range (>=240)."})
        elif chol >= 200:
            factors.append({"factor": "Borderline Elevated Cholesterol", "impact": "Moderate Positive", "note": f"Total cholesterol ({chol} mg/dL) exceeds optimal threshold (<200)."})
        else:
            factors.append({"factor": "Desirable Cholesterol", "impact": "Protective", "note": f"Total cholesterol ({chol} mg/dL) is within desirable range (<200)."})

    if exang == "Y":
        factors.append({"factor": "Exercise-Induced Angina", "impact": "High Positive", "note": "Chest tightness or discomfort provoked by physical exertion indicates potential myocardial ischemia."})

    if cp == "TA":
        factors.append({"factor": "Typical Anginal Pattern", "impact": "High Positive", "note": "Substernal exertional pressure consistent with classic coronary insufficiency."})
    elif cp == "ASY":
        factors.append({"factor": "Documented Silent Ischemia Referral", "impact": "High Positive", "note": "Angiography referral profile without typical angina symptoms."})
    else:
        factors.append({"factor": "Absence of Anginal Symptoms", "impact": "Protective", "note": "No ischemic chest pain symptoms reported."})

    if sex == "M":
        factors.append({"factor": "Male Demographic", "impact": "Mild Positive", "note": "Biological males exhibit higher statistical baseline prevalence in coronary cohorts."})
    else:
        factors.append({"factor": "Female Demographic", "impact": "Protective", "note": "Females exhibit statistically lower baseline incidence of early-onset CAD."})

    return {
        "disease": "Coronary Heart Disease (CAD)",
        "probability": round(proba, 4),
        "percentage": round(proba * 100, 1),
        "riskTier": risk_info["tier"],
        "badge": risk_info["badge"],
        "level": risk_info["level"],
        "description": risk_info["description"],
        "factors": factors,
        "featuresUsed": [k for k, v in input_df.iloc[0].items() if not pd.isna(v)],
        "missingFeaturesImputed": [k for k, v in input_df.iloc[0].items() if pd.isna(v)],
        "modelInfo": "UCI Multi-Center Angiography Cohort Calibrated Logistic Regression (ROC-AUC ~0.93)"
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
    heart_rate = float(data.get("heartRate", np.nan)) if data.get("heartRate") not in (None, "") else np.nan
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
            factors.append({"factor": "Optimal Blood Pressure", "impact": "Protective", "note": f"Blood pressure is within optimal limits ({round(sys_bp)}/{round(dia_bp) if not np.isnan(dia_bp) else '-'} mmHg)."})

    if smoker == 1:
        factors.append({"factor": "Current Smoker", "impact": "Moderate Positive", "note": "Nicotine causes acute arterial constriction and arterial wall stiffness."})

    if not np.isnan(bmi) and bmi >= 30:
        factors.append({"factor": "Elevated BMI", "impact": "Moderate Positive", "note": "Adiposity increases systemic vascular resistance."})

    return {
        "disease": "Hypertension (Current Status)",
        "probability": round(proba, 4),
        "percentage": round(proba * 100, 1),
        "riskTier": risk_info["tier"],
        "badge": risk_info["badge"],
        "level": risk_info["level"],
        "description": risk_info["description"],
        "factors": factors,
        "featuresUsed": [k for k, v in input_df.iloc[0].items() if not pd.isna(v)],
        "missingFeaturesImputed": [k for k, v in input_df.iloc[0].items() if pd.isna(v)],
        "modelInfo": "Framingham Heart Study Clinical Cohort Calibrated Random Forest (prevalentHyp, ROC-AUC ~0.95)"
    }


def evaluate_full_patient_assessment(data: dict) -> dict:
    """Evaluates all three conditions comprehensively."""
    warnings = validate_vitals(data)

    diabetes_res = predict_diabetes_risk(data)
    heart_res = predict_heart_risk(data)
    hypertension_res = predict_hypertension_risk(data)

    # Clinical Stratification for Overall Composite Health Risk:
    # An overall "High Health Risk" requires either:
    # 1. At least two conditions in High Risk (level 3), OR
    # 2. One condition in High Risk WITH confirmed severe clinical biomarker elevation (e.g. glucose >= 180, sysBP >= 160), OR
    # 3. An average cross-condition risk probability >= 0.55
    # A single elevated level without severe biomarkers is classified as "Moderate / Domain-Specific Risk".
    high_count = sum(1 for res in (diabetes_res, heart_res, hypertension_res) if res["level"] == 3)
    mod_count = sum(1 for res in (diabetes_res, heart_res, hypertension_res) if res["level"] == 2)
    avg_proba = (diabetes_res["probability"] + heart_res["probability"] + hypertension_res["probability"]) / 3.0

    sys_bp = float(data.get("sysBP") or data.get("bp") or 0)
    glucose = float(data.get("glucose") or 0)
    has_critical_biomarker = (sys_bp >= 160 or glucose >= 180)

    if high_count >= 2 or (high_count == 1 and has_critical_biomarker) or avg_proba >= 0.55:
        overall_tier = "High Health Risk"
        overall_summary = "Substantial clinical risk markers detected across metabolic or cardiovascular domains. We strongly recommend clinical follow-up with a licensed healthcare provider."
        overall_badge = "danger"
    elif high_count == 1 or mod_count >= 1 or avg_proba >= 0.25:
        overall_tier = "Moderate Health Risk"
        overall_summary = "Borderline or localized risk indicators identified. Targeted lifestyle modifications, routine surveillance, and preventive health habits are recommended."
        overall_badge = "warning"
    else:
        overall_tier = "Low Health Risk"
        overall_summary = "Evaluated parameters and statistical models fall within standard non-elevated reference ranges."
        overall_badge = "success"

    # Identify individual abnormal biomarkers for clinical clarity
    abnormal_biomarkers = []
    if sys_bp >= 140:
        abnormal_biomarkers.append({"biomarker": "Systolic Blood Pressure", "value": f"{round(sys_bp)} mmHg", "status": "Stage 2 Hypertension", "reference": "<120 mmHg"})
    elif sys_bp >= 130:
        abnormal_biomarkers.append({"biomarker": "Systolic Blood Pressure", "value": f"{round(sys_bp)} mmHg", "status": "Stage 1 Hypertension", "reference": "<120 mmHg"})

    dia_bp = float(data.get("diaBP") or 0)
    if dia_bp >= 90:
        abnormal_biomarkers.append({"biomarker": "Diastolic Blood Pressure", "value": f"{round(dia_bp)} mmHg", "status": "Stage 2 Diastolic", "reference": "<80 mmHg"})
    elif dia_bp >= 80:
        abnormal_biomarkers.append({"biomarker": "Diastolic Blood Pressure", "value": f"{round(dia_bp)} mmHg", "status": "Stage 1 Diastolic", "reference": "<80 mmHg"})

    if glucose >= 140:
        abnormal_biomarkers.append({"biomarker": "Blood Glucose", "value": f"{round(glucose)} mg/dL", "status": "Elevated (Diabetic Range)", "reference": "<100 mg/dL (fasting)"})
    elif glucose >= 100:
        abnormal_biomarkers.append({"biomarker": "Blood Glucose", "value": f"{round(glucose)} mg/dL", "status": "Borderline (Pre-diabetic Range)", "reference": "<100 mg/dL (fasting)"})

    chol = float(data.get("cholesterol") or data.get("totChol") or 0)
    if chol >= 240:
        abnormal_biomarkers.append({"biomarker": "Total Cholesterol", "value": f"{round(chol)} mg/dL", "status": "High Hypercholesterolemia", "reference": "<200 mg/dL"})
    elif chol >= 200:
        abnormal_biomarkers.append({"biomarker": "Total Cholesterol", "value": f"{round(chol)} mg/dL", "status": "Borderline High", "reference": "<200 mg/dL"})

    bmi = float(data.get("bmi") or 0)
    if bmi >= 30:
        abnormal_biomarkers.append({"biomarker": "Body Mass Index (BMI)", "value": f"{bmi:.1f}", "status": "Obese Tier", "reference": "18.5 - 24.9"})
    elif bmi >= 25:
        abnormal_biomarkers.append({"biomarker": "Body Mass Index (BMI)", "value": f"{bmi:.1f}", "status": "Overweight Tier", "reference": "18.5 - 24.9"})

    return {
        "overall": {
            "tier": overall_tier,
            "badge": overall_badge,
            "averageProbability": round(avg_proba, 4),
            "summary": overall_summary,
            "warnings": warnings,
            "abnormalBiomarkers": abnormal_biomarkers
        },
        "diseases": {
            "diabetes": diabetes_res,
            "heart": heart_res,
            "hypertension": hypertension_res
        },
        "disclaimer": "Swasth AI generates statistical health risk estimates based on peer-reviewed clinical cohort models (Framingham Heart Study, Pima NIDDK, and UCI Cardiology). It is an educational health aid and not a clinical diagnosis or medical prescription."
    }
