"""
Swasth AI - Machine Learning Accuracy & Validation Test Suite
Tests all 3 calibrated models (Diabetes, Heart CAD, Hypertension)
against realistic clinical profiles, boundary values, edge cases, and missing inputs.
"""

import unittest
import numpy as np
import pandas as pd
from backend.services.prediction_service import (
    load_models,
    predict_diabetes_risk,
    predict_heart_risk,
    predict_hypertension_risk,
    evaluate_full_patient_assessment,
    validate_vitals
)


class TestMLValidationSuite(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        load_models()

    # =========================================================================
    # DIABETES MODEL AUDIT TESTS
    # =========================================================================
    def test_diabetes_low_risk_profile(self):
        """Healthy young adult with normal fasting glucose and healthy BMI."""
        data = {
            "age": 24,
            "gender": "Female",
            "bmi": 21.5,
            "glucose": 82,
            "bp": 110,
            "diaBP": 70,
            "pregnancies": 0
        }
        res = predict_diabetes_risk(data)
        self.assertIn("probability", res)
        self.assertGreaterEqual(res["probability"], 0.0)
        self.assertLessEqual(res["probability"], 1.0)
        self.assertLess(res["probability"], 0.35, "Healthy young profile should produce Low Risk (<0.35)")
        self.assertEqual(res["riskTier"], "Low Risk")

    def test_diabetes_intermediate_risk_profile(self):
        """Middle-aged individual with impaired fasting glucose (pre-diabetic) and overweight BMI."""
        data = {
            "age": 48,
            "gender": "Female",
            "bmi": 28.5,
            "glucose": 115,
            "diaBP": 82,
            "pregnancies": 1
        }
        res = predict_diabetes_risk(data)
        self.assertGreaterEqual(res["probability"], 0.20)
        self.assertLess(res["probability"], 0.70)
        self.assertIn(res["riskTier"], ["Low Risk", "Moderate Risk"])

    def test_diabetes_high_risk_profile(self):
        """Clinical diabetic range: glucose >= 160, obesity BMI >= 33, age >= 50."""
        data = {
            "age": 55,
            "gender": "Female",
            "bmi": 35.0,
            "glucose": 195,
            "diaBP": 90,
            "pregnancies": 3
        }
        res = predict_diabetes_risk(data)
        self.assertGreaterEqual(res["probability"], 0.65, "Clinical diabetic markers should yield High Risk")
        self.assertEqual(res["riskTier"], "High Risk")

    def test_diabetes_missing_optional_inputs(self):
        """Only glucose and age provided; skinThickness, insulin, dpf imputed."""
        data = {
            "age": 35,
            "glucose": 95
        }
        res = predict_diabetes_risk(data)
        self.assertIsInstance(res["probability"], float)
        self.assertIn("missingFeaturesImputed", res)
        self.assertIn("SkinThickness", res["missingFeaturesImputed"])
        self.assertIn("Insulin", res["missingFeaturesImputed"])

    def test_diabetes_diastolic_bp_mapping(self):
        """Ensures systolic BP is not mistakenly treated as diastolic BP without adjustment."""
        # Patient with sysBP=130, diaBP=80
        data_with_dia = {"age": 40, "glucose": 90, "diaBP": 80, "sysBP": 130}
        res_dia = predict_diabetes_risk(data_with_dia)

        # Patient with only sysBP=130
        data_sys_only = {"age": 40, "glucose": 90, "sysBP": 130}
        res_sys = predict_diabetes_risk(data_sys_only)

        # Neither should explode to high risk simply because systolic is 130
        self.assertLess(res_dia["probability"], 0.35)
        self.assertLess(res_sys["probability"], 0.35)

    # =========================================================================
    # CORONARY HEART DISEASE (CAD) AUDIT TESTS
    # =========================================================================
    def test_heart_healthy_young_adult(self):
        """Healthy 28yo male, resting HR 70, no chest discomfort, non-smoker, normal lipid profile."""
        data = {
            "age": 28,
            "gender": "Male",
            "bp": 115,
            "cholesterol": 165,
            "heartRate": 70,
            "cp": "NONE",
            "exang": "0"
        }
        res = predict_heart_risk(data)
        self.assertLess(res["probability"], 0.20, f"Healthy young adult should be low probability, got {res['probability']}")
        self.assertEqual(res["riskTier"], "Low Risk")

    def test_heart_healthy_middle_aged_female(self):
        """45yo female, optimal vitals, no chest pain."""
        data = {
            "age": 45,
            "gender": "Female",
            "bp": 118,
            "cholesterol": 178,
            "heartRate": 68,
            "cp": "NONE",
            "exang": "0"
        }
        res = predict_heart_risk(data)
        self.assertLess(res["probability"], 0.15)
        self.assertEqual(res["riskTier"], "Low Risk")

    def test_heart_resting_heart_rate_not_passed_as_max_exercise_hr(self):
        """A resting pulse of 65 bpm should NOT be treated as a maximum exercise treadmill heart rate."""
        data = {
            "age": 30,
            "gender": "Male",
            "bp": 120,
            "cholesterol": 180,
            "heartRate": 65,  # Resting pulse
            "cp": "NONE"
        }
        res = predict_heart_risk(data)
        self.assertLess(res["probability"], 0.25, "Resting heart rate must not inflate risk into high tier")

    def test_heart_high_risk_ischemic_profile(self):
        """65yo male with typical exertional angina, exercise-induced angina, high BP, high cholesterol."""
        data = {
            "age": 65,
            "gender": "Male",
            "bp": 165,
            "cholesterol": 285,
            "glucose": 210,
            "cp": "TA",
            "exang": "1"
        }
        res = predict_heart_risk(data)
        self.assertGreaterEqual(res["probability"], 0.65, "Classic multi-factor ischemic coronary presentation should yield High Risk")
        self.assertEqual(res["riskTier"], "High Risk")

    def test_heart_asymptomatic_screening_not_penalized_as_catheter_silent_ischemia(self):
        """User selecting 'No Chest Pain' / 'NONE' should not be slapped with silent ischemia referral penalty."""
        data_no_pain = {"age": 35, "gender": "Male", "bp": 120, "cholesterol": 180, "cp": "NONE"}
        data_silent_ref = {"age": 35, "gender": "Male", "bp": 120, "cholesterol": 180, "cp": "ASY"}

        res_no_pain = predict_heart_risk(data_no_pain)
        res_silent = predict_heart_risk(data_silent_ref)

        self.assertLess(res_no_pain["probability"], res_silent["probability"])
        self.assertLess(res_no_pain["probability"], 0.35)

    # =========================================================================
    # HYPERTENSION AUDIT TESTS
    # =========================================================================
    def test_hypertension_optimal_bp(self):
        """Optimal blood pressure (<120/<80)."""
        data = {
            "age": 30,
            "gender": "Male",
            "bp": 115,
            "diaBP": 75,
            "cholesterol": 170,
            "glucose": 85,
            "bmi": 22.0
        }
        res = predict_hypertension_risk(data)
        self.assertLess(res["probability"], 0.15)
        self.assertEqual(res["riskTier"], "Low Risk")

    def test_hypertension_elevated_bp(self):
        """Stage 1 border (130-135/85)."""
        data = {
            "age": 50,
            "gender": "Male",
            "bp": 132,
            "diaBP": 84,
            "cholesterol": 210,
            "glucose": 95,
            "bmi": 26.5
        }
        res = predict_hypertension_risk(data)
        self.assertLess(res["probability"], 0.50)

    def test_hypertension_stage2_profile(self):
        """Stage 2 hypertension clinical criteria (sysBP >= 140 or diaBP >= 90)."""
        data = {
            "age": 58,
            "gender": "Female",
            "bp": 155,
            "diaBP": 95,
            "cholesterol": 240,
            "glucose": 110,
            "bmi": 30.5
        }
        res = predict_hypertension_risk(data)
        self.assertGreaterEqual(res["probability"], 0.65, "Stage 2 criteria must trigger High Risk for hypertension")
        self.assertEqual(res["riskTier"], "High Risk")

    def test_hypertension_diastolic_estimation_when_missing(self):
        """If diastolic BP is omitted, pulse pressure estimation must work smoothly."""
        data = {"age": 45, "bp": 120}
        res = predict_hypertension_risk(data)
        self.assertIsInstance(res["probability"], float)
        self.assertLess(res["probability"], 0.35)

    # =========================================================================
    # COMPOSITE FULL ASSESSMENT & BOUNDARY TESTS
    # =========================================================================
    def test_full_assessment_overall_low_risk(self):
        """Healthy young patient should receive Low Health Risk overall."""
        patient = {
            "age": 28,
            "gender": "Female",
            "bmi": 22.0,
            "bp": 112,
            "diaBP": 72,
            "glucose": 85,
            "cholesterol": 168,
            "heartRate": 68,
            "smoker": 0,
            "cp": "NONE"
        }
        full = evaluate_full_patient_assessment(patient)
        self.assertEqual(full["overall"]["tier"], "Low Health Risk")
        self.assertEqual(full["overall"]["badge"], "success")

    def test_full_assessment_overall_high_risk(self):
        """Patient with severe multiple elevated risk factors should receive High Health Risk."""
        patient = {
            "age": 62,
            "gender": "Male",
            "bmi": 33.5,
            "bp": 165,
            "diaBP": 98,
            "glucose": 210,
            "cholesterol": 275,
            "heartRate": 84,
            "smoker": 1,
            "cp": "TA",
            "exang": "1"
        }
        full = evaluate_full_patient_assessment(patient)
        self.assertEqual(full["overall"]["tier"], "High Health Risk")
        self.assertEqual(full["overall"]["badge"], "danger")
        self.assertGreaterEqual(len(full["overall"]["abnormalBiomarkers"]), 3)

    def test_physiological_validation_warnings(self):
        """Tests that physiological validation detects non-physical extremes without crashing."""
        invalid_data = {
            "age": 150,
            "bp": 350,
            "glucose": 800,
            "bmi": 95
        }
        warnings = validate_vitals(invalid_data)
        self.assertGreaterEqual(len(warnings), 3)

    def test_probabilities_strictly_bounded(self):
        """Verifies all model probabilities fall strictly in [0.0, 1.0]."""
        test_samples = [
            {"age": 20, "bp": 90, "glucose": 60, "cholesterol": 120},
            {"age": 90, "bp": 220, "glucose": 400, "cholesterol": 500},
            {}  # completely empty input
        ]
        for s in test_samples:
            d_res = predict_diabetes_risk(s)
            h_res = predict_heart_risk(s)
            hyp_res = predict_hypertension_risk(s)
            for res in [d_res, h_res, hyp_res]:
                self.assertGreaterEqual(res["probability"], 0.0)
                self.assertLessEqual(res["probability"], 1.0)
                self.assertIn(res["riskTier"], ["Low Risk", "Moderate Risk", "High Risk"])


if __name__ == "__main__":
    unittest.main()
