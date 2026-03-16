import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import api from "../utils/api";
import toast from "react-hot-toast";
import GroupDetail from "../components/groups/GroupDetail";

const inputClass =
  "w-full bg-[#0f1117] border border-white/10 text-white placeholder-gray-600 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [memberInputs, setMemberInputs] = useState([{ name: "", upiId: "" }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await api.get("/groups");
      setGroups(data);
    } catch {
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  const updateMember = (i, field, value) => {
    const updated = [...memberInputs];
    updated[i][field] = value;
    setMemberInputs(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const members = memberInputs
        .filter((m) => m.name.trim())
        .map((m) => ({ name: m.name.trim(), upiId: m.upiId.trim() }));
      await api.post("/groups", { name: form.name, description: form.description, members });
      toast.success("Group created!");
      setForm({ name: "", description: "" });
      setMemberInputs([{ name: "", upiId: "" }]);
      setShowForm(false);
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this group?")) return;
    try {
      await api.delete(`/groups/${id}`);
      toast.success("Group deleted");
      fetchGroups();
    } catch {
      toast.error("Failed to delete group");
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

  if (selectedGroup)
    return (
      <GroupDetail
        group={selectedGroup}
        onBack={() => { setSelectedGroup(null); fetchGroups(); }}
      />
    );

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Bill Splitter</h1>
            <p className="text-gray-500 text-sm mt-1">Manage shared expenses with groups</p>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setForm({ name: "", description: "" }); setMemberInputs([{ name: "", upiId: "" }]); }}
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
                New Group
              </>
            )}
          </button>
        </div>

        {/* Create Group Form */}
        {showForm && (
          <div className="bg-[#1a1d27] border border-white/5 rounded-2xl p-6 mb-6">
            <h2 className="text-white font-semibold mb-5">Create Group</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Group Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Goa Trip"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Members</label>
                  <button
                    type="button"
                    onClick={() => setMemberInputs([...memberInputs, { name: "", upiId: "" }])}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    + Add member
                  </button>
                </div>
                <div className="space-y-2">
                  {memberInputs.map((member, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateMember(i, "name", e.target.value)}
                        placeholder="Name"
                        className={inputClass}
                      />
                      <input
                        type="text"
                        value={member.upiId}
                        onChange={(e) => updateMember(i, "upiId", e.target.value)}
                        placeholder="UPI ID (optional)"
                        className={inputClass}
                      />
                      {memberInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setMemberInputs(memberInputs.filter((_, idx) => idx !== i))}
                          className="text-gray-600 hover:text-red-400 transition p-2.5 rounded-xl hover:bg-red-400/10 flex-shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition"
              >
                {submitting ? "Creating..." : "Create Group"}
              </button>
            </form>
          </div>
        )}

        {/* Groups Grid */}
        {groups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => {
              const totalSpend = group.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
              return (
                <div
                  key={group._id}
                  className="bg-[#1a1d27] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/10 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {group.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">{group.name}</h3>
                        {group.description && (
                          <p className="text-gray-500 text-xs mt-0.5 truncate max-w-[160px]">{group.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(group._id)}
                      className="text-gray-700 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-400/10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {group.members.length} members
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                      </svg>
                      {group.expenses.length} expenses
                    </span>
                    {totalSpend > 0 && (
                      <span className="text-indigo-400 font-medium ml-auto">₹{totalSpend.toLocaleString()}</span>
                    )}
                  </div>

                  <div className="flex -space-x-2">
                    {group.members.slice(0, 5).map((m, i) => (
                      <div
                        key={i}
                        title={m.name}
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 border-2 border-[#1a1d27] flex items-center justify-center text-white text-xs font-bold"
                      >
                        {m.name[0].toUpperCase()}
                      </div>
                    ))}
                    {group.members.length > 5 && (
                      <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-[#1a1d27] flex items-center justify-center text-gray-400 text-xs font-bold">
                        +{group.members.length - 5}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedGroup(group)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 rounded-xl text-sm font-medium transition"
                  >
                    Open Group
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#1a1d27] border border-white/5 rounded-2xl flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-white font-medium">No groups yet</p>
            <p className="text-gray-500 text-sm mt-1">Create a group to start splitting bills</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
