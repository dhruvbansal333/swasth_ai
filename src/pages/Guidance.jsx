import { useState, useEffect } from "react";
import api from "../services/api";
import {
  BookOpen,
  Apple,
  Dumbbell,
  Moon,
  Droplet,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Footprints,
  Salad,
  Sparkles,
  Heart,
  Activity,
  Flame,
  Check,
  ShieldAlert
} from "lucide-react";

export default function Guidance() {
  const [guidance, setGuidance] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [gRes, hRes] = await Promise.all([
          api.getGuidance().catch(() => ({ guidance: null })),
          api.getHabits().catch(() => ({ habits: [] }))
        ]);
        if (gRes.guidance) setGuidance(gRes.guidance);
        if (hRes.habits) setHabits(hRes.habits);
      } catch (err) {
        setError("Could not load companion guidance.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleHabit = async (habitKey) => {
    setToggling(habitKey);
    try {
      const res = await api.toggleHabit(habitKey);
      if (res.success) {
        setHabits((prev) =>
          prev.map((h) => (h.key === habitKey ? { ...h, completed: res.completed } : h))
        );
      }
    } catch (err) {
      console.error("Failed to toggle habit:", err);
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Loading Your Health Companion Plan...</p>
        </div>
      </div>
    );
  }

  const diet = guidance?.diet;
  const exercise = guidance?.exercise;
  const diseasePlans = guidance?.diseaseSpecificPlans || [];
  const weeklyGoals = guidance?.weeklyGoals || [];

  const completedCount = habits.filter((h) => h.completed).length;
  const habitPercentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
            <span>Preventive Health Companion & Action Plan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            My Health Companion
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Evidence-based nutritional, exercise, and lifestyle recommendations adhering to American Heart Association (AHA) and American Diabetes Association (ADA) preventive guidelines.
          </p>
        </div>

        {/* Daily Habit Checklist (Interactive) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Today's Preventive Habit Tracker</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Mark daily preventive health practices. Changes are automatically saved to your patient profile.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-emerald-400">
                {completedCount} / {habits.length} Done ({habitPercentage}%)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300"
              style={{ width: `${habitPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map((habit) => (
              <div
                key={habit.key}
                onClick={() => handleToggleHabit(habit.key)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-150 flex items-start gap-3.5 select-none ${
                  habit.completed
                    ? "bg-emerald-500/10 border-emerald-500/30 shadow-xs"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition ${
                    habit.completed
                      ? "bg-emerald-500 text-slate-950"
                      : "border border-slate-700 bg-slate-900"
                  }`}
                >
                  {habit.completed && <Check className="h-4 w-4 stroke-[3]" />}
                </div>
                <div>
                  <h4
                    className={`text-sm font-bold transition ${
                      habit.completed ? "text-emerald-300 line-through opacity-80" : "text-white"
                    }`}
                  >
                    {habit.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {habit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disease-Specific Tailored Guidance */}
        {diseasePlans.length > 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Disease-Specific Educational Action Plans
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Stratified according to your latest clinical assessment outcomes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {diseasePlans.map((dp, i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                      <span className="text-xs font-bold text-white">{dp.disease}</span>
                      <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-cyan-400">
                        Tier: {dp.currentTier}
                      </span>
                    </div>

                    <div className="space-y-2.5 mb-6">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                        Recommended Actions
                      </span>
                      {dp.keyActions.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Red Flag Warning */}
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] leading-relaxed">
                    <span className="font-bold flex items-center gap-1.5 text-rose-400 mb-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Clinical Alert Threshold:
                    </span>
                    {dp.redFlags}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diet & Nutrition Section */}
        {diet && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Apple className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{diet.title || "Clinical Nutrition"}</h2>
                <p className="text-xs text-slate-400">{diet.overview}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Recommended Foods (DASH & Mediterranean)
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {diet.recommendedFoods?.map((item, idx) => (
                    <li key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" /> Foods to Moderate or Limit
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {diet.foodsToAvoid?.map((item, idx) => (
                    <li key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Exercise & Cardiovascular Conditioning */}
        {exercise && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{exercise.title || "Physical Activity"}</h2>
                <p className="text-xs text-slate-400">{exercise.overview}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {exercise.protocols?.map((prot, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-cyan-400 block">{prot.type}</span>
                  <span className="text-[11px] font-mono text-white block">{prot.frequency}</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{prot.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advisory Notice */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-amber-300">Educational Guidance Advisory: </span>
            Companion guidance is generated based on population health guidelines and your verified survey responses. It does not constitute a customized medical prescription or individualized clinical therapy plan. Consult your physician prior to commencing rigorous new physical conditioning regimes.
          </div>
        </div>

      </div>
    </div>
  );
}
