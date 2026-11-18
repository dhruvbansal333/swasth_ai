# SWASTH AI — Comprehensive Project Audit & Baseline Review

**Date:** November 2026  
**Auditor:** Senior ML Engineer, Healthcare AI Architect & Full-Stack Lead  
**Repository:** [https://github.com/dhruvbansal333/swasth_ai](https://github.com/dhruvbansal333/swasth_ai)  
**Target Diseases:** Diabetes, Heart Disease, Hypertension

---

## 1. Executive Summary

Swasth AI was initially constructed as a demonstration healthcare web application designed to evaluate patient health risks. While the baseline codebase demonstrated a functional prototype using React and Flask, the comprehensive audit reveals critical architectural vulnerabilities, clinical inaccuracies, missing machine learning pipelines, and security risks.

The most significant baseline findings are:
1. **Three Target Diseases Identified:**
   - **Diabetes:** Implemented via a pickled scikit-learn `RandomForestClassifier(n_estimators=200)` trained on 8 Pima Indian clinical features.
   - **Heart Disease:** Implemented via a pickled scikit-learn `RandomForestClassifier(n_estimators=200)` with a 20-feature one-hot encoded pipeline (UCI Heart Failure dataset).
   - **Hypertension:** **Completely absent from the backend ML system.** In the original frontend, hypertension was evaluated via a crude client-side rule (`bp > 140 ? "High ⚠️" : "Normal ✅"`), while in the `ResultCard` component the hypertension section was commented out entirely.
2. **Fabricated Fallback Formulas:** In `src/pages/Predict.jsx`, the "Continue Previous Assessment" flow bypassed the backend ML models entirely and computed hardcoded arbitrary linear formulas (`diabetesScore = glucose * 0.4 + bmi * 0.3 + ...`), directly violating clinical and data science standards.
3. **Harmful Zero-Imputation:** In `src/components/RiskForm.jsx`, optional or empty inputs were defaulted to `0` (`Number(form.bp || 0)`, `Number(form.cholesterol || 0)`). Feeding a blood pressure or cholesterol value of 0 into clinical models severely distorts risk calculations.
4. **No Authentication or Persistence:** Authentication was simulated with a dummy local storage flag (`localStorage.setItem("isLoggedIn", "true")`). Patient assessments and results were saved in client browser `localStorage` with no database backend, no data isolation between users, and no session security.
5. **Serialization Incompatibilities:** Model artifacts were serialized using `scikit-learn 1.6.1` and unpickled in modern environments (`scikit-learn 1.9.1+`), producing runtime warnings and potential breaking changes. Furthermore, bare `pickle.load` on unvalidated files poses remote code execution risks.

---

## 2. Baseline Architecture Overview

```
swasth_ai (Baseline)
├── backend/
│   ├── app.py                      # Monolithic Flask server (debug=True, CORS: *)
│   ├── diabetes_model.pkl          # Pickled RandomForest (8 Pima features)
│   ├── heart_disease_model.pkl     # Pickled RandomForest (20 one-hot features)
│   ├── heart_columns.pkl           # Pickled column list (20 features)
│   ├── scaler_d.pkl                # StandardScaler for diabetes
│   └── scaler_h.pkl                # StandardScaler for heart
├── src/
│   ├── pages/
│   │   ├── Home.jsx                # Landing page
│   │   ├── Login.jsx               # Pseudo-login form
│   │   └── Predict.jsx             # Dual-mode container with formula fallback
│   ├── components/
│   │   ├── Navbar.jsx              # Navigation header
│   │   ├── Hero.jsx                # Landing hero banner
│   │   ├── Features.jsx            # 3-feature card deck (mentions diabetes, hypertension, heart)
│   │   ├── RiskForm.jsx            # 20-field monolithic input form
│   │   └── ResultCard.jsx          # Result modal (hypertension commented out)
│   ├── App.jsx                     # Route configuration with dummy PrivateRoute
│   └── main.jsx                    # React 19 entrypoint
├── package.json                    # React 19, Vite, Tailwind CSS 3
└── README.md                       # Boilerplate Vite readme
```

---

## 3. Disease-Specific Assessment & Model Audit

### 3.1 Diabetes Prediction System

| Parameter | Baseline State | Evaluation & Impact |
| :--- | :--- | :--- |
| **Model Type** | `sklearn.ensemble.RandomForestClassifier` (`n_estimators=200`) | Standard ensemble, but raw pickles lack reproducibility records, train/test split info, or evaluation logs. |
| **Dataset Source** | Pima Indians Diabetes Database (NIDDK) | Standard 768-sample medical benchmark dataset. |
| **Input Features (8)** | `Pregnancies`, `Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, `BMI`, `DiabetesPedigreeFunction`, `Age` | Clinically valid features, but biologically impossible 0s (e.g. Glucose=0, BloodPressure=0, BMI=0) exist in raw dataset and must be treated as missing values rather than valid measurements. |
| **Preprocessing** | `StandardScaler` (`scaler_d.pkl`) | Scaler was fitted externally. No scikit-learn `Pipeline` object, risking feature ordering mismatch. |
| **Backend Endpoint** | `POST /predict/diabetes` | Returns binary `{"prediction": 0 | 1}` without probability, confidence, or risk calibration. |
| **Frontend Flaw** | Blank inputs converted to `0` (`insulin: 0, dpf: 0, skinThickness: 0`) | Falsifies patient profile; severely skews model inference. |

### 3.2 Heart Disease Prediction System

| Parameter | Baseline State | Evaluation & Impact |
| :--- | :--- | :--- |
| **Model Type** | `sklearn.ensemble.RandomForestClassifier` (`n_estimators=200`) | Pickled model saved with scikit-learn 1.6.1. |
| **Dataset Source** | UCI Heart Failure Prediction Dataset (918 records) | Combination of Cleveland, Hungarian, Switzerland, Long Beach VA, and Stalog datasets. |
| **Input Features (11 base, 20 encoded)** | `Age`, `RestingBP`, `Cholesterol`, `FastingBS`, `MaxHR`, `Oldpeak`, `Sex (M/F)`, `ChestPainType (ASY/ATA/NAP/TA)`, `RestingECG (LVH/Normal/ST)`, `ExerciseAngina (N/Y)`, `ST_Slope (Down/Flat/Up)` | One-hot manual dictionary building in `app.py` lines 41–74. Redundant unused inputs (`ca`, `thal`) were gathered in the UI but dropped in backend! |
| **Preprocessing** | `StandardScaler` (`scaler_h.pkl`) | Applied across the 20 encoded columns. |
| **Backend Endpoint** | `POST /predict/heart` | Returns binary `{"prediction": 0 | 1}`. Logs probability to console (`print("Heart Probabilities:", proba)`), but never delivers probability to client! |
| **Frontend Flaw** | Collects irrelevant fields like `ca` (major vessels) and `thal` (thalassemia) that are silently discarded. | Disconnect between UI forms and underlying model contract. |

### 3.3 Hypertension Prediction System

| Parameter | Baseline State | Evaluation & Impact |
| :--- | :--- | :--- |
| **Model Type** | **None** (No trained model exists) | **CRITICAL DEFICIENCY.** Hypertension is advertised as one of the platform's 3 primary diseases but had zero backend implementation. |
| **Dataset Source** | N/A | No dataset was curated or integrated for hypertension. |
| **Inference Logic** | `Number(form.bp) > 140 ? "High ⚠️" : "Normal ✅"` | Naive hardcoded threshold ignoring age, BMI, heart rate, lifestyle, and Stage 1 / Stage 2 AHA/ACC clinical guidelines. |
| **Backend Endpoint** | Missing entirely. | Frontend never calls backend for hypertension. |
| **UI Presentation** | Commented out in `src/components/ResultCard.jsx` (lines 63–68). | Half-finished feature left visible in form logic but hidden in result UI. |

---

## 4. Code Quality, Security & Engineering Flaws

1. **Insecure Authentication:**
   ```javascript
   // src/pages/Login.jsx
   if (email && password) {
     localStorage.setItem("isLoggedIn", "true");
     navigate("/predict");
   }
   ```
   Any non-empty string granted access. No password verification, no hash generation (e.g. bcrypt), no JWT token issuance, no expiration.
2. **Insecure Local Storage & Privacy Exposure:**
   All patient clinical data (`glucose`, `cholesterol`, `bp`, `prediction`) was written to unencrypted browser `localStorage`. Anyone with device access can view prior health data. Furthermore, multiple users on the same machine share the same `patientData` key.
3. **CORS Wildcard & Debug Mode:**
   `backend/app.py` enabled `CORS(app)` without origin restrictions and invoked `app.run(debug=True)`.
4. **Hardcoded Ports & URLs:**
   Frontend components explicitly hardcoded `http://127.0.0.1:5000/...` instead of using environment configuration (`VITE_API_BASE_URL`).
5. **No Database Layer:**
   No SQLite, PostgreSQL, or ORM layer existed. All user records and historical predictions evaporate upon local storage clearance.
6. **No Automated Testing:**
   Zero unit tests, zero integration tests, zero ML validation benchmarks.

---

## 5. Summary Matrix of Required Actions

| Component | Current State | Required Upgrade |
| :--- | :--- | :--- |
| **Hypertension System** | Client-side `bp > 140` check; UI commented out | Train robust ML model (Logistic Regression, Random Forest, XGBoost) on validated clinical data; establish `/predict/hypertension` endpoint. |
| **Diabetes Model** | RandomForest (scikit-learn 1.6.1 pickle) | Retrain with multi-model experimentation (Logistic Regression, Random Forest, XGBoost), cross-validation, probability calibration, SHAP explainability. |
| **Heart Disease Model** | RandomForest (scikit-learn 1.6.1 pickle) | Retrain with multi-model experimentation, clean pipeline encoding, probability calibration, SHAP explainability. |
| **Missing Value Handling** | Defaults blank inputs to `0` | Intelligent clinical validation, multi-stage assessment (Basic vs. Advanced), out-of-range warnings, never substituting 0 for vitals. |
| **Patient Assessment UI** | Single monolithic 20-field form | Clean multi-step Basic Patient Assessment + Advanced Medical Report Assessment (with OCR/PDF extraction and verification). |
| **Health Analytics** | Raw text cards | Interactive charts, historical trend tracking, disease risk scoring, and explainable AI factor breakdowns. |
| **Patient Health Guidance** | Completely absent | "My Health Companion" with diet, exercise, lifestyle, and disease-specific evidence-based action plans. |
| **Auth & Database** | Client dummy flag | Secure JWT authentication, bcrypt password hashing, SQLite relational database with isolated patient histories. |
| **UI/UX Design** | Basic demo Tailwind layout | Premium medical UI, responsive navigation, accessible healthcare color palette, and error handling. |
