import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import api from "../utils/api";
import toast from "react-hot-toast";
import GroupDetail from "../components/groups/GroupDetail";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [memberInputs, setMemberInputs] = useState([{ name: "", upiId: "" }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await api.get("/groups");
      setGroups(data);
    } catch (error) {
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  const addMemberRow = () => {
    setMemberInputs([...memberInputs, { name: "", upiId: "" }]);
  };

  const removeMemberRow = (index) => {
    setMemberInputs(memberInputs.filter((_, i) => i !== index));
  };

  const updateMember = (index, field, value) => {
    const updated = [...memberInputs];
    updated[index][field] = value;
    setMemberInputs(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const members = memberInputs
        .filter((m) => m.name.trim())
        .map((m) => ({ name: m.name.trim(), upiId: m.upiId.trim() }));

      await api.post("/groups", {
        name: form.name,
        description: form.description,
        members,
      });

      toast.success("Group created! 🎉");
      setForm({ name: "", description: "" });
      setMemberInputs([{ name: "", upiId: "" }]);
      setShowForm(false);
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
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
    } catch (error) {
      toast.error("Failed to delete group");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (selectedGroup) {
    return (
      <GroupDetail
        group={selectedGroup}
        onBack={() => {
          setSelectedGroup(null);
          fetchGroups();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Bill Splitter 🧾</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition"
          >
            {showForm ? "Cancel" : "+ Create Group"}
          </button>
        </div>

        {/* Create Group Form */}
        {showForm && (
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-white font-semibold text-lg mb-4">
              Create Group
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  Group Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Goa Trip 🏖️"
                  required
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

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
                  placeholder="Trip expenses"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Members */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Members
                </label>
                <div className="space-y-2">
                  {memberInputs.map((member, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) =>
                          updateMember(index, "name", e.target.value)
                        }
                        placeholder="Name (eg: Akash)"
                        className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={member.upiId}
                        onChange={(e) =>
                          updateMember(index, "upiId", e.target.value)
                        }
                        placeholder="UPI ID (optional)"
                        className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {memberInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMemberRow(index)}
                          className="text-red-400 hover:text-red-300 px-3"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMemberRow}
                    className="text-indigo-400 hover:text-indigo-300 text-sm mt-1"
                  >
                    + Add Member
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Group"}
              </button>
            </form>
          </div>
        )}

        {/* Groups List */}
        {groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div key={group._id} className="bg-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-semibold text-lg mb-1">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-gray-400 text-sm mb-3">
                    {group.description}
                  </p>
                )}
                <div className="space-y-1 mb-4">
                  <p className="text-gray-400 text-sm">
                    👥 {group.members.length} members —{" "}
                    {group.members.map((m) => m.name).join(", ")}
                  </p>
                  <p className="text-gray-400 text-sm">
                    💸 {group.expenses.length} expenses
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedGroup(group)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(group._id)}
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
            <p className="text-gray-400 text-lg">No groups yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Create a group to start splitting bills
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
