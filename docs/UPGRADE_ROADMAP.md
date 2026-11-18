# SWASTH AI — System Upgrade Roadmap

**Version:** 2.0.0  
**Status:** In Execution  
**Target Completion:** Comprehensive Healthcare Risk-Assessment and Patient-Guidance Platform

---

## Roadmap Overview & Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SWASTH AI UPGRADE ROADMAP                             │
└─────────────────────────────────────────────────────────────────────────────┘
  │
  ├── [Phase 1] COMPLETE AUDIT & ARCHITECTURAL FOUNDATION (Done)
  │    ├── Comprehensive code, ML, and security audit
  │    └── Technical documentation (Audit, Roadmap, ML Plan, Architecture)
  │
  ├── [Phase 2 & 3] MACHINE LEARNING ENGINE UPGRADE (All 3 Diseases)
  │    ├── Dataset curation: Diabetes (Pima), Heart Disease (UCI), Hypertension
  │    ├── Experimentation: Logistic Regression, Random Forest, XGBoost, etc.
  │    ├── Rigorous evaluation: Accuracy, Precision, Recall, F1, ROC-AUC, PR Curves
  │    ├── Probability calibration (Isotonic/Platt) & Risk Threshold Tuning
  │    ├── Unified Scikit-Learn Preprocessing Pipelines (no data leakage)
  │    └── Model Explainability Engine (Feature Importance / Contribution Weights)
  │
  ├── [Phase 4] SECTION A: BASIC PATIENT ASSESSMENT
  │    ├── Multi-step guided vitals form (Personal, Vitals, Lifestyle, Symptoms)
  │    ├── Strict medical range validation (no zero substitution)
  │    └── Real-time completeness check & missing-feature tolerance
  │
  ├── [Phase 5] SECTION B: ADVANCED MEDICAL REPORT ASSESSMENT
  │    ├── Laboratory report integration (CBC, Fasting Blood Sugar, HbA1c, Lipid Profile)
  │    ├── File upload processing (PDF/Image OCR with structured field parsing)
  │    ├── Patient verification & correction interface prior to inference
  │    └── Validated feature mapping to disease prediction engines
  │
  ├── [Phase 6] HEALTH ANALYTICS DASHBOARD & EXPLAINABLE AI
  │    ├── Comprehensive overview card with multi-disease risk synthesis
  │    ├── Interactive trend charts (BP, Glucose, Cholesterol, BMI, Risk Trajectory)
  │    ├── Explainable AI factor contribution visualizer (per prediction)
  │    └── Historical assessment comparison (Current vs. Prior checks)
  │
  ├── [Phase 7] PATIENT HEALTH GUIDANCE & MY HEALTH COMPANION
  │    ├── Personalized evidence-based action plans (Diet, Exercise, Lifestyle)
  │    ├── Disease-specific clinical education & warning thresholds
  │    └── Interactive daily habit checklist & goal tracker
  │
  ├── [Phase 8] AUTHENTICATION, DATABASE & PATIENT HISTORY PERSISTENCE
  │    ├── Relational SQLite database schema (Users, Profiles, Assessments, Logs)
  │    ├── Secure password hashing with bcrypt & stateless JWT authentication
  │    ├── Strict patient data isolation & GDPR/HIPAA-conscious data deletion API
  │    └── Comprehensive assessment history timeline
  │
  ├── [Phase 9] PREMIUM UI/UX REDESIGN
  │    ├── Clean, clinical, modern aesthetic with Tailwind CSS
  │    ├── Unified design language (cards, typography, badges, progress steppers)
  │    └── Mobile/tablet/desktop responsive navigation with sidebar & topbar
  │
  └── [Phase 10] TESTING, SECURITY HARDENING & VERIFICATION
       ├── ML pipeline unit tests & boundary value tests
       ├── Backend API tests (Auth, Endpoints, Permissions, Input validation)
       ├── Frontend end-to-end user journey verification
       └── Production configuration, environment variables & documentation
```

---

## Detailed Milestone Breakdown

### Milestone 1: Audit & Foundation (Completed)
- [x] Full codebase audit and disease identification: Diabetes, Heart Disease, Hypertension.
- [x] Identified critical flaws: missing hypertension model, formula fallbacks, zero-imputation, dummy authentication.
- [x] Author core documentation in `docs/`.

### Milestone 2: ML Engine Overhaul & Experimentation
- [ ] Curate benchmark datasets for Diabetes (Pima), Heart Disease (UCI Heart Failure), and Hypertension (AHA/NHANES clinical cohort).
- [ ] Build end-to-end training and evaluation script:
  - Stratified 80/20 train/test splits.
  - Test algorithms: Logistic Regression, Random Forest, XGBoost.
  - Metrics: Accuracy, Precision, Recall, Specificity, F1-Score, ROC-AUC, Confusion Matrix.
- [ ] Probability calibration and threshold tuning (Low, Moderate, High risk tiers).
- [ ] Export production pipelines using `joblib` in versioned format under `backend/ml_models/`.
- [ ] Generate evaluation benchmark report with comparison tables.

### Milestone 3: Backend Architecture & Database Persistence
- [ ] Implement SQLite database with schema for `users`, `patient_profiles`, and `assessments`.
- [ ] Add auth endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
- [ ] Implement JWT token authentication and bcrypt password hashing.
- [ ] Create standardized prediction endpoints:
  - `POST /api/predict/basic` (assesses all 3 diseases from basic patient data).
  - `POST /api/predict/advanced` (assesses diseases with lab values).
  - `POST /api/report/extract` (extracts structured lab markers from PDF/image reports).
- [ ] Create assessment history endpoints: `GET /api/assessments`, `GET /api/assessments/:id`, `DELETE /api/assessments/:id`.

### Milestone 4: Frontend Patient Assessment Modes
- [ ] **Basic Assessment Form:**
  - Multi-step wizard with visual steps: Demographics & Anthropometry -> Vital Signs -> Lifestyle Factors.
  - Interactive BMI auto-calculator with real-time feedback.
  - Strict validation preventing 0-value injection for biological vitals.
- [ ] **Advanced Report Assessment:**
  - File drag-and-drop supporting PDF, PNG, JPG.
  - Client preview & extraction verification modal before model inference.
  - Manual lab test entry tab (CBC, Lipid Panel, Metabolic Profile, Blood Sugar).

### Milestone 5: Analytics Dashboard & Explainable AI
- [ ] Multi-disease risk scorecard with visual risk badges (Low, Moderate, High).
- [ ] Interactive Canvas/SVG health trend charts (BP trajectory, Glucose, BMI over time).
- [ ] Statistical feature contribution cards explaining model factors without claiming biological causation.
- [ ] Comparison view against previous assessments with progress indicators.

### Milestone 6: Health Guidance & Action Plan
- [ ] "My Health Companion" hub with categorized guidance:
  - Evidence-based dietary recommendations.
  - Aerobic and resistance exercise guidelines customized to risk tiers.
  - Sleep, stress, and lifestyle hygiene.
- [ ] Interactive daily checklist enabling users to mark goals as completed.
- [ ] High-risk red-flag clinical warnings advising immediate physician consultation.

### Milestone 7: Verification & Polishing
- [ ] Backend test suite testing auth, authorization, inputs, and ML predictions.
- [ ] Frontend build verification (`npm run build`).
- [ ] End-to-end user journey test: Register -> Login -> Basic Assessment -> Advanced Assessment -> Analytics -> Guidance -> Logout.
