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

  /* Load previous patient data if exists */
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
        };
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const age = Number(form.age);
    const glucose = Number(form.glucose);
    const bmi = Number(form.bmi);
    const bp = Number(form.bp);
    const cholesterol = Number(form.cholesterol);
    const heartRate = Number(form.heartRate);
    const insulin = Number(form.insulin);
    const pregnancies = Number(form.pregnancies);

    const diabetesScore =
      glucose * 0.4 +
      bmi * 0.3 +
      insulin * 0.2 +
      pregnancies * 0.1;

    const diabetesRisk =
      diabetesScore > 120 ? "High Risk" : "Low Risk";

    const heartScore =
      age * 0.2 +
      cholesterol * 0.3 +
      bp * 0.2 +
      heartRate * 0.2 +
      bmi * 0.1;

    const heartRisk =
      heartScore > 130 ? "High Risk" : "Low Risk";

    const hypertension =
      bp > 140 ? "Positive" : "Normal";

    const resultData = {
      ...form,
      diabetesRisk,
      heartRisk,
      hypertension,
    };

    /* Save patient history */
    localStorage.setItem("patientData", JSON.stringify(resultData));

    onResult(resultData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">

      <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-6">
        AI Health Risk Assessment
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <InputField name="age" value={form.age} placeholder="Age" handleChange={handleChange} />

        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
          className="w-full p-3 rounded-xl border border-gray-300 bg-white text-black focus:ring-2 focus:ring-cyan-400"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <InputField name="glucose" value={form.glucose} placeholder="Glucose Level" handleChange={handleChange} />
        <InputField name="bmi" value={form.bmi} placeholder="BMI" handleChange={handleChange} />
        <InputField name="bp" value={form.bp} placeholder="Blood Pressure" handleChange={handleChange} />
        <InputField name="cholesterol" value={form.cholesterol} placeholder="Cholesterol" handleChange={handleChange} />
        <InputField name="heartRate" value={form.heartRate} placeholder="Heart Rate" handleChange={handleChange} />
        <InputField name="insulin" value={form.insulin} placeholder="Insulin Level" handleChange={handleChange} />

        <InputField
          name="pregnancies"
          value={form.pregnancies}
          placeholder="Number of Pregnancies"
          handleChange={handleChange}
          extra="md:col-span-2"
        />

      </div>

      <button
        type="submit"
        className="w-full mt-6 py-3 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 shadow-lg transition duration-300"
      >
        Check Risk
      </button>

    </form>
  );
}