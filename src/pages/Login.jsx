import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Heart,
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Activity
} from "lucide-react";

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";

  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        if (!fullName.trim()) throw new Error("Full name is required for registration.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters long.");
        await register(email, password, fullName);
      }
      navigate("/assessment/basic");
    } catch (err) {
      setError(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] bg-slate-950 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Left Side: Brand Showcase (Hidden on mobile) */}
        <div className="relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 border-r border-slate-800">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Heart className="h-5 w-5 fill-white/20" />
              </div>
              <span className="text-xl font-black text-white">
                Swasth<span className="text-cyan-400">AI</span>
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
                Clinical Intelligence v2.1
              </span>
              <h3 className="text-2xl font-black text-white leading-tight">
                Secure, Calibrated Preventive Health Risk Analytics
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect to your personal health portal to securely log vitals, parse laboratory diagnostic documents, and monitor your biomarker trajectories over time.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero-leakage, cross-validated multi-disease predictive pipelines</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Private local database isolation with bcrypt encryption</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Personalized habit companion & preventive guidelines</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-500">
            <Lock className="h-3.5 w-3.5 text-cyan-400" />
            <span>Cryptographically signed JWT sessions</span>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="p-8 sm:p-10 space-y-6 flex flex-col justify-center">
          
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {tab === "login" ? "Sign in to your account" : "Create Patient Profile"}
            </h2>
            <p className="text-xs text-slate-400">
              {tab === "login"
                ? "Enter your credentials to access encrypted assessment records."
                : "Register once to track your assessments and longitudinal trends."}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                tab === "login" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab("register"); setError(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                tab === "register" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {tab === "register" && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Patient Name</label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Account Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {tab === "register" && (
                <span className="text-[10px] text-slate-500 mt-1 block">Minimum 6 characters with letters/numbers.</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : tab === "login" ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick guest bypass link */}
          <div className="pt-2 text-center border-t border-slate-800">
            <Link
              to="/assessment/basic"
              className="text-xs text-cyan-400 hover:text-cyan-300 transition"
            >
              Continue without signing in as Guest →
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
