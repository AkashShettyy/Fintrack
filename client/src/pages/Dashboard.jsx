import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import api from "../utils/api";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

const StatCard = ({ label, value, sub, color }) => (
  <div className="bg-[#1a1d27] border border-white/5 rounded-2xl p-5">
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{label}</p>
    <p className={`text-3xl font-bold ${color} tracking-tight`}>{value}</p>
    {sub && <p className="text-gray-600 text-xs mt-1.5">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState({});
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, groupRes] = await Promise.all([
          api.get("/subscriptions"),
          api.get("/groups"),
        ]);
        setSubscriptions(subRes.data.subscriptions);
        setSummary(subRes.data.summary);
        setGroups(groupRes.data);
      } catch {
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = subscriptions
    .filter((s) => s.status === "active")
    .map((s) => ({ name: s.name, value: s.amount }));

  const activeCount = subscriptions.filter((s) => s.status === "active").length;

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Your financial overview</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Monthly Spend"
            value={`₹${(summary.monthlyTotal || 0).toLocaleString()}`}
            sub={`${activeCount} active subscription${activeCount !== 1 ? "s" : ""}`}
            color="text-indigo-400"
          />
          <StatCard
            label="Yearly Spend"
            value={`₹${(summary.yearlyTotal || 0).toLocaleString()}`}
            sub="Projected annual cost"
            color="text-purple-400"
          />
          <StatCard
            label="Total Subscriptions"
            value={summary.totalSubscriptions || 0}
            sub={`${groups.length} bill splitter group${groups.length !== 1 ? "s" : ""}`}
            color="text-pink-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pie Chart */}
          <div className="bg-[#1a1d27] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold text-sm">Subscription Breakdown</h2>
                <p className="text-gray-500 text-xs mt-0.5">Active subscriptions by spend</p>
              </div>
              <button
                onClick={() => navigate("/subscriptions")}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                View all →
              </button>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1a1d27",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(v, n) => [`₹${v}`, n]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[220px]">
                <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No active subscriptions</p>
              </div>
            )}
            {/* Legend */}
            {chartData.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                {chartData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-400 text-xs">{d.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Groups */}
          <div className="bg-[#1a1d27] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold text-sm">Recent Groups</h2>
                <p className="text-gray-500 text-xs mt-0.5">Bill splitter activity</p>
              </div>
              <button
                onClick={() => navigate("/groups")}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                View all →
              </button>
            </div>
            {groups.length > 0 ? (
              <div className="space-y-2">
                {groups.slice(0, 5).map((group) => {
                  const totalSpend = group.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
                  return (
                    <div
                      key={group._id}
                      className="flex items-center justify-between bg-[#0f1117] border border-white/5 px-4 py-3 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {group.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{group.name}</p>
                          <p className="text-gray-500 text-xs">
                            {group.members.length} members · {group.expenses.length} expenses
                          </p>
                        </div>
                      </div>
                      {totalSpend > 0 && (
                        <span className="text-indigo-400 text-sm font-semibold">
                          ₹{totalSpend.toLocaleString()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[220px]">
                <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No groups yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
