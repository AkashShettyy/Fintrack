import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../layout/Navbar";
import api from "../../utils/api";

const initialForm = { description: "", amount: "", paidBy: [], splitBetween: [] };

const inputCls = "w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/20 transition-all";

export default function GroupDetail({ group, onBack }) {
  const [detail, setDetail] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [balances, setBalances] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  const loadAll = useCallback(async () => {
    try {
      const [{ data: g }, { data: s }, { data: b }] = await Promise.all([
        api.get(`/groups/${group._id}`),
        api.get(`/groups/${group._id}/settlements`),
        api.get(`/groups/${group._id}/balances`),
      ]);
      setDetail(g); setSettlements(s); setBalances(b);
    } catch { toast.error("Failed to load group"); }
  }, [group._id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!form.paidBy.length || !form.splitBetween.length) { toast.error("Select payers and members to split"); return; }
    setSubmitting(true);
    try {
      await api.post(`/groups/${group._id}/expenses`, { description: form.description.trim(), amount: Number(form.amount), paidBy: form.paidBy, splitBetween: form.splitBetween });
      toast.success("Expense added"); setForm(initialForm); setShowForm(false); await loadAll();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try { await api.delete(`/groups/${group._id}/expenses/${id}`); toast.success("Deleted"); await loadAll(); }
    catch { toast.error("Failed"); }
  };

  const handleSettle = async (from, to, amount) => {
    try { await api.put(`/groups/${group._id}/settlements/settle`, { from, to, amount }); toast.success("Payment recorded"); await loadAll(); }
    catch { toast.error("Failed"); }
  };

  const toggle = (field, name, checked) => setForm((f) => ({ ...f, [field]: checked ? [...f[field], name] : f[field].filter((n) => n !== name) }));
  const toggleAll = (field, all) => setForm((f) => ({ ...f, [field]: f[field].length === all.length ? [] : all }));

  if (!detail) return (
    <div className="min-h-screen bg-[#070908] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
        <p className="text-gray-500 text-sm">Loading group...</p>
      </div>
    </div>
  );

  const allNames = detail.members.map((m) => m.name);
  const totalSpend = detail.expenses.reduce((s, e) => s + e.amount, 0);
  const averageExpense = detail.expenses.length ? Math.round(totalSpend / detail.expenses.length) : 0;
  const pendingTotal = settlements.reduce((sum, settlement) => sum + Number(settlement.amount || 0), 0);

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrap">

        {/* Header */}
        <div className="hero-panel mb-6 p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <button onClick={onBack} className="flex items-center gap-1.5 text-gray-500 hover:text-white transition text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-orange-500 text-base font-bold text-white shadow-lg shadow-teal-950/30 sm:flex">
                {detail.name[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="section-label text-teal-300">Group Workspace</p>
                <h1 className="mt-2 text-2xl font-bold text-white tracking-tight truncate">{detail.name}</h1>
                {detail.description && <p className="text-gray-500 text-sm mt-1 truncate">{detail.description}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:min-w-[430px]">
              {[
                { label: "Total", value: `₹${totalSpend.toLocaleString()}`, tone: "text-teal-300" },
                { label: "Average", value: `₹${averageExpense.toLocaleString()}`, tone: "text-emerald-300" },
                { label: "Pending", value: `₹${pendingTotal.toLocaleString()}`, tone: "text-orange-300" },
              ].map(({ label, value, tone }) => (
                <div key={label} className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">{label}</p>
                  <p className={`mt-2 text-sm font-bold sm:text-base ${tone}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left — Expenses */}
          <div className="lg:col-span-2 space-y-4">

            {/* Add expense card */}
            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <h2 className="text-white font-semibold text-sm">Expenses</h2>
                  <p className="text-gray-500 text-xs mt-0.5">{detail.expenses.length} recorded</p>
                </div>
                <button
                  onClick={() => { setShowForm((v) => !v); setForm(initialForm); }}
                  className={`flex items-center gap-2 text-sm font-semibold transition-all ${
                    showForm
                      ? "secondary-action px-3.5 py-2"
                      : "primary-action px-3.5 py-2"
                  }`}
                >
                  {showForm
                    ? <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Cancel</>
                    : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Expense</>
                  }
                </button>
              </div>

              {showForm && (
                <form onSubmit={handleAddExpense} className="border-t border-white/[0.06] px-5 py-5 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                      <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Hotel booking" required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Amount (₹)</label>
                      <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" required className={inputCls} />
                    </div>
                  </div>

                  {[{ field: "paidBy", label: "Paid By" }, { field: "splitBetween", label: "Split Between" }].map(({ field, label }) => (
                    <div key={field}>
                      <div className="flex items-center justify-between mb-2.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                          {label}
                          {form[field].length > 0 && <span className="ml-2 text-teal-300 normal-case font-normal">({form[field].length} selected)</span>}
                        </label>
                        <button type="button" onClick={() => toggleAll(field, allNames)} className="text-xs text-teal-300 hover:text-teal-200 font-semibold transition">
                          {form[field].length === allNames.length ? "Deselect all" : "Select all"}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {detail.members.map((m) => {
                          const sel = form[field].includes(m.name);
                          return (
                            <button key={m._id} type="button" onClick={() => toggle(field, m.name, !sel)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                                sel ? "bg-teal-600/20 border-teal-500/40 text-teal-300" : "bg-white/[0.04] border-white/[0.08] text-gray-400 hover:border-white/[0.15] hover:text-gray-300"
                              }`}
                            >
                              {sel && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                              {m.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <button type="submit" disabled={submitting} className="w-full primary-action py-2.5">
                    {submitting ? "Adding..." : "Add Expense"}
                  </button>
                </form>
              )}
            </div>

            {/* Expense list */}
            {detail.expenses.length > 0 ? (
              <div className="glass-card overflow-hidden">
                <div className="divide-y divide-white/[0.05]">
                  {detail.expenses.map((exp, i) => (
                    <div key={exp._id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition group">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300 text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{exp.description}</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          Paid by <span className="text-gray-400">{(Array.isArray(exp.paidBy) ? exp.paidBy : [exp.paidBy]).join(", ")}</span>
                          {" · "}split {exp.splitBetween.length} ways
                        </p>
                      </div>
                      <span className="text-white font-bold text-sm shrink-0">₹{exp.amount.toLocaleString()}</span>
                      <button onClick={() => handleDeleteExpense(exp._id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-card flex flex-col items-center justify-center py-14 text-center">
                <div className="w-12 h-12 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
                </div>
                <p className="text-gray-400 font-medium text-sm">No expenses yet</p>
                <p className="text-gray-600 text-xs mt-1">Add your first expense above</p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">

            {/* Member balances */}
            {balances.length > 0 && (
              <div className="glass-card p-5">
                <h2 className="text-white font-semibold text-sm mb-4">Balances</h2>
                <div className="space-y-2.5">
                  {balances.map((b) => (
                    <div key={b.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-teal-500 to-orange-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                          {b.name[0].toUpperCase()}
                        </div>
                        <span className="text-gray-300 text-sm font-medium">{b.name}</span>
                      </div>
                      <span className={`text-sm font-bold ${
                        b.status === "owed" ? "text-emerald-400" : b.status === "owes" ? "text-red-400" : "text-gray-500"
                      }`}>
                        {b.status === "owed" ? `+₹${b.balance}` : b.status === "owes" ? `-₹${Math.abs(b.balance)}` : "Settled"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-sm">Members</h2>
                <span className="text-xs font-semibold text-gray-500 bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded-md">{detail.members.length}</span>
              </div>
              <div className="space-y-2.5">
                {detail.members.map((m) => (
                  <div key={m._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md shadow-teal-950/30">
                      {m.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{m.name}</p>
                      {m.upiId && <p className="text-gray-500 text-xs truncate">{m.upiId}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settlements */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-sm">Settlements</h2>
                {settlements.length > 0
                  ? <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">{settlements.length} pending</span>
                  : <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">All clear</span>
                }
              </div>

              {settlements.length > 0 ? (
                <div className="space-y-3">
                  {settlements.map((s) => (
                    <div key={`${s.from}-${s.to}`} className="bg-white/[0.03] border border-white/[0.07] rounded-lg p-3.5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm min-w-0">
                          <span className="text-red-400 font-semibold truncate max-w-[65px]">{s.from}</span>
                          <svg className="w-3.5 h-3.5 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                          <span className="text-emerald-400 font-semibold truncate max-w-[65px]">{s.to}</span>
                        </div>
                        <span className="text-white font-bold text-sm shrink-0 ml-2">₹{s.amount}</span>
                      </div>
                      <div className="flex gap-2">
                        {s.upiId && (
                          <a href={`upi://pay?pa=${s.upiId}&pn=${s.to}&am=${s.amount}&cu=INR`}
                            className="flex-1 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/25 text-teal-300 py-2 rounded-lg text-xs text-center font-semibold transition">
                            Pay UPI
                          </a>
                        )}
                        <button onClick={() => handleSettle(s.from, s.to, s.amount)}
                          className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 py-2 rounded-lg text-xs font-semibold transition">
                          Mark Settled
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-gray-300 font-medium text-sm">All settled up!</p>
                  <p className="text-gray-600 text-xs mt-1">No pending payments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
