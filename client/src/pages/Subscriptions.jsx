import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import api from "../utils/api";
import toast from "react-hot-toast";

const CATEGORIES = ["Entertainment", "Productivity", "Health", "Education", "Other"];
const BILLING_CYCLES = ["monthly", "yearly"];
const STATUSES = ["active", "cancelled", "paused"];

const defaultForm = {
  name: "", amount: "", currency: "INR", category: "Other",
  billingCycle: "monthly", renewalDate: "", status: "active",
};

const inputClass =
  "w-full bg-[#0f1117] border border-white/10 text-white placeholder-gray-600 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition";

const selectClass =
  "w-full bg-[#0f1117] border border-white/10 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition";

const STATUS_STYLES = {
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const CATEGORY_COLORS = {
  Entertainment: "from-pink-600 to-rose-600",
  Productivity: "from-blue-600 to-cyan-600",
  Health: "from-green-600 to-emerald-600",
  Education: "from-yellow-600 to-amber-600",
  Other: "from-indigo-600 to-purple-600",
};

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchSubscriptions(); }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await api.get("/subscriptions");
      setSubscriptions(data.subscriptions);
      setSummary(data.summary);
    } catch {
      toast.error("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await api.put(`/subscriptions/${editId}`, form);
        toast.success("Subscription updated");
      } else {
        await api.post("/subscriptions", form);
        toast.success("Subscription added");
      }
      setForm(defaultForm);
      setEditId(null);
      setShowForm(false);
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sub) => {
    setForm({
      name: sub.name, amount: sub.amount, currency: sub.currency,
      category: sub.category, billingCycle: sub.billingCycle,
      renewalDate: sub.renewalDate.split("T")[0], status: sub.status,
    });
    setEditId(sub._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subscription?")) return;
    try {
      await api.delete(`/subscriptions/${id}`);
      toast.success("Subscription deleted");
      fetchSubscriptions();
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Subscriptions</h1>
            <p className="text-gray-500 text-sm mt-1">Track and manage recurring payments</p>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setForm(defaultForm); setEditId(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              showForm
                ? "bg-gray-800 border border-white/10 text-gray-300 hover:bg-gray-700"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            {showForm ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Subscription
              </>
            )}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Monthly Spend", value: `₹${(summary.monthlyTotal || 0).toLocaleString()}`, color: "text-indigo-400" },
            { label: "Yearly Spend", value: `₹${(summary.yearlyTotal || 0).toLocaleString()}`, color: "text-purple-400" },
            { label: "Total", value: summary.totalSubscriptions || 0, color: "text-pink-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#1a1d27] border border-white/5 rounded-2xl p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</p>
              <p className={`text-2xl font-bold ${color} tracking-tight`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-[#1a1d27] border border-white/5 rounded-2xl p-6 mb-6">
            <h2 className="text-white font-semibold mb-5">
              {editId ? "Edit Subscription" : "Add Subscription"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Name", key: "name", type: "text", placeholder: "Netflix" },
                { label: "Amount (₹)", key: "amount", type: "number", placeholder: "649" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    required
                    className={inputClass}
                  />
                </div>
              ))}

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={selectClass}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Billing Cycle</label>
                <select value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })} className={selectClass}>
                  {BILLING_CYCLES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Renewal Date</label>
                <input
                  type="date"
                  value={form.renewalDate}
                  onChange={(e) => setForm({ ...form, renewalDate: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectClass}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  {submitting ? "Saving..." : editId ? "Update Subscription" : "Add Subscription"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subscriptions List */}
        {subscriptions.length > 0 ? (
          <div className="bg-[#1a1d27] border border-white/5 rounded-2xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {subscriptions.map((sub) => (
                <div
                  key={sub._id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition group"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[sub.category] || CATEGORY_COLORS.Other} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {sub.name[0].toUpperCase()}
                  </div>

                  {/* Name + Category */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{sub.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {sub.category} · Renews {new Date(sub.renewalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[sub.status]}`}>
                    {sub.status}
                  </span>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-semibold text-sm">
                      ₹{Number(sub.amount).toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-xs">/{sub.billingCycle === "monthly" ? "mo" : "yr"}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleEdit(sub)}
                      className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(sub._id)}
                      className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#1a1d27] border border-white/5 rounded-2xl flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white font-medium">No subscriptions yet</p>
            <p className="text-gray-500 text-sm mt-1">Add your first subscription to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
