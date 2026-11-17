"""
Swasth AI - Authentication, Authorization & User Management Service
"""

import os
import datetime
import bcrypt
import jwt
from functools import wraps
from flask import request, jsonify
from backend.database.db import get_db

JWT_SECRET = os.environ.get("JWT_SECRET", "swasth_ai_secure_jwt_secret_2026_super_key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def generate_token(user_id: int, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=JWT_EXPIRATION_DAYS),
        "iat": datetime.datetime.now(datetime.timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header:
            return jsonify({"error": "Missing authorization header", "authenticated": False}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid authorization token format", "authenticated": False}), 401

        token = parts[1]
        try:
            payload = decode_token(token)
            request.user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired. Please log in again.", "authenticated": False}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token. Authorization denied.", "authenticated": False}), 401

        return f(*args, **kwargs)
    return decorated


def register_user(email: str, password: str, full_name: str):
    email = email.strip().lower()
    if not email or "@" not in email:
        raise ValueError("A valid email address is required.")
    if not password or len(password) < 6:
        raise ValueError("Password must be at least 6 characters long.")
    if not full_name.strip():
        raise ValueError("Full name is required.")

    password_hash = hash_password(password)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            raise ValueError("An account with this email already exists.")

        cursor.execute(
            "INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)",
            (email, password_hash, full_name.strip())
        )
        user_id = cursor.lastrowid

        # Initialize default empty patient profile
        cursor.execute(
            "INSERT INTO patient_profiles (user_id) VALUES (?)",
            (user_id,)
        )

    token = generate_token(user_id, email)
    return {
        "user": {"id": user_id, "email": email, "full_name": full_name.strip()},
        "token": token
    }


def authenticate_user(email: str, password: str):
    email = email.strip().lower()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, password_hash, full_name FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        if not row:
            raise ValueError("Invalid email or password.")

        if not verify_password(password, row["password_hash"]):
            raise ValueError("Invalid email or password.")

        user_id = row["id"]
        full_name = row["full_name"]

    token = generate_token(user_id, email)
    return {
        "user": {"id": user_id, "email": email, "full_name": full_name},
        "token": token
    }


def get_user_profile(user_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.id, u.email, u.full_name, u.created_at,
                   p.age, p.gender, p.height_cm, p.weight_kg, p.blood_group, p.updated_at
            FROM users u
            LEFT JOIN patient_profiles p ON u.id = p.user_id
            WHERE u.id = ?
        """, (user_id,))
        row = cursor.fetchone()
        if not row:
            return None
        return dict(row)


def update_patient_profile(user_id: int, age=None, gender=None, height_cm=None, weight_kg=None, blood_group=None):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO patient_profiles (user_id, age, gender, height_cm, weight_kg, blood_group, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                age = COALESCE(excluded.age, patient_profiles.age),
                gender = COALESCE(excluded.gender, patient_profiles.gender),
                height_cm = COALESCE(excluded.height_cm, patient_profiles.height_cm),
                weight_kg = COALESCE(excluded.weight_kg, patient_profiles.weight_kg),
                blood_group = COALESCE(excluded.blood_group, patient_profiles.blood_group),
                updated_at = CURRENT_TIMESTAMP
        """, (user_id, age, gender, height_cm, weight_kg, blood_group))
    return get_user_profile(user_id)
