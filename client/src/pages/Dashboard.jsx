import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import api from "../utils/api";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

const STAT_CONFIG = [
  { key: "monthly", label: "Monthly Spend", prefix: "₹", color: "from-indigo-600/20 to-indigo-600/5", border: "border-indigo-500/20", text: "text-indigo-400", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "yearly", label: "Yearly Spend", prefix: "₹", color: "from-violet-600/20 to-violet-600/5", border: "border-violet-500/20", text: "text-violet-400", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { key: "total", label: "Subscriptions", prefix: "", color: "from-pink-600/20 to-pink-600/5", border: "border-pink-500/20", text: "text-pink-400", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
];

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState({});
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [s, g] = await Promise.all([api.get("/subscriptions"), api.get("/groups")]);
        setSubscriptions(s.data.subscriptions);
        setSummary(s.data.summary);
        setGroups(g.data);
      } catch { toast.error("Failed to load data"); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#080a10] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-gray-500 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );

  const chartData = subscriptions.filter((s) => s.status === "active").map((s) => ({ name: s.name, value: s.amount }));
  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const nextRenewals = subscriptions
    .filter((s) => s.status === "active" && s.renewalDate)
    .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate))
    .slice(0, 4);
  const topSubscriptions = [...subscriptions]
    .filter((s) => s.status === "active")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);
  const totalGroupSpend = groups.reduce(
    (sum, group) => sum + (group.expenses?.reduce((inner, expense) => inner + expense.amount, 0) || 0),
    0,
  );
  const todayLabel = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const statValues = {
    monthly: (summary.monthlyTotal || 0).toLocaleString(),
    yearly: (summary.yearlyTotal || 0).toLocaleString(),
    total: summary.totalSubscriptions || 0,
  };

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-wrap">
        <div className="hero-panel p-6 sm:p-8 mb-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-label text-cyan-300">Overview</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
                A live snapshot of your recurring spend, active services, and recent group activity.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">Snapshot for {todayLabel}</span>
                <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1.5 text-cyan-200">
                  {activeCount} active services monitored
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: "Active", value: activeCount },
                { label: "Groups", value: groups.length },
                { label: "Monthly", value: `₹${(summary.monthlyTotal || 0).toLocaleString()}` },
              ].map(({ label, value }) => (
                <div key={label} className="glass-card min-w-[120px] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">{label}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {STAT_CONFIG.map(({ key, label, prefix, color, border, text, icon }) => (
            <div key={key} className={`stat-card ${color} ${border} p-6`}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/[0.02] -translate-y-8 translate-x-8" />
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
                <div className={`w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center ${text}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
                  </svg>
                </div>
              </div>
              <p className={`text-3xl font-bold ${text} tracking-tight`}>{prefix}{statValues[key]}</p>
              {key === "monthly" && <p className="text-gray-600 text-xs mt-2">{activeCount} active subscription{activeCount !== 1 ? "s" : ""}</p>}
              {key === "yearly" && <p className="text-gray-600 text-xs mt-2">Projected annual cost</p>}
              {key === "total" && <p className="text-gray-600 text-xs mt-2">{groups.length} group{groups.length !== 1 ? "s" : ""} created</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-white">Spend Breakdown</h2>
              <button onClick={() => navigate("/subscriptions")} className="text-xs text-indigo-400 hover:text-indigo-300 transition font-medium">View all →</button>
            </div>
            <p className="text-gray-500 text-xs mb-5">Active subscriptions by cost</p>

            {chartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#0f1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff", fontSize: "12px", padding: "8px 14px" }}
                      formatter={(v, n) => [`₹${v}`, n]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {chartData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-400 text-xs flex-1 truncate">{d.name}</span>
                      <span className="text-gray-500 text-xs font-medium">₹{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[190px] text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">No data yet</p>
                <button onClick={() => navigate("/subscriptions")} className="text-indigo-400 text-xs mt-2 hover:text-indigo-300 transition">Add subscriptions →</button>
              </div>
            )}
          </div>

          {/* Groups */}
          <div className="lg:col-span-3 glass-card p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-white">Recent Groups</h2>
              <button onClick={() => navigate("/groups")} className="text-xs text-indigo-400 hover:text-indigo-300 transition font-medium">View all →</button>
            </div>
            <p className="text-gray-500 text-xs mb-5">Bill splitter activity</p>

            {groups.length > 0 ? (
              <div className="space-y-2.5">
                {groups.slice(0, 5).map((group) => {
                  const total = group.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
                  return (
                    <div key={group._id} className="flex items-center gap-3.5 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.1] px-4 py-3.5 rounded-xl transition cursor-pointer" onClick={() => navigate("/groups")}>
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg shadow-indigo-500/20">
                        {group.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{group.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{group.members.length} members · {group.expenses.length} expenses</p>
                      </div>
                      {total > 0 && <span className="text-indigo-400 text-sm font-bold shrink-0">₹{total.toLocaleString()}</span>}
                      <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[220px] text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">No groups yet</p>
                <button onClick={() => navigate("/groups")} className="text-indigo-400 text-xs mt-2 hover:text-indigo-300 transition">Create a group →</button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Upcoming Renewals</h2>
                <p className="mt-1 text-xs text-gray-500">What needs attention next</p>
              </div>
              <button onClick={() => navigate("/subscriptions")} className="text-xs font-medium text-cyan-300 hover:text-cyan-200 transition">
                Manage
              </button>
            </div>

            {nextRenewals.length > 0 ? (
              <div className="mt-5 space-y-3">
                {nextRenewals.map((item) => (
                  <div key={item._id} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {new Date(item.renewalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {item.billingCycle}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-cyan-300">₹{Number(item.amount).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-6 text-center text-sm text-gray-400">
                No active renewals scheduled yet.
              </div>
            )}
          </div>

          <div className="lg:col-span-3 glass-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Spend Signals</h2>
                <p className="mt-1 text-xs text-gray-500">Largest active services and shared-cost footprint</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
                <div className="rounded-2xl border border-amber-400/15 bg-amber-400/10 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-amber-100/70">Group Spend</p>
                  <p className="mt-2 text-lg font-semibold text-amber-200">₹{totalGroupSpend.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/70">Top Services</p>
                  <p className="mt-2 text-lg font-semibold text-cyan-200">{topSubscriptions.length}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {topSubscriptions.length > 0 ? (
                topSubscriptions.map((subscription, index) => (
                  <div key={subscription._id} className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.05] text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{subscription.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{subscription.category} · {subscription.billingCycle}</p>
                    </div>
                    <p className="text-sm font-semibold text-white">₹{Number(subscription.amount).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-6 text-center text-sm text-gray-400">
                  Add subscriptions to surface spend signals.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
