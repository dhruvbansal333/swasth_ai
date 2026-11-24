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
  Check
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
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading Your Health Companion Plan...</p>
        </div>
      </div>
    );
  }

  const diet = guidance?.diet;
  const exercise = guidance?.exercise;
  const diseasePlans = guidance?.diseaseSpecificPlans || [];
  const weeklyGoals = guidance?.weeklyGoals || [];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
            <span>Health Guidance & Action Plan</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Health Companion
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Practical, evidence-based recommendations adhering to American Heart Association (AHA) and American Diabetes Association (ADA) guidelines. Tailored to your latest clinical assessments.
          </p>
        </div>

        {/* Daily Habit Checklist (Interactive) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Today's Preventive Habit Tracker</span>
              </h2>
              <p className="text-xs text-slate-500">
                Mark completed daily preventive habits. Tracked securely in your patient history.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 self-start sm:self-auto">
              {habits.filter((h) => h.completed).length} of {habits.length} Completed Today
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map((habit) => (
              <div
                key={habit.key}
                onClick={() => handleToggleHabit(habit.key)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start gap-3 select-none ${
                  habit.completed
                    ? "bg-emerald-50/70 border-emerald-200 shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition ${
                    habit.completed
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-300 bg-white"
                  }`}
                >
                  {habit.completed && <Check className="h-4 w-4 stroke-[3]" />}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${habit.completed ? "text-emerald-900 line-through opacity-75" : "text-slate-900"}`}>
                    {habit.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {habit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disease-Specific Tailored Guidance */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Disease-Specific Educational Action Plans
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Customized based on your latest model risk estimations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {diseasePlans.map((dp, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800">{dp.disease}</span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Tier: {dp.currentTier}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Priority Actions</span>
                    {dp.keyActions.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Red Flag Warning */}
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] leading-relaxed">
                  <span className="font-bold flex items-center gap-1 text-rose-700 mb-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Clinical Alert Threshold:
                  </span>
                  {dp.redFlags}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diet & Nutrition Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Apple className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{diet?.title || "Clinical Nutrition"}</h2>
              <p className="text-xs text-slate-500">{diet?.overview}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Foods to Favor */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-3">
                Cardioprotective Foods to Favor
              </span>
              <ul className="space-y-2 text-xs text-emerald-950">
                {diet?.foods_to_favor?.map((food, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Foods to Limit */}
            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block mb-3">
                Pro-Inflammatory Foods to Minimize
              </span>
              <ul className="space-y-2 text-xs text-rose-950">
                {diet?.foods_to_limit?.map((food, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Exercise & Physical Activity */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{exercise?.title || "Exercise Protocol"}</h2>
              <p className="text-xs text-slate-500">{exercise?.weekly_target}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exercise?.regimen?.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-900 text-sm block">{item.type}</span>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Frequency: <b>{item.frequency}</b></span>
                  <span>Duration: <b>{item.duration}</b></span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed pt-1 border-t border-slate-200/60">
                  {item.details}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Milestone Goals */}
        <div className="p-6 rounded-3xl bg-slate-100 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Weekly Preventive Goals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            {weeklyGoals.map((goal, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                <span>{goal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Medical Safety Mandate: </span>
            {guidance?.medicalSafetyDisclaimer}
          </div>
        </div>

      </div>
    </div>
  );
}
