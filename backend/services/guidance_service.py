"""
Swasth AI - Patient Health Guidance & Personalized Action Plan Service ("My Health Companion")
Evidence-based recommendations adhering to American Heart Association (AHA),
American Diabetes Association (ADA), and WHO public health guidelines.
"""

from typing import Dict, Any, List


DEFAULT_DAILY_HABITS = [
    {"key": "water_hydration", "title": "Hydration Target", "desc": "Drink at least 2.5 Liters of fresh water.", "category": "lifestyle", "icon": "Droplet"},
    {"key": "daily_walk", "title": "Brisk 30-min Walk", "desc": "Complete 30 minutes of continuous moderate aerobic walking.", "category": "exercise", "icon": "Footprints"},
    {"key": "fiber_vegetables", "title": "High-Fiber Vegetables", "desc": "Include at least 2 generous portions of leafy greens or vegetables in meals.", "category": "diet", "icon": "Salad"},
    {"key": "low_sodium", "title": "Sodium Awareness", "desc": "Keep dietary salt intake below 1 teaspoon (2,000 mg) for cardiovascular protection.", "category": "diet", "icon": "ShieldCheck"},
    {"key": "sleep_hygiene", "title": "7+ Hours Restful Sleep", "desc": "Achieve 7 to 8 hours of uninterrupted restorative sleep.", "category": "lifestyle", "icon": "Moon"}
]


def generate_personalized_guidance(assessment_results: Dict[str, Any]) -> Dict[str, Any]:
    diseases = assessment_results.get("diseases", {})
    diabetes_tier = diseases.get("diabetes", {}).get("riskTier", "Low Risk")
    heart_tier = diseases.get("heart", {}).get("riskTier", "Low Risk")
    hyp_tier = diseases.get("hypertension", {}).get("riskTier", "Low Risk")

    # Dietary Guidance
    diet_recommendations = {
        "title": "Clinical Nutrition & Dietary Strategy",
        "overview": "Balanced medical nutrition focusing on whole grains, unprocessed proteins, and cardioprotective micronutrients.",
        "principles": [
            "Incorporate a Mediterranean or DASH dietary framework high in antioxidants and dietary fiber.",
            "Prioritize complex carbohydrates with low glycemic index (oats, legumes, quinoa) over refined sugars.",
            "Utilize healthy unsaturated fats (extra-virgin olive oil, flaxseeds, walnuts) to optimize lipid ratios."
        ],
        "foods_to_favor": [
            "Leafy green vegetables (spinach, kale, methi)",
            "High-fiber pulses and lentils (chana, dal, beans)",
            "Whole grains (brown rice, steel-cut oats, millets)",
            "Omega-3 fatty acid sources (walnuts, chia seeds, fatty fish)",
            "Berries, citrus fruits, and apples (rich in polyphenols)"
        ],
        "foods_to_limit": [
            "Ultra-processed packaged snacks and trans-fat baked goods",
            "Added simple sugars, sweet beverages, and syrups",
            "High-sodium processed meats and salted pickles",
            "Excessive saturated fats and deep-fried items"
        ]
    }

    # Exercise Guidance
    exercise_recommendations = {
        "title": "Physical Activity & Cardiovascular Conditioning",
        "weekly_target": "150 minutes of moderate-intensity aerobic physical activity per week.",
        "regimen": [
            {
                "type": "Aerobic Activity",
                "frequency": "5 days per week",
                "duration": "30 minutes daily",
                "details": "Brisk walking (at a pace where conversation is possible but singing is not), cycling, or swimming."
            },
            {
                "type": "Resistance & Muscle Strengthening",
                "frequency": "2 non-consecutive days per week",
                "duration": "15-20 minutes",
                "details": "Bodyweight squats, wall push-ups, light resistance bands to preserve metabolic insulin sensitivity."
            },
            {
                "type": "Sedentary Break Intervals",
                "frequency": "Every 45-60 minutes",
                "duration": "2-3 minutes",
                "details": "Stand up, stretch, and pace lightly to interrupt prolonged venous pooling and insulin resistance."
            }
        ]
    }

    # Disease-Specific Educational Action Plans
    disease_plans = []

    # Diabetes Plan
    d_plan = {
        "disease": "Diabetes Risk Guidance",
        "currentTier": diabetes_tier,
        "keyActions": [
            "Monitor carbohydrate portions; combine carbs with dietary protein or fat to blunt postprandial glucose spikes.",
            "Schedule post-meal walks of 10-15 minutes; postprandial ambulation enhances muscular GLUT4 glucose uptake.",
            "Consult a physician for periodic Fasting Blood Sugar and HbA1c screening if risk remains elevated."
        ],
        "redFlags": "Extreme thirst, frequent nocturnal urination, unexplained rapid weight loss, or persistent fatigue require immediate clinical evaluation."
    }
    disease_plans.append(d_plan)

    # Heart Disease Plan
    h_plan = {
        "disease": "Cardiovascular Health Guidance",
        "currentTier": heart_tier,
        "keyActions": [
            "Maintain total cholesterol under 200 mg/dL through soluble fiber intake and aerobic conditioning.",
            "Avoid all tobacco and nicotine products; smoking cessation reduces acute coronary spasm risk rapidly.",
            "Practice heart-rate variability breathing (4 seconds in, 6 seconds out) for 5 minutes daily to regulate autonomic tone."
        ],
        "redFlags": "Substernal chest pressure radiating to the jaw, neck, or left arm, acute shortness of breath, or unexplained syncope require immediate emergency services."
    }
    disease_plans.append(h_plan)

    # Hypertension Plan
    hyp_plan = {
        "disease": "Blood Pressure Management Guidance",
        "currentTier": hyp_tier,
        "keyActions": [
            "Adopt the DASH (Dietary Approaches to Stop Hypertension) protocol, emphasizing potassium-rich foods (bananas, sweet potatoes, coconut water).",
            "Maintain dietary sodium below 2,000 mg/day (approx 1 teaspoon of table salt across all meals).",
            "Record resting blood pressure weekly in a seated, relaxed posture with arm supported at heart level."
        ],
        "redFlags": "Systolic BP exceeding 180 mmHg or diastolic exceeding 120 mmHg accompanied by severe headache, blurred vision, or chest pain constitutes a hypertensive crisis requiring emergency care."
    }
    disease_plans.append(hyp_plan)

    return {
        "diet": diet_recommendations,
        "exercise": exercise_recommendations,
        "diseaseSpecificPlans": disease_plans,
        "dailyHabits": DEFAULT_DAILY_HABITS,
        "weeklyGoals": [
            "Log at least 3 home or clinic blood pressure and glucose readings.",
            "Achieve 150 total minutes of purposeful aerobic exercise.",
            "Cook at least 5 dinners at home utilizing whole ingredients.",
            "Maintain a consistent bedtime within 30 minutes every evening."
        ],
        "medicalSafetyDisclaimer": "Guidance provided is solely educational and preventive. Swasth AI does not diagnose illnesses, prescribe medication, or adjust pharmacological regimens. Always consult your personal physician before embarking on new exercise or nutritional protocols."
    }
