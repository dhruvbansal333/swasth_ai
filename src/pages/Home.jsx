import { Link } from "react-router-dom";
import {
  Heart,
  Activity,
  FileText,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  BarChart3,
  Stethoscope,
  Database,
  ChevronRight
} from "lucide-react";

export default function Home() {
  const diseases = [
    {
      name: "Type 2 Diabetes",
      badge: "Metabolic Risk",
      cohort: "Pima Indians NIDDK Cohort",
      desc: "Detects early dysglycemia, insulin resistance trends, and metabolic vulnerability using fasting/random glucose, BMI index, and physiological vitals.",
      algorithm: "Calibrated Random Forest",
      auc: "81.8% ROC-AUC",
      accuracy: "72.1% Accuracy",
      inputs: ["Fasting Glucose", "Diastolic BP", "BMI", "Age"],
      gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
      border: "border-blue-500/30",
      accent: "text-blue-400"
    },
    {
      name: "Coronary Heart Disease (CAD)",
      badge: "Cardiovascular Health",
      cohort: "UCI Multi-Center Cardiology Cohort (918 records)",
      desc: "Evaluates atherosclerotic coronary artery disease probability using resting systolic pressure, serum cholesterol, exertional symptoms, and stress dynamics.",
      algorithm: "Calibrated Logistic Regression",
      auc: "93.2% ROC-AUC",
      accuracy: "88.0% Accuracy",
      inputs: ["Resting Systolic BP", "Cholesterol", "Exercise Angina", "Max HR"],
      gradient: "from-rose-500/20 via-rose-500/5 to-transparent",
      border: "border-rose-500/30",
      accent: "text-rose-400"
    },
    {
      name: "Clinical Hypertension",
      badge: "Vascular Status",
      cohort: "Framingham Heart Study (4,240 records)",
      desc: "Determines current clinical hypertension status (Stage 1 / Stage 2 criteria) based on systolic and diastolic pressure, age, smoking status, and metabolic indices.",
      algorithm: "Calibrated Random Forest",
      auc: "95.2% ROC-AUC",
      accuracy: "89.4% Accuracy",
      inputs: ["Systolic BP", "Diastolic BP", "BMI", "Smoking Status"],
      gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
      border: "border-cyan-500/30",
      accent: "text-cyan-400"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 border-b border-slate-800/80">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/15 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Dynamic Version Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Production AI Clinical Engine v2.1.0</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-mono">Calibrated & Validated</span>
            </div>

            {/* Dynamic Animated Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.12]">
              Calibrated Machine Learning for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
                Preventive Health Intelligence
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal max-w-2xl mx-auto">
              Screen for <span className="text-white font-semibold">Type 2 Diabetes</span>,{" "}
              <span className="text-white font-semibold">Coronary CAD</span>, and{" "}
              <span className="text-white font-semibold">Hypertension</span> with zero-leakage cross-validated ML pipelines, physiological calibration, and patient data privacy.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/assessment/basic"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 group"
              >
                <Heart className="h-4 w-4 text-cyan-200" />
                <span>Start Basic Assessment (No Lab Data)</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/assessment/advanced"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4 text-cyan-400" />
                <span>Upload Lab Report (PDF / Image)</span>
              </Link>
            </div>

            {/* Verified Performance Metrics Backed by Evaluation */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-left border-t border-slate-800/80 mt-12">
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 backdrop-blur-xs">
                <span className="text-2xl font-black text-cyan-400 font-mono block">95.2%</span>
                <span className="text-[11px] text-slate-400 font-medium">Hypertension ROC-AUC</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Framingham Cohort</span>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 backdrop-blur-xs">
                <span className="text-2xl font-black text-rose-400 font-mono block">93.2%</span>
                <span className="text-[11px] text-slate-400 font-medium">Coronary CAD ROC-AUC</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">UCI Angiography Data</span>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 backdrop-blur-xs">
                <span className="text-2xl font-black text-blue-400 font-mono block">81.8%</span>
                <span className="text-[11px] text-slate-400 font-medium">Diabetes ROC-AUC</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Pima Indians NIDDK</span>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 backdrop-blur-xs">
                <span className="text-2xl font-black text-emerald-400 font-mono block">5,926</span>
                <span className="text-[11px] text-slate-400 font-medium">Verified Patient Cases</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">5-Fold Stratified CV</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Target Diseases Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Multi-Disease Clinical AI Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Target Disease Prediction Pipelines
          </h2>
          <p className="text-sm text-slate-400 mt-2.5">
            Every condition runs through an independent, probability-calibrated scikit-learn pipeline with transparent feature explainability and clinical reference comparisons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {diseases.map((d, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl border ${d.border} bg-gradient-to-b ${d.gradient} p-7 flex flex-col justify-between hover:border-slate-700 transition-all duration-200 shadow-lg shadow-black/40`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300">
                    {d.badge}
                  </span>
                  <Activity className={`h-4 w-4 ${d.accent}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1.5">{d.name}</h3>
                <span className="text-[11px] font-mono text-slate-500 block mb-3">{d.cohort}</span>
                <p className="text-xs text-slate-400 leading-relaxed mb-5">{d.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pipeline Model:</span>
                  <span className="text-slate-200 font-semibold">{d.algorithm}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Held-Out Performance:</span>
                  <span className="text-cyan-400 font-mono font-semibold">{d.auc}</span>
                </div>
                <div className="pt-2">
                  <span className="text-[11px] text-slate-500 block mb-1">Evaluated Parameters:</span>
                  <div className="flex flex-wrap gap-1">
                    {d.inputs.map((inp, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-300">
                        {inp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dual Assessment Paths */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Two Tailored Clinical Assessment Paths
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Whether you have hospital laboratory test documents or just basic physiological vitals, Swasth AI matches your data without substituting unmeasured values with zero.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Assessment Card */}
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-6 shadow-inner">
                  <Heart className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase text-blue-400 tracking-wider">Path A</span>
                  <span className="text-xs text-slate-500">• 4-Step Guided Wizard</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2.5">Basic Patient Assessment</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Ideal for individuals completing a preliminary checkup without recent blood reports. Evaluates physical vitals, blood pressure, BMI, and lifestyle indicators.
                </p>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Auto-calculates BMI with clinical WHO category classification</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Physiological range validation (AHA/ADA reference guidelines)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Age-adjusted maximal exercise heart rate formulation (Tanaka formula)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Review screen before submission with data completeness indicators</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/assessment/basic"
                className="w-full py-3.5 rounded-xl font-bold text-center text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5"
              >
                <span>Launch Basic Assessment Wizard</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Advanced Assessment Card */}
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-6 shadow-inner">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase text-cyan-400 tracking-wider">Path B</span>
                  <span className="text-xs text-slate-500">• PDF & Scanned Lab Parsing</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2.5">Diagnostic Report Assessment</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Upload laboratory reports (PDF, text, or image). Automatically extracts Fasting Glucose, Lipid Panel, and Blood Pressure with an interactive verification table.
                </p>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Automated regex biomarker parser for standard clinical lab formats</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Editable verification table — you review and confirm all numbers</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Identifies abnormal biomarkers against standard laboratory reference ranges</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Explicitly alerts when cardiac stress test features are unmeasured</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/assessment/advanced"
                className="w-full py-3.5 rounded-xl font-bold text-center text-xs text-slate-900 bg-white hover:bg-slate-100 shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>Upload Diagnostic Lab Report</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Privacy & Architecture Trust */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>Patient Data Protection & Isolation</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Engineered for Clinical Integrity & Confidentiality
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Swasth AI stores patient data in isolated local SQLite storage keyed to your authenticated session. Your assessment history is private, never shared with third-party advertising brokers, and you retain the absolute right to wipe your entire medical history in one click.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                to="/analytics"
                className="px-5 py-3 rounded-xl text-xs font-bold text-center text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              >
                View Analytics Dashboard
              </Link>
              <Link
                to="/profile"
                className="px-5 py-3 rounded-xl text-xs font-bold text-center text-slate-300 bg-slate-950 hover:bg-slate-900 border border-slate-800 transition"
              >
                Manage Privacy & History
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
