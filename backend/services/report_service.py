"""
Swasth AI - Medical Report Extraction, Biomarker Parsing & Verification Service
Parses PDF reports and images, extracts standard clinical lab biomarkers,
and structures them for patient review and validation prior to inference.
"""

import re
import os
from typing import Dict, Any, List

try:
    import pypdf as pdf_lib
except ImportError:
    try:
        import PyPDF2 as pdf_lib
    except ImportError:
        pdf_lib = None


# Standard clinical lab biomarker definitions with normal reference ranges & standard units
STANDARD_BIOMARKERS = {
    "glucose_fasting": {
        "label": "Fasting Blood Sugar (FBS)",
        "patterns": [r"fasting\s*(?:blood)?\s*sugar", r"fbs", r"fasting\s*glucose", r"glucose[,\s]*fasting"],
        "unit": "mg/dL",
        "normal_min": 70,
        "normal_max": 99,
        "maps_to": "glucose"
    },
    "glucose_random": {
        "label": "Random Blood Sugar (RBS)",
        "patterns": [r"random\s*(?:blood)?\s*sugar", r"rbs", r"random\s*glucose", r"glucose[,\s]*random"],
        "unit": "mg/dL",
        "normal_min": 70,
        "normal_max": 140,
        "maps_to": "glucose"
    },
    "hba1c": {
        "label": "Glycated Hemoglobin (HbA1c)",
        "patterns": [r"hba1c", r"glycated\s*hemoglobin", r"glycosylated\s*hemoglobin"],
        "unit": "%",
        "normal_min": 4.0,
        "normal_max": 5.6,
        "maps_to": "hba1c"
    },
    "cholesterol_total": {
        "label": "Total Cholesterol",
        "patterns": [r"total\s*cholesterol", r"cholesterol[,\s]*total", r"serum\s*cholesterol"],
        "unit": "mg/dL",
        "normal_min": 125,
        "normal_max": 200,
        "maps_to": "cholesterol"
    },
    "cholesterol_hdl": {
        "label": "HDL Cholesterol (Good)",
        "patterns": [r"hdl(?:\s*cholesterol)?", r"high\s*density\s*lipoprotein"],
        "unit": "mg/dL",
        "normal_min": 40,
        "normal_max": 60,
        "maps_to": "hdl"
    },
    "cholesterol_ldl": {
        "label": "LDL Cholesterol (Bad)",
        "patterns": [r"ldl(?:\s*cholesterol)?", r"low\s*density\s*lipoprotein"],
        "unit": "mg/dL",
        "normal_min": 50,
        "normal_max": 100,
        "maps_to": "ldl"
    },
    "triglycerides": {
        "label": "Triglycerides",
        "patterns": [r"triglycerides?", r"serum\s*triglycerides?"],
        "unit": "mg/dL",
        "normal_min": 50,
        "normal_max": 150,
        "maps_to": "triglycerides"
    },
    "hemoglobin": {
        "label": "Hemoglobin (Hb)",
        "patterns": [r"hemoglobin", r"haemoglobin", r"\bhb\b"],
        "unit": "g/dL",
        "normal_min": 12.0,
        "normal_max": 17.5,
        "maps_to": "hemoglobin"
    },
    "creatinine": {
        "label": "Serum Creatinine",
        "patterns": [r"(?:serum\s*)?creatinine"],
        "unit": "mg/dL",
        "normal_min": 0.6,
        "normal_max": 1.2,
        "maps_to": "creatinine"
    },
    "blood_pressure_systolic": {
        "label": "Systolic Blood Pressure",
        "patterns": [r"systolic\s*(?:bp|blood\s*pressure)?", r"sys\s*bp", r"\bbp\s*sys\b"],
        "unit": "mmHg",
        "normal_min": 90,
        "normal_max": 120,
        "maps_to": "bp"
    },
    "blood_pressure_diastolic": {
        "label": "Diastolic Blood Pressure",
        "patterns": [r"diastolic\s*(?:bp|blood\s*pressure)?", r"dia\s*bp", r"\bbp\s*dia\b"],
        "unit": "mmHg",
        "normal_min": 60,
        "normal_max": 80,
        "maps_to": "diaBP"
    }
}


def extract_text_from_pdf(file_stream) -> str:
    """Extracts raw text content from uploaded PDF stream."""
    if pdf_lib is None:
        raise ValueError("PDF parsing library is not installed on server.")
    try:
        reader = pdf_lib.PdfReader(file_stream)
        text_content = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_content.append(page_text)
        return "\n".join(text_content)
    except Exception as e:
        raise ValueError(f"Could not read PDF document: {str(e)}")


