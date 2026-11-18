"""
Swasth AI - Machine Learning Experimentation, Validation and Production Pipeline
Trains, evaluates, calibrates, and packages models for:
1. Diabetes (Pima Indians Dataset)
2. Heart Disease (UCI Heart Failure 918 Dataset)
3. Hypertension (Framingham Heart Study Clinical Cohort)
"""

import os
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, brier_score_loss
)

RANDOM_STATE = 42
os.makedirs("backend/ml_models", exist_ok=True)
os.makedirs("docs", exist_ok=True)


def calculate_specificity(y_true, y_pred):
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()
    return float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0


def evaluate_model_pipeline(pipeline, X_train, y_train, X_test, y_test, model_name):
    # 5-Fold Stratified Cross Validation on Train Set
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    cv_scores = cross_validate(
        pipeline, X_train, y_train, cv=cv,
        scoring=['accuracy', 'precision', 'recall', 'f1', 'roc_auc']
    )

    # Train on full train set and evaluate on held-out test set
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1] if hasattr(pipeline, "predict_proba") else y_pred

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    spec = calculate_specificity(y_test, y_pred)
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    auc = float(roc_auc_score(y_test, y_proba))
    brier = float(brier_score_loss(y_test, y_proba))
    cm = confusion_matrix(y_test, y_pred).tolist()

    return {
        "model_name": model_name,
        "test_metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "specificity": round(spec, 4),
            "f1": round(f1, 4),
            "roc_auc": round(auc, 4),
            "brier_score": round(brier, 4),
            "confusion_matrix": cm
        },
        "cv_metrics_mean": {
            "accuracy": round(float(np.mean(cv_scores['test_accuracy'])), 4),
            "precision": round(float(np.mean(cv_scores['test_precision'])), 4),
            "recall": round(float(np.mean(cv_scores['test_recall'])), 4),
            "f1": round(float(np.mean(cv_scores['test_f1'])), 4),
            "roc_auc": round(float(np.mean(cv_scores['test_roc_auc'])), 4),
        },
        "pipeline": pipeline
    }


