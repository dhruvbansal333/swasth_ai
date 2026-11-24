import { useState, useEffect } from "react";
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
  Heart
} from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
            <User className="h-3.5 w-3.5 text-slate-600" />
            <span>Patient Portal</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Patient Profile & Baseline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain your demographic and baseline physical attributes to streamline assessments.
          </p>
        </div>

        {/* Account Info Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
              {user?.full_name ? user.full_name[0].toUpperCase() : "P"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{user?.full_name || "Patient"}</h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "2026"}
              </span>
            </div>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Your patient baseline profile has been saved successfully!</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Baseline Physical Measurements
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                min="1"
                max="120"
                name="age"
                placeholder="Years"
                value={form.age}
                onChange={handleChange}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Biological Sex</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
              <input
                type="number"
                min="50"
                max="250"
                name="height_cm"
                placeholder="e.g. 175"
                value={form.height_cm}
                onChange={handleChange}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                name="weight_kg"
                placeholder="e.g. 72"
                value={form.weight_kg}
                onChange={handleChange}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
              <select
                name="blood_group"
                value={form.blood_group}
                onChange={handleChange}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="">Select Blood Group</option>
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
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </form>

        {/* Security & Privacy note */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Data Isolation: </span>
            Your profile and clinical assessments are strictly segregated by user ID in an encrypted database. No third party or other patient has access to your medical history.
          </div>
        </div>

      </div>
    </div>
  );
}
