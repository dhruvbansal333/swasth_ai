"""
Swasth AI - Patient Health Guidance & Interactive Companion API Blueprint
"""

import json
import datetime
from flask import Blueprint, request, jsonify
from backend.services.auth_service import auth_required
from backend.services.guidance_service import generate_personalized_guidance, DEFAULT_DAILY_HABITS
from backend.database.db import get_db

guidance_bp = Blueprint("guidance", __name__, url_prefix="/api")


@guidance_bp.route("/guidance", methods=["GET"])
def get_guidance():
    auth_header = request.headers.get("Authorization", "")
    user_id = None
    if auth_header and auth_header.startswith("Bearer "):
        try:
            from backend.services.auth_service import decode_token
            payload = decode_token(auth_header.split(" ")[1])
            user_id = payload.get("user_id")
        except Exception:
            pass

    latest_assessment = None
    if user_id:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT results_json FROM assessments
                WHERE user_id = ?
                ORDER BY created_at DESC LIMIT 1
            """, (user_id,))
            row = cursor.fetchone()
            if row:
                latest_assessment = json.loads(row["results_json"])

    # If no assessment yet, provide default preventive baseline
    if not latest_assessment:
        latest_assessment = {
            "diseases": {
                "diabetes": {"riskTier": "Low Risk"},
                "heart": {"riskTier": "Low Risk"},
                "hypertension": {"riskTier": "Low Risk"}
            }
        }

    guidance = generate_personalized_guidance(latest_assessment)
    return jsonify({"success": True, "guidance": guidance, "hasPersonalizedData": latest_assessment is not None}), 200


@guidance_bp.route("/habits", methods=["GET"])
@auth_required
def get_habits():
    user_id = request.user["user_id"]
    today_str = datetime.date.today().isoformat()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT habit_key, status FROM habit_logs
            WHERE user_id = ? AND completed_date = ?
        """, (user_id, today_str))
        rows = cursor.fetchall()

    completed_map = {r["habit_key"]: bool(r["status"]) for r in rows}

    habits_with_status = []
    for h in DEFAULT_DAILY_HABITS:
        habits_with_status.append({
            **h,
            "completed": completed_map.get(h["key"], False),
            "date": today_str
        })

    return jsonify({"success": True, "date": today_str, "habits": habits_with_status}), 200


@guidance_bp.route("/habits/toggle", methods=["POST"])
@auth_required
def toggle_habit():
    user_id = request.user["user_id"]
    data = request.get_json(force=True)
    habit_key = data.get("habit_key")
    if not habit_key:
        return jsonify({"error": "Missing habit_key parameter."}), 400

    today_str = datetime.date.today().isoformat()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, status FROM habit_logs
            WHERE user_id = ? AND habit_key = ? AND completed_date = ?
        """, (user_id, habit_key, today_str))
        row = cursor.fetchone()

        if row:
            new_status = 0 if row["status"] == 1 else 1
            cursor.execute("UPDATE habit_logs SET status = ? WHERE id = ?", (new_status, row["id"]))
            is_completed = bool(new_status)
        else:
            cursor.execute("""
                INSERT INTO habit_logs (user_id, habit_key, completed_date, status)
                VALUES (?, ?, ?, 1)
            """, (user_id, habit_key, today_str))
            is_completed = True

    return jsonify({"success": True, "habit_key": habit_key, "completed": is_completed, "date": today_str}), 200
