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
  FileText,
  Sparkles,
  Info,
  ChevronRight,
  Lock
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
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Loading Clinical Analytics...</p>
        </div>
      </div>
    );
  }

  const latest = data?.latest;
  const results = latest?.results;
  const vitals = latest?.vitals;
  const diseases = results?.diseases;
  const hasHistory = data?.hasHistory;
  const trends = data?.trends || {};

  // Simple clean SVG line chart component for real data
  const RenderTrendChart = ({ points, unit, targetLabel, targetMax, targetMin, color = "stroke-cyan-400", fill = "fill-cyan-500/10" }) => {
    if (!points || points.length === 0) return null;
    if (points.length === 1) {
      return (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
          <span className="text-xs text-slate-500 block">Baseline Value</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {points[0].value} {unit}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Recorded: {new Date(points[0].date).toLocaleDateString()}
          </span>
        </div>
      );
    }

    const values = points.map(p => p.value);
    const minVal = Math.min(...values, targetMin || 0) * 0.9;
    const maxVal = Math.max(...values, targetMax || 100) * 1.1;
    const range = maxVal - minVal || 1;

    const width = 360;
    const height = 120;
    const padding = 20;

    const coords = points.map((p, idx) => {
      const x = padding + (idx / (points.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((p.value - minVal) / range) * (height - 2 * padding);
      return { x, y, val: p.value, date: p.date };
    });

    const pathData = coords.reduce((acc, c, idx) => {
      return idx === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
    }, "");

    return (
      <div className="space-y-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
          {/* Target guideline dashed line */}
          {targetMax && (
            <line
              x1={padding}
              y1={height - padding - ((targetMax - minVal) / range) * (height - 2 * padding)}
              x2={width - padding}
              y2={height - padding - ((targetMax - minVal) / range) * (height - 2 * padding)}
              stroke="#64748b"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          )}
          {/* Sparkline */}
          <path d={pathData} fill="none" className={`${color}`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Dots */}
          {coords.map((c, idx) => (
            <circle key={idx} cx={c.x} cy={c.y} r="3.5" className={`${color} fill-slate-950 stroke-2`} />
          ))}
        </svg>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
          <span>{new Date(points[0].date).toLocaleDateString()}</span>
          {targetLabel && <span className="text-slate-400 font-sans">{targetLabel}</span>}
          <span>{new Date(points[points.length - 1].date).toLocaleDateString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Clinical Analytics & Longitudinal Tracking</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Health Analytics & Longitudinal Trends
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Calibrated multi-disease probabilities, feature impact factors, and real biomarker trajectories derived from your verified assessments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/assessment/basic"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition shadow-sm shadow-blue-500/25 flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>New Assessment</span>
            </Link>
            <Link
              to="/history"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
            >
              History Timeline
            </Link>
          </div>
        </div>

        {/* Empty State / Auth Required State */}
        {!latest ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl max-w-xl mx-auto space-y-5">
            <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <Activity className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white">No Patient Records On File</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                {error.includes("Authentication") ? (
                  "Please sign in to save your clinical assessments and track longitudinal biomarker trajectories over time."
                ) : (
                  "Complete your first Basic Patient Assessment or upload a diagnostic lab report to start tracking your calibrated health analytics."
                )}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                to="/assessment/basic"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition shadow-md shadow-blue-500/20"
              >
                Launch Assessment Wizard
              </Link>
              {error.includes("Authentication") && (
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Overview Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Most Recent Clinical Assessment
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" />
                      {latest.date ? new Date(latest.date).toLocaleDateString() : "Recent"}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {results?.overall?.tier || "Standard Profile"}
                  </h2>
                </div>
                <RiskBadge
                  tier={results?.overall?.tier}
                  probability={results?.overall?.averageProbability}
                  size="lg"
                />
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {results?.overall?.summary}
              </p>

              {/* Vitals quick row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Blood Pressure</span>
                  <span className="text-base font-black text-white font-mono mt-0.5 block">
                    {vitals?.bp ? `${vitals.bp} / ${vitals.diaBP || "-"} mmHg` : "Not recorded"}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Blood Glucose</span>
                  <span className="text-base font-black text-white font-mono mt-0.5 block">
                    {vitals?.glucose ? `${vitals.glucose} mg/dL` : "Not recorded"}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Serum Cholesterol</span>
                  <span className="text-base font-black text-white font-mono mt-0.5 block">
                    {vitals?.cholesterol ? `${vitals.cholesterol} mg/dL` : "Not recorded"}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Body Mass Index</span>
                  <span className="text-base font-black text-cyan-400 font-mono mt-0.5 block">
                    {vitals?.bmi ? `${vitals.bmi} kg/m²` : "Not recorded"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Disease Scorecards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Diabetes */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type 2 Diabetes</span>
                    <RiskBadge tier={diseases?.diabetes?.riskTier} probability={diseases?.diabetes?.probability} />
                  </div>
                  <div className="text-3xl font-black text-white font-mono mb-1">
                    {diseases?.diabetes?.percentage}%
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{diseases?.diabetes?.description}</p>

                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      Feature Contribution (Explainable AI)
                    </span>
                    {diseases?.diabetes?.factors?.length > 0 ? (
                      diseases.diabetes.factors.map((f, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-semibold text-slate-200">{f.factor}</span>
                            <span className={`text-[10px] font-bold ${f.impact.includes("High") ? "text-rose-400" : f.impact.includes("Protective") ? "text-emerald-400" : "text-amber-400"}`}>
                              {f.impact}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block leading-tight">{f.note}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">Parameters within optimal bounds.</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Model: Random Forest</span>
                  <span>Cohort: NIDDK Pima</span>
                </div>
              </div>

              {/* Heart Disease */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Coronary CAD</span>
                    <RiskBadge tier={diseases?.heart?.riskTier} probability={diseases?.heart?.probability} />
                  </div>
                  <div className="text-3xl font-black text-white font-mono mb-1">
                    {diseases?.heart?.percentage}%
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{diseases?.heart?.description}</p>

                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      Feature Contribution (Explainable AI)
                    </span>
                    {diseases?.heart?.factors?.length > 0 ? (
                      diseases.heart.factors.map((f, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-semibold text-slate-200">{f.factor}</span>
                            <span className={`text-[10px] font-bold ${f.impact.includes("High") ? "text-rose-400" : f.impact.includes("Protective") ? "text-emerald-400" : "text-amber-400"}`}>
                              {f.impact}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block leading-tight">{f.note}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">Parameters within optimal bounds.</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Model: Calibrated Logistic Reg</span>
                  <span>Cohort: UCI 918 CAD</span>
                </div>
              </div>

              {/* Hypertension */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hypertension</span>
                    <RiskBadge tier={diseases?.hypertension?.riskTier} probability={diseases?.hypertension?.probability} />
                  </div>
                  <div className="text-3xl font-black text-white font-mono mb-1">
                    {diseases?.hypertension?.percentage}%
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{diseases?.hypertension?.description}</p>

                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      Feature Contribution (Explainable AI)
                    </span>
                    {diseases?.hypertension?.factors?.length > 0 ? (
                      diseases.hypertension.factors.map((f, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-semibold text-slate-200">{f.factor}</span>
                            <span className={`text-[10px] font-bold ${f.impact.includes("High") ? "text-rose-400" : f.impact.includes("Protective") ? "text-emerald-400" : "text-amber-400"}`}>
                              {f.impact}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block leading-tight">{f.note}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">Parameters within optimal bounds.</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Model: Random Forest</span>
                  <span>Cohort: Framingham 4,240</span>
                </div>
              </div>

            </div>

            {/* Longitudinal Trend Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Biomarker Trajectories & Time-Series</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual history of blood pressure, blood glucose, cholesterol, and body mass index across recorded checks.
                </p>
              </div>

              {!hasHistory ? (
                /* Honest Empty State when only 1 record exists */
                <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <Calendar className="h-8 w-8 text-slate-500 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Single Baseline Assessment Completed</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    You currently have 1 recorded baseline. Swasth AI adheres to strict clinical integrity standards and does not fabricate fake historical data points. Longitudinal trend lines will populate automatically once you record a subsequent check.
                  </p>
                </div>
              ) : (
                /* Multi-assessment trend visualization with real interactive SVG sparklines */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* BP Trend */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white block">Systolic Blood Pressure (mmHg)</span>
                      <span className="text-[10px] text-cyan-400 font-mono">Target: &lt;120 mmHg</span>
                    </div>
                    <RenderTrendChart
                      points={trends.bloodPressure}
                      unit="mmHg"
                      targetLabel="AHA <120 Target"
                      targetMax={120}
                      targetMin={80}
                      color="stroke-cyan-400"
                    />
                  </div>

                  {/* Glucose Trend */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white block">Blood Glucose (mg/dL)</span>
                      <span className="text-[10px] text-blue-400 font-mono">Target: &lt;100 mg/dL</span>
                    </div>
                    <RenderTrendChart
                      points={trends.glucose}
                      unit="mg/dL"
                      targetLabel="ADA <100 Target"
                      targetMax={100}
                      targetMin={60}
                      color="stroke-blue-400"
                    />
                  </div>

                  {/* Cholesterol Trend */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white block">Total Cholesterol (mg/dL)</span>
                      <span className="text-[10px] text-rose-400 font-mono">Target: &lt;200 mg/dL</span>
                    </div>
                    <RenderTrendChart
                      points={trends.cholesterol}
                      unit="mg/dL"
                      targetLabel="ATP III <200 Target"
                      targetMax={200}
                      targetMin={100}
                      color="stroke-rose-400"
                    />
                  </div>

                  {/* BMI Trend */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white block">Body Mass Index (BMI)</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Target: 18.5 - 24.9</span>
                    </div>
                    <RenderTrendChart
                      points={trends.bmi}
                      unit="kg/m²"
                      targetLabel="WHO 24.9 Threshold"
                      targetMax={24.9}
                      targetMin={18.5}
                      color="stroke-emerald-400"
                    />
                  </div>

                </div>
              )}
            </div>

            {/* Model Confidence & Platt Scaling Calibration Explanation */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="h-4 w-4 text-cyan-400" />
                <span>Model Confidence & Probability Calibration Architecture</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Raw classifier logits are calibrated via 5-fold cross-validated Platt scaling (sigmoid transformations) fitted strictly on held-out folds. This ensures that a predicted probability of 30% genuinely corresponds to a 30% empirical disease frequency in patient cohorts matching those clinical covariates. Laboratory reference bounds (e.g. glucose &lt;100 mg/dL) are preserved as distinct clinical criteria and not conflated with model probabilities.
              </p>
            </div>

            {/* Interpretability & Medical Disclaimer */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200">Interpretability Distinction: </span>
                Feature contributions identify statistical associations learned by the models from epidemiological cohorts (e.g. higher glucose increases statistical prediction of diabetes risk). Statistical correlation does not establish individual clinical causation. Always review abnormal readings with a qualified healthcare physician.
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
