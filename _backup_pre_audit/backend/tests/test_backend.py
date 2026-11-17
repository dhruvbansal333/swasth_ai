"""
Swasth AI - Automated Integration & System Tests
Tests Authentication, Prediction Pipelines, Report Extraction, History, and Data Isolation.
"""

import unittest
import json
import os

# Set testing database path before importing app
os.environ["DATABASE_PATH"] = os.path.join(os.path.dirname(__file__), "test_swasth.db")

from backend.app import app
from backend.database.db import init_db


class SwasthAITestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = app.test_client()

    @classmethod
    def tearDownClass(cls):
        db_file = os.environ.get("DATABASE_PATH")
        if db_file and os.path.exists(db_file):
            try:
                os.remove(db_file)
            except Exception:
                pass

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")

    def test_02_auth_workflow(self):
        # Register User A
        reg_payload = {
            "email": "patient_a@example.com",
            "password": "SecurePassword123!",
            "full_name": "Patient Alpha"
        }
        res = self.client.post("/api/auth/register", json=reg_payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertIn("token", data)
        self.assertEqual(data["user"]["email"], "patient_a@example.com")

        # Duplicate email registration must be rejected
        res_dup = self.client.post("/api/auth/register", json=reg_payload)
        self.assertEqual(res_dup.status_code, 400)

        # Login User A
        login_res = self.client.post("/api/auth/login", json={
            "email": "patient_a@example.com",
            "password": "SecurePassword123!"
        })
        self.assertEqual(login_res.status_code, 200)
        login_data = login_res.get_json()
        token = login_data["token"]

        # Access Protected Route /api/auth/me
        me_res = self.client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.get_json()["user"]["full_name"], "Patient Alpha")

    def test_03_basic_prediction_pipeline(self):
        # Login to get token
        login_res = self.client.post("/api/auth/login", json={
            "email": "patient_a@example.com",
            "password": "SecurePassword123!"
        })
        token = login_res.get_json()["token"]

        vitals_payload = {
            "age": 48,
            "gender": "Male",
            "glucose": 135,
            "bp": 138,
            "cholesterol": 225,
            "bmi": 29.4,
            "heartRate": 78,
            "pregnancies": 0,
            "smoker": 0
        }

        res = self.client.post(
            "/api/predict/basic",
            json=vitals_payload,
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertIsNotNone(data["assessmentId"])

        results = data["results"]
        # Check all 3 diseases present
        self.assertIn("diabetes", results["diseases"])
        self.assertIn("heart", results["diseases"])
        self.assertIn("hypertension", results["diseases"])

        # Check probability bounds
        for dis_name, dis_info in results["diseases"].items():
            self.assertGreaterEqual(dis_info["probability"], 0.0)
            self.assertLessEqual(dis_info["probability"], 1.0)
            self.assertIn(dis_info["riskTier"], ["Low Risk", "Moderate Risk", "High Risk"])
            self.assertIsInstance(dis_info["factors"], list)

    def test_04_patient_data_isolation(self):
        # Register User B
        self.client.post("/api/auth/register", json={
            "email": "patient_b@example.com",
            "password": "SecurePassword123!",
            "full_name": "Patient Beta"
        })
        token_b = self.client.post("/api/auth/login", json={
            "email": "patient_b@example.com",
            "password": "SecurePassword123!"
        }).get_json()["token"]

        # User B assessments must be 0 initially
        res_b = self.client.get("/api/assessments", headers={"Authorization": f"Bearer {token_b}"})
        self.assertEqual(res_b.status_code, 200)
        self.assertEqual(res_b.get_json()["count"], 0)

        # User A must see their 1 assessment
        token_a = self.client.post("/api/auth/login", json={
            "email": "patient_a@example.com",
            "password": "SecurePassword123!"
        }).get_json()["token"]
        res_a = self.client.get("/api/assessments", headers={"Authorization": f"Bearer {token_a}"})
        self.assertEqual(res_a.status_code, 200)
        self.assertEqual(res_a.get_json()["count"], 1)

    def test_05_legacy_backwards_compatibility(self):
        # Test original /predict/diabetes
        d_res = self.client.post("/predict/diabetes", json={
            "pregnancies": 2,
            "glucose": 140,
            "bp": 80,
            "skinThickness": 20,
            "insulin": 120,
            "bmi": 31.2,
            "dpf": 0.5,
            "age": 45
        })
        self.assertEqual(d_res.status_code, 200)
        d_data = d_res.get_json()
        self.assertIn("prediction", d_data)
        self.assertIn(d_data["prediction"], [0, 1])

        # Test original /predict/heart
        h_res = self.client.post("/predict/heart", json={
            "age": 52,
            "sex": 1,
            "cp": 2,
            "trestbps": 135,
            "chol": 230,
            "fbs": 0,
            "restecg": 0,
            "thalach": 145,
            "exang": 0,
            "oldpeak": 1.2,
            "slope": 1,
            "ca": 0,
            "thal": 1
        })
        self.assertEqual(h_res.status_code, 200)
        h_data = h_res.get_json()
        self.assertIn("prediction", h_data)
        self.assertIn(h_data["prediction"], [0, 1])

    def test_06_guidance_and_habits(self):
        token_a = self.client.post("/api/auth/login", json={
            "email": "patient_a@example.com",
            "password": "SecurePassword123!"
        }).get_json()["token"]

        # Guidance
        g_res = self.client.get("/api/guidance", headers={"Authorization": f"Bearer {token_a}"})
        self.assertEqual(g_res.status_code, 200)
        g_data = g_res.get_json()["guidance"]
        self.assertIn("diet", g_data)
        self.assertIn("exercise", g_data)
        self.assertIn("dailyHabits", g_data)

        # Habit toggle
        habit_toggle_res = self.client.post(
            "/api/habits/toggle",
            json={"habit_key": "daily_walk"},
            headers={"Authorization": f"Bearer {token_a}"}
        )
        self.assertEqual(habit_toggle_res.status_code, 200)
        self.assertTrue(habit_toggle_res.get_json()["completed"])


if __name__ == "__main__":
    unittest.main()
