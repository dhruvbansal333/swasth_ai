"""
Swasth AI - Full End-to-End User Journey & Integration Test Suite
Simulates:
1. Patient registration
2. Patient authentication & JWT issuance
3. Basic Assessment submission & 3-disease prediction
4. Diagnostic report extraction & Advanced Assessment
5. Longitudinal Analytics & trends retrieval
6. Health Companion guidance & daily habit toggling
7. Profile update & physical metrics persistence
8. Patient data isolation across multiple user sessions
"""

import unittest
import json
import io
from backend.app import create_app
from backend.database.db import get_db


class TestFullUserJourney(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def test_complete_user_journey_and_data_isolation(self):
        # 1. Register Patient A
        reg_payload_a = {
            "email": "patient_a_journey@example.com",
            "password": "SecurePassword123!",
            "full_name": "Patient Alpha"
        }
        res_a = self.client.post("/api/auth/register", json=reg_payload_a)
        self.assertEqual(res_a.status_code, 201)
        data_a = res_a.get_json()
        token_a = data_a["token"]
        self.assertIsNotNone(token_a)

        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 2. Check /api/auth/me for Patient A
        me_res = self.client.get("/api/auth/me", headers=headers_a)
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.get_json()["user"]["email"], "patient_a_journey@example.com")

        # 3. Patient A completes Basic Assessment (Healthy normal adult: 32yo, BP 118/76, Glucose 92, Chol 175)
        basic_input = {
            "age": 32,
            "gender": "Male",
            "bmi": 23.2,
            "height_cm": 178,
            "weight_kg": 73.5,
            "bp": 118,
            "diaBP": 76,
            "glucose": 92,
            "cholesterol": 175,
            "heartRate": 68,
            "smoker": 0,
            "cp": "none",
            "exang": "0"
        }
        pred_res = self.client.post("/api/predict/basic", json=basic_input, headers=headers_a)
        self.assertEqual(pred_res.status_code, 200)
        pred_data = pred_res.get_json()
        self.assertTrue(pred_data["success"])
        self.assertIsNotNone(pred_data["assessmentId"])

        results = pred_data["results"]
        # Assert healthy patient receives Low Risk across all conditions
        self.assertEqual(results["overall"]["tier"], "Low Health Risk")
        self.assertEqual(results["diseases"]["diabetes"]["riskTier"], "Low Risk")
        self.assertEqual(results["diseases"]["heart"]["riskTier"], "Low Risk")
        self.assertEqual(results["diseases"]["hypertension"]["riskTier"], "Low Risk")
        self.assertLess(results["diseases"]["heart"]["probability"], 0.20)

        # 4. Patient A uploads a laboratory test text report
        mock_report_text = """
        CLINICAL LABORATORY REPORT - DIAGNOSTIC BIOCHEMISTRY
        Patient: Patient Alpha | Age: 32 | Gender: Male
        Fasting Blood Sugar: 94 mg/dL (Reference: 70 - 99 mg/dL)
        Total Cholesterol: 180 mg/dL (Reference: 125 - 200 mg/dL)
        HDL Cholesterol: 55 mg/dL (Reference: >40 mg/dL)
        LDL Cholesterol: 98 mg/dL (Reference: <100 mg/dL)
        Blood Pressure: 118/76 mmHg
        Serum Creatinine: 0.9 mg/dL
        """
        data = {
            'file': (io.BytesIO(mock_report_text.encode('utf-8')), 'lab_report.txt')
        }
        extract_res = self.client.post("/api/report/extract", data=data, content_type='multipart/form-data')
        self.assertEqual(extract_res.status_code, 200)
        extract_data = extract_res.get_json()
        self.assertTrue(extract_data["success"])
        self.assertIn("glucose_fasting", extract_data["extractedBiomarkers"])
        self.assertEqual(extract_data["extractedBiomarkers"]["glucose_fasting"]["value"], 94.0)

        # 5. Patient A runs Advanced Assessment with extracted & confirmed values
        adv_input = {
            "age": 32,
            "gender": "Male",
            "bmi": 23.2,
            "bp": 118,
            "diaBP": 76,
            "glucose": 94,
            "cholesterol": 180
        }
        adv_res = self.client.post("/api/predict/advanced", json=adv_input, headers=headers_a)
        self.assertEqual(adv_res.status_code, 200)
        adv_data = adv_res.get_json()
        self.assertEqual(adv_data["results"]["overall"]["tier"], "Low Health Risk")

        # 6. Patient A checks Analytics Trends (Now has 2 assessments -> hasHistory: True)
        trends_res = self.client.get("/api/analytics/trends", headers=headers_a)
        self.assertEqual(trends_res.status_code, 200)
        trends_data = trends_res.get_json()
        self.assertTrue(trends_data["hasHistory"])
        self.assertEqual(trends_data["count"], 2)
        self.assertEqual(len(trends_data["trends"]["bloodPressure"]), 2)

        # 7. Patient A checks and toggles Daily Health Habits
        habits_res = self.client.get("/api/habits", headers=headers_a)
        self.assertEqual(habits_res.status_code, 200)
        habits_list = habits_res.get_json()["habits"]
        self.assertGreater(len(habits_list), 0)

        first_habit_key = habits_list[0]["key"]
        toggle_res = self.client.post(
            "/api/habits/toggle",
            json={"habit_key": first_habit_key},
            headers=headers_a
        )
        self.assertEqual(toggle_res.status_code, 200)
        self.assertTrue(toggle_res.get_json()["completed"])

        # 8. Patient A updates profile
        prof_res = self.client.put(
            "/api/auth/profile",
            json={"age": 33, "height_cm": 178, "weight_kg": 73, "blood_group": "O+"},
            headers=headers_a
        )
        self.assertEqual(prof_res.status_code, 200)

        # 9. Test Patient Data Isolation: Register Patient B
        reg_payload_b = {
            "email": "patient_b_journey@example.com",
            "password": "SecurePassword456!",
            "full_name": "Patient Beta"
        }
        res_b = self.client.post("/api/auth/register", json=reg_payload_b)
        self.assertEqual(res_b.status_code, 201)
        token_b = res_b.get_json()["token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # Patient B's history must be completely empty (zero records, count=0)
        history_b = self.client.get("/api/assessments", headers=headers_b)
        self.assertEqual(history_b.status_code, 200)
        self.assertEqual(len(history_b.get_json()["assessments"]), 0)

        trends_b = self.client.get("/api/analytics/trends", headers=headers_b)
        self.assertEqual(trends_b.status_code, 200)
        self.assertFalse(trends_b.get_json()["hasHistory"])
        self.assertEqual(trends_b.get_json()["count"], 0)

        # Patient B's habits must all be uncompleted (isolation)
        habits_b = self.client.get("/api/habits", headers=headers_b)
        self.assertEqual(habits_b.status_code, 200)
        for h in habits_b.get_json()["habits"]:
            self.assertFalse(h["completed"])

        # 10. Clean up test users
        with get_db() as conn:
            conn.execute("DELETE FROM users WHERE email LIKE '%_journey@example.com'")


if __name__ == "__main__":
    unittest.main()
