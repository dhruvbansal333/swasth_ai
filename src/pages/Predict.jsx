import { useState, useEffect } from "react";
import RiskForm from "../components/RiskForm";
import ResultCard from "../components/ResultCard";

export default function Predict() {

  const [result, setResult] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("patientData");
    if (saved) setHasPrevious(true);
  }, []);

  const loadPrevious = () => {
    const saved = JSON.parse(localStorage.getItem("patientData"));

    if (!saved) return;

    const age = Number(saved.age);
    const glucose = Number(saved.glucose);
    const bmi = Number(saved.bmi);
    const bp = Number(saved.bp);
    const cholesterol = Number(saved.cholesterol);
    const heartRate = Number(saved.heartRate);
    const insulin = Number(saved.insulin);
    const pregnancies = Number(saved.pregnancies);

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

    setResult({
      ...saved,
      diabetesRisk,
      heartRisk,
      hypertension
    });

    setShowForm(true);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200 px-4 overflow-hidden">

      {!showForm ? (

        /* START SCREEN */
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-10 border border-white/40 shadow-xl text-center max-w-xl w-full">

          <h1 className="text-3xl font-bold mb-6 text-blue-700">
            Patient Risk Assessment
          </h1>

          {hasPrevious && (
            <button
              onClick={loadPrevious}
              className="w-full mb-4 py-3 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition"
            >
              Continue Previous Assessment
            </button>
          )}

          <button
            onClick={() => {
              localStorage.removeItem("patientData");
              setShowForm(true);
            }}
            className="w-full py-3 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 transition"
          >
            Start New Assessment
          </button>

        </div>

      ) : (

        /* FORM CONTAINER */
        <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-xl">
          <RiskForm onResult={setResult} />
        </div>

      )}

      {/* RESULT POPUP */}
      {result && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">

          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-4xl w-full relative">

            <button
              onClick={() => setResult(null)}
              className="absolute top-4 right-6 text-gray-500 text-2xl hover:text-black"
            >
              ✕
            </button>

            <ResultCard result={result} />

          </div>

        </div>
      )}

    </div>
  );
}