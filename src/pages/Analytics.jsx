import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import RiskBadge from "../components/RiskBadge";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Heart,
  ShieldAlert,
  Calendar,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  FileText
} from "lucide-react";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await api.getTrends();
        setData(res);
      } catch (err) {
        setError(err.message || "Failed to load health analytics.");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading Clinical Analytics...</p>
        </div>
      </div>
    );
  }

  const latest = data?.latest;
  const results = latest?.results;
  const vitals = latest?.vitals;
  const diseases = results?.diseases;
  const hasHistory = data?.hasHistory;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
              <span>Clinical Analytics & Prediction Dashboard</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Health Analytics & Longitudinal Trends
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Objective risk scores, factor contributions, and biomarker trajectories derived from verified patient assessments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/assessment/basic"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
            >
              + New Assessment
            </Link>
            <Link
              to="/history"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
            >
              View Records History
            </Link>
          </div>
        </div>

        {/* Empty State if No Assessments Completed */}
        {!latest ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs max-w-xl mx-auto space-y-4">
            <Activity className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-xl font-bold text-slate-800">No Assessments on Record</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete your first Basic Patient Assessment or upload a medical test report to generate comprehensive risk predictions and start tracking your biomarker trends over time.
            </p>
            <div className="pt-2">
              <Link
                to="/assessment/basic"
                className="inline-block px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                Start Basic Assessment Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Overview Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Latest Assessment Overview
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {latest.date ? new Date(latest.date).toLocaleDateString() : "Recent"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {results?.overall?.tier || "Standard Profile"}
                  </h2>
                </div>
                <RiskBadge
                  tier={results?.overall?.tier}
                  probability={results?.overall?.averageProbability}
                  size="lg"
                />
              </div>

              <p className="text-sm text-slate-700 mt-4 leading-relaxed">
                {results?.overall?.summary}
              </p>

              {/* Vitals quick row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-100 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Systolic / Diastolic BP</span>
                  <span className="text-base font-bold text-slate-900">
                    {vitals?.bp ? `${vitals.bp} / ${vitals.diaBP || "-"} mmHg` : "Not recorded"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Blood Glucose</span>
                  <span className="text-base font-bold text-slate-900">
                    {vitals?.glucose ? `${vitals.glucose} mg/dL` : "Not recorded"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Total Cholesterol</span>
                  <span className="text-base font-bold text-slate-900">
                    {vitals?.cholesterol ? `${vitals.cholesterol} mg/dL` : "Not recorded"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Body Mass Index (BMI)</span>
                  <span className="text-base font-bold text-slate-900">
                    {vitals?.bmi ? `${vitals.bmi} kg/m²` : "Not recorded"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Disease In-Depth Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Diabetes */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Diabetes Mellitus</span>
                    <RiskBadge tier={diseases?.diabetes?.riskTier} probability={diseases?.diabetes?.probability} />
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">
                    {diseases?.diabetes?.percentage}%
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{diseases?.diabetes?.description}</p>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                      Feature Contribution (Explainable AI)
                    </span>
                    {diseases?.diabetes?.factors?.length > 0 ? (
                      diseases.diabetes.factors.map((f, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-slate-800">{f.factor}</span>
                            <span className={`text-[10px] font-semibold ${f.impact.includes("High") ? "text-rose-600" : f.impact.includes("Protective") ? "text-emerald-600" : "text-amber-600"}`}>
                              {f.impact}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block leading-tight">{f.note}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Parameters within optimal bounds.</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Model: Random Forest</span>
                  <span>Dataset: NIDDK Pima</span>
                </div>
              </div>

              {/* Heart Disease */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Cardiovascular Disease</span>
                    <RiskBadge tier={diseases?.heart?.riskTier} probability={diseases?.heart?.probability} />
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">
                    {diseases?.heart?.percentage}%
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{diseases?.heart?.description}</p>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                      Feature Contribution (Explainable AI)
                    </span>
                    {diseases?.heart?.factors?.length > 0 ? (
                      diseases.heart.factors.map((f, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-slate-800">{f.factor}</span>
                            <span className={`text-[10px] font-semibold ${f.impact.includes("High") ? "text-rose-600" : f.impact.includes("Protective") ? "text-emerald-600" : "text-amber-600"}`}>
                              {f.impact}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block leading-tight">{f.note}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Parameters within optimal bounds.</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Model: Calibrated Logistic Reg</span>
                  <span>Dataset: UCI 918</span>
                </div>
              </div>

              {/* Hypertension */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Primary Hypertension</span>
                    <RiskBadge tier={diseases?.hypertension?.riskTier} probability={diseases?.hypertension?.probability} />
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">
                    {diseases?.hypertension?.percentage}%
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{diseases?.hypertension?.description}</p>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                      Feature Contribution (Explainable AI)
                    </span>
                    {diseases?.hypertension?.factors?.length > 0 ? (
                      diseases.hypertension.factors.map((f, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-slate-800">{f.factor}</span>
                            <span className={`text-[10px] font-semibold ${f.impact.includes("High") ? "text-rose-600" : f.impact.includes("Protective") ? "text-emerald-600" : "text-amber-600"}`}>
                              {f.impact}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block leading-tight">{f.note}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Parameters within optimal bounds.</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Model: Random Forest</span>
                  <span>Dataset: Framingham 4,240</span>
                </div>
              </div>

            </div>

            {/* Longitudinal Trend Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">Biomarker Trajectories & Time-Series</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual history of blood pressure, blood glucose, cholesterol, and body mass index.
                </p>
              </div>

              {!hasHistory ? (
                /* Honest Empty State when only 1 record exists */
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <Calendar className="h-8 w-8 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700">Single Baseline Assessment Completed</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You currently have 1 recorded assessment. Swasth AI adheres to clinical integrity guidelines and does not synthesize fictional historical data points. Longitudinal trend lines will populate automatically once you record a subsequent check.
                  </p>
                </div>
              ) : (
                /* Multi-assessment trend visualization */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* BP Trend */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 block mb-2">Systolic Blood Pressure (mmHg)</span>
                    <div className="space-y-2">
                      {data.trends.bloodPressure.map((pt, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">{new Date(pt.date).toLocaleDateString()}</span>
                          <span className="font-bold text-slate-900">{pt.value} mmHg</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Glucose Trend */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 block mb-2">Blood Glucose (mg/dL)</span>
                    <div className="space-y-2">
                      {data.trends.glucose.map((pt, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">{new Date(pt.date).toLocaleDateString()}</span>
                          <span className="font-bold text-slate-900">{pt.value} mg/dL</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Explainable AI Medical Causation Disclaimer */}
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Interpretability Distinction: </span>
                Feature contributions identify statistical associations learned by the models from epidemiological cohorts (e.g. higher glucose increases statistical prediction of diabetes risk). Statistical correlation does not establish individual clinical causation. Always review abnormal readings with a qualified healthcare physician.
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
