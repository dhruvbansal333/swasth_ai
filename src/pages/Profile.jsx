import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  User,
  Mail,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Heart,
  Lock,
  Activity,
  Trash2
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    age: "",
    gender: "Male",
    height_cm: "",
    weight_kg: "",
    blood_group: ""
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        age: user.age || "",
        gender: user.gender || "Male",
        height_cm: user.height_cm || "",
        weight_kg: user.weight_kg || "",
        blood_group: user.blood_group || ""
      });
    }
  }, [user]);

  const calculatedBMI = useMemo(() => {
    const h = parseFloat(form.height_cm);
    const w = parseFloat(form.weight_kg);
    if (h > 50 && w > 20) {
      const heightInM = h / 100.0;
      return (w / (heightInM * heightInM)).toFixed(1);
    }
    return "";
  }, [form.height_cm, form.weight_kg]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError("");

    try {
      await updateProfile({
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        blood_group: form.blood_group
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <User className="h-3.5 w-3.5 text-cyan-400" />
            <span>Patient Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Patient Profile & Baseline
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Maintain your demographic and baseline physical attributes to streamline future clinical assessments.
          </p>
        </div>

        {/* Account Info Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-blue-500/20">
              {user?.full_name ? user.full_name[0].toUpperCase() : "P"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{user?.full_name || "Patient"}</h3>
              <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Session Authenticated (JWT)
              </span>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Isolated Local Store</span>
            </span>
          </div>
        </div>

        {/* Success / Error Banners */}
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Profile baseline parameters updated successfully.</span>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Physical Baseline Metrics</h3>
            <p className="text-[11px] text-slate-400">
              Used as initial defaults when filling out basic assessments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Age (Years)</label>
              <input
                type="number"
                min="1"
                max="120"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="e.g. 40"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Biological Sex</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Height (cm)</label>
              <input
                type="number"
                min="50"
                max="250"
                name="height_cm"
                value={form.height_cm}
                onChange={handleChange}
                placeholder="e.g. 175"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Weight (kg)</label>
              <input
                type="number"
                min="20"
                max="300"
                name="weight_kg"
                value={form.weight_kg}
                onChange={handleChange}
                placeholder="e.g. 72"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Blood Group</label>
              <select
                name="blood_group"
                value={form.blood_group}
                onChange={handleChange}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="">Not Specified</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Computed Baseline BMI</label>
              <div className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs font-bold">
                {calculatedBMI ? `${calculatedBMI} kg/m²` : "Provide height & weight"}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving..." : "Save Baseline"}</span>
            </button>
          </div>
        </form>

        {/* Data Privacy & Right to be Forgotten Banner */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Data Privacy & Security Controls</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Manage your saved clinical timeline, or execute a complete right-to-be-forgotten database erase.
            </p>
          </div>
          <Link
            to="/history"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-950 border border-slate-800 hover:border-slate-700 transition self-start sm:self-auto"
          >
            Manage Data History
          </Link>
        </div>

      </div>
    </div>
  );
}
