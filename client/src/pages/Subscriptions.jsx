import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import api from "../utils/api";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Entertainment",
  "Productivity",
  "Health",
  "Education",
  "Other",
];
const BILLING_CYCLES = ["monthly", "yearly"];
const STATUSES = ["active", "cancelled", "paused"];

const defaultForm = {
  name: "",
  amount: "",
  currency: "INR",
  category: "Other",
  billingCycle: "monthly",
  renewalDate: "",
  status: "active",
};

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await api.get("/subscriptions");
      setSubscriptions(data.subscriptions);
      setSummary(data.summary);
    } catch (error) {
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
        toast.success("Subscription updated! ✅");
      } else {
        await api.post("/subscriptions", form);
        toast.success("Subscription added! 🎉");
      }
      setForm(defaultForm);
      setEditId(null);
      setShowForm(false);
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sub) => {
    setForm({
      name: sub.name,
      amount: sub.amount,
      currency: sub.currency,
      category: sub.category,
      billingCycle: sub.billingCycle,
      renewalDate: sub.renewalDate.split("T")[0],
      status: sub.status,
    });
    setEditId(sub._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subscription?")) return;
    try {
      await api.delete(`/subscriptions/${id}`);
      toast.success("Subscription deleted");
      fetchSubscriptions();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const statusColor = (status) => {
    if (status === "active") return "text-green-400";
    if (status === "paused") return "text-yellow-400";
    return "text-red-400";
  };

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Subscriptions 📅</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setForm(defaultForm);
              setEditId(null);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition"
          >
            {showForm ? "Cancel" : "+ Add Subscription"}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Monthly Spend</p>
            <p className="text-3xl font-bold text-indigo-400">
              ₹{summary.monthlyTotal || 0}
            </p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Yearly Spend</p>
            <p className="text-3xl font-bold text-purple-400">
              ₹{summary.yearlyTotal || 0}
            </p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Subscriptions</p>
            <p className="text-3xl font-bold text-pink-400">
              {summary.totalSubscriptions || 0}
            </p>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-white font-semibold text-lg mb-4">
              {editId ? "Edit Subscription" : "Add Subscription"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Netflix"
                  required
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="649"
                  required
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  Billing Cycle
                </label>
                <select
                  value={form.billingCycle}
                  onChange={(e) =>
                    setForm({ ...form, billingCycle: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {BILLING_CYCLES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  Renewal Date
                </label>
                <input
                  type="date"
                  value={form.renewalDate}
                  onChange={(e) =>
                    setForm({ ...form, renewalDate: e.target.value })
                  }
                  required
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editId
                      ? "Update Subscription"
                      : "Add Subscription"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subscriptions List */}
        {subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((sub) => (
              <div key={sub._id} className="bg-gray-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-lg">
                    {sub.name}
                  </h3>
                  <span
                    className={`text-sm font-medium ${statusColor(sub.status)}`}
                  >
                    {sub.status}
                  </span>
                </div>

                <p className="text-3xl font-bold text-indigo-400 mb-3">
                  ₹{sub.amount}
                  <span className="text-sm text-gray-400 font-normal">
                    /{sub.billingCycle === "monthly" ? "mo" : "yr"}
                  </span>
                </p>

                <div className="space-y-1 mb-4">
                  <p className="text-gray-400 text-sm">📁 {sub.category}</p>
                  <p className="text-gray-400 text-sm">
                    🔄 Renews on{" "}
                    {new Date(sub.renewalDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(sub)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sub._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-lg">No subscriptions yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Click + Add Subscription to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
