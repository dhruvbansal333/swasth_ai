from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import pickle

app = Flask(__name__)
CORS(app)

# ✅ Load models + scalers + columns
heart_model = pickle.load(open("heart_disease_model.pkl", "rb"))
heart_columns = joblib.load("heart_columns.pkl")
scaler_h = joblib.load("scaler_h.pkl")

diabetes_model = joblib.load("diabetes_model.pkl")
scaler_d = joblib.load("scaler_d.pkl")


@app.route("/")
def home():
    return "Backend Running ✅"


# ❤️ HEART PREDICTION (FIXED WITH ENCODING)
@app.route("/predict/heart", methods=["POST"])
def predict_heart():
    try:
        data = request.json

        # 🔥 Step 1: Base numerical features
        input_dict = {
            "Age": float(data["age"]),
            "RestingBP": float(data["trestbps"]),
            "Cholesterol": float(data["chol"]),
            "FastingBS": int(data["fbs"]),
            "MaxHR": float(data["thalach"]),
            "Oldpeak": float(data["oldpeak"]),
        }

        # 🔥 Step 2: Initialize all columns = 0
        for col in heart_columns:
            if col not in input_dict:
                input_dict[col] = 0

        # 🔥 Step 3: Encoding

        # Gender
        if int(data["sex"]) == 1:
            input_dict["Sex_M"] = 1
        else:
            input_dict["Sex_F"] = 1

        # Chest Pain
        cp_map = ["TA", "ATA", "NAP", "ASY"]
        input_dict[f"ChestPainType_{cp_map[int(data['cp'])]}"] = 1

        # Rest ECG
        restecg_map = ["Normal", "ST", "LVH"]
        input_dict[f"RestingECG_{restecg_map[int(data['restecg'])]}"] = 1

        # Exercise Angina
        if int(data["exang"]) == 1:
            input_dict["ExerciseAngina_Y"] = 1
        else:
            input_dict["ExerciseAngina_N"] = 1

        # Slope
        slope_map = ["Up", "Flat", "Down"]
        input_dict[f"ST_Slope_{slope_map[int(data['slope'])]}"] = 1

        # 🔥 Step 4: DataFrame with correct column order
        features_df = pd.DataFrame([input_dict])
        features_df = features_df[heart_columns]

        # 🔥 Step 5: Scaling
        features = scaler_h.transform(features_df)

        # Prediction
        result = heart_model.predict(features)[0]

        # ✅ Debug probability
        proba = heart_model.predict_proba(features)[0]
        print("Heart Probabilities:", proba, flush=True)

        return jsonify({"prediction": int(result)})

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)})


# 🩸 DIABETES PREDICTION (UNCHANGED - ALREADY CORRECT)
@app.route("/predict/diabetes", methods=["POST"])
def predict_diabetes():
    try:
        data = request.json

        features = np.array([[
            float(data["pregnancies"]),
            float(data["glucose"]),
            float(data["bp"]),
            float(data["skinThickness"]),
            float(data["insulin"]),
            float(data["bmi"]),
            float(data["dpf"]),
            float(data["age"])
        ]])

        # 🔥 APPLY SCALER
        features = scaler_d.transform(features)

        result = diabetes_model.predict(features)[0]

        return jsonify({"prediction": int(result)})

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)