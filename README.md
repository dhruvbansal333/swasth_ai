# Swasth AI — Intelligent Clinical Risk-Assessment & Patient Guidance Platform

[![Python Version](https://img.shields.io/badge/python-3.11%20%7C%203.12%20%7C%203.13-blue.svg)](https://www.python.org/)
[![React Version](https://img.shields.io/badge/react-19.0.0-cyan.svg)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.9.1-orange.svg)](https://scikit-learn.org/)
[![XGBoost](https://img.shields.io/badge/xgboost-3.4.1-red.svg)](https://xgboost.readthedocs.io/)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-3.4.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Swasth AI is a comprehensive, modern healthcare platform engineered to provide calibrated risk stratification, explainable artificial intelligence insights, and personalized preventive health guidance across three primary medical domains:
1. **Type 2 Diabetes Mellitus**
2. **Cardiovascular / Coronary Heart Disease**
3. **Primary & Essential Hypertension**

---

## 1. Key Platform Capabilities

### 🩺 1. Section A: Basic Patient Assessment
- **Multi-Step Clinical Wizard:** Guided 4-step intake (Demographics -> Vitals & Blood Sugar -> Cardiac & Lifestyle -> Review).
- **Interactive BMI Calculator:** Real-time computation from height (cm) and weight (kg).
- **Strict Physiological Range Validation:** Biological safeguards preventing extreme or impossible entries.
- **Zero-Imputation Elimination:** Never injects biological zeroes for missing vitals. Unrecorded optional parameters are handled using population medians learned strictly from training cohorts.

### 📄 2. Section B: Advanced Medical Report Assessment
- **Diagnostic Document Upload:** Supports PDF reports, plain text, and scan uploads.
- **Biomarker Extraction Engine:** Automatically parses Fasting Blood Sugar, HbA1c, Total Cholesterol, HDL, LDL, Triglycerides, Blood Pressure, and Creatinine.
- **Pre-Inference Patient Verification:** Extracted readings are presented in an editable review table with standard clinical reference ranges and status badges before executing predictions.
- **Strict Clinical Mapping:** Lab biomarkers map strictly to trained model features without fabricating ad-hoc weighted scores.

### 📊 3. Health Analytics Dashboard & Explainable AI
- **Multi-Condition Scorecard:** Clear risk tier categorization (Low, Moderate, High) with calibrated probability estimations.
- **Feature Contribution (Explainable AI):** Transparently reveals statistical factors influencing each prediction without falsely asserting biological causation.
- **Longitudinal Trend Tracking:** Tracks time-series trajectories for Blood Pressure, Blood Glucose, Cholesterol, and BMI across visits.
- **Clinical Integrity Standards:** If a patient has recorded only a baseline assessment, an informative empty-state is displayed rather than fabricating artificial historical points.

### 🍎 4. My Health Companion (Patient Guidance & Action Plan)
- **Clinical Nutrition Protocols:** Evidence-based dietary strategies (Mediterranean & DASH frameworks) highlighting foods to favor and foods to minimize.
- **Cardiovascular Conditioning Regimens:** Weekly aerobic and resistance exercise guidelines customized to risk tiers.
- **Interactive Daily Habit Tracker:** Allows patients to toggle and save daily health milestones (hydration, 30-min brisk walk, sodium reduction) stored in the database.
- **Clinical Alert Thresholds:** Prominently details red-flag emergency symptoms requiring immediate professional physician evaluation.

### 🔐 5. Secure Authentication & Data Privacy
- **Cryptographic Password Security:** Salted hashes generated using `bcrypt` (work factor 12).
- **Stateless Authorization:** Cryptographically signed JWT bearer tokens.
- **Tenant Data Isolation:** Queries strictly filter by authenticated user ID; patients can access only their own records.
- **GDPR / Right-to-be-Forgotten:** One-click permanent data erasure API (`DELETE /api/user/data`).

---

## 2. Machine Learning Architecture & Benchmark Results

All models were evaluated under strict anti-leakage constraints using stratified 80/20 train/test splits, 5-fold cross-validation on training data, and probability calibration (Platt/sigmoid scaling).

### Evaluation Benchmarks

| Condition | Selected Model | Dataset & Size | Accuracy | Precision | Recall (Sens.) | Specificity | F1-Score | ROC-AUC |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Diabetes** | **Random Forest** | NIDDK Pima (768 records) | 72.08% | 57.97% | **74.07%** | 71.00% | 0.6504 | **0.8178** |
| **Heart Disease** | **Logistic Regression** | UCI Heart Failure (918 records) | 88.04% | 90.00% | **88.24%** | 87.80% | **0.8911** | **0.9324** |
| **Hypertension** | **Random Forest** | Framingham Cohort (4,240 records) | 89.39% | 78.36% | **90.87%** | 88.72% | **0.8415** | **0.9520** |

*Detailed experiment logs, cross-validation metrics, and confusion matrices are documented in [docs/MODEL_EXPERIMENTS_REPORT.md](docs/MODEL_EXPERIMENTS_REPORT.md).*

---

## 3. Technology Stack

- **Frontend:** React 19, Vite 7, React Router 7, Tailwind CSS 3, Lucide React Icons.
- **Backend:** Python 3.13, Flask 3.1, SQLite 3, Scikit-Learn 1.9.1, XGBoost 3.4.1, PyPDF / PyPDF2, Bcrypt, PyJWT.
- **Persistence:** SQLite relational database (`users`, `patient_profiles`, `assessments`, `habit_logs`).

---

## 4. Getting Started & Installation

### Prerequisites
- Python 3.10+ (Python 3.11 - 3.13 tested)
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# Navigate to repository root
cd swasth-ai(upgrade)

# Create & activate a virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Retrain models and generate benchmark report
python backend/train_and_evaluate_models.py

# Run the automated backend test suite
python -m unittest backend/tests/test_backend.py

# Start the Flask API server
python backend/app.py
```
*Backend server runs at `http://127.0.0.1:5000`.*

### 2. Frontend Setup
```bash
# In another terminal window:
npm install

# Start the Vite development server
npm run dev

# Or build for production
npm run build
```
*Frontend web application runs at `http://localhost:5173`.*

---

## 5. API Reference Summary

| Endpoint | Method | Auth Required | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | POST | No | Registers a new patient account with bcrypt hash |
| `/api/auth/login` | POST | No | Authenticates patient and returns JWT bearer token |
| `/api/auth/me` | GET | Yes | Retrieves current user profile |
| `/api/auth/profile` | PUT | Yes | Updates patient demographic baseline |
| `/api/predict/basic` | POST | Optional | Evaluates all 3 diseases from basic vitals; saves if authed |
| `/api/predict/advanced` | POST | Optional | Evaluates all 3 diseases from lab biomarkers |
| `/api/report/extract` | POST | No | Parses lab test readings from uploaded PDF or scan |
| `/api/assessments` | GET | Yes | Retrieves patient's historical assessment timeline |
| `/api/assessments/:id` | GET / DEL | Yes | Retrieves or deletes a specific assessment session |
| `/api/analytics/trends` | GET | Yes | Computes longitudinal trend data for BP, glucose, BMI, etc. |
| `/api/guidance` | GET | Optional | Delivers personalized diet, exercise, and clinical guidance |
| `/api/habits` | GET | Yes | Retrieves today's completed habit checklist |
| `/api/habits/toggle` | POST | Yes | Toggles completion of a daily health habit |
| `/api/user/data` | DELETE | Yes | GDPR data erasure: permanently wipes all patient records |
| `/predict/heart` | POST | No | *Legacy backwards-compatible endpoint* |
| `/predict/diabetes` | POST | No | *Legacy backwards-compatible endpoint* |

---

## 6. Project Documentation Links

- [docs/PROJECT_AUDIT.md](docs/PROJECT_AUDIT.md) — Initial codebase inspection, vulnerabilities, and baseline audit.
- [docs/UPGRADE_ROADMAP.md](docs/UPGRADE_ROADMAP.md) — Implementation roadmap and architectural milestones.
- [docs/ML_MODEL_PLAN.md](docs/ML_MODEL_PLAN.md) — Data science methodology, anti-leakage pipelines, and evaluation metrics.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — High-level architecture, database schema, and security specifications.
- [docs/MODEL_EXPERIMENTS_REPORT.md](docs/MODEL_EXPERIMENTS_REPORT.md) — Full benchmark tables, cross-validation scores, and model comparison.

---

## 7. Medical Disclaimer

*Swasth AI is an educational health-risk estimation platform powered by statistical machine learning models trained on public clinical cohorts. It does not provide medical diagnoses, treatment plans, or clinical prescriptions. Always consult a qualified medical professional for any health concerns or before changing any dietary or pharmacological regimen.*
