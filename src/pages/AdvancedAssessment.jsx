import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  FileCheck
} from "lucide-react";

export default function AdvancedAssessment() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'manual'
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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

  const [extractionCompleted, setExtractionCompleted] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setNotice("");
    }
  };

  const handleExtract = async (e) => {
    e.preventDefault();
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
      }
    } catch (err) {
      setError(err.message || "Assessment evaluation failed.");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="h-3.5 w-3.5 text-indigo-600" />
            <span>Section B: Advanced Medical Report Assessment</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Diagnostic Lab Report Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-1">
            Upload your laboratory test document (PDF, TXT, or scan) or enter verified hospital lab readings. All extracted figures are reviewed and confirmed by you before running the AI models.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Notice banner */}
        {notice && (
          <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-blue-600" />
            <span>{notice}</span>
          </div>
        )}

        {/* Results View */}
        {result ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Overall synthesis */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Advanced Multi-Marker Synthesis
                  </span>
                  <h2 className="text-2xl font-black text-slate-900">
                    {result.overall.tier}
                  </h2>
                </div>
                <RiskBadge tier={result.overall.tier} probability={result.overall.averageProbability} size="lg" />
              </div>

              <p className="text-sm text-slate-700 mt-4 leading-relaxed">
                {result.overall.summary}
              </p>
            </div>

            {/* 3 Disease Scorecards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Diabetes */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Diabetes Risk</span>
                    <RiskBadge tier={result.diseases.diabetes.riskTier} probability={result.diseases.diabetes.probability} />
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">
                    {result.diseases.diabetes.percentage}%
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{result.diseases.diabetes.description}</p>
                  
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Lab Values Used:</span>
                    <div className="flex flex-wrap gap-1">
                      {result.diseases.diabetes.featuresUsed.map((f, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                  Model: Calibrated Random Forest
                </div>
              </div>

              {/* Heart */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Heart Disease</span>
                    <RiskBadge tier={result.diseases.heart.riskTier} probability={result.diseases.heart.probability} />
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">
                    {result.diseases.heart.percentage}%
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{result.diseases.heart.description}</p>

                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Lab Values Used:</span>
                    <div className="flex flex-wrap gap-1">
                      {result.diseases.heart.featuresUsed.map((f, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                  Model: Calibrated Logistic Regression
                </div>
              </div>

              {/* Hypertension */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Hypertension</span>
                    <RiskBadge tier={result.diseases.hypertension.riskTier} probability={result.diseases.hypertension.probability} />
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">
                    {result.diseases.hypertension.percentage}%
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{result.diseases.hypertension.description}</p>

                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Lab Values Used:</span>
                    <div className="flex flex-wrap gap-1">
                      {result.diseases.hypertension.featuresUsed.map((f, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                  Model: Framingham Clinical Random Forest
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200">
              <button
                onClick={() => setResult(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Modify Lab Values
              </button>
              <button
                onClick={() => navigate("/analytics")}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
              >
                View Analytics & Trends
              </button>
            </div>
          </div>
        ) : (
          /* Report Input View */
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg shadow-slate-100 space-y-8">
            
            {/* Upload Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Step 1: Upload Diagnostic Laboratory Report (PDF or Scan)
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center transition bg-slate-50/50">
                <UploadCloud className="h-10 w-10 text-indigo-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-800">
                  {file ? file.name : "Drag & drop report or click to browse"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supported formats: PDF, TXT, PNG, JPG (Max 15MB)
                </p>
                <input
                  type="file"
                  id="report-file"
                  accept=".pdf,.txt,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="mt-4 flex items-center justify-center gap-3">
                  <label
                    htmlFor="report-file"
                    className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
                  >
                    Select File
                  </label>
                  {file && (
                    <button
                      type="button"
                      onClick={handleExtract}
                      disabled={extracting}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
                    >
                      {extracting ? "Extracting Biomarkers..." : "Parse & Extract"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Verification & Manual Table */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-emerald-600" />
                    <span>Step 2: Review, Confirm & Correct Laboratory Values</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Verify that values match your laboratory report. You can edit any figure directly.
                  </p>
                </div>
                {extractionCompleted && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Parsed from {file?.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Age <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    name="age"
                    placeholder="e.g. 52"
                    value={biomarkers.age}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Biological Sex <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={biomarkers.gender}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">BMI (kg/m²)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="bmi"
                    placeholder="e.g. 26.8"
                    value={biomarkers.bmi}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Blood Sugar / Glucose (mg/dL)
                  </label>
                  <input
                    type="number"
                    name="glucose"
                    placeholder="e.g. 110"
                    value={biomarkers.glucose}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Ref: 70 - 140 mg/dL</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    HbA1c (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="hba1c"
                    placeholder="e.g. 5.8"
                    value={biomarkers.hba1c}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Ref: 4.0 - 5.6 %</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Cholesterol (mg/dL)
                  </label>
                  <input
                    type="number"
                    name="cholesterol"
                    placeholder="e.g. 210"
                    value={biomarkers.cholesterol}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Ref: 125 - 200 mg/dL</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    HDL Cholesterol (Good)
                  </label>
                  <input
                    type="number"
                    name="hdl"
                    placeholder="e.g. 48"
                    value={biomarkers.hdl}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Ref: 40 - 60 mg/dL</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    LDL Cholesterol (Bad)
                  </label>
                  <input
                    type="number"
                    name="ldl"
                    placeholder="e.g. 130"
                    value={biomarkers.ldl}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Ref: 50 - 100 mg/dL</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Systolic Blood Pressure (mmHg)
                  </label>
                  <input
                    type="number"
                    name="bp"
                    placeholder="e.g. 128"
                    value={biomarkers.bp}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Ref: 90 - 120 mmHg</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Diastolic Blood Pressure (mmHg)
                  </label>
                  <input
                    type="number"
                    name="diaBP"
                    placeholder="e.g. 84"
                    value={biomarkers.diaBP}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Ref: 60 - 80 mmHg</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Serum Creatinine (mg/dL)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="creatinine"
                    placeholder="e.g. 0.9"
                    value={biomarkers.creatinine}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Ref: 0.6 - 1.2 mg/dL</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hemoglobin (g/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="hemoglobin"
                    placeholder="e.g. 14.2"
                    value={biomarkers.hemoglobin}
                    onChange={handleBiomarkerChange}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Ref: 12.0 - 17.5 g/dL</span>
                </div>
              </div>
            </div>

            {/* Run Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={handleRunAssessment}
                disabled={predicting || !biomarkers.age}
                className="px-8 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition flex items-center gap-2"
              >
                {predicting ? (
                  <span>Evaluating Calibrated Pipelines...</span>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Run Advanced Clinical Assessment</span>
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
