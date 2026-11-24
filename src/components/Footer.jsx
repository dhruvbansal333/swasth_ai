import { ShieldAlert, Heart, Activity } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Top Disclaimer Banner */}
        <div className="mb-8 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold">Medical Safety & Advisory Notice: </span>
            Swasth AI delivers statistical risk estimation derived from validated clinical research datasets (Pima Diabetes Database, UCI Heart Failure Cohort, Framingham Heart Study). The platform is designed strictly for educational awareness and preventive guidance. It does not provide medical diagnoses, clinical prescriptions, or treatment plans. Patients experiencing acute symptoms should immediately consult an authorized healthcare physician or emergency medical center.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Heart className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">SwasthAI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Empowering proactive healthcare through calibrated machine learning risk stratification and evidence-based clinical guidance.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Clinical Systems</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Diabetes Mellitus Risk</li>
              <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Cardiovascular Disease Risk</li>
              <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Primary Hypertension Risk</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Patient Portal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/assessment/basic" className="hover:text-blue-600 transition">Basic Assessment Wizard</Link></li>
              <li><Link to="/assessment/advanced" className="hover:text-blue-600 transition">Lab Report Assessment</Link></li>
              <li><Link to="/analytics" className="hover:text-blue-600 transition">Health Trend Analytics</Link></li>
              <li><Link to="/guidance" className="hover:text-blue-600 transition">My Health Companion</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Privacy & Ethics</h4>
            <p className="text-xs text-slate-500 mb-2 leading-relaxed">
              Your medical assessments are cryptographically isolated and private to your account. You retain full rights to delete your history at any time.
            </p>
            <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              HIPAA & GDPR Ready Design
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Swasth AI Platform. Calibrated Machine Learning & Clinical Preventive Health. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
