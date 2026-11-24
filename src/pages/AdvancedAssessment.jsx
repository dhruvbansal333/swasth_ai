import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import RiskBadge from "../components/RiskBadge";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Edit2,
  Sparkles,
  ArrowRight,
  FileCheck,
  RotateCcw,
  BarChart3,
  BookOpen,
  AlertCircle
} from "lucide-react";

export default function AdvancedAssessment() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Extracted or manual biomarkers state for patient review & verification
  const [biomarkers, setBiomarkers] = useState({
    glucose: "",
    hba1c: "",
    cholesterol: "",
    hdl: "",
    ldl: "",
    triglycerides: "",
    bp: "",
    diaBP: "",
    hemoglobin: "",
    creatinine: "",
    age: "",
    gender: "Male",
    bmi: ""
  });

  const [extractedMeta, setExtractedMeta] = useState({});
  const [extractionCompleted, setExtractionCompleted] = useState(false);
  const [result, setResult] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError("");
      setNotice("");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setNotice("");
    }
  };

  const handleExtract = async (e) => {
    if (e) e.preventDefault();
    if (!file) {
      setError("Please select a laboratory report document (PDF, TXT, or clear image) first.");
      return;
    }

    setExtracting(true);
    setError("");
    setNotice("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.extractReport(formData);

      if (res.extractedBiomarkers) {
        const updated = { ...biomarkers };
        const extracted = res.extractedBiomarkers;
        setExtractedMeta(extracted);

        if (extracted.glucose_fasting) updated.glucose = extracted.glucose_fasting.value;
        else if (extracted.glucose_random) updated.glucose = extracted.glucose_random.value;

        if (extracted.hba1c) updated.hba1c = extracted.hba1c.value;
        if (extracted.cholesterol_total) updated.cholesterol = extracted.cholesterol_total.value;
        if (extracted.cholesterol_hdl) updated.hdl = extracted.cholesterol_hdl.value;
        if (extracted.cholesterol_ldl) updated.ldl = extracted.cholesterol_ldl.value;
        if (extracted.triglycerides) updated.triglycerides = extracted.triglycerides.value;
        if (extracted.blood_pressure_systolic) updated.bp = extracted.blood_pressure_systolic.value;
        if (extracted.blood_pressure_diastolic) updated.diaBP = extracted.blood_pressure_diastolic.value;
        if (extracted.hemoglobin) updated.hemoglobin = extracted.hemoglobin.value;
        if (extracted.creatinine) updated.creatinine = extracted.creatinine.value;

        setBiomarkers(updated);
        setExtractionCompleted(true);
        if (res.notice) setNotice(res.notice);
      }
    } catch (err) {
      setError(err.message || "Failed to extract data from report document.");
    } finally {
      setExtracting(false);
    }
  };

  const handleBiomarkerChange = (e) => {
    setBiomarkers({
      ...biomarkers,
      [e.target.name]: e.target.value
    });
  };

  const handleRunAssessment = async (e) => {
    e.preventDefault();
    if (!biomarkers.age) {
      setError("Please enter the patient's age to calibrate the epidemiological risk models.");
      return;
    }

    setPredicting(true);
    setError("");

    try {
      const payload = {
        age: biomarkers.age ? parseFloat(biomarkers.age) : undefined,
        gender: biomarkers.gender,
        sex: biomarkers.gender === "Male" ? 1 : 0,
        bmi: biomarkers.bmi ? parseFloat(biomarkers.bmi) : undefined,
        bp: biomarkers.bp ? parseFloat(biomarkers.bp) : undefined,
        sysBP: biomarkers.bp ? parseFloat(biomarkers.bp) : undefined,
        diaBP: biomarkers.diaBP ? parseFloat(biomarkers.diaBP) : undefined,
        glucose: biomarkers.glucose ? parseFloat(biomarkers.glucose) : undefined,
        cholesterol: biomarkers.cholesterol ? parseFloat(biomarkers.cholesterol) : undefined,
        hba1c: biomarkers.hba1c ? parseFloat(biomarkers.hba1c) : undefined,
        hdl: biomarkers.hdl ? parseFloat(biomarkers.hdl) : undefined,
        ldl: biomarkers.ldl ? parseFloat(biomarkers.ldl) : undefined,
        triglycerides: biomarkers.triglycerides ? parseFloat(biomarkers.triglycerides) : undefined
      };

      const res = await api.predictAdvanced(payload);
      if (res.results) {
        setResult(res.results);
      } else {
        throw new Error("No evaluation returned from server.");
      }
    } catch (err) {
      setError(err.message || "Assessment evaluation failed.");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5" />
            <span>Path B: Diagnostic Lab Report Parsing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Laboratory Report Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Upload your laboratory blood test document (PDF, TXT, or scan) or enter verified lab readings. All extracted figures are verified by you before executing the AI models.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Notice banner */}
        {notice && (
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2.5">
            <Info className="h-4 w-4 shrink-0 text-cyan-400" />
            <span>{notice}</span>
          </div>
        )}

        {/* Results View */}
        {result ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Overall synthesis */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Advanced Diagnostic Synthesis
                    </span>
                    <h2 className="text-2xl font-black text-white">
                      {result.overall.tier}
                    </h2>
                  </div>
                </div>
                <RiskBadge tier={result.overall.tier} probability={result.overall.averageProbability} size="lg" />
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {result.overall.summary}
              </p>

              {/* Abnormal biomarkers */}
              {result.overall.abnormalBiomarkers && result.overall.abnormalBiomarkers.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" /> Out-of-Range Clinical Biomarkers
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.overall.abnormalBiomarkers.map((b, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/20 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-white block">{b.biomarker}: {b.value}</span>
                          <span className="text-[10px] text-slate-400">Reference: {b.reference}</span>
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

            {/* 3 Disease Scorecards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Diabetes */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type 2 Diabetes</span>
                    <RiskBadge tier={result.diseases.diabetes.riskTier} probability={result.diseases.diabetes.probability} />
                  </div>
                  <div className="text-3xl font-black text-white font-mono mb-1">
                    {result.diseases.diabetes.percentage}%
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{result.diseases.diabetes.description}</p>
                  
                  <div className="space-y-1.5 border-t border-slate-800 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Lab Values Used:</span>
                    <div className="flex flex-wrap gap-1">
                      {result.diseases.diabetes.featuresUsed.map((f, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 font-semibold border border-blue-500/20">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
                  Model: {result.diseases.diabetes.modelInfo || "Calibrated Random Forest"}
                </div>
              </div>

              {/* Heart */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Coronary CAD</span>
                    <RiskBadge tier={result.diseases.heart.riskTier} probability={result.diseases.heart.probability} />
                  </div>
                  <div className="text-3xl font-black text-white font-mono mb-1">
                    {result.diseases.heart.percentage}%
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{result.diseases.heart.description}</p>

                  <div className="space-y-1.5 border-t border-slate-800 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Lab Values Used:</span>
                    <div className="flex flex-wrap gap-1">
                      {result.diseases.heart.featuresUsed.map((f, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 font-semibold border border-rose-500/20">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
                  Model: {result.diseases.heart.modelInfo || "Calibrated Logistic Regression"}
                </div>
              </div>

              {/* Hypertension */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hypertension</span>
                    <RiskBadge tier={result.diseases.hypertension.riskTier} probability={result.diseases.hypertension.probability} />
                  </div>
                  <div className="text-3xl font-black text-white font-mono mb-1">
                    {result.diseases.hypertension.percentage}%
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{result.diseases.hypertension.description}</p>

                  <div className="space-y-1.5 border-t border-slate-800 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Lab Values Used:</span>
                    <div className="flex flex-wrap gap-1">
                      {result.diseases.hypertension.featuresUsed.map((f, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
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
                <span>Modify Lab Values</span>
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
          /* Report Input View */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
            
            {/* Upload Drag & Drop Area */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Step 1: Upload Diagnostic Laboratory Report (PDF, TXT, or Image)
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all ${
                  dragActive
                    ? "border-cyan-400 bg-cyan-500/10"
                    : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                }`}
              >
                <UploadCloud className="h-10 w-10 text-cyan-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-white">
                  {file ? file.name : "Drag & drop your diagnostic report or click to browse"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supported: PDF laboratory slips, text test results, clear medical scans (Max 15MB)
                </p>
                <input
                  type="file"
                  id="report-file"
                  accept=".pdf,.txt,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="mt-5 flex items-center justify-center gap-3">
                  <label
                    htmlFor="report-file"
                    className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition"
                  >
                    Select File
                  </label>
                  {file && (
                    <button
                      type="button"
                      onClick={handleExtract}
                      disabled={extracting}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition shadow-md disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {extracting ? (
                        <>
                          <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Extracting Biomarkers...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Parse & Extract Biomarkers</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Extracted Biomarker Indicators */}
            {extractionCompleted && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Biomarkers Successfully Extracted
                  </span>
                  <span className="text-[11px] text-slate-400">Document: {file?.name}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(extractedMeta).map(([k, v]) => (
                    <span
                      key={k}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]"
                    >
                      {v.label}: <b className="text-white">{v.value} {v.unit}</b>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Table */}
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-emerald-400" />
                    <span>Step 2: Review, Confirm & Edit Clinical Readings</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Confirm that values match your laboratory slip. You can edit any figure directly.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Patient Age (Years) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    name="age"
                    placeholder="e.g. 52"
                    value={biomarkers.age}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Age in completed years.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Biological Sex <span className="text-rose-400">*</span>
                  </label>
                  <select
                    name="gender"
                    value={biomarkers.gender}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Epidemiological cohort mapping.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">BMI (kg/m²)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="bmi"
                    placeholder="e.g. 24.5"
                    value={biomarkers.bmi}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Reference: 18.5 - 24.9.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Blood Glucose (mg/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="glucose"
                    placeholder="e.g. 98"
                    value={biomarkers.glucose}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Fasting target: &lt;100 mg/dL.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">HbA1c (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="hba1c"
                    placeholder="e.g. 5.4"
                    value={biomarkers.hba1c}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Target: &lt;5.7% (normal).</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Total Cholesterol (mg/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="cholesterol"
                    placeholder="e.g. 195"
                    value={biomarkers.cholesterol}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Desirable: &lt;200 mg/dL.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Systolic Blood Pressure (mmHg)
                  </label>
                  <input
                    type="number"
                    name="bp"
                    placeholder="e.g. 120"
                    value={biomarkers.bp}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Optimal: &lt;120 mmHg.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Diastolic Blood Pressure (mmHg)
                  </label>
                  <input
                    type="number"
                    name="diaBP"
                    placeholder="e.g. 80"
                    value={biomarkers.diaBP}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Optimal: &lt;80 mmHg.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    HDL Cholesterol (mg/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="hdl"
                    placeholder="e.g. 52"
                    value={biomarkers.hdl}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Protective: &gt;50 mg/dL.</span>
                </div>
              </div>
            </div>

            {/* Confirm & Execute Button */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Confirm laboratory readings before running calibrated prediction pipelines.
              </span>
              <button
                type="button"
                onClick={handleRunAssessment}
                disabled={predicting}
                className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-500/25 transition flex items-center gap-2 disabled:opacity-50"
              >
                {predicting ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating Calibrated Models...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-cyan-200" />
                    <span>Run Advanced Assessment</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
