import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  ShieldCheck,
  RotateCcw,
  BarChart3,
  BookOpen,
  AlertCircle
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
    cp: "none", // Chest pain
    exang: "0", // Exercise angina
    fbs: "0",
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

  // BMI Category interpretation
  const bmiCategory = useMemo(() => {
    const val = parseFloat(activeBMI);
    if (!val) return null;
    if (val < 18.5) return { label: "Underweight", color: "text-amber-400" };
    if (val < 25.0) return { label: "Normal Weight", color: "text-emerald-400" };
    if (val < 30.0) return { label: "Overweight", color: "text-amber-400" };
    return { label: "Obese Tier", color: "text-rose-400" };
  }, [activeBMI]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError("");

    // Step 1 basic validation
    if (step === 1) {
      if (!form.age) {
        setError("Please enter your age.");
        return;
      }
      const ageNum = parseInt(form.age);
      if (ageNum < 1 || ageNum > 120) {
        setError("Please enter a valid clinical age (1-120 years).");
        return;
      }
    }

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
        pregnancies: form.gender === "Female" && form.pregnancies ? parseFloat(form.pregnancies) : 0,
        smoker: parseInt(form.smoker || 0),
        cp: form.cp || "none",
        exang: form.exang || "0",
        fbs: form.fbs ? parseInt(form.fbs) : undefined
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

  const stepsInfo = [
    { num: 1, title: "Demographics & Body", desc: "Age, sex, height, weight, BMI" },
    { num: 2, title: "Vitals & Metabolic", desc: "Blood pressure, glucose, lipids" },
    { num: 3, title: "Cardiac & Lifestyle", desc: "Heart rate, smoking, symptoms" },
    { num: 4, title: "Review & Run", desc: "Verify parameters & execute AI" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Heart className="h-3.5 w-3.5 text-cyan-400" />
            <span>Path A: Non-Laboratory Guided Assessment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Basic Health Risk Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Evaluate your multi-disease statistical risk profile across Diabetes, Coronary Heart Disease, and Hypertension using daily vitals and clinical anthropometry.
          </p>
        </div>

        {/* Step Indicator */}
        {!result && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stepsInfo.map((s) => {
                const isCurrent = step === s.num;
                const isDone = step > s.num;
                return (
                  <div
                    key={s.num}
                    className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                      isCurrent
                        ? "bg-slate-800 border border-cyan-500/30 text-white"
                        : isDone
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isDone
                          ? "bg-emerald-500 text-slate-950"
                          : isCurrent
                          ? "bg-cyan-500 text-slate-950"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{s.title}</p>
                      <p className="text-[10px] text-slate-400 hidden sm:block truncate">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Result Dashboard */}
        {result ? (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Overall Composite Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-cyan-400">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Overall Health Composite Stratification
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white">{result.overall.tier}</h2>
                  </div>
                </div>
                <RiskBadge tier={result.overall.tier} probability={result.overall.averageProbability} size="lg" />
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {result.overall.summary}
              </p>

              {/* Warnings / Abnormal Biomarkers */}
              {result.overall.abnormalBiomarkers && result.overall.abnormalBiomarkers.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" /> Clinical Reference Alerts
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.overall.abnormalBiomarkers.map((b, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/20 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-white block">{b.biomarker}: {b.value}</span>
                          <span className="text-[10px] text-slate-400">Optimal: {b.reference}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3 Disease Prediction Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Diabetes Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type 2 Diabetes</span>
                    <RiskBadge tier={result.diseases.diabetes.riskTier} probability={result.diseases.diabetes.probability} />
                  </div>
                  <div className="text-3xl font-black text-white font-mono mb-1">
                    {result.diseases.diabetes.percentage}%
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{result.diseases.diabetes.description}</p>

                  <div className="space-y-2 border-t border-slate-800/80 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Influencing Factors</span>
                    {result.diseases.diabetes.factors && result.diseases.diabetes.factors.length > 0 ? (
                      result.diseases.diabetes.factors.map((f, i) => (
                        <div key={i} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                          <span className="font-semibold text-slate-200 block">{f.factor}</span>
                          <span className="text-slate-400 text-[10px]">{f.note}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">Parameters within population standard baseline.</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500">
                  Model: {result.diseases.diabetes.modelInfo || "Calibrated Random Forest"}
                </div>
              </div>

              {/* Heart Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Coronary CAD</span>
                    <RiskBadge tier={result.diseases.heart.riskTier} probability={result.diseases.heart.probability} />
                  </div>
                  <div className="text-3xl font-black text-white font-mono mb-1">
                    {result.diseases.heart.percentage}%
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{result.diseases.heart.description}</p>

                  <div className="space-y-2 border-t border-slate-800/80 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Influencing Factors</span>
                    {result.diseases.heart.factors && result.diseases.heart.factors.length > 0 ? (
                      result.diseases.heart.factors.map((f, i) => (
                        <div key={i} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                          <span className="font-semibold text-slate-200 block">{f.factor}</span>
                          <span className="text-slate-400 text-[10px]">{f.note}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">Parameters within population standard baseline.</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500">
                  Model: {result.diseases.heart.modelInfo || "Calibrated Logistic Regression"}
                </div>
              </div>

              {/* Hypertension Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hypertension</span>
                    <RiskBadge tier={result.diseases.hypertension.riskTier} probability={result.diseases.hypertension.probability} />
                  </div>
                  <div className="text-3xl font-black text-white font-mono mb-1">
                    {result.diseases.hypertension.percentage}%
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{result.diseases.hypertension.description}</p>

                  <div className="space-y-2 border-t border-slate-800/80 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Influencing Factors</span>
                    {result.diseases.hypertension.factors && result.diseases.hypertension.factors.length > 0 ? (
                      result.diseases.hypertension.factors.map((f, i) => (
                        <div key={i} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                          <span className="font-semibold text-slate-200 block">{f.factor}</span>
                          <span className="text-slate-400 text-[10px]">{f.note}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">Parameters within population standard baseline.</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500">
                  Model: {result.diseases.hypertension.modelInfo || "Framingham Calibrated Random Forest"}
                </div>
              </div>

            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setResult(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Modify Assessment</span>
              </button>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => navigate("/analytics")}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>View Analytics</span>
                </button>
                <button
                  onClick={() => navigate("/guidance")}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Health Companion</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Multi-Step Input Wizard */
          <form onSubmit={step === 4 ? handleSubmit : handleNext} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            
            {/* Step 1: Demographics & Anthropometry */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Step 1: Demographics & Physical Anthropometry</h3>
                  <p className="text-xs text-slate-400">Baseline physiological characteristics utilized across all models.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Age (Years) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      name="age"
                      placeholder="e.g. 35"
                      value={form.age}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Age in complete years.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Biological Sex <span className="text-rose-400">*</span>
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Used for cohort risk stratification.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="250"
                      name="height_cm"
                      placeholder="e.g. 175"
                      value={form.height_cm}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Used to automatically compute BMI.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      min="20"
                      max="300"
                      name="weight_kg"
                      placeholder="e.g. 70"
                      value={form.weight_kg}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Current body mass in kilograms.</span>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-300 block">Computed Body Mass Index (BMI)</span>
                        <span className="text-[11px] text-slate-500">Normal clinical range: 18.5 – 24.9 kg/m²</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-cyan-400 font-mono block">
                          {activeBMI || "--"}
                        </span>
                        {bmiCategory && (
                          <span className={`text-[10px] font-bold ${bmiCategory.color}`}>
                            {bmiCategory.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {form.gender === "Female" && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Number of Pregnancies
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        name="pregnancies"
                        placeholder="e.g. 0"
                        value={form.pregnancies}
                        onChange={handleChange}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Gestational factor utilized in Pima diabetes model.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Vitals & Metabolic */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Step 2: Vitals & Metabolic Biomarkers</h3>
                  <p className="text-xs text-slate-400">Resting blood pressure and metabolic laboratory indices.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
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
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Upper reading (optimal: &lt;120 mmHg).</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
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
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Lower reading (optimal: &lt;80 mmHg).</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
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
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Fasting target: &lt;100 mg/dL | Pre-diabetic: 100-125.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Serum Total Cholesterol (mg/dL)
                    </label>
                    <input
                      type="number"
                      min="80"
                      max="550"
                      name="cholesterol"
                      placeholder="e.g. 185 (optional)"
                      value={form.cholesterol}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Desirable target: &lt;200 mg/dL.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0 text-cyan-400" />
                  <span>Unentered laboratory numbers are safely estimated using clinical median imputation without inserting arbitrary zeroes.</span>
                </div>
              </div>
            )}

            {/* Step 3: Cardiac & Lifestyle */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Step 3: Cardiac & Lifestyle Indicators</h3>
                  <p className="text-xs text-slate-400">Cardiovascular symptom screening and lifestyle factors.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Resting Heart Rate (BPM)
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="160"
                      name="heartRate"
                      placeholder="e.g. 72"
                      value={form.heartRate}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Resting pulse (normal: 60-100 bpm). Maximum exercise heart rate is modeled using clinical Tanaka formula.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Smoking History</label>
                    <select
                      name="smoker"
                      value={form.smoker}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="0">Non-Smoker</option>
                      <option value="1">Current Regular Smoker</option>
                    </select>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Smoked regularly within past 12 months.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Chest Discomfort Pattern</label>
                    <select
                      name="cp"
                      value={form.cp}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="none">No Chest Discomfort / Asymptomatic (Screening)</option>
                      <option value="nap">Non-Anginal Discomfort (Fleeting / Musculoskeletal)</option>
                      <option value="ata">Atypical Angina (Stabbing, non-exertional)</option>
                      <option value="ta">Typical Angina (Heavy exertional pressure / tightness)</option>
                      <option value="silent_ischemia">Known Silent Ischemia / Prior Cardiac Referral</option>
                    </select>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">General screening users without chest pain should choose No Chest Discomfort.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Exercise-Induced Chest Pain</label>
                    <select
                      name="exang"
                      value={form.exang}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="0">No discomfort provoked during exertion / exercise</option>
                      <option value="1">Yes, experiences chest tightness or dyspnea on exertion</option>
                    </select>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Exertional tightness indicates potential coronary insufficiency.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review Screen */}
            {step === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Step 4: Clinical Review & Confirmation</h3>
                  <p className="text-xs text-slate-400">Review entered vitals before running calibrated ML predictions.</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Age & Sex</span>
                    <b className="text-white font-mono">{form.age || "Not entered"} yrs, {form.gender}</b>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">BMI Index</span>
                    <b className="text-cyan-400 font-mono">{activeBMI || "Not calculated"} kg/m²</b>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Blood Pressure</span>
                    <b className="text-white font-mono">{form.bp ? `${form.bp} / ${form.diaBP || "est"} mmHg` : "Not entered"}</b>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Blood Glucose</span>
                    <b className="text-white font-mono">{form.glucose ? `${form.glucose} mg/dL` : "Not entered"}</b>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Total Cholesterol</span>
                    <b className="text-white font-mono">{form.cholesterol ? `${form.cholesterol} mg/dL` : "Not entered"}</b>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Resting Pulse</span>
                    <b className="text-white font-mono">{form.heartRate ? `${form.heartRate} bpm` : "Not entered"}</b>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Smoking Status</span>
                    <b className="text-white">{form.smoker === "1" ? "Active Smoker" : "Non-Smoker"}</b>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Chest Pain Classification</span>
                    <b className="text-white capitalize">{form.cp.replace("_", " ")}</b>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Exertional Angina</span>
                    <b className="text-white">{form.exang === "1" ? "Yes" : "No"}</b>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Models executing:</span>
                  <span className="font-mono text-cyan-400 font-semibold text-[11px]">
                    NIDDK RF + UCI Logistic Reg + Framingham RF
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                disabled={loading}
                className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Executing ML Models...</span>
                  </>
                ) : step === 4 ? (
                  <>
                    <Sparkles className="h-4 w-4 text-cyan-200" />
                    <span>Run Calibrated Prediction</span>
                  </>
                ) : (
                  <>
                    <span>Next Step</span>
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
