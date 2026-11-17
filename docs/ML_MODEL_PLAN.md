# SWASTH AI — Machine Learning Engineering & Model Plan

**Version:** 2.0.0  
**Target Diseases:** Diabetes, Heart Disease, Hypertension  
**Objective:** Deliver clinically sound, rigorously validated, reproducible, and explainable ML models for all three target conditions.

---

## 1. Disease-Wise Dataset Specifications

### 1.1 Diabetes Dataset (Pima Indians Diabetes Database)
- **Source:** National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK), UCI / Kaggle repository.
- **Records:** 768 patient observations.
- **Target:** `Outcome` (0 = Non-diabetic, 1 = Diabetic).
- **Features:**
  1. `Pregnancies`: Number of times pregnant.
  2. `Glucose`: Plasma glucose concentration (2 hours in an oral glucose tolerance test).
  3. `BloodPressure`: Diastolic blood pressure (mm Hg).
  4. `SkinThickness`: Triceps skin fold thickness (mm).
  5. `Insulin`: 2-Hour serum insulin (mu U/ml).
  6. `BMI`: Body mass index (weight in kg/(height in m)^2).
  7. `DiabetesPedigreeFunction`: Diabetes pedigree genetic function.
  8. `Age`: Patient age in years.
- **Known Limitations & Preprocessing Rules:**
  - In biological reality, Glucose, BloodPressure, SkinThickness, Insulin, and BMI cannot be 0 for a living patient. Values of 0 in these columns represent unrecorded/missing data.
  - A `SimpleImputer(strategy='median')` is built inside the scikit-learn pipeline fitted *strictly on training data* to prevent data leakage.

### 1.2 Heart Disease Dataset (UCI Heart Failure Prediction Benchmark)
- **Source:** Combined dataset curated by Fedesorov et al. (combining Cleveland, Hungarian, Switzerland, Long Beach VA, and Stalog datasets).
- **Records:** 918 observations.
- **Target:** `HeartDisease` (0 = Normal, 1 = Heart Disease detected).
- **Features (11 clinical features):**
  1. `Age`: Age in years (numerical).
  2. `Sex`: Sex (`M`, `F`).
  3. `ChestPainType`: Chest pain type (`TA`: Typical Angina, `ATA`: Atypical Angina, `NAP`: Non-Anginal Pain, `ASY`: Asymptomatic).
  4. `RestingBP`: Resting blood pressure (mm Hg).
  5. `Cholesterol`: Serum cholesterol (mm/dl).
  6. `FastingBS`: Fasting blood sugar > 120 mg/dl (`1` if true, `0` otherwise).
  7. `RestingECG`: Resting electrocardiogram results (`Normal`, `ST`, `LVH`).
  8. `MaxHR`: Maximum heart rate achieved (numerical, 60–202).
  9. `ExerciseAngina`: Exercise-induced angina (`Y`, `N`).
  10. `Oldpeak`: ST depression induced by exercise relative to rest (numerical).
  11. `ST_Slope`: Slope of the peak exercise ST segment (`Up`, `Flat`, `Down`).
- **Known Limitations & Preprocessing Rules:**
  - Cholesterol has some zero entries (resting cholesterol = 0 is non-physiological). Imputation or median replacement is handled within the pipeline.
  - Categorical variables are encoded with `OneHotEncoder(handle_unknown='ignore')`.

### 1.3 Hypertension Dataset (Clinical Hypertension Cohort)
- **Source:** Clinical Cardiovascular & Hypertension Risk Dataset (based on NHANES/Framingham epidemiological risk factors).
- **Target:** `Hypertension` (0 = Normal/Controlled, 1 = Hypertensive).
- **Features:**
  1. `Age`: Age of patient.
  2. `Sex`: Biological sex (0 = Female, 1 = Male).
  3. `RestingBP`: Systolic/Resting blood pressure (mm Hg).
  4. `BMI`: Body Mass Index.
  5. `Glucose`: Blood glucose level (mg/dL).
  6. `Cholesterol`: Total cholesterol (mg/dL).
  7. `HeartRate`: Resting heart rate (bpm).
  8. `Smoker`: Smoking status (0 = Non-smoker, 1 = Smoker).
  9. `PhysicalActivity`: Physical activity level (0 = Sedentary, 1 = Active).
- **Clinical Alignment:** Conforms to AHA/ACC guidelines incorporating blood pressure, age, metabolic markers, and lifestyle indicators.

---

## 2. Preprocessing & Leakage Prevention Architecture

To guarantee absolute reproducibility and zero data leakage:
1. **Train/Test Splitting:** `train_test_split(..., test_size=0.20, random_state=42, stratify=y)`.
2. **Unified Pipelines:** All preprocessing (imputation, scaling, one-hot encoding) is encapsulated inside a `sklearn.pipeline.Pipeline` or `ColumnTransformer`. Preprocessors are never fitted on test data.
3. **No Zero Substitution in Production:** In the API, if an optional variable is omitted by the patient, the pipeline uses median imputation learned strictly from the training cohort rather than forcing an impossible biological zero.

```
Raw Patient Data
       │
       ▼
[Input Validation Layer] ---> Reject out-of-range impossible values (e.g. Age < 1 or > 125, BP < 40)
       │
       ▼
[Pipeline Transformer]
  ├── Categorical: OneHotEncoder(handle_unknown='ignore')
  └── Numerical: SimpleImputer(strategy='median') -> StandardScaler()
       │
       ▼
[Trained Calibrated Classifier] (Platt/Isotonic Calibrated)
       │
       ▼
[Risk Stratification Engine]
  ├── Low Risk: Probability < 0.35
  ├── Moderate Risk: 0.35 <= Probability < 0.65
  └── High Risk: Probability >= 0.65
```

---

## 3. Algorithm Candidates & Evaluation Protocol

For each disease, we evaluate multiple algorithms:
1. **Logistic Regression (L2 regularized):** Benchmark linear baseline, highly interpretable.
2. **Random Forest Classifier:** Non-linear decision ensemble, handles complex interactions, robust to outliers.
3. **XGBoost (Extreme Gradient Boosting):** State-of-the-art gradient boosting framework with shrinkage and regularization.

### 3.1 Evaluation Metrics
- **Accuracy:** Overall correctness.
- **Sensitivity / Recall:** $\frac{TP}{TP + FN}$ — **Crucial for healthcare** to minimize false negatives (failing to identify at-risk patients).
- **Specificity:** $\frac{TN}{TN + FP}$ — Ensures healthy patients are not overly alarmed.
- **Precision:** $\frac{TP}{TP + FP}$ — Reliability of positive flags.
- **F1-Score:** Harmonic mean of Precision and Recall.
- **ROC-AUC:** Area under the Receiver Operating Characteristic curve.
- **Brier Score:** Mean squared error between predicted probabilities and true binary labels (measures calibration quality).

---

## 4. Model Explainability Strategy

To satisfy Phase 5 & 6 requirements:
1. **Global Feature Importance:** Extracted from model coefficients (Logistic Regression) or Gini/Gain importances (Random Forest / XGBoost) to show top predictive factors.
2. **Local Prediction Explanation:** For each individual assessment, calculate normalized feature contribution deltas:
   $$\text{Contribution}_i = (x_i - \mu_i) \times w_i$$
   Presented to the patient with clear educational disclaimers:
   *"Statistical factor associated with model estimate — does not constitute medical causation."*
