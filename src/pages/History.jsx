import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import RiskBadge from "../components/RiskBadge";
import {
  History as HistoryIcon,
  Calendar,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Eye,
  ShieldCheck,
  FileText,
  Heart,
  X,
  Filter,
  Sparkles,
  Lock,
  ChevronRight
} from "lucide-react";

export default function History() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [filterType, setFilterType] = useState("all"); // 'all' | 'basic' | 'advanced'

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    try {
      const res = await api.getAssessments();
      setAssessments(res.assessments || []);
    } catch (err) {
      setError("Could not load history. Please ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assessment record?")) return;
    setDeletingId(id);
    try {
      await api.deleteAssessment(id);
      setAssessments((prev) => prev.filter((a) => a.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (err) {
      alert("Failed to delete record: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleWipeAll = async () => {
    try {
      await api.deleteAllData();
      setAssessments([]);
      setShowWipeConfirm(false);
      setSelectedRecord(null);
      alert("All your patient clinical assessments and account data have been permanently erased.");
    } catch (err) {
      alert("Failed to wipe data: " + err.message);
    }
  };

  const filteredAssessments = useMemo(() => {
    if (filterType === "all") return assessments;
    return assessments.filter((a) => a.assessment_type === filterType);
  }, [assessments, filterType]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Loading Patient History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <HistoryIcon className="h-3.5 w-3.5 text-cyan-400" />
              <span>Assessment Timeline</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Patient Assessment History
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Private longitudinal log of all completed basic vital checks and diagnostic lab reports.
            </p>
          </div>

          {assessments.length > 0 && (
            <button
              onClick={() => setShowWipeConfirm(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 transition flex items-center gap-2 self-start sm:self-auto"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Erase All History</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        {assessments.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 mr-2 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === "all"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "bg-slate-900/60 text-slate-400 hover:text-white"
              }`}
            >
              All ({assessments.length})
            </button>
            <button
              onClick={() => setFilterType("basic")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === "basic"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "bg-slate-900/60 text-slate-400 hover:text-white"
              }`}
            >
              Basic Vitals ({assessments.filter((a) => a.assessment_type === "basic").length})
            </button>
            <button
              onClick={() => setFilterType("advanced")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === "advanced"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "bg-slate-900/60 text-slate-400 hover:text-white"
              }`}
            >
              Diagnostic Lab ({assessments.filter((a) => a.assessment_type === "advanced").length})
            </button>
          </div>
        )}

        {/* Assessments List / Empty State */}
        {assessments.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl max-w-xl mx-auto space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              <Calendar className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-white">No Saved Assessments</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              You haven't recorded any clinical risk evaluations yet. Start a basic assessment or upload a laboratory report to begin tracking your records.
            </p>
            <div className="pt-2">
              <Link
                to="/assessment/basic"
                className="inline-block px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition shadow-md shadow-blue-500/25"
              >
                Start Assessment
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssessments.map((item) => {
              const res = item.results;
              const vitals = item.vitals || {};
              const overall = res?.overall || {};
              const diseases = res?.diseases || {};

              return (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-cyan-400 uppercase tracking-wider">
                        {item.assessment_type}
                      </span>
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-white">
                        {overall.tier || "Completed Assessment"}
                      </span>
                      <RiskBadge tier={overall.tier} probability={overall.averageProbability} size="sm" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                      {diseases.diabetes && (
                        <span>Diabetes: <b className="text-slate-200">{diseases.diabetes.percentage}%</b></span>
                      )}
                      <span className="text-slate-700">•</span>
                      {diseases.heart && (
                        <span>CAD: <b className="text-slate-200">{diseases.heart.percentage}%</b></span>
                      )}
                      <span className="text-slate-700">•</span>
                      {diseases.hypertension && (
                        <span>Hypertension: <b className="text-slate-200">{diseases.hypertension.percentage}%</b></span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setSelectedRecord(item)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition flex items-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Assessment ID #{selectedRecord.id} ({selectedRecord.assessment_type})
                  </span>
                  <h3 className="text-xl font-bold text-white">Clinical Assessment Details</h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(selectedRecord.created_at).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Overall Summary */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{selectedRecord.results?.overall?.tier}</span>
                  <RiskBadge
                    tier={selectedRecord.results?.overall?.tier}
                    probability={selectedRecord.results?.overall?.averageProbability}
                    size="sm"
                  />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedRecord.results?.overall?.summary}
                </p>
              </div>

              {/* Vitals Record */}
              <div>
                <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">Recorded Clinical Inputs</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {Object.entries(selectedRecord.vitals || {}).map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block truncate capitalize">{k}</span>
                      <span className="font-mono text-white font-semibold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wipe Confirm Modal */}
        {showWipeConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-rose-500/30 p-6 sm:p-8 space-y-4 shadow-2xl">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Erase Entire Medical History?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This action adheres to GDPR/HIPAA right-to-be-forgotten privacy standards. It will permanently delete all your assessment records, trend data, and habit logs from the database. This cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setShowWipeConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWipeAll}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30"
                >
                  Yes, Permanently Erase
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
