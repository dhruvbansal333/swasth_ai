"""
Swasth AI - Medical Report Upload & Extraction API Blueprint
"""

from flask import Blueprint, request, jsonify
from backend.services.report_service import extract_report_data

report_bp = Blueprint("report", __name__, url_prefix="/api/report")


@report_bp.route("/extract", methods=["POST"])
def upload_report():
    if "file" not in request.files:
        return jsonify({"error": "No file attached to upload request."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    try:
        extraction_result = extract_report_data(file)
        return jsonify(extraction_result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to process report document.", "details": str(e)}), 500
