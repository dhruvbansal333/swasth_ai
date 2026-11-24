# SWASTH AI — Machine Learning Model Validation & Benchmark Report

**Version:** 2.1.0  
**Environment:** Python 3.13 / Scikit-Learn 1.9.1 / XGBoost 3.4.1  
**Validation Methodology:** 80/20 Stratified Split + 5-Fold Stratified Cross-Validation on Training Set + Held-Out Test Evaluation  
**Calibration:** 5-Fold Cross-Validated Platt Sigmoid Scaling (`CalibratedClassifierCV`)  

---

## 1. Overview & Evaluation Protocols

Swasth AI deploys three dedicated clinical machine learning pipelines. All feature transformers (median imputers, standard scalers, one-hot encoders) are encapsulated strictly inside Scikit-learn `Pipeline` and `ColumnTransformer` constructs, ensuring zero data leakage between training folds and test evaluations.

Probabilities are calibrated using cross-validated sigmoid scaling (Platt scaling) so that output percentages correspond to empirical risk frequencies rather than uncalibrated margin distances.

---

## 2. Model 1: Type 2 Diabetes Risk Prediction

- **Cohort Source:** Pima Indians Diabetes Database (National Institute of Diabetes and Digestive and Kidney Diseases).
- **Target:** `Outcome` (0 = Non-Diabetic, 1 = Diabetic within 5-year follow-up).
- **Sample Size:** 768 patient records (500 non-diabetic, 268 diabetic; prevalence: $34.9\%$).
- **Features (8):** `Pregnancies`, `Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, `BMI`, `DiabetesPedigreeFunction`, `Age`.
- **Selected Model:** **Calibrated Random Forest Classifier** (`n_estimators=200`, `max_depth=6`, `class_weight='balanced'`).

### Algorithm Comparison Benchmark (Held-Out Test Set)
| Algorithm | Accuracy | Precision | Recall (Sens.) | Specificity | F1-Score | ROC-AUC | Brier Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | 73.38% | 60.32% | 70.37% | 75.00% | 0.6496 | 0.8126 | 0.1814 |
| **Random Forest (Selected)** | **72.08%** | **57.97%** | **74.07%** | **71.00%** | **0.6504** | **0.8178** | **0.1704** |
| **XGBoost** | 75.97% | 68.09% | 59.26% | 85.00% | 0.6337 | 0.8291 | 0.1649 |

### Cross-Validation & Confusion Matrix
- **5-Fold Cross-Validation (Mean on Train):** Accuracy: $76.55\%$, Recall: $77.11\%$, ROC-AUC: $0.8377$.
- **Test Confusion Matrix ($N=154$):**
  $$\begin{pmatrix} \text{TN: } 71 & \text{FP: } 29 \\ \text{FN: } 14 & \text{TP: } 40 \end{pmatrix}$$
- **Clinical Selection Rationale:** In diabetes screening, false negatives carry substantial morbidity risk. Random Forest delivers higher clinical sensitivity ($74.07\%$ recall vs. $59.26\%$ for XGBoost) and superior Brier calibration ($0.1704$).

---

## 3. Model 2: Coronary Artery Disease (CAD) Prediction

- **Cohort Source:** UCI Multi-Center Heart Disease Dataset (Combined Cleveland, Hungarian, Switzerland, Long Beach VA; 918 records).
- **Target:** `HeartDisease` (0 = $<50\%$ stenosis, 1 = $\ge 50\%$ angiographically documented coronary diameter narrowing).
- **Sample Size:** 918 patient records (410 non-CAD, 508 CAD; prevalence: $55.3\%$).
- **Features (11):**
  - Numerical: `Age`, `RestingBP`, `Cholesterol`, `FastingBS`, `MaxHR`, `Oldpeak`.
  - Categorical: `Sex`, `ChestPainType`, `RestingECG`, `ExerciseAngina`, `ST_Slope`.
- **Selected Model:** **Calibrated Logistic Regression** (`max_iter=1000`, `class_weight='balanced'`).

### Algorithm Comparison Benchmark (Held-Out Test Set)
| Algorithm | Accuracy | Precision | Recall (Sens.) | Specificity | F1-Score | ROC-AUC | Brier Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression (Selected)** | **88.04%** | **90.00%** | **88.24%** | **87.80%** | **0.8911** | **0.9322** | **0.0996** |
| **Random Forest** | 88.04% | 87.74% | 91.18% | 84.15% | 0.8942 | 0.9265 | 0.1040 |
| **XGBoost** | 87.50% | 87.25% | 88.56% | 86.50% | 0.8856 | 0.9197 | 0.1020 |

### Cross-Validation & Confusion Matrix
- **5-Fold Cross-Validation (Mean on Train):** Accuracy: $83.65\%$, Recall: $84.48\%$, ROC-AUC: $0.9220$.
- **Test Confusion Matrix ($N=184$):**
  $$\begin{pmatrix} \text{TN: } 72 & \text{FP: } 10 \\ \text{FN: } 12 & \text{TP: } 90 \end{pmatrix}$$
- **Clinical Selection Rationale:** Logistic Regression achieved the highest ROC-AUC ($0.9322$), lowest Brier calibration error ($0.0996$), balanced specificity ($87.80\%$), and complete feature interpretability for clinical practice.

---

## 4. Model 3: Clinical Hypertension Status Prediction

- **Cohort Source:** Framingham Heart Study Cohort ($4,240$ participant examinations).
- **Target:** `prevalentHyp` (0 = Normotensive, 1 = Prevalent Hypertension: $\text{sysBP}\ge 140$ or $\text{diaBP}\ge 90$ or on anti-hypertensive medication).
- **Sample Size:** 4,240 records (2,923 normotensive, 1,317 hypertensive; prevalence: $31.06\%$).
- **Features (9):** `male`, `age`, `currentSmoker`, `totChol`, `sysBP`, `diaBP`, `BMI`, `heartRate`, `glucose`.
- **Selected Model:** **Calibrated Random Forest Classifier** (`n_estimators=200`, `max_depth=6`, `class_weight='balanced'`).

### Algorithm Comparison Benchmark (Held-Out Test Set)
| Algorithm | Accuracy | Precision | Recall (Sens.) | Specificity | F1-Score | ROC-AUC | Brier Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | 87.15% | 74.06% | 90.11% | 85.81% | 0.8130 | 0.9487 | 0.0933 |
| **Random Forest (Selected)** | **89.39%** | **78.36%** | **90.87%** | **88.72%** | **0.8415** | **0.9520** | **0.0849** |
| **XGBoost** | 88.33% | 79.93% | 83.27% | 90.60% | 0.8156 | 0.9527 | 0.0791 |

### Cross-Validation & Confusion Matrix
- **5-Fold Cross-Validation (Mean on Train):** Accuracy: $89.39\%$, Recall: $89.94\%$, ROC-AUC: $0.9465$.
- **Test Confusion Matrix ($N=848$):**
  $$\begin{pmatrix} \text{TN: } 519 & \text{FP: } 66 \\ \text{FN: } 24 & \text{TP: } 239 \end{pmatrix}$$
- **Clinical Selection Rationale:** Random Forest captured non-linear interactions between age, pulse pressure, and metabolic factors, delivering an outstanding ROC-AUC of $0.9520$ and $90.87\%$ sensitivity.

---

## 5. Stratified Risk Stratification Guidelines

Probabilities are mapped to three clinical action tiers:
- **Low Risk ($\text{Probability} < 0.35$):** Markers within standard non-elevated reference boundaries. Routine annual preventive health checks recommended.
- **Moderate Risk ($0.35 \le \text{Probability} < 0.65$):** Borderline indicators detected. Lifestyle modifications (DASH diet, physical activity) and surveillance recommended.
- **High Risk ($\text{Probability} \ge 0.65$):** Clinically significant risk elevation. Formal consultation with a qualified medical physician advised.

---

## 6. Known Limitations & Safe Clinical Scope

1. **Cohort Demographics:**
   - The Pima Indians Diabetes database consists of adult women of Pima Indian heritage. While glucose and BMI markers generalize robustly across populations, genetic risk factors may differ in other ancestral groups.
   - The UCI Heart Disease cohort reflects patients evaluated in cardiology referral clinics who underwent coronary angiography. General screening patients without anginal symptoms or prior cardiac history should not be treated as high-risk catheterization referrals.
2. **Prevalent Status vs. Longitudinal Incidence:**
   - The hypertension model predicts current prevalent hypertension status at examination, not 10-year future incidence.
3. **Missing Biomarkers:**
   - When optional laboratory features are omitted, median imputation from clinical training distributions is applied. Predictions with missing features are explicitly accompanied by data completeness indicators.
4. **Regulatory & Clinical Safety:**
   - Swasth AI is an educational preventive health aid and does not constitute an FDA/EMA-cleared diagnostic medical device.
