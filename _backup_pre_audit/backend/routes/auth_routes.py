"""
Swasth AI - Authentication & Profile API Blueprint
"""

from flask import Blueprint, request, jsonify
from backend.services.auth_service import (
    register_user, authenticate_user, get_user_profile,
    update_patient_profile, auth_required
)

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json(force=True)
        email = data.get("email", "")
        password = data.get("password", "")
        full_name = data.get("full_name", "")

        res = register_user(email, password, full_name)
        return jsonify({"success": True, **res}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to create user account.", "details": str(e)}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(force=True)
        email = data.get("email", "")
        password = data.get("password", "")

        res = authenticate_user(email, password)
        return jsonify({"success": True, **res}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": "Authentication failed.", "details": str(e)}), 500


@auth_bp.route("/me", methods=["GET"])
@auth_required
def get_current_user():
    try:
        user_id = request.user["user_id"]
        profile = get_user_profile(user_id)
        if not profile:
            return jsonify({"error": "User profile not found."}), 404
        return jsonify({"success": True, "user": profile}), 200
    except Exception as e:
        return jsonify({"error": "Could not fetch profile.", "details": str(e)}), 500


@auth_bp.route("/profile", methods=["PUT"])
@auth_required
def update_profile():
    try:
        user_id = request.user["user_id"]
        data = request.get_json(force=True)

        age = data.get("age")
        gender = data.get("gender")
        height_cm = data.get("height_cm")
        weight_kg = data.get("weight_kg")
        blood_group = data.get("blood_group")

        profile = update_patient_profile(user_id, age, gender, height_cm, weight_kg, blood_group)
        return jsonify({"success": True, "user": profile}), 200
    except Exception as e:
        return jsonify({"error": "Failed to update profile.", "details": str(e)}), 500
