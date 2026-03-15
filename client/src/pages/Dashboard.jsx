import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

const Dashboard = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState({});
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, groupRes] = await Promise.all([
        api.get("/subscriptions"),
        api.get("/groups"),
      ]);
      setSubscriptions(subRes.data.subscriptions);
      setSummary(subRes.data.summary);
      setGroups(groupRes.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const chartData = subscriptions
    .filter((s) => s.status === "active")
    .map((s) => ({ name: s.name, value: s.amount }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard 📊</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Monthly Spend</p>
            <p className="text-3xl font-bold text-indigo-400">
              ₹{summary.monthlyTotal || 0}
            </p>
            <p className="text-gray-500 text-xs mt-1">Active subscriptions</p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Yearly Spend</p>
            <p className="text-3xl font-bold text-purple-400">
              ₹{summary.yearlyTotal || 0}
            </p>
            <p className="text-gray-500 text-xs mt-1">Active subscriptions</p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Subscriptions</p>
            <p className="text-3xl font-bold text-pink-400">
              {summary.totalSubscriptions || 0}
            </p>
            <p className="text-gray-500 text-xs mt-1">All subscriptions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-4">
              Subscription Breakdown
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ₹${value}`}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-16">
                No subscriptions yet
              </p>
            )}
          </div>

          {/* Recent Groups */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-4">
              Recent Groups
            </h2>
            {groups.length > 0 ? (
              <div className="space-y-3">
                {groups.slice(0, 4).map((group) => (
                  <div
                    key={group._id}
                    className="flex items-center justify-between bg-gray-700 px-4 py-3 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">{group.name}</p>
                      <p className="text-gray-400 text-xs">
                        {group.members.length} members • {group.expenses.length}{" "}
                        expenses
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-16">No groups yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
