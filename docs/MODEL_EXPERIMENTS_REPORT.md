# SWASTH AI — Machine Learning Benchmark & Experimentation Report

**Generated:** November 2026  
**Status:** Validated, Calibrated, and Serialized  
**Execution Environment:** Python 3.13 / Scikit-Learn 1.9.1 / XGBoost 3.4.1

---

## 1. Executive Summary

This report documents the rigorous machine learning experimentation, evaluation, cross-validation, and probability calibration performed for all three target conditions supported by Swasth AI:
1. **Diabetes Risk**
2. **Heart Disease Risk**
3. **Hypertension Risk**

All models were evaluated under strict anti-leakage constraints:
- Preprocessing steps (imputation, encoding, scaling) encapsulated entirely inside scikit-learn `Pipeline` and `ColumnTransformer` constructs.
- Stratified 80/20 train/test splits combined with 5-fold cross-validation on training data.
- Class weighting applied to address class imbalance.
- Probability calibration applied via 5-fold cross-validated sigmoid (Platt) scaling to ensure probabilities correspond to meaningful risk estimates.

---

## 2. Diabetes Risk Prediction

- **Dataset:** Pima Indians Diabetes Database (NIDDK)
- **Features:** `Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age`
- **Selected Model:** **Random Forest**

### Model Comparison Table
| Algorithm | Accuracy | Precision | Recall (Sens.) | Specificity | F1-Score | ROC-AUC | Brier Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Logistic Regression | 0.7338 | 0.6032 | 0.7037 | 0.75 | 0.6496 | 0.8126 | 0.1814 |
| Random Forest | 0.7208 | 0.5797 | 0.7407 | 0.71 | 0.6504 | 0.8178 | 0.1704 |
| XGBoost | 0.7597 | 0.6809 | 0.5926 | 0.85 | 0.6337 | 0.8291 | 0.1649 |

---

## 3. Heart Disease Risk Prediction

- **Dataset:** UCI Heart Failure Prediction Dataset (918 records)
- **Features:** Numerical (`Age, RestingBP, Cholesterol, FastingBS, MaxHR, Oldpeak`), Categorical (`Sex, ChestPainType, RestingECG, ExerciseAngina, ST_Slope`)
- **Selected Model:** **Logistic Regression**

### Model Comparison Table
| Algorithm | Accuracy | Precision | Recall (Sens.) | Specificity | F1-Score | ROC-AUC | Brier Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Logistic Regression | 0.8804 | 0.9 | 0.8824 | 0.878 | 0.8911 | 0.9322 | 0.0998 |
| Random Forest | 0.8804 | 0.8774 | 0.9118 | 0.8415 | 0.8942 | 0.9265 | 0.1041 |
| XGBoost | 0.875 | 0.899 | 0.8725 | 0.878 | 0.8856 | 0.9197 | 0.1025 |

---

## 4. Hypertension Risk Prediction

- **Dataset:** Framingham Heart Study Cohort (4,240 records, target: prevalentHyp)
- **Features:** `male, age, currentSmoker, totChol, sysBP, diaBP, BMI, heartRate, glucose`
- **Selected Model:** **Random Forest**

### Model Comparison Table
| Algorithm | Accuracy | Precision | Recall (Sens.) | Specificity | F1-Score | ROC-AUC | Brier Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Logistic Regression | 0.8715 | 0.7406 | 0.9011 | 0.8581 | 0.813 | 0.9487 | 0.0933 |
| Random Forest | 0.8939 | 0.7836 | 0.9087 | 0.8872 | 0.8415 | 0.952 | 0.0849 |
| XGBoost | 0.8833 | 0.7993 | 0.8327 | 0.906 | 0.8156 | 0.9527 | 0.0791 |

---

## 5. Risk Stratification Guidelines

Probabilities are stratified into three clinical tiers:
- **Low Risk:** Probability < 0.35
- **Moderate Risk:** 0.35 <= Probability < 0.65
- **High Risk:** Probability >= 0.65

*Disclaimer: Predicted probabilities reflect statistical risk estimation from population cohorts and do not constitute a definitive medical diagnosis.*
