import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import api from "../utils/api";
import { daysUntil } from "../utils/dates";
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
  Entertainment: "from-rose-500 to-orange-500",
  Productivity: "from-teal-500 to-sky-500",
  Health: "from-emerald-500 to-green-600",
  Education: "from-orange-500 to-yellow-500",
  Other: "from-teal-500 to-orange-500",
};

const inputCls = "w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 transition-all";
const selectCls = "w-full bg-white/[0.05] border border-white/[0.1] text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 transition-all";

const RenewalBadge = ({ date }) => {
  const days = daysUntil(date);
  if (days === null) return <span className="text-xs text-gray-600">No date</span>;
  if (days < 0) return <span className="text-xs text-gray-600">Overdue</span>;
  if (days === 0) return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">today</span>;
  if (days <= 3) return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">in {days}d</span>;
  if (days <= 7) return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">in {days}d</span>;
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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

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
    <div className="min-h-screen bg-[#070908] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );

  // annualizedTotal = monthly*12 + yearly (fixed from backend, fallback computed here)
  const annualized = summary.annualizedTotal ?? ((summary.monthlyTotal || 0) * 12 + (summary.yearlyTotal || 0));
  const activeCount = subscriptions.filter((sub) => sub.status === "active").length;
  const pausedCount = subscriptions.filter((sub) => sub.status === "paused").length;
  const averageActiveCost = activeCount ? Math.round((summary.monthlyTotal || 0) / activeCount) : 0;
  const activeRenewals = subscriptions
    .filter((sub) => sub.status === "active")
    .map((sub) => ({ ...sub, daysToRenewal: daysUntil(sub.renewalDate) }))
    .filter((sub) => sub.daysToRenewal !== null);
  const renewalBuckets = {
    urgent: activeRenewals.filter((sub) => sub.daysToRenewal <= 3 && sub.daysToRenewal >= 0).length,
    soon: activeRenewals.filter((sub) => sub.daysToRenewal > 3 && sub.daysToRenewal <= 7).length,
  };
  const categoryOptions = ["all", ...CATEGORIES.filter((category) => subscriptions.some((sub) => sub.category === category))];
  const largestMonthly = [...subscriptions]
    .filter((sub) => sub.status === "active")
    .sort((a, b) => Number(b.amount) - Number(a.amount))[0];
  const filteredSubscriptions = subscriptions
    .filter((sub) => {
      const matchesQuery =
        !query ||
        sub.name.toLowerCase().includes(query.toLowerCase()) ||
        sub.category.toLowerCase().includes(query.toLowerCase()) ||
        (sub.notes || "").toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || sub.category === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    })
    .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate));

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrap">
        <div className="hero-panel p-6 sm:p-8 mb-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="section-label text-teal-300">Recurring Spend</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Subscriptions</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
                Track renewals, billing cycles, and annualized cost without losing detail on individual services.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-400">
                <span className="insight-chip border-red-500/20 bg-red-500/10 text-red-300">{renewalBuckets.urgent} urgent renewals</span>
                <span className="insight-chip border-amber-500/20 bg-amber-500/10 text-amber-300">{renewalBuckets.soon} due this week</span>
                <span className="insight-chip border-teal-500/20 bg-teal-500/10 text-teal-200">₹{averageActiveCost.toLocaleString()} average active cost</span>
                {largestMonthly && (
                  <span className="insight-chip border-white/[0.08] bg-white/[0.04] text-gray-300">
                    Top service: {largestMonthly.name}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => { setShowForm((v) => !v); setForm(defaultForm); setEditId(null); }}
              className={`flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                showForm
                  ? "secondary-action"
                  : "primary-action"
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
              { label: "Monthly", value: `₹${(summary.monthlyTotal || 0).toLocaleString()}`, color: "text-teal-300", border: "border-teal-500/20", bg: "from-teal-500/10 to-transparent", sub: `${activeCount} active` },
              { label: "Annual Cost", value: `₹${annualized.toLocaleString()}`, color: "text-emerald-300", border: "border-emerald-500/20", bg: "from-emerald-500/10 to-transparent", sub: "monthly x 12 + yearly" },
              { label: "Paused", value: pausedCount, color: "text-orange-300", border: "border-orange-500/20", bg: "from-orange-500/10 to-transparent", sub: `${summary.totalSubscriptions || 0} total` },
            ].map(({ label, value, color, border, bg, sub }) => (
              <div key={label} className={`bg-gradient-to-br ${bg} border ${border} rounded-lg px-5 py-4`}>
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
              <span className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">0-3 days · {renewalBuckets.urgent}</span>
              <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">4-7 days · {renewalBuckets.soon}</span>
              <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-semibold text-gray-300">Later</span>
            </div>
          </div>
        </div>

        <div className="glass-card mb-6 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, category, or notes"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", ...STATUSES].map((status) => {
                const active = statusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                      active
                        ? "border-teal-400/20 bg-teal-400/10 text-teal-200"
                        : "border-white/[0.08] bg-white/[0.03] text-gray-400 hover:text-white"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => {
                const active = categoryFilter === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setCategoryFilter(category)}
                    className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${
                      active
                        ? "border-orange-400/20 bg-orange-400/10 text-orange-100"
                        : "border-white/[0.08] bg-white/[0.03] text-gray-400 hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
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
                <button type="submit" disabled={submitting} className="w-full primary-action py-2.5">
                  {submitting ? "Saving..." : editId ? "Update Subscription" : "Add Subscription"}
                </button>
              </div>
            </form>
          </div>
        )}

        {subscriptions.length > 0 ? (
          <div className="glass-card overflow-hidden">
            {filteredSubscriptions.length > 0 ? (
              <>
                <div className="hidden sm:grid grid-cols-[auto_1fr_110px_130px_80px_100px_60px] items-center gap-4 px-5 py-3 border-b border-white/[0.06]">
                  {["", "Name", "Category", "Renewal", "Status", "Amount", ""].map((h, i) => (
                    <p key={i} className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest">{h}</p>
                  ))}
                </div>
                <div className="divide-y divide-white/[0.05]">
                  {filteredSubscriptions.map((sub) => (
                    <div key={sub._id} className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_110px_130px_80px_100px_60px] items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition group">
                      <div className={`w-9 h-9 rounded-md bg-gradient-to-br ${CAT_GRADIENT[sub.category] || CAT_GRADIENT.Other} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md`}>
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
                      <span className={`hidden sm:inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-semibold border ${STATUS_PILL[sub.status]}`}>{sub.status}</span>
                      <div className="hidden sm:block text-right">
                        <p className="text-white font-bold text-sm">₹{Number(sub.amount).toLocaleString()}</p>
                        <p className="text-gray-600 text-xs">/{sub.billingCycle === "monthly" ? "mo" : "yr"}</p>
                      </div>
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition">
                        <button onClick={() => handleEdit(sub)} aria-label={`Edit ${sub.name}`} className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/10 focus-visible:text-white focus-visible:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 transition">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(sub._id)} aria-label={`Delete ${sub.name}`} className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 focus-visible:text-red-400 focus-visible:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 transition">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-teal-400/15 bg-teal-400/10">
                  <svg className="h-7 w-7 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-white">No matching subscriptions</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">Clear the current search and status filter to bring the full list back.</p>
                <button
                  type="button"
                  onClick={() => { setQuery(""); setStatusFilter("all"); setCategoryFilter("all"); }}
                  className="mt-5 rounded-lg border border-teal-400/20 bg-teal-400/10 px-4 py-2 text-sm font-semibold text-teal-200 transition hover:bg-teal-400/15 hover:text-white"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
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
