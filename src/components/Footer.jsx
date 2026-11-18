import { ShieldAlert, Heart, Activity, Lock, Cpu, Database } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Top Disclaimer Banner */}
        <div className="mb-10 p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-amber-200/90 flex items-start gap-3.5 shadow-sm">
          <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-amber-300">Medical Safety & Advisory Notice: </span>
            Swasth AI delivers calibrated statistical risk estimation derived from peer-reviewed clinical research cohorts (Pima Indians Diabetes NIDDK, UCI Cardiology Multi-Center Cohort, and the Framingham Heart Study). The platform is engineered strictly for educational health awareness and preventive lifestyle stratification. It does not render clinical diagnoses, medical prescriptions, or emergency evaluations. Patients with persistent or acute symptoms should promptly consult a licensed healthcare practitioner or certified clinical facility.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Heart className="h-4 w-4 fill-white/20" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Swasth<span className="text-cyan-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calibrated multi-disease predictive intelligence platform engineered with anti-leakage cross-validation, probability calibration, and patient data isolation.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Production Pipeline v2.1.0 Online</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-blue-400" />
              <span>Calibrated Models</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 hover:text-slate-200 transition">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>Type 2 Diabetes (Pima NIDDK)</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                <span>Coronary Heart Disease (UCI CAD)</span>
              </li>
              <li className="flex items-center gap-2 hover:text-slate-200 transition">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span>Hypertension (Framingham Cohort)</span>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Clinical Modules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/assessment/basic" className="hover:text-cyan-400 transition">
                  Basic Patient Assessment Wizard
                </Link>
              </li>
              <li>
                <Link to="/assessment/advanced" className="hover:text-cyan-400 transition">
                  Diagnostic Lab Report Parsing
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-cyan-400 transition">
                  Longitudinal Health Analytics
                </Link>
              </li>
              <li>
                <Link to="/guidance" className="hover:text-cyan-400 transition">
                  Preventive Health Companion
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Security & Data Privacy</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Assessment records are isolated by JWT user keys with bcrypt salt hashing. Full patient right-to-be-forgotten data wipe available.
            </p>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <Database className="h-3 w-3" />
              <span>Isolated Local SQLite Storage</span>
            </span>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Swasth AI Platform. Calibrated Machine Learning & Clinical Preventive Health.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/assessment/basic" className="hover:text-slate-300">Basic Assessment</Link>
            <Link to="/assessment/advanced" className="hover:text-slate-300">Lab Analysis</Link>
            <Link to="/profile" className="hover:text-slate-300">Data Privacy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
