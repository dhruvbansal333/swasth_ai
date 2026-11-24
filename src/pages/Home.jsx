import { Link } from "react-router-dom";
import {
  Heart,
  Activity,
  FileText,
  ShieldCheck,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function Home() {
  const diseases = [
    {
      name: "Diabetes Risk Stratification",
      badge: "Metabolic Health",
      desc: "Detect early pre-diabetic and insulin resistance patterns using oral glucose tolerance markers, physiological BMI, and age parameters.",
      model: "Random Forest Classifier (Calibrated)",
      features: "Glucose, BMI, Blood Pressure, Insulin, Age",
      color: "from-blue-600 to-cyan-600",
      iconColor: "text-blue-600",
      bgLight: "bg-blue-50/70 border-blue-100"
    },
    {
      name: "Cardiovascular Risk Prediction",
      badge: "Coronary Health",
      desc: "Evaluate coronary disease likelihood using resting blood pressure, serum cholesterol, exercise angina, and electrocardiogram ST dynamics.",
      model: "Calibrated Logistic Regression (ROC-AUC: 0.932)",
      features: "Resting BP, Cholesterol, Max HR, Angina, ST Slope",
      color: "from-rose-600 to-amber-600",
      iconColor: "text-rose-600",
      bgLight: "bg-rose-50/70 border-rose-100"
    },
    {
      name: "Hypertension Assessment",
      badge: "Vascular Health",
      desc: "Screen for primary and essential hypertension based on Framingham epidemiological cohorts, systolic/diastolic ratios, and lifestyle factors.",
      model: "Random Forest Classifier (ROC-AUC: 0.952)",
      features: "Systolic BP, Diastolic BP, BMI, Heart Rate, Smoking",
      color: "from-indigo-600 to-blue-600",
      iconColor: "text-indigo-600",
      bgLight: "bg-indigo-50/70 border-indigo-100"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold tracking-wide uppercase shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Calibrated Clinical Machine Learning Engine</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Intelligent Healthcare Risk Assessment & Patient Companion
            </h1>

            {/* Subheading */}
            <p className="text-lg text-slate-600 leading-relaxed font-normal">
              Screen for <span className="font-semibold text-slate-800">Diabetes</span>, <span className="font-semibold text-slate-800">Heart Disease</span>, and <span className="font-semibold text-slate-800">Hypertension</span> with peer-reviewed machine learning pipelines, transparent factor explainability, and personalized preventive action plans.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/assessment/basic"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                <span>Basic Assessment (No Lab Reports)</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/assessment/advanced"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Upload Medical Report (PDF / Image)</span>
              </Link>
            </div>

            {/* Verified Benchmark Stats */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-200/80 mt-10">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-2xl font-black text-blue-600 block">5,900+</span>
                <span className="text-xs text-slate-500 font-medium">Clinical Patient Cohorts</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-2xl font-black text-emerald-600 block">95.2%</span>
                <span className="text-xs text-slate-500 font-medium">Hypertension ROC-AUC</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-2xl font-black text-indigo-600 block">93.2%</span>
                <span className="text-xs text-slate-500 font-medium">Cardiac Model ROC-AUC</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-2xl font-black text-cyan-600 block">100%</span>
                <span className="text-xs text-slate-500 font-medium">Zero-Imputation Free</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3 Core Diseases Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Target Disease Prediction Systems
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Each disease is independently assessed by an optimized, probability-calibrated pipeline trained on gold-standard clinical cohorts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {diseases.map((d, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between ${d.bgLight}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">
                    {d.badge}
                  </span>
                  <Activity className={`h-5 w-5 ${d.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{d.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{d.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-200/60 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <span className="text-slate-500 font-medium">Selected Model:</span>
                  <span className="text-slate-900 font-semibold text-right">{d.model}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-slate-500 font-medium">Core Inputs:</span>
                  <span className="text-slate-900 font-semibold text-right">{d.features}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dual Assessment Modes Showcase */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Two Tailored Clinical Assessment Paths
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Whether you have detailed hospital test reports or just daily vitals, Swasth AI matches inputs to validated clinical models without fabricating missing numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Assessment Card */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition shadow-xs flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Section A: Basic Patient Assessment</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Designed for individuals who do not possess recent laboratory blood reports. Evaluates physical vitals, age, blood pressure, BMI, and lifestyle habits.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Multi-step guided input wizard with units</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Physiological range validation (no zero substitution)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Immediate multi-disease probability output</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Identifies which predictions have full data vs. limitations</li>
                </ul>
              </div>
              <Link
                to="/assessment/basic"
                className="w-full py-3 rounded-xl font-bold text-center text-sm text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
              >
                Launch Basic Assessment
              </Link>
            </div>

            {/* Advanced Assessment Card */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition shadow-xs flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Section B: Advanced Report Assessment</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Designed for patients with actual hospital diagnostic reports (PDF, images, or manual test values). Automatically parses biomarkers with patient verification.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> PDF and image report parsing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Extracts Fasting Glucose, Lipid Profile (HDL/LDL), HbA1c</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Interactive verification table before running model</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Strict feature alignment — never invents weighted formulas</li>
                </ul>
              </div>
              <Link
                to="/assessment/advanced"
                className="w-full py-3 rounded-xl font-bold text-center text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
              >
                Upload Medical Report
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
