import { useNavigate } from "react-router-dom";
import { Heart, FileText, ArrowRight, Activity, ShieldCheck, Sparkles, ChevronRight } from "lucide-react";

export default function Predict() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="max-w-2xl w-full bg-slate-900 rounded-3xl border border-slate-800 p-8 sm:p-10 shadow-2xl space-y-8 text-center">
        
        <div>
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
            <Heart className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono">
            Clinical Assessment Hub
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Choose Assessment Mode
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1">
            Select your clinical intake method to evaluate calibrated risks for Diabetes, Coronary CAD, and Hypertension.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          
          {/* Option A */}
          <div
            onClick={() => navigate("/assessment/basic")}
            className="cursor-pointer p-6 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-cyan-500/40 hover:bg-slate-950 transition group flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-cyan-400 flex items-center justify-center mb-3">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">
                Basic Assessment
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Enter your physical vitals, blood pressure, BMI, and lifestyle habits manually. Ideal if you do not have recent laboratory blood reports.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Start Basic Wizard</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Option B */}
          <div
            onClick={() => navigate("/assessment/advanced")}
            className="cursor-pointer p-6 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-cyan-500/40 hover:bg-slate-950 transition group flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">
                Diagnostic Lab Report
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Upload a hospital diagnostic report (PDF, text, or scan) or enter verified Fasting Glucose, Lipid profile, and blood pressure readings.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Upload Report</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>

        </div>

        <div className="pt-2 text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Calibrated against Pima NIDDK, UCI Cardiology, and Framingham cohorts.</span>
        </div>

      </div>
    </div>
  );
}
