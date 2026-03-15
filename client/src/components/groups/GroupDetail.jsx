import { useState, useEffect } from "react";
import Navbar from "../layout/Navbar";
import api from "../../utils/api";
import toast from "react-hot-toast";

const GroupDetail = ({ group, onBack }) => {
  const [detail, setDetail] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    paidBy: "",
    splitBetween: "",
  });

  useEffect(() => {
    fetchDetail();
    fetchSettlements();
  }, []);

  const fetchDetail = async () => {
    try {
      const { data } = await api.get(`/groups/${group._id}`);
      setDetail(data);
    } catch (error) {
      toast.error("Failed to fetch group details");
    }
  };

  const fetchSettlements = async () => {
    try {
      const { data } = await api.get(`/groups/${group._id}/settlements`);
      setSettlements(data);
    } catch (error) {
      toast.error("Failed to fetch settlements");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const splitBetween = form.splitBetween
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m);

      await api.post(`/groups/${group._id}/expenses`, {
        description: form.description,
        amount: Number(form.amount),
        paidBy: form.paidBy,
        splitBetween,
      });

      toast.success("Expense added! 💸");
      setForm({ description: "", amount: "", paidBy: "", splitBetween: "" });
      setShowForm(false);
      fetchDetail();
      fetchSettlements();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/groups/${group._id}/expenses/${expenseId}`);
      toast.success("Expense deleted");
      fetchDetail();
      fetchSettlements();
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  if (!detail) {
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
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition text-sm"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">{detail.name}</h1>
            {detail.description && (
              <p className="text-gray-400 text-sm mt-1">{detail.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Expenses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-lg">Expenses</h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  {showForm ? "Cancel" : "+ Add Expense"}
                </button>
              </div>

              {showForm && (
                <form onSubmit={handleAddExpense} className="space-y-4 mb-6">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">
                      Description
                    </label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="Hotel booking"
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
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                      placeholder="3000"
                      required
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">
                      Paid By
                    </label>
                    <select
                      value={form.paidBy}
                      onChange={(e) =>
                        setForm({ ...form, paidBy: e.target.value })
                      }
                      required
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select member</option>
                      {detail.members.map((m) => (
                        <option key={m._id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">
                      Split Between
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {detail.members.map((m) => (
                        <label
                          key={m._id}
                          className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            value={m.name}
                            checked={form.splitBetween.includes(m.name)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const name = e.target.value;
                              const current = form.splitBetween
                                ? form.splitBetween
                                    .split(",")
                                    .map((x) => x.trim())
                                    .filter((x) => x)
                                : [];
                              const updated = checked
                                ? [...current, name]
                                : current.filter((x) => x !== name);
                              setForm({
                                ...form,
                                splitBetween: updated.join(", "),
                              });
                            }}
                            className="accent-indigo-500"
                          />
                          <span className="text-white text-sm">{m.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                  >
                    {submitting ? "Adding..." : "Add Expense"}
                  </button>
                </form>
              )}

              {/* Expenses List */}
              {detail.expenses.length > 0 ? (
                <div className="space-y-3">
                  {detail.expenses.map((expense) => (
                    <div
                      key={expense._id}
                      className="flex items-center justify-between bg-gray-700 px-4 py-3 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {expense.description}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Paid by {expense.paidBy} • Split{" "}
                          {expense.splitBetween.length} ways
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-indigo-400 font-bold">
                          ₹{expense.amount}
                        </p>
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="text-red-400 hover:text-red-300 text-sm transition"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No expenses yet
                </p>
              )}
            </div>
          </div>

          {/* Right — Members & Settlements */}
          <div className="space-y-6">
            {/* Members */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4">
                Members 👥
              </h2>
              <div className="space-y-2">
                {detail.members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 bg-gray-700 px-3 py-2 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {member.name[0].toUpperCase()}
                    </div>
                    <p className="text-white text-sm font-medium">
                      {member.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Settlements */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4">
                Settlements 💰
              </h2>
              {settlements.length > 0 ? (
                <div className="space-y-3">
                  {settlements.map((s, i) => (
                    <div key={i} className="bg-gray-700 px-4 py-3 rounded-lg">
                      <p className="text-white text-sm">
                        <span className="text-red-400 font-medium">
                          {s.from}
                        </span>
                        {" owes "}
                        <span className="text-green-400 font-medium">
                          {s.to}
                        </span>
                      </p>
                      <p className="text-indigo-400 font-bold mt-1">
                        ₹{s.amount}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  All settled up! 🎉
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
