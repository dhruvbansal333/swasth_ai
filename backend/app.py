"""
Swasth AI - Main Application Entrypoint
Modular, Secure, Fully-Featured Healthcare Platform Backend
"""

import os
import sys

# Ensure both project root and backend directory are in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from flask import Flask, jsonify
from flask_cors import CORS

from backend.database.db import init_db
from backend.services.prediction_service import load_models
from backend.routes.auth_routes import auth_bp
from backend.routes.prediction_routes import prediction_bp
from backend.routes.report_routes import report_bp
from backend.routes.history_routes import history_bp
from backend.routes.guidance_routes import guidance_bp


def create_app():
    app = Flask(__name__)

    # Security: Configure CORS
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize persistent storage & ML models
    init_db()
    load_models()

    # Register modular blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(guidance_bp)

    @app.route("/")
    def index():
        return jsonify({
            "service": "Swasth AI Healthcare Risk Assessment API",
            "version": "2.0.0",
            "status": "online",
            "supportedDiseases": ["Diabetes", "Heart Disease", "Hypertension"],
            "endpoints": [
                "/api/auth/register",
                "/api/auth/login",
                "/api/auth/me",
                "/api/predict/basic",
                "/api/predict/advanced",
                "/api/report/extract",
                "/api/assessments",
                "/api/analytics/trends",
                "/api/guidance",
                "/api/habits"
            ]
        })

    @app.route("/api/health")
    def health():
        return jsonify({"status": "healthy", "service": "swasth-ai-api", "version": "2.0.0"}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found", "status": 404}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error occurred.", "status": 500}), 500

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
