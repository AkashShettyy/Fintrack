import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import api from "../utils/api";
import toast from "react-hot-toast";
import GroupDetail from "../components/groups/GroupDetail";

const inputCls = "w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [members, setMembers] = useState([{ name: "", upiId: "" }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try { const { data } = await api.get("/groups"); setGroups(data); }
    catch { toast.error("Failed to fetch groups"); }
    finally { setLoading(false); }
  };

  const updateMember = (i, field, val) => {
    const u = [...members]; u[i][field] = val; setMembers(u);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const memberList = members.filter((m) => m.name.trim()).map((m) => ({ name: m.name.trim(), upiId: m.upiId.trim() }));
      await api.post("/groups", { name: form.name, description: form.description, members: memberList });
      toast.success("Group created!");
      setForm({ name: "", description: "" }); setMembers([{ name: "", upiId: "" }]); setShowForm(false); fetchGroups();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this group?")) return;
    try { await api.delete(`/groups/${id}`); toast.success("Deleted"); fetchGroups(); }
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

  if (selected) return <GroupDetail group={selected} onBack={() => { setSelected(null); fetchGroups(); }} />;

  return (
    <div className="min-h-screen bg-[#080a10]">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-5 sm:px-8 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Bill Splitter</h1>
            <p className="text-gray-500 text-sm mt-1">Split expenses fairly across groups</p>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setForm({ name: "", description: "" }); setMembers([{ name: "", upiId: "" }]); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              showForm
                ? "bg-white/[0.06] border border-white/[0.1] text-gray-300 hover:bg-white/[0.09]"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25"
            }`}
          >
            {showForm
              ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Cancel</>
              : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>New Group</>
            }
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-6">
            <h2 className="text-white font-semibold mb-5">Create New Group</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Group Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Goa Trip" required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                  <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" className={inputCls} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Members</label>
                  <button type="button" onClick={() => setMembers([...members, { name: "", upiId: "" }])} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition">+ Add member</button>
                </div>
                <div className="space-y-2.5">
                  {members.map((m, i) => (
                    <div key={i} className="flex gap-2.5">
                      <input type="text" value={m.name} onChange={(e) => updateMember(i, "name", e.target.value)} placeholder="Name" className={inputCls} />
                      <input type="text" value={m.upiId} onChange={(e) => updateMember(i, "upiId", e.target.value)} placeholder="UPI ID (optional)" className={inputCls} />
                      {members.length > 1 && (
                        <button type="button" onClick={() => setMembers(members.filter((_, idx) => idx !== i))} className="p-2.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20">
                {submitting ? "Creating..." : "Create Group"}
              </button>
            </form>
          </div>
        )}

        {/* Groups grid */}
        {groups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => {
              const total = group.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
              return (
                <div key={group._id} className="bg-white/[0.03] border border-white/[0.07] hover:border-indigo-500/30 rounded-2xl p-5 flex flex-col gap-4 transition-all hover:bg-white/[0.05] group">
                  {/* Card header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-lg shadow-indigo-500/25">
                        {group.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm leading-tight">{group.name}</h3>
                        {group.description
                          ? <p className="text-gray-500 text-xs mt-0.5 truncate max-w-[150px]">{group.description}</p>
                          : <p className="text-gray-600 text-xs mt-0.5">{group.members.length} members</p>
                        }
                      </div>
                    </div>
                    <button onClick={() => handleDelete(group._id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 text-center">
                      <p className="text-white font-bold text-sm">{group.expenses.length}</p>
                      <p className="text-gray-600 text-[11px]">expenses</p>
                    </div>
                    <div className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 text-center">
                      <p className="text-white font-bold text-sm">{group.members.length}</p>
                      <p className="text-gray-600 text-[11px]">members</p>
                    </div>
                    <div className="flex-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-2 text-center">
                      <p className="text-indigo-400 font-bold text-sm">₹{total > 0 ? total.toLocaleString() : "0"}</p>
                      <p className="text-indigo-600 text-[11px]">total</p>
                    </div>
                  </div>

                  {/* Member avatars */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 6).map((m, i) => (
                        <div key={i} title={m.name} className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 border-2 border-[#080a10] flex items-center justify-center text-white text-[10px] font-bold">
                          {m.name[0].toUpperCase()}
                        </div>
                      ))}
                      {group.members.length > 6 && (
                        <div className="w-7 h-7 rounded-full bg-white/[0.08] border-2 border-[#080a10] flex items-center justify-center text-gray-400 text-[10px] font-bold">
                          +{group.members.length - 6}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs">{group.members.map((m) => m.name).slice(0, 2).join(", ")}{group.members.length > 2 ? "..." : ""}</p>
                  </div>

                  <button
                    onClick={() => setSelected(group)}
                    className="w-full flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-indigo-600 border border-white/[0.1] hover:border-indigo-500 text-gray-300 hover:text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    Open Group
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-white font-semibold">No groups yet</p>
            <p className="text-gray-500 text-sm mt-1">Create a group to start splitting bills</p>
          </div>
        )}
      </div>
    </div>
  );
}
