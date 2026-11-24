import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import RiskBadge from "../components/RiskBadge";
import {
  Heart,
  Activity,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  ShieldCheck
} from "lucide-react";

export default function BasicAssessment() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Patient inputs
  const [form, setForm] = useState({
    // Step 1: Demographics & Anthropometry
    age: "",
    gender: "Male",
    height_cm: "",
    weight_kg: "",
    bmi: "",
    pregnancies: "",

    // Step 2: Vitals & Metabolic
    bp: "", // Systolic BP
    diaBP: "", // Diastolic BP
    glucose: "",
    cholesterol: "",

    // Step 3: Cardiac & Lifestyle
    heartRate: "",
    smoker: "0",
    physicalActivity: "1",
    cp: "ASY", // Chest pain
    exang: "0", // Exercise angina
    fbs: "0",

    // Step 4: Symptoms (Optional context)
    symptoms: []
  });

  // Auto-calculate BMI when height and weight are provided
  const calculatedBMI = useMemo(() => {
    const h = parseFloat(form.height_cm);
    const w = parseFloat(form.weight_kg);
    if (h > 50 && w > 20) {
      const heightInMeters = h / 100.0;
      return (w / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return "";
  }, [form.height_cm, form.weight_kg]);

  const activeBMI = form.bmi || calculatedBMI;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError("");
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Build clean payload without biological zeroes
      const payload = {
        age: form.age ? parseFloat(form.age) : undefined,
        gender: form.gender,
        sex: form.gender === "Male" ? 1 : 0,
        bmi: activeBMI ? parseFloat(activeBMI) : undefined,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : undefined,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        bp: form.bp ? parseFloat(form.bp) : undefined,
        sysBP: form.bp ? parseFloat(form.bp) : undefined,
        diaBP: form.diaBP ? parseFloat(form.diaBP) : undefined,
        glucose: form.glucose ? parseFloat(form.glucose) : undefined,
        cholesterol: form.cholesterol ? parseFloat(form.cholesterol) : undefined,
        heartRate: form.heartRate ? parseFloat(form.heartRate) : undefined,
        thalach: form.heartRate ? parseFloat(form.heartRate) : undefined,
        pregnancies: form.gender === "Female" && form.pregnancies ? parseFloat(form.pregnancies) : 0,
        smoker: parseInt(form.smoker || 0),
        cp: form.cp || "ASY",
        exang: form.exang || "0",
        fbs: form.fbs ? parseInt(form.fbs) : 0
      };

      const res = await api.predictBasic(payload);
      if (res.results) {
        setResult(res.results);
      } else {
        throw new Error("No evaluation returned from server.");
      }
    } catch (err) {
      setError(err.message || "Failed to generate risk assessment. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Heart className="h-3.5 w-3.5 text-blue-600" />
            <span>Section A: Basic Clinical Assessment</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Patient Health Risk Wizard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-1">
            Fill in your known vitals and physical information. Fields you do not know can be left blank — the system uses population medians without forcing false zeroes.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        {!result && (
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-xl mx-auto mb-2">
              {["Demographics", "Vitals & Sugar", "Cardiac & Habits", "Review"].map((label, idx) => {
                const stepNum = idx + 1;
                const isCurrent = step === stepNum;
                const isDone = step > stepNum;
                return (
                  <div key={label} className="flex flex-col items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-100"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : stepNum}
                    </div>
                    <span className={`text-[11px] font-medium mt-1 ${isCurrent ? "text-blue-700 font-bold" : "text-slate-400"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden max-w-xl mx-auto">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Assessment Result View */}
        {result ? (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Overall Health Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Overall Clinical Synthesis
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    {result.overall.tier}
                  </h2>
                </div>
                <RiskBadge tier={result.overall.tier} probability={result.overall.averageProbability} size="lg" />
              </div>

              <p className="text-sm text-slate-700 mt-4 leading-relaxed">
                {result.overall.summary}
              </p>

              {result.overall.warnings && result.overall.warnings.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                  <span className="font-bold block">Input Notice / Out of Expected Range:</span>
                  {result.overall.warnings.map((w, i) => (
                    <li key={i} className="list-disc ml-4">{w}</li>
                  ))}
                </div>
              )}
            </div>

            {/* 3 Disease Scorecards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Diabetes Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Diabetes Risk</span>
                    <RiskBadge tier={result.diseases.diabetes.riskTier} probability={result.diseases.diabetes.probability} />
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">
                    {result.diseases.diabetes.percentage}%
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{result.diseases.diabetes.description}</p>

                  {/* Factor Breakdown */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Influencing Factors</span>
                    {result.diseases.diabetes.factors.length > 0 ? (
                      result.diseases.diabetes.factors.map((f, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                          <span className="font-semibold text-slate-800 block">{f.factor}</span>
                          <span className="text-slate-500 text-[10px]">{f.note}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Within standard parameters.</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                  Model: Calibrated Random Forest
                </div>
              </div>

              {/* Heart Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Heart Disease</span>
                    <RiskBadge tier={result.diseases.heart.riskTier} probability={result.diseases.heart.probability} />
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">
                    {result.diseases.heart.percentage}%
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{result.diseases.heart.description}</p>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Influencing Factors</span>
                    {result.diseases.heart.factors.length > 0 ? (
                      result.diseases.heart.factors.map((f, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                          <span className="font-semibold text-slate-800 block">{f.factor}</span>
                          <span className="text-slate-500 text-[10px]">{f.note}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Within standard parameters.</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                  Model: Calibrated Logistic Regression
                </div>
              </div>

              {/* Hypertension Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Hypertension</span>
                    <RiskBadge tier={result.diseases.hypertension.riskTier} probability={result.diseases.hypertension.probability} />
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">
                    {result.diseases.hypertension.percentage}%
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{result.diseases.hypertension.description}</p>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Influencing Factors</span>
                    {result.diseases.hypertension.factors.length > 0 ? (
                      result.diseases.hypertension.factors.map((f, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                          <span className="font-semibold text-slate-800 block">{f.factor}</span>
                          <span className="text-slate-500 text-[10px]">{f.note}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Within standard parameters.</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                  Model: Framingham Clinical Random Forest
                </div>
              </div>

            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200">
              <button
                onClick={() => setResult(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Modify Assessment
              </button>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => navigate("/analytics")}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                >
                  View Analytics
                </button>
                <button
                  onClick={() => navigate("/guidance")}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
                >
                  View Health Companion Plan
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Multi-Step Input Form */
          <form onSubmit={step === 4 ? handleSubmit : handleNext} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg shadow-slate-100">
            
            {/* Step 1: Personal & Anthropometrics */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Step 1: Demographics & Body Metrics</h3>
                  <p className="text-xs text-slate-500">Essential baseline characteristics used by all clinical models.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Age <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      name="age"
                      placeholder="e.g. 45"
                      value={form.age}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Age in completed years.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Biological Sex <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Relevant for sex-specific cardiac & diabetes risk weighting.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      min="50"
                      max="250"
                      name="height_cm"
                      placeholder="e.g. 175"
                      value={form.height_cm}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Centimeters (used to calculate BMI).</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      min="20"
                      max="300"
                      step="0.1"
                      name="weight_kg"
                      placeholder="e.g. 72.5"
                      value={form.weight_kg}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Kilograms.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Body Mass Index (BMI) {calculatedBMI && <span className="text-blue-600 font-semibold">(Auto-calculated: {calculatedBMI})</span>}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="10"
                      max="75"
                      name="bmi"
                      placeholder={calculatedBMI || "e.g. 24.5"}
                      value={form.bmi}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Leave blank to use height/weight calculation.</span>
                  </div>

                  {form.gender === "Female" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Pregnancies (if applicable)</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        name="pregnancies"
                        placeholder="e.g. 1"
                        value={form.pregnancies}
                        onChange={handleChange}
                        className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Number of times pregnant (Pima diabetes feature).</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Vitals & Sugar */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Step 2: Blood Pressure & Glucose</h3>
                  <p className="text-xs text-slate-500">If you do not know a value, leave it empty. We never substitute 0 for medical vitals.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Systolic Blood Pressure (mmHg)
                    </label>
                    <input
                      type="number"
                      min="60"
                      max="260"
                      name="bp"
                      placeholder="e.g. 120"
                      value={form.bp}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Upper number of your blood pressure reading (normal: &lt;120).</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Diastolic Blood Pressure (mmHg)
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="160"
                      name="diaBP"
                      placeholder="e.g. 80"
                      value={form.diaBP}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Lower number of your blood pressure reading (normal: &lt;80).</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Blood Glucose / Sugar (mg/dL)
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="500"
                      name="glucose"
                      placeholder="e.g. 95 (Fasting) or 130 (Random)"
                      value={form.glucose}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Oral glucose tolerance / Fasting blood sugar level in mg/dL.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Serum Total Cholesterol (mg/dL)
                    </label>
                    <input
                      type="number"
                      min="80"
                      max="550"
                      name="cholesterol"
                      placeholder="e.g. 185 (leave blank if unknown)"
                      value={form.cholesterol}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Total serum cholesterol in mg/dL (desirable: &lt;200).</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-blue-800 text-xs flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0 text-blue-600" />
                  <span>Missing values will be safely estimated using clinical median imputation without bias.</span>
                </div>
              </div>
            )}

            {/* Step 3: Cardiac & Lifestyle */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Step 3: Cardiac & Lifestyle Indicators</h3>
                  <p className="text-xs text-slate-500">Lifestyle factors incorporated in Framingham and UCI cardiac models.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Resting Heart Rate (BPM)
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="220"
                      name="heartRate"
                      placeholder="e.g. 72"
                      value={form.heartRate}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Beats per minute at rest.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Smoking Status</label>
                    <select
                      name="smoker"
                      value={form.smoker}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="0">Non-Smoker</option>
                      <option value="1">Current Smoker</option>
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Smoked within the past 12 months.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Chest Pain Pattern</label>
                    <select
                      name="cp"
                      value={form.cp}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="ASY">No pain / Asymptomatic</option>
                      <option value="ATA">Atypical Angina</option>
                      <option value="NAP">Non-Anginal Discomfort</option>
                      <option value="TA">Typical Angina (Heavy pressure)</option>
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">UCI Heart Failure chest pain classification.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Exercise Angina</label>
                    <select
                      name="exang"
                      value={form.exang}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="0">No chest discomfort during exercise</option>
                      <option value="1">Yes, experiences chest tightness on exertion</option>
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Chest tightness or shortness of breath while exercising.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Run Prediction */}
            {step === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Step 4: Review Clinical Input Summary</h3>
                  <p className="text-xs text-slate-500">Confirm entered details before executing the calibrated prediction pipelines.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div><span className="text-slate-400 block">Age:</span> <b className="text-slate-900">{form.age || "Not specified"} years</b></div>
                  <div><span className="text-slate-400 block">Sex:</span> <b className="text-slate-900">{form.gender}</b></div>
                  <div><span className="text-slate-400 block">BMI:</span> <b className="text-slate-900">{activeBMI || "Not calculated"}</b></div>
                  <div><span className="text-slate-400 block">Blood Pressure:</span> <b className="text-slate-900">{form.bp ? `${form.bp} / ${form.diaBP || "-"} mmHg` : "Not entered"}</b></div>
                  <div><span className="text-slate-400 block">Glucose:</span> <b className="text-slate-900">{form.glucose ? `${form.glucose} mg/dL` : "Not entered"}</b></div>
                  <div><span className="text-slate-400 block">Cholesterol:</span> <b className="text-slate-900">{form.cholesterol ? `${form.cholesterol} mg/dL` : "Not entered"}</b></div>
                  <div><span className="text-slate-400 block">Heart Rate:</span> <b className="text-slate-900">{form.heartRate ? `${form.heartRate} bpm` : "Not entered"}</b></div>
                  <div><span className="text-slate-400 block">Smoker:</span> <b className="text-slate-900">{form.smoker === "1" ? "Yes" : "No"}</b></div>
                  <div><span className="text-slate-400 block">Chest Pain:</span> <b className="text-slate-900">{form.cp}</b></div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Transparent Validation: </span>
                    Your inputs will be evaluated against all three disease models (Diabetes, Heart Disease, Hypertension). Results will clearly state which inputs were utilized and provide risk stratification with probability estimates.
                  </div>
                </div>
              </div>
            )}

            {/* Form Nav Buttons */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              ) : <div />}

              <button
                type="submit"
                disabled={loading}
                className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 transition flex items-center gap-1.5"
              >
                {loading ? (
                  <span>Evaluating Clinical Models...</span>
                ) : step === 4 ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Run Health Risk Assessment</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Step {step + 1}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
