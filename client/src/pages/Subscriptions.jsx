import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import api from "../utils/api";
import toast from "react-hot-toast";

const CATEGORIES = ["Entertainment", "Productivity", "Health", "Education", "Other"];
const BILLING_CYCLES = ["monthly", "yearly"];
const STATUSES = ["active", "cancelled", "paused"];

const defaultForm = { name: "", amount: "", currency: "INR", category: "Other", billingCycle: "monthly", renewalDate: "", status: "active", notes: "" };

const STATUS_PILL = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  paused: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/25",
};

const CAT_GRADIENT = {
  Entertainment: "from-pink-500 to-rose-600",
  Productivity: "from-blue-500 to-cyan-600",
  Health: "from-emerald-500 to-green-600",
  Education: "from-amber-500 to-yellow-600",
  Other: "from-indigo-500 to-violet-600",
};

const inputCls = "w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all";
const selectCls = "w-full bg-white/[0.05] border border-white/[0.1] text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all";

const daysUntil = (dateStr) => {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
};

const RenewalBadge = ({ date }) => {
  const days = daysUntil(date);
  if (days < 0) return <span className="text-xs text-gray-600">Overdue</span>;
  if (days <= 3) return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">in {days}d</span>;
  if (days <= 7) return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">in {days}d</span>;
  return <span className="text-gray-500 text-xs">{new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}</span>;
};

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadSubscriptions(); }, []);

  const loadSubscriptions = async () => {
    try {
      const { data } = await api.get("/subscriptions");
      setSubscriptions(data.subscriptions);
      setSummary(data.summary);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      editId ? await api.put(`/subscriptions/${editId}`, form) : await api.post("/subscriptions", form);
      toast.success(editId ? "Updated" : "Added");
      setForm(defaultForm); setEditId(null); setShowForm(false); loadSubscriptions();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (sub) => {
    setForm({ name: sub.name, amount: sub.amount, currency: sub.currency, category: sub.category, billingCycle: sub.billingCycle, renewalDate: sub.renewalDate.split("T")[0], status: sub.status, notes: sub.notes || "" });
    setEditId(sub._id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subscription?")) return;
    try { await api.delete(`/subscriptions/${id}`); toast.success("Deleted"); loadSubscriptions(); }
    catch { toast.error("Failed"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#080a10] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );

  // annualizedTotal = monthly*12 + yearly (fixed from backend, fallback computed here)
  const annualized = summary.annualizedTotal ?? ((summary.monthlyTotal || 0) * 12 + (summary.yearlyTotal || 0));

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrap">
        <div className="hero-panel p-6 sm:p-8 mb-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-300">Recurring Spend</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Subscriptions</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
                Track renewals, billing cycles, and annualized cost without losing detail on individual services.
              </p>
            </div>
            <button
              onClick={() => { setShowForm((v) => !v); setForm(defaultForm); setEditId(null); }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                showForm
                  ? "bg-white/[0.06] border border-white/[0.1] text-gray-300 hover:bg-white/[0.09]"
                  : "bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25"
              }`}
            >
              {showForm
                ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Cancel</>
                : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Subscription</>
              }
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_280px] gap-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Monthly", value: `₹${(summary.monthlyTotal || 0).toLocaleString()}`, color: "text-indigo-300", border: "border-indigo-500/20", bg: "from-indigo-600/10 to-transparent" },
              { label: "Annual Cost", value: `₹${annualized.toLocaleString()}`, color: "text-violet-300", border: "border-violet-500/20", bg: "from-violet-600/10 to-transparent", sub: "monthly×12 + yearly" },
              { label: "Total", value: summary.totalSubscriptions || 0, color: "text-cyan-300", border: "border-cyan-500/20", bg: "from-cyan-600/10 to-transparent" },
            ].map(({ label, value, color, border, bg, sub }) => (
              <div key={label} className={`bg-gradient-to-br ${bg} border ${border} rounded-2xl px-5 py-4`}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">{label}</p>
                <p className={`text-2xl font-bold ${color} tracking-tight`}>{value}</p>
                {sub && <p className="text-gray-600 text-[11px] mt-1">{sub}</p>}
              </div>
            ))}
          </div>
          <div className="glass-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Renewal Focus</p>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              Prioritize active subscriptions with near-term renewal dates to reduce surprise charges.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">0-3 days</span>
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">4-7 days</span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-semibold text-gray-300">Later</span>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="glass-card p-6 mb-6">
            <h2 className="text-white font-semibold mb-5">{editId ? "Edit Subscription" : "New Subscription"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Netflix" required className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Amount (₹)</label><input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="649" required className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={selectCls}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Billing Cycle</label><select value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })} className={selectCls}>{BILLING_CYCLES.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Renewal Date</label><input type="date" value={form.renewalDate} onChange={(e) => setForm({ ...form, renewalDate: e.target.value })} required className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectCls}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Notes <span className="normal-case font-normal text-gray-600">(optional)</span></label>
                <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Family plan, login: user@email.com" className={inputCls} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20">
                  {submitting ? "Saving..." : editId ? "Update Subscription" : "Add Subscription"}
                </button>
              </div>
            </form>
          </div>
        )}

        {subscriptions.length > 0 ? (
          <div className="glass-card overflow-hidden">
            <div className="hidden sm:grid grid-cols-[auto_1fr_110px_130px_80px_100px_60px] items-center gap-4 px-5 py-3 border-b border-white/[0.06]">
              {["", "Name", "Category", "Renewal", "Status", "Amount", ""].map((h, i) => (
                <p key={i} className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest">{h}</p>
              ))}
            </div>
            <div className="divide-y divide-white/[0.05]">
              {subscriptions.map((sub) => (
                <div key={sub._id} className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_110px_130px_80px_100px_60px] items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition group">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${CAT_GRADIENT[sub.category] || CAT_GRADIENT.Other} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md`}>
                    {sub.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{sub.name}</p>
                    {sub.notes
                      ? <p className="text-gray-600 text-xs mt-0.5 truncate">{sub.notes}</p>
                      : <p className="text-gray-500 text-xs mt-0.5 sm:hidden">{sub.category} · ₹{Number(sub.amount).toLocaleString()}/{sub.billingCycle === "monthly" ? "mo" : "yr"}</p>
                    }
                  </div>
                  <p className="hidden sm:block text-gray-500 text-sm truncate">{sub.category}</p>
                  <div className="hidden sm:flex items-center gap-2">
                    <RenewalBadge date={sub.renewalDate} />
                  </div>
                  <span className={`hidden sm:inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_PILL[sub.status]}`}>{sub.status}</span>
                  <div className="hidden sm:block text-right">
                    <p className="text-white font-bold text-sm">₹{Number(sub.amount).toLocaleString()}</p>
                    <p className="text-gray-600 text-xs">/{sub.billingCycle === "monthly" ? "mo" : "yr"}</p>
                  </div>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => handleEdit(sub)} className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/10 transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(sub._id)} className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-card flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-white font-semibold">No subscriptions yet</p>
            <p className="text-gray-500 text-sm mt-1">Add your first subscription to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
