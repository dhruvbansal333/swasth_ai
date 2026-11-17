"""
Swasth AI - Clinical Prediction & Assessment API Routes
"""

import json
from flask import Blueprint, request, jsonify
from backend.services.prediction_service import (
    evaluate_full_patient_assessment, predict_heart_risk, predict_diabetes_risk
)
from backend.services.auth_service import decode_token
from backend.database.db import get_db

prediction_bp = Blueprint("prediction", __name__)


def extract_user_id_if_present(req) -> int:
    """Extracts user_id from Authorization header if a valid token is supplied."""
    auth_header = req.headers.get("Authorization", "")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = decode_token(token)
            return payload.get("user_id")
        except Exception:
            return None
    return None


@prediction_bp.route("/api/predict/basic", methods=["POST"])
def predict_basic():
    try:
        data = request.get_json(force=True)
        results = evaluate_full_patient_assessment(data)

        # Persist to database if authenticated
        user_id = extract_user_id_if_present(request)
        assessment_id = None
        if user_id:
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO assessments (user_id, assessment_type, vitals_json, results_json) VALUES (?, ?, ?, ?)",
                    (user_id, "basic", json.dumps(data), json.dumps(results))
                )
                assessment_id = cursor.lastrowid

        return jsonify({
            "success": True,
            "assessmentId": assessment_id,
            "results": results,
            "inputs": data
        }), 200

    except Exception as e:
        return jsonify({"error": "Assessment prediction failed.", "details": str(e)}), 400


@prediction_bp.route("/api/predict/advanced", methods=["POST"])
def predict_advanced():
    try:
        data = request.get_json(force=True)
        results = evaluate_full_patient_assessment(data)

        user_id = extract_user_id_if_present(request)
        assessment_id = None
        if user_id:
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO assessments (user_id, assessment_type, vitals_json, results_json) VALUES (?, ?, ?, ?)",
                    (user_id, "advanced", json.dumps(data), json.dumps(results))
                )
                assessment_id = cursor.lastrowid

        return jsonify({
            "success": True,
            "assessmentId": assessment_id,
            "results": results,
            "inputs": data
        }), 200

    except Exception as e:
        return jsonify({"error": "Advanced assessment failed.", "details": str(e)}), 400


# ==============================================================================
# LEGACY BACKWARDS-COMPATIBLE ENDPOINTS (Original app.py endpoints)
# ==============================================================================

@prediction_bp.route("/predict/heart", methods=["POST"])
def predict_heart_legacy():
    try:
        data = request.get_json(force=True)
        res = predict_heart_risk(data)
        binary_pred = 1 if res["probability"] >= 0.50 else 0
        return jsonify({
            "prediction": binary_pred,
            "probability": res["probability"],
            "riskTier": res["riskTier"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@prediction_bp.route("/predict/diabetes", methods=["POST"])
def predict_diabetes_legacy():
    try:
        data = request.get_json(force=True)
        res = predict_diabetes_risk(data)
        binary_pred = 1 if res["probability"] >= 0.50 else 0
        return jsonify({
            "prediction": binary_pred,
            "probability": res["probability"],
            "riskTier": res["riskTier"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
