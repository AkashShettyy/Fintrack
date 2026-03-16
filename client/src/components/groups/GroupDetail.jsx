import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../layout/Navbar";
import api from "../../utils/api";

const initialForm = {
  description: "",
  amount: "",
  paidBy: [],
  splitBetween: [],
};

const GroupDetail = ({ group, onBack }) => {
  const [detail, setDetail] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const loadGroupData = async () => {
      try {
        const [{ data: groupData }, { data: settlementData }] =
          await Promise.all([
            api.get(`/groups/${group._id}`),
            api.get(`/groups/${group._id}/settlements`),
          ]);
        setDetail(groupData);
        setSettlements(settlementData);
      } catch (error) {
        toast.error("Failed to fetch group details");
      }
    };
    loadGroupData();
  }, [group._id]);

  const refreshData = async () => {
    try {
      const [{ data: groupData }, { data: settlementData }] = await Promise.all(
        [
          api.get(`/groups/${group._id}`),
          api.get(`/groups/${group._id}/settlements`),
        ],
      );
      setDetail(groupData);
      setSettlements(settlementData);
    } catch (error) {
      toast.error("Failed to refresh group details");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!form.paidBy.length || !form.splitBetween.length) {
        toast.error("Select at least one payer and one member to split");
        setSubmitting(false);
        return;
      }
      await api.post(`/groups/${group._id}/expenses`, {
        description: form.description.trim(),
        amount: Number(form.amount),
        paidBy: form.paidBy,
        splitBetween: form.splitBetween,
      });
      toast.success("Expense added 💸");
      setForm(initialForm);
      setShowForm(false);
      await refreshData();
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
      await refreshData();
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  const handleMarkSettled = async (from, to, amount) => {
    try {
      await api.put(`/groups/${group._id}/settlements/settle`, {
        from,
        to,
        amount,
      });
      toast.success("Payment recorded! ✅");
      await refreshData();
    } catch (error) {
      toast.error("Failed to record payment");
    }
  };

  const toggleMember = (field, name, checked) => {
    setForm((f) => ({
      ...f,
      [field]: checked ? [...f[field], name] : f[field].filter((n) => n !== name),
    }));
  };

  const toggleAll = (field, allNames) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].length === allNames.length ? [] : allNames,
    }));
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
                  onClick={() => setShowForm((current) => !current)}
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
                        setForm((currentForm) => ({
                          ...currentForm,
                          description: e.target.value,
                        }))
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
                      min="0"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) =>
                        setForm((currentForm) => ({
                          ...currentForm,
                          amount: e.target.value,
                        }))
                      }
                      placeholder="3000"
                      required
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {["paidBy", "splitBetween"].map((field) => {
                    const allNames = detail.members.map((m) => m.name);
                    const label = field === "paidBy" ? "Paid By" : "Split Between";
                    return (
                      <div key={field}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-gray-400 text-sm">{label}</label>
                          <button
                            type="button"
                            onClick={() => toggleAll(field, allNames)}
                            className="text-indigo-400 text-xs hover:text-indigo-300"
                          >
                            {form[field].length === allNames.length ? "Deselect All" : "Select All"}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {detail.members.map((member) => {
                            const selected = form[field].includes(member.name);
                            return (
                              <button
                                key={member._id}
                                type="button"
                                onClick={() => toggleMember(field, member.name, !selected)}
                                className={`px-3 py-1 rounded-full text-sm transition ${
                                  selected
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                              >
                                {member.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                  >
                    {submitting ? "Adding..." : "Add Expense"}
                  </button>
                </form>
              )}

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
                          Paid by {Array.isArray(expense.paidBy) ? expense.paidBy.join(", ") : expense.paidBy} • Split{" "}
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
            <div className="bg-gray-800 rounded-2xl p-4">
              <h2 className="text-white font-semibold mb-3">Members 👥</h2>
              <div className="flex flex-wrap gap-2">
                {detail.members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-full"
                  >
                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {member.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-white text-sm">{member.name}</span>
                    {member.upiId && (
                      <span className="text-gray-400 text-xs">· {member.upiId}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Settlements */}
            <div className="bg-gray-800 rounded-2xl p-4">
              <h2 className="text-white font-semibold mb-3">Settlements 💰</h2>
              {settlements.length > 0 ? (
                <div className="space-y-2">
                  {settlements.map((s) => (
                    <div
                      key={`${s.from}-${s.to}`}
                      className="bg-gray-700 px-3 py-2 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm">
                          <span className="text-red-400 font-medium">{s.from}</span>
                          <span className="text-gray-400"> → </span>
                          <span className="text-green-400 font-medium">{s.to}</span>
                        </p>
                        <span className="text-indigo-400 font-bold text-sm">₹{s.amount}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {s.upiId && (
                          <a
                            href={`upi://pay?pa=${s.upiId}&pn=${s.to}&am=${s.amount}&cu=INR`}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg text-xs text-center transition"
                          >
                            Pay via UPI 💳
                          </a>
                        )}
                        <button
                          onClick={() => handleMarkSettled(s.from, s.to, s.amount)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg text-xs transition"
                        >
                          Mark Settled ✅
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">All settled up! 🎉</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
