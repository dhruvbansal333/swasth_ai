import { useNavigate } from "react-router-dom";
import { Heart, FileText, ArrowRight, Activity, ShieldCheck } from "lucide-react";

export default function Predict() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xl space-y-8 text-center">
        
        <div>
          <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
            <Heart className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Patient Health Assessment Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            Choose your assessment mode to evaluate risks for Diabetes, Heart Disease, and Hypertension.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          
          {/* Option A */}
          <div
            onClick={() => navigate("/assessment/basic")}
            className="cursor-pointer p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition group flex flex-col justify-between"
          >
            <div>
              <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                Basic Assessment
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Enter your physical vitals, blood pressure, BMI, and lifestyle habits manually. Ideal if you do not have laboratory blood reports.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>Start Basic</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Option B */}
          <div
            onClick={() => navigate("/assessment/advanced")}
            className="cursor-pointer p-6 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition group flex flex-col justify-between"
          >
            <div>
              <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Advanced Report
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Upload a hospital diagnostic report (PDF or scan) or enter verified Fasting Glucose, Lipid profile, and HbA1c lab readings.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
              <span>Upload Report</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

        </div>

        <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Calibrated against Pima NIDDK, UCI Heart Failure, and Framingham cohorts.</span>
        </div>

      </div>
    </div>
  );
}
