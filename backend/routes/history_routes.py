"""
Swasth AI - Patient Assessment History, Health Analytics & Privacy API Blueprint
"""

import json
from flask import Blueprint, request, jsonify
from backend.services.auth_service import auth_required
from backend.database.db import get_db

history_bp = Blueprint("history", __name__, url_prefix="/api")


@history_bp.route("/assessments", methods=["GET"])
@auth_required
def list_assessments():
    user_id = request.user["user_id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, assessment_type, vitals_json, results_json, created_at
            FROM assessments
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
        rows = cursor.fetchall()

    assessments = []
    for r in rows:
        assessments.append({
            "id": r["id"],
            "assessmentType": r["assessment_type"],
            "vitals": json.loads(r["vitals_json"]),
            "results": json.loads(r["results_json"]),
            "createdAt": r["created_at"]
        })

    return jsonify({"success": True, "count": len(assessments), "assessments": assessments}), 200


@history_bp.route("/assessments/<int:assessment_id>", methods=["GET"])
@auth_required
def get_assessment(assessment_id: int):
    user_id = request.user["user_id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, assessment_type, vitals_json, results_json, created_at
            FROM assessments
            WHERE id = ? AND user_id = ?
        """, (assessment_id, user_id))
        row = cursor.fetchone()

    if not row:
        return jsonify({"error": "Assessment record not found."}), 404

    return jsonify({
        "success": True,
        "assessment": {
            "id": row["id"],
            "assessmentType": row["assessment_type"],
            "vitals": json.loads(row["vitals_json"]),
            "results": json.loads(row["results_json"]),
            "createdAt": row["created_at"]
        }
    }), 200


@history_bp.route("/assessments/<int:assessment_id>", methods=["DELETE"])
@auth_required
def delete_assessment(assessment_id: int):
    user_id = request.user["user_id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM assessments WHERE id = ? AND user_id = ?", (assessment_id, user_id))
        if cursor.rowcount == 0:
            return jsonify({"error": "Assessment record not found or access denied."}), 404

    return jsonify({"success": True, "message": "Assessment record deleted successfully."}), 200


@history_bp.route("/analytics/trends", methods=["GET"])
@auth_required
def get_health_trends():
    user_id = request.user["user_id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, assessment_type, vitals_json, results_json, created_at
            FROM assessments
            WHERE user_id = ?
            ORDER BY created_at ASC
        """, (user_id,))
        rows = cursor.fetchall()

    if not rows:
        return jsonify({
            "success": True,
            "hasHistory": False,
            "count": 0,
            "message": "No assessments completed yet. Complete a basic or advanced assessment to initiate your health trend analytics.",
            "trends": {}
        }), 200

    bp_trend = []
    glucose_trend = []
    cholesterol_trend = []
    bmi_trend = []
    risk_trend = []

    for r in rows:
        vitals = json.loads(r["vitals_json"])
        results = json.loads(r["results_json"])
        date_str = r["created_at"]

        # Systolic BP
        bp_val = vitals.get("bp") or vitals.get("sysBP") or vitals.get("trestbps")
        if bp_val is not None and str(bp_val) != "":
            bp_trend.append({"date": date_str, "value": float(bp_val)})

        # Glucose
        gluc_val = vitals.get("glucose")
        if gluc_val is not None and str(gluc_val) != "":
            glucose_trend.append({"date": date_str, "value": float(gluc_val)})

        # Cholesterol
        chol_val = vitals.get("cholesterol") or vitals.get("totChol") or vitals.get("chol")
        if chol_val is not None and str(chol_val) != "":
            cholesterol_trend.append({"date": date_str, "value": float(chol_val)})

        # BMI
        bmi_val = vitals.get("bmi")
        if bmi_val is not None and str(bmi_val) != "":
            bmi_trend.append({"date": date_str, "value": float(bmi_val)})

        # Disease risks
        diseases = results.get("diseases", {})
        risk_trend.append({
            "date": date_str,
            "diabetes": diseases.get("diabetes", {}).get("probability", 0),
            "heart": diseases.get("heart", {}).get("probability", 0),
            "hypertension": diseases.get("hypertension", {}).get("probability", 0)
        })

    latest_assessment = json.loads(rows[-1]["results_json"])
    latest_vitals = json.loads(rows[-1]["vitals_json"])

    return jsonify({
        "success": True,
        "hasHistory": len(rows) > 1,
        "count": len(rows),
        "latest": {
            "id": rows[-1]["id"],
            "date": rows[-1]["created_at"],
            "vitals": latest_vitals,
            "results": latest_assessment
        },
        "trends": {
            "bloodPressure": bp_trend,
            "glucose": glucose_trend,
            "cholesterol": cholesterol_trend,
            "bmi": bmi_trend,
            "diseaseRisks": risk_trend
        }
    }), 200


@history_bp.route("/user/data", methods=["DELETE"])
@auth_required
def delete_all_user_data():
    """Right-to-be-forgotten / Data privacy wipe."""
    user_id = request.user["user_id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM assessments WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM habit_logs WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM patient_profiles WHERE user_id = ?", (user_id,))
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))

    return jsonify({
        "success": True,
        "message": "All patient clinical records, account data, and history have been completely and permanently erased."
    }), 200