def parse_biomarkers_from_text(raw_text: str) -> Dict[str, Any]:
    """Scans text for clinical laboratory biomarkers with flexible regular expressions."""
    extracted = {}
    lines = raw_text.splitlines()

    for marker_key, meta in STANDARD_BIOMARKERS.items():
        found = False
        for pattern in meta["patterns"]:
            if found:
                break
            # Match biomarker name followed by optional delimiters and float/int number
            regex = re.compile(rf"{pattern}\s*[:=-]?\s*([0-9]+(?:\.[0-9]+)?)", re.IGNORECASE)
            for line in lines:
                match = regex.search(line)
                if match:
                    try:
                        val = float(match.group(1))
                        # Determine clinical status flag
                        if val < meta["normal_min"]:
                            status = "Low"
                            status_badge = "warning"
                        elif val > meta["normal_max"]:
                            status = "High"
                            status_badge = "danger"
                        else:
                            status = "Normal"
                            status_badge = "success"

                        extracted[marker_key] = {
                            "key": marker_key,
                            "label": meta["label"],
                            "value": val,
                            "unit": meta["unit"],
                            "reference_range": f"{meta['normal_min']} - {meta['normal_max']} {meta['unit']}",
                            "status": status,
                            "status_badge": status_badge,
                            "maps_to": meta["maps_to"]
                        }
                        found = True
                        break
                    except (ValueError, IndexError):
                        pass

    # Check for combined Blood Pressure pattern (e.g. 120/80 or 135 / 85 mmHg)
    bp_regex = re.compile(r"(?:blood\s*pressure|b\.?p\.?)\s*[:=-]?\s*([0-9]{2,3})\s*/\s*([0-9]{2,3})", re.IGNORECASE)
    for line in lines:
        bp_match = bp_regex.search(line)
        if bp_match:
            sys_val = float(bp_match.group(1))
            dia_val = float(bp_match.group(2))
            if "blood_pressure_systolic" not in extracted:
                extracted["blood_pressure_systolic"] = {
                    "key": "blood_pressure_systolic",
                    "label": "Systolic Blood Pressure",
                    "value": sys_val,
                    "unit": "mmHg",
                    "reference_range": "90 - 120 mmHg",
                    "status": "High" if sys_val > 120 else ("Low" if sys_val < 90 else "Normal"),
                    "status_badge": "danger" if sys_val > 120 else ("warning" if sys_val < 90 else "success"),
                    "maps_to": "bp"
                }
            if "blood_pressure_diastolic" not in extracted:
                extracted["blood_pressure_diastolic"] = {
                    "key": "blood_pressure_diastolic",
                    "label": "Diastolic Blood Pressure",
                    "value": dia_val,
                    "unit": "mmHg",
                    "reference_range": "60 - 80 mmHg",
                    "status": "High" if dia_val > 80 else ("Low" if dia_val < 60 else "Normal"),
                    "status_badge": "danger" if dia_val > 80 else ("warning" if dia_val < 60 else "success"),
                    "maps_to": "diaBP"
                }
            break

    return extracted


def extract_report_data(file_storage) -> Dict[str, Any]:
    """Processes uploaded medical report file (PDF or text)."""
    filename = file_storage.filename.lower()

    if filename.endswith(".pdf"):
        raw_text = extract_text_from_pdf(file_storage.stream)
    elif filename.endswith((".txt", ".csv")):
        raw_text = file_storage.stream.read().decode("utf-8", errors="ignore")
    elif filename.endswith((".png", ".jpg", ".jpeg")):
        # For image reports without OCR binary installed, provide helpful message and fallback template
        raw_text = "IMAGE_UPLOAD"
        return {
            "success": True,
            "filename": filename,
            "rawTextLength": 0,
            "extractedBiomarkers": {},
            "requiresManualReview": True,
            "notice": "Image format received. Please verify or input your laboratory test readings into the verified fields."
        }
    else:
        raise ValueError("Unsupported file format. Please upload a PDF, TXT, or clear image of your laboratory report.")

    biomarkers = parse_biomarkers_from_text(raw_text)

    # Determine which model input features have been fulfilled
    mapped_features = {}
    for item in biomarkers.values():
        mapped_features[item["maps_to"]] = item["value"]

    return {
        "success": True,
        "filename": filename,
        "rawTextLength": len(raw_text),
        "extractedBiomarkers": biomarkers,
        "mappedModelInputs": mapped_features,
        "requiresManualReview": True,
        "guidance": "Please review the extracted laboratory values for accuracy. You may modify or add missing readings before submitting for AI risk evaluation."
    }
