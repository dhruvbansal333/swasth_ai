import { useState, useEffect } from "react";
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
  X
} from "lucide-react";

export default function History() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading Patient History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
              <HistoryIcon className="h-3.5 w-3.5 text-slate-600" />
              <span>Assessment Timeline</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Patient Assessment History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Complete, private log of your past basic and diagnostic lab assessments.
            </p>
          </div>

          {assessments.length > 0 && (
            <button
              onClick={() => setShowWipeConfirm(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-600" />
              <span>Erase All History (GDPR Wipe)</span>
            </button>
          )}
        </div>

        {/* Wipe Confirm Modal */}
        {showWipeConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center">Permanently Erase All Data?</h3>
              <p className="text-xs text-slate-500 text-center leading-relaxed">
                This action is irreversible. It permanently deletes all historical vitals, lab reports, disease predictions, and habit records associated with your account.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowWipeConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWipeAll}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {assessments.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs max-w-md mx-auto space-y-4">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Assessment Records Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You haven't completed any health assessments under this account yet. Complete an assessment to save your clinical history.
            </p>
            <div className="pt-2">
              <Link
                to="/assessment/basic"
                className="inline-block px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                Start New Assessment
              </Link>
            </div>
          </div>
        ) : (
          /* Timeline List */
          <div className="space-y-4">
            {assessments.map((item) => {
              const res = item.results;
              const vitals = item.vitals;
              const dateStr = new Date(item.createdAt).toLocaleString();
              const isAdvanced = item.assessmentType === "advanced";

              return (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isAdvanced ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {isAdvanced ? "Advanced Lab Report" : "Basic Assessment"}
                      </span>
                      <span className="text-xs text-slate-400">{dateStr}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">
                        {res.overall?.tier}
                      </span>
                      <RiskBadge tier={res.overall?.tier} probability={res.overall?.averageProbability} />
                    </div>

                    {/* Disease Tiers Pills */}
                    <div className="flex flex-wrap gap-2 text-xs pt-1">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                        Diabetes: <b>{res.diseases?.diabetes?.riskTier} ({res.diseases?.diabetes?.percentage}%)</b>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                        Heart: <b>{res.diseases?.heart?.riskTier} ({res.diseases?.heart?.percentage}%)</b>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                        Hypertension: <b>{res.diseases?.hypertension?.riskTier} ({res.diseases?.hypertension?.percentage}%)</b>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => setSelectedRecord(item)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Record Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 relative">
              
              <button
                onClick={() => setSelectedRecord(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Assessment #{selectedRecord.id} Details
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {new Date(selectedRecord.createdAt).toLocaleString()}
                </h3>
              </div>

              {/* Vitals Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Recorded Vitals</h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {Object.entries(selectedRecord.vitals).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-slate-400 block capitalize">{k}:</span>
                      <span className="font-bold text-slate-900">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diseases Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Clinical Model Outputs</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(selectedRecord.results.diseases).map(([disName, disInfo]) => (
                    <div key={disName} className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
                      <span className="text-xs font-bold text-slate-800 capitalize block">{disName}</span>
                      <div className="text-xl font-black text-slate-900">{disInfo.percentage}%</div>
                      <RiskBadge tier={disInfo.riskTier} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
