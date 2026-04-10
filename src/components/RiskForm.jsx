import { useState } from "react";

/* Reusable Input component */
const InputField = ({ name, value, placeholder, handleChange, extra = "" }) => (
  <input
    type="number"
    name={name}
    value={value}
    placeholder={placeholder}
    onChange={handleChange}
    required
    className={`w-full p-4 rounded-xl border border-white/20 
    bg-white/20 backdrop-blur-sm text-black placeholder-gray-500
    focus:ring-2 focus:ring-cyan-400 focus:outline-none 
    transition duration-200 shadow-sm ${extra}`}
  />
);

export default function RiskForm({ onResult }) {

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("patientData");
    return saved
      ? JSON.parse(saved)
      : {
          age: "",
          gender: "",
          glucose: "",
          bmi: "",
          bp: "",
          cholesterol: "",
          heartRate: "",
          insulin: "",
          pregnancies: "",
          skinThickness: "",
          dpf: "",
          cp: "",
          fbs: "",
          restecg: "",
          exang: "",
          oldpeak: "",
          slope: "",
          ca: "",
          thal: "",
        };
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🩸 Diabetes API
      const diabetesRes = await fetch("http://127.0.0.1:5000/predict/diabetes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pregnancies: Number(form.pregnancies || 0),
          glucose: Number(form.glucose || 0),
          bp: Number(form.bp || 0),
          skinThickness: Number(form.skinThickness || 0),
          insulin: Number(form.insulin || 0),
          bmi: Number(form.bmi || 0),
          dpf: Number(form.dpf || 0),
          age: Number(form.age || 0),
        }),
      });

      const diabetesData = await diabetesRes.json();

      // ❤️ Heart API
      const heartRes = await fetch("http://127.0.0.1:5000/predict/heart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(form.age || 0),
          sex: form.gender === "Male" ? 1 : 0,
          cp: Number(form.cp || 0),
          trestbps: Number(form.bp || 0),
          chol: Number(form.cholesterol || 0),
          fbs: Number(form.fbs || 0),
          restecg: Number(form.restecg || 0),
          thalach: Number(form.heartRate || 0),
          exang: Number(form.exang || 0),
          oldpeak: Number(form.oldpeak || 0),
          slope: Number(form.slope || 0),
          ca: Number(form.ca || 0),
          thal: Number(form.thal || 0),
        }),
      });

      const heartData = await heartRes.json();

      const resultData = {
        ...form,
        diabetesRisk:
          diabetesData.prediction === 1 ? "High Risk ⚠️" : "Low Risk ✅",
        heartRisk:
          heartData.prediction === 1 ? "High Risk ⚠️" : "Low Risk ✅",
        hypertension:
          Number(form.bp) > 140 ? "High ⚠️" : "Normal ✅",
      };

      localStorage.setItem("patientData", JSON.stringify(resultData));
      onResult(resultData);

    } catch (error) {
      console.error("API Error:", error);
      alert("Something went wrong. Check backend.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">

      <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
        AI Health Risk Assessment
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">

        {/* Basic */}
        <InputField name="age" value={form.age} placeholder="Age" handleChange={handleChange} />

        <select name="gender" value={form.gender} onChange={handleChange} required className="w-full p-3 rounded-xl border bg-white">
          <option value="">Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        {/* Diabetes */}
        <InputField name="glucose" value={form.glucose} placeholder="Glucose" handleChange={handleChange} />
        <InputField name="bmi" value={form.bmi} placeholder="BMI" handleChange={handleChange} />
        <InputField name="bp" value={form.bp} placeholder="Blood Pressure" handleChange={handleChange} />
        <InputField name="insulin" value={form.insulin} placeholder="Insulin" handleChange={handleChange} />
        <InputField name="pregnancies" value={form.pregnancies} placeholder="Pregnancies" handleChange={handleChange} />
        <InputField name="skinThickness" value={form.skinThickness} placeholder="Skin Thickness" handleChange={handleChange} />
        <InputField name="dpf" value={form.dpf} placeholder="Diabetes Pedigree Function" handleChange={handleChange} />

        {/* Heart */}
        <InputField name="cholesterol" value={form.cholesterol} placeholder="Cholesterol" handleChange={handleChange} />
        <InputField name="heartRate" value={form.heartRate} placeholder="Max Heart Rate" handleChange={handleChange} />
        <InputField name="oldpeak" value={form.oldpeak} placeholder="Oldpeak" handleChange={handleChange} />

        <select name="cp" value={form.cp} onChange={handleChange} required className="w-full p-3 rounded-xl border bg-white">
          <option value="">Chest Pain Type</option>
          <option value="0">Typical</option>
          <option value="1">Atypical</option>
          <option value="2">Non-anginal</option>
          <option value="3">Asymptomatic</option>
        </select>

        <select name="fbs" value={form.fbs} onChange={handleChange} required className="w-full p-3 rounded-xl border bg-white">
          <option value="">Fasting Blood Sugar</option>
          <option value="1">Above 120</option>
          <option value="0">Below 120</option>
        </select>

        <select name="restecg" value={form.restecg} onChange={handleChange} required className="w-full p-3 rounded-xl border bg-white">
          <option value="">Rest ECG</option>
          <option value="0">Normal</option>
          <option value="1">Abnormal</option>
          <option value="2">Hypertrophy</option>
        </select>

        <select name="exang" value={form.exang} onChange={handleChange} required className="w-full p-3 rounded-xl border bg-white">
          <option value="">Exercise Angina</option>
          <option value="1">Yes</option>
          <option value="0">No</option>
        </select>

        <select name="slope" value={form.slope} onChange={handleChange} required className="w-full p-3 rounded-xl border bg-white">
          <option value="">Slope</option>
          <option value="0">Up</option>
          <option value="1">Flat</option>
          <option value="2">Down</option>
        </select>

        <select name="ca" value={form.ca} onChange={handleChange} required className="w-full p-3 rounded-xl border bg-white">
          <option value="">Major Vessels</option>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>

        <select name="thal" value={form.thal} onChange={handleChange} required className="w-full p-3 rounded-xl border bg-white">
          <option value="">Thalassemia</option>
          <option value="1">Normal</option>
          <option value="2">Fixed Defect</option>
          <option value="3">Reversible Defect</option>
        </select>

      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 py-3 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105"
      >
        {loading ? "Analyzing..." : "Check Risk"}
      </button>

    </form>
  );
}