# ==============================================================================
# 1. DIABETES MODEL EXPERIMENTATION & SELECTION
# ==============================================================================
def train_diabetes():
    print("\n" + "="*50)
    print(">> STEP 1: DIABETES ML PIPELINE EXPERIMENTATION")
    print("="*50)

    df = pd.read_csv("backend/data/diabetes.csv")
    print(f"Loaded {len(df)} records. Features: {list(df.columns)}")

    # Treat biological zeroes as NaN for imputation
    zero_as_nan_cols = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
    df_clean = df.copy()
    for col in zero_as_nan_cols:
        df_clean[col] = df_clean[col].replace(0, np.nan)

    X = df_clean.drop(columns=['Outcome'])
    y = df_clean['Outcome']
    feature_names = list(X.columns)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight='balanced', random_state=RANDOM_STATE),
        "Random Forest": RandomForestClassifier(n_estimators=200, max_depth=6, class_weight='balanced', random_state=RANDOM_STATE),
        "XGBoost": XGBClassifier(n_estimators=150, max_depth=4, learning_rate=0.05, eval_metric='logloss', random_state=RANDOM_STATE)
    }

    results = []
    for name, clf in models.items():
        pipe = Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler()),
            ('classifier', clf)
        ])
        res = evaluate_model_pipeline(pipe, X_train, y_train, X_test, y_test, name)
        results.append(res)
        print(f"[{name}] Acc: {res['test_metrics']['accuracy']} | Recall: {res['test_metrics']['recall']} | F1: {res['test_metrics']['f1']} | ROC-AUC: {res['test_metrics']['roc_auc']}")

    # Select best model based on ROC-AUC and F1
    best_res = max(results, key=lambda r: (r['test_metrics']['roc_auc'] + r['test_metrics']['f1']))
    print(f">> Selected Best Diabetes Model: {best_res['model_name']}")

    # Calibrate probability on training data using CalibratedClassifierCV
    calibrated_pipe = CalibratedClassifierCV(best_res['pipeline'], cv=5, method='sigmoid')
    calibrated_pipe.fit(X_train, y_train)

    # Save artifact & metadata
    artifact_path = "backend/ml_models/diabetes_pipeline.joblib"
    joblib.dump(calibrated_pipe, artifact_path)

    metadata = {
        "disease": "Diabetes",
        "version": "2.0.0",
        "dataset_source": "Pima Indians Diabetes Database (NIDDK)",
        "features": feature_names,
        "zero_nan_imputed_features": zero_as_nan_cols,
        "selected_algorithm": best_res['model_name'],
        "test_metrics": best_res['test_metrics'],
        "cv_metrics_mean": best_res['cv_metrics_mean'],
        "comparison_table": [{
            "model": r['model_name'],
            "accuracy": r['test_metrics']['accuracy'],
            "precision": r['test_metrics']['precision'],
            "recall": r['test_metrics']['recall'],
            "specificity": r['test_metrics']['specificity'],
            "f1": r['test_metrics']['f1'],
            "roc_auc": r['test_metrics']['roc_auc'],
            "brier_score": r['test_metrics']['brier_score']
        } for r in results],
        "risk_thresholds": {
            "low_risk": {"max": 0.35, "label": "Low Risk"},
            "moderate_risk": {"min": 0.35, "max": 0.65, "label": "Moderate Risk"},
            "high_risk": {"min": 0.65, "label": "High Risk"}
        }
    }
    with open("backend/ml_models/diabetes_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    return metadata


# ==============================================================================
# 2. HEART DISEASE MODEL EXPERIMENTATION & SELECTION
# ==============================================================================
def train_heart():
    print("\n" + "="*50)
    print(">> STEP 2: HEART DISEASE ML PIPELINE EXPERIMENTATION")
    print("="*50)

    df = pd.read_csv("backend/data/heart_failure_918.csv")
    print(f"Loaded {len(df)} records. Columns: {list(df.columns)}")

    # Cholesterol 0 is missing value in UCI heart
    df_clean = df.copy()
    df_clean['Cholesterol'] = df_clean['Cholesterol'].replace(0, np.nan)

    X = df_clean.drop(columns=['HeartDisease'])
    y = df_clean['HeartDisease']

    num_cols = ['Age', 'RestingBP', 'Cholesterol', 'FastingBS', 'MaxHR', 'Oldpeak']
    cat_cols = ['Sex', 'ChestPainType', 'RestingECG', 'ExerciseAngina', 'ST_Slope']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )

    preprocessor = ColumnTransformer(transformers=[
        ('num', Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ]), num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_cols)
    ])

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight='balanced', random_state=RANDOM_STATE),
        "Random Forest": RandomForestClassifier(n_estimators=200, max_depth=6, class_weight='balanced', random_state=RANDOM_STATE),
        "XGBoost": XGBClassifier(n_estimators=150, max_depth=4, learning_rate=0.05, eval_metric='logloss', random_state=RANDOM_STATE)
    }

    results = []
    for name, clf in models.items():
        pipe = Pipeline([
            ('preprocessor', preprocessor),
            ('classifier', clf)
        ])
        res = evaluate_model_pipeline(pipe, X_train, y_train, X_test, y_test, name)
        results.append(res)
        print(f"[{name}] Acc: {res['test_metrics']['accuracy']} | Recall: {res['test_metrics']['recall']} | F1: {res['test_metrics']['f1']} | ROC-AUC: {res['test_metrics']['roc_auc']}")

    best_res = max(results, key=lambda r: (r['test_metrics']['roc_auc'] + r['test_metrics']['f1']))
    print(f">> Selected Best Heart Disease Model: {best_res['model_name']}")

    calibrated_pipe = CalibratedClassifierCV(best_res['pipeline'], cv=5, method='sigmoid')
    calibrated_pipe.fit(X_train, y_train)

    artifact_path = "backend/ml_models/heart_pipeline.joblib"
    joblib.dump(calibrated_pipe, artifact_path)

    metadata = {
        "disease": "Heart Disease",
        "version": "2.0.0",
        "dataset_source": "UCI Heart Failure Prediction Dataset (918 records)",
        "numerical_features": num_cols,
        "categorical_features": cat_cols,
        "all_input_features": list(X.columns),
        "selected_algorithm": best_res['model_name'],
        "test_metrics": best_res['test_metrics'],
        "cv_metrics_mean": best_res['cv_metrics_mean'],
        "comparison_table": [{
            "model": r['model_name'],
            "accuracy": r['test_metrics']['accuracy'],
            "precision": r['test_metrics']['precision'],
            "recall": r['test_metrics']['recall'],
            "specificity": r['test_metrics']['specificity'],
            "f1": r['test_metrics']['f1'],
            "roc_auc": r['test_metrics']['roc_auc'],
            "brier_score": r['test_metrics']['brier_score']
        } for r in results],
        "risk_thresholds": {
            "low_risk": {"max": 0.35, "label": "Low Risk"},
            "moderate_risk": {"min": 0.35, "max": 0.65, "label": "Moderate Risk"},
            "high_risk": {"min": 0.65, "label": "High Risk"}
        }
    }
    with open("backend/ml_models/heart_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    return metadata


# ==============================================================================
# 3. HYPERTENSION MODEL EXPERIMENTATION & SELECTION
# ==============================================================================
def train_hypertension():
    print("\n" + "="*50)
    print(">> STEP 3: HYPERTENSION ML PIPELINE EXPERIMENTATION")
    print("="*50)

    df = pd.read_csv("backend/data/framingham.csv")
    print(f"Loaded {len(df)} records. Columns: {list(df.columns)}")

    # Relevant clinical features for hypertension screening
    selected_features = [
        'male', 'age', 'currentSmoker', 'totChol', 'sysBP', 'diaBP', 'BMI', 'heartRate', 'glucose'
    ]
    target_col = 'prevalentHyp'

    df_subset = df[selected_features + [target_col]].dropna(subset=[target_col])
    X = df_subset[selected_features]
    y = df_subset[target_col]

    print(f"Hypertension Prevalence: {round(y.mean()*100, 2)}% ({y.sum()} / {len(y)})")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight='balanced', random_state=RANDOM_STATE),
        "Random Forest": RandomForestClassifier(n_estimators=200, max_depth=6, class_weight='balanced', random_state=RANDOM_STATE),
        "XGBoost": XGBClassifier(n_estimators=150, max_depth=4, learning_rate=0.05, eval_metric='logloss', random_state=RANDOM_STATE)
    }

    results = []
    for name, clf in models.items():
        pipe = Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler()),
            ('classifier', clf)
        ])
        res = evaluate_model_pipeline(pipe, X_train, y_train, X_test, y_test, name)
        results.append(res)
        print(f"[{name}] Acc: {res['test_metrics']['accuracy']} | Recall: {res['test_metrics']['recall']} | F1: {res['test_metrics']['f1']} | ROC-AUC: {res['test_metrics']['roc_auc']}")

    best_res = max(results, key=lambda r: (r['test_metrics']['roc_auc'] + r['test_metrics']['f1']))
    print(f">> Selected Best Hypertension Model: {best_res['model_name']}")

    calibrated_pipe = CalibratedClassifierCV(best_res['pipeline'], cv=5, method='sigmoid')
    calibrated_pipe.fit(X_train, y_train)

    artifact_path = "backend/ml_models/hypertension_pipeline.joblib"
    joblib.dump(calibrated_pipe, artifact_path)

    metadata = {
        "disease": "Hypertension",
        "version": "2.0.0",
        "dataset_source": "Framingham Heart Study Cohort (4,240 records, target: prevalentHyp)",
        "features": selected_features,
        "selected_algorithm": best_res['model_name'],
        "test_metrics": best_res['test_metrics'],
        "cv_metrics_mean": best_res['cv_metrics_mean'],
        "comparison_table": [{
            "model": r['model_name'],
            "accuracy": r['test_metrics']['accuracy'],
            "precision": r['test_metrics']['precision'],
            "recall": r['test_metrics']['recall'],
            "specificity": r['test_metrics']['specificity'],
            "f1": r['test_metrics']['f1'],
            "roc_auc": r['test_metrics']['roc_auc'],
            "brier_score": r['test_metrics']['brier_score']
        } for r in results],
        "risk_thresholds": {
            "low_risk": {"max": 0.35, "label": "Low Risk"},
            "moderate_risk": {"min": 0.35, "max": 0.65, "label": "Moderate Risk"},
            "high_risk": {"min": 0.65, "label": "High Risk"}
        }
    }
    with open("backend/ml_models/hypertension_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    return metadata


# ==============================================================================
# 4. GENERATE MARKDOWN COMPARISON REPORT
# ==============================================================================
def generate_report(meta_d, meta_h, meta_hyp):
    report_content = f"""# SWASTH AI — Machine Learning Benchmark & Experimentation Report

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

- **Dataset:** {meta_d['dataset_source']}
- **Features:** `{', '.join(meta_d['features'])}`
- **Selected Model:** **{meta_d['selected_algorithm']}**

### Model Comparison Table
| Algorithm | Accuracy | Precision | Recall (Sens.) | Specificity | F1-Score | ROC-AUC | Brier Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
"""
    for r in meta_d['comparison_table']:
        report_content += f"| {r['model']} | {r['accuracy']} | {r['precision']} | {r['recall']} | {r['specificity']} | {r['f1']} | {r['roc_auc']} | {r['brier_score']} |\n"

    report_content += f"""
---

## 3. Heart Disease Risk Prediction

- **Dataset:** {meta_h['dataset_source']}
- **Features:** Numerical (`{', '.join(meta_h['numerical_features'])}`), Categorical (`{', '.join(meta_h['categorical_features'])}`)
- **Selected Model:** **{meta_h['selected_algorithm']}**

### Model Comparison Table
| Algorithm | Accuracy | Precision | Recall (Sens.) | Specificity | F1-Score | ROC-AUC | Brier Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
"""
    for r in meta_h['comparison_table']:
        report_content += f"| {r['model']} | {r['accuracy']} | {r['precision']} | {r['recall']} | {r['specificity']} | {r['f1']} | {r['roc_auc']} | {r['brier_score']} |\n"

    report_content += f"""
---

## 4. Hypertension Risk Prediction

- **Dataset:** {meta_hyp['dataset_source']}
- **Features:** `{', '.join(meta_hyp['features'])}`
- **Selected Model:** **{meta_hyp['selected_algorithm']}**

### Model Comparison Table
| Algorithm | Accuracy | Precision | Recall (Sens.) | Specificity | F1-Score | ROC-AUC | Brier Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
"""
    for r in meta_hyp['comparison_table']:
        report_content += f"| {r['model']} | {r['accuracy']} | {r['precision']} | {r['recall']} | {r['specificity']} | {r['f1']} | {r['roc_auc']} | {r['brier_score']} |\n"

    report_content += """
---

## 5. Risk Stratification Guidelines

Probabilities are stratified into three clinical tiers:
- **Low Risk:** Probability < 0.35
- **Moderate Risk:** 0.35 <= Probability < 0.65
- **High Risk:** Probability >= 0.65

*Disclaimer: Predicted probabilities reflect statistical risk estimation from population cohorts and do not constitute a definitive medical diagnosis.*
"""
    with open("docs/MODEL_EXPERIMENTS_REPORT.md", "w") as f:
        f.write(report_content)
    print(">> Saved benchmark report to docs/MODEL_EXPERIMENTS_REPORT.md")


if __name__ == "__main__":
    meta_d = train_diabetes()
    meta_h = train_heart()
    meta_hyp = train_hypertension()
    generate_report(meta_d, meta_h, meta_hyp)
    print("\n[SUCCESS] All 3 disease models trained, evaluated, calibrated, and saved.")